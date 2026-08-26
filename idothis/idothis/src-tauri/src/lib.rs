use bdo_rs::BDO;
use serde::{Deserialize, Serialize};
use serde_json::json;
use sessionless::hex::IntoHex;
use sessionless::secp256k1::SecretKey;
use sessionless::Sessionless;
use std::fs;
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};
use tauri::Manager;

const GATEWAY_BDO_URL: &str = "https://allyabase-gateway.netlify.app/bdo/";
// Shared, app-embedded identity: every idothis install writes its own
// profiles' entries into (and reads the whole list from) the SAME BDO
// record under this hash. A deliberate, honestly-limited MVP pattern — no
// multi-writer shared-list primitive exists in BDO today, so anyone with
// the app's source has the same embedded key and thus the same write
// access. Consistent with the rest of this ecosystem's current maturity
// level, not a regression.
const DIRECTORY_HASH: &str = "idothis-directory";
const DIRECTORY_PRIVATE_KEY_HEX: &str = "f1c960ef6ba0f4ac83cc264a19b5ff7731e8e4bf5a784283a46b0bc9d31ec908";
// BDO assigns its own server-generated uuid on create_user — distinct from
// (and not derivable from) the signing pubkey — so it must be captured once
// and hardcoded here for every install to agree on the same record.
const DIRECTORY_BDO_UUID: &str = "042d657e-9f93-47f5-ac38-f8cee75c2433";
const DEFAULT_RADIUS_MILES: f64 = 25.0;

// zip,lat,long — US Census Bureau 2023 ZCTA Gazetteer file (public domain).
const ZIP_CENTROIDS_CSV: &str = include_str!("../resources/zip_centroids.csv");

// ── Category taxonomy ────────────────────────────────────────────────────────
//
// A fixed, curated list rather than freeform skill text — 30 to start, meant
// to grow over time. Keep this in sync with the identical array in
// src/main.js (get_categories exists so the frontend never has to
// hand-maintain a second copy, but the constant itself still needs to match
// if either side changes independently).

const CATEGORIES: &[(&str, &str)] = &[
    ("plumber", "Plumber"),
    ("electrician", "Electrician"),
    ("house_cleaner", "House Cleaner"),
    ("caterer", "Caterer"),
    ("restauranteur", "Restauranteur"),
    ("handyman", "Handyman"),
    ("landscaper", "Landscaper"),
    ("painter", "Painter"),
    ("carpenter", "Carpenter"),
    ("hvac_technician", "HVAC Technician"),
    ("photographer", "Photographer"),
    ("videographer", "Videographer"),
    ("hair_stylist", "Hair Stylist"),
    ("barber", "Barber"),
    ("massage_therapist", "Massage Therapist"),
    ("personal_trainer", "Personal Trainer"),
    ("tutor", "Tutor"),
    ("pet_groomer", "Pet Groomer"),
    ("dog_walker", "Dog Walker"),
    ("auto_mechanic", "Auto Mechanic"),
    ("mover", "Moving Services"),
    ("interior_designer", "Interior Designer"),
    ("web_developer", "Web Developer"),
    ("graphic_designer", "Graphic Designer"),
    ("accountant", "Accountant"),
    ("event_planner", "Event Planner"),
    ("dj_musician", "DJ / Musician"),
    ("baker", "Baker"),
    ("florist", "Florist"),
    ("tailor", "Tailor / Seamstress"),
];

fn category_label(slug: &str) -> Option<&'static str> {
    CATEGORIES.iter().find(|(s, _)| *s == slug).map(|(_, label)| *label)
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Category {
    pub slug: String,
    pub label: String,
}

#[tauri::command]
async fn get_categories() -> Result<Vec<Category>, String> {
    Ok(CATEGORIES
        .iter()
        .map(|(slug, label)| Category { slug: slug.to_string(), label: label.to_string() })
        .collect())
}

// ── Data types ───────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct Profile {
    #[serde(default)]
    pub id: String,
    pub category: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub business_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bio: Option<String>,
    pub zip: String,
    /// Snapshotted from the Canonical Profile at creation time — not
    /// live-linked, same reasoning as every other app this session.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub from_name: Option<String>,
    #[serde(default)]
    pub created_at: String,
    #[serde(default)]
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Default)]
struct ProfilesStore {
    profiles: Vec<Profile>,
}

// ── Storage ──────────────────────────────────────────────────────────────────

fn data_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

fn profiles_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    Ok(data_dir(app)?.join("profiles.json"))
}

fn read_profiles(app: &tauri::AppHandle) -> Result<ProfilesStore, String> {
    let path = profiles_path(app)?;
    match fs::read_to_string(&path) {
        Ok(contents) => serde_json::from_str(&contents).map_err(|e| e.to_string()),
        Err(_) => Ok(ProfilesStore::default()),
    }
}

fn write_profiles(app: &tauri::AppHandle, store: &ProfilesStore) -> Result<(), String> {
    let path = profiles_path(app)?;
    let json = serde_json::to_string_pretty(store).map_err(|e| e.to_string())?;
    fs::write(path, json).map_err(|e| e.to_string())
}

static ID_COUNTER: AtomicU64 = AtomicU64::new(0);

fn new_id() -> String {
    let nanos = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    let counter = ID_COUNTER.fetch_add(1, Ordering::Relaxed);
    format!("{}-{}", nanos, counter)
}

fn unix_now_ms_string() -> String {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis().to_string())
        .unwrap_or_default()
}

// ── Sessionless identity persistence ────────────────────────────────────────
//
// Persists the private key to app_data_dir the first time it's generated,
// loaded back every time after — fixes the earlier bug where a fresh
// identity was generated on every single command call. Same pattern as
// BizBuz/Linkitylink/Gelder's own per-install identities.

#[derive(Debug, Serialize, Deserialize)]
struct StoredSessionlessKey {
    private_key_hex: String,
}

fn sessionless_key_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    Ok(data_dir(app)?.join("sessionless_key.json"))
}

fn sessionless_from_hex(priv_key_hex: &str) -> Result<Sessionless, String> {
    let bytes = hex::decode(priv_key_hex).map_err(|e| e.to_string())?;
    let secret_key = SecretKey::from_slice(&bytes).map_err(|e| e.to_string())?;
    Ok(Sessionless::from_private_key(secret_key))
}

fn create_sessionless(app: &tauri::AppHandle) -> Result<Sessionless, String> {
    let path = sessionless_key_path(app)?;
    if let Ok(contents) = fs::read_to_string(&path) {
        if let Ok(stored) = serde_json::from_str::<StoredSessionlessKey>(&contents) {
            if let Ok(sessionless) = sessionless_from_hex(&stored.private_key_hex) {
                return Ok(sessionless);
            }
        }
    }

    let sessionless = Sessionless::new();
    let stored = StoredSessionlessKey {
        private_key_hex: sessionless.private_key().to_hex(),
    };
    let json = serde_json::to_string_pretty(&stored).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(sessionless)
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionlessInfo {
    pub uuid: String,
    pub public_key: String,
}

#[tauri::command]
async fn get_sessionless_info(app: tauri::AppHandle) -> Result<SessionlessInfo, String> {
    let sessionless = create_sessionless(&app)?;
    Ok(SessionlessInfo {
        uuid: sessionless.public_key().to_hex(),
        public_key: sessionless.public_key().to_hex(),
    })
}

// ── Real discovery: shared directory BDO + zip-radius matching ─────────────
//
// One entry per PROFILE now (not per user) — a single identity can publish
// several. `owner_pub_key` is what lets discover_by_category exclude your
// own profiles from your own search results. Empirically verified against
// the live gateway earlier this session: writes are visible on a subsequent
// read within a few seconds, not always instantly (short propagation delay).

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DirectoryEntry {
    pub profile_id: String,
    pub owner_pub_key: String,
    pub category: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub business_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub from_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bio: Option<String>,
    pub zip: String,
    pub updated_at: String,
}

fn directory_sessionless() -> Result<Sessionless, String> {
    sessionless_from_hex(DIRECTORY_PRIVATE_KEY_HEX)
}

async fn read_directory() -> Vec<DirectoryEntry> {
    let sessionless = match directory_sessionless() {
        Ok(s) => s,
        Err(_) => return Vec::new(),
    };
    let client = BDO::new(Some(GATEWAY_BDO_URL.to_string()), Some(sessionless));
    match client.get_bdo(DIRECTORY_BDO_UUID, DIRECTORY_HASH).await {
        Ok(user) => serde_json::from_value::<Vec<DirectoryEntry>>(
            user.bdo.get("entries").cloned().unwrap_or(json!([])),
        )
        .unwrap_or_default(),
        Err(e) => {
            println!("read_directory failed: {}", e);
            Vec::new()
        }
    }
}

async fn write_directory(entries: &[DirectoryEntry]) -> Result<(), String> {
    let sessionless = directory_sessionless()?;
    let client = BDO::new(Some(GATEWAY_BDO_URL.to_string()), Some(sessionless));
    let payload = json!({ "entries": entries });
    // update_bdo is the normal path (the directory record already exists).
    // create_user is only a resilience fallback for the rare case the
    // gateway's backing store gets reset — same pattern wiki-plugin-agora
    // uses (sanoraCreateProductResilient).
    let update_failed = client
        .update_bdo(DIRECTORY_BDO_UUID, DIRECTORY_HASH, &payload, &true)
        .await
        .is_err();
    if update_failed {
        client
            .create_user(DIRECTORY_HASH, &payload, &true)
            .await
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Replaces this profile's own entry in the shared directory (or adds it,
/// on first publish) — best-effort, a failure here shouldn't block the
/// local save that triggered it.
async fn publish_directory_entry(owner_pub_key: &str, profile: &Profile) {
    let mut entries = read_directory().await;
    entries.retain(|e| e.profile_id != profile.id);
    entries.push(DirectoryEntry {
        profile_id: profile.id.clone(),
        owner_pub_key: owner_pub_key.to_string(),
        category: profile.category.clone(),
        business_name: profile.business_name.clone(),
        from_name: profile.from_name.clone(),
        bio: profile.bio.clone(),
        zip: profile.zip.clone(),
        updated_at: unix_now_ms_string(),
    });
    if let Err(e) = write_directory(&entries).await {
        println!("Failed to publish directory entry: {}", e);
    }
}

/// Removes this profile's entry from the shared directory — fixes the
/// previous version's gap where a deleted profile kept showing up in
/// discovery forever.
async fn remove_directory_entry(profile_id: &str) {
    let mut entries = read_directory().await;
    let before = entries.len();
    entries.retain(|e| e.profile_id != profile_id);
    if entries.len() != before {
        if let Err(e) = write_directory(&entries).await {
            println!("Failed to remove directory entry: {}", e);
        }
    }
}

// ── Zip-radius matching ─────────────────────────────────────────────────────

fn zip_centroid(zip: &str) -> Option<(f64, f64)> {
    for line in ZIP_CENTROIDS_CSV.lines() {
        let mut parts = line.splitn(3, ',');
        let z = parts.next()?;
        if z == zip {
            let lat: f64 = parts.next()?.parse().ok()?;
            let lon: f64 = parts.next()?.parse().ok()?;
            return Some((lat, lon));
        }
    }
    None
}

fn haversine_distance_miles(lat1: f64, lon1: f64, lat2: f64, lon2: f64) -> f64 {
    const EARTH_RADIUS_MILES: f64 = 3958.8;
    let (lat1r, lat2r) = (lat1.to_radians(), lat2.to_radians());
    let dlat = (lat2 - lat1).to_radians();
    let dlon = (lon2 - lon1).to_radians();
    let a = (dlat / 2.0).sin().powi(2) + lat1r.cos() * lat2r.cos() * (dlon / 2.0).sin().powi(2);
    let c = 2.0 * a.sqrt().atan2((1.0 - a).sqrt());
    EARTH_RADIUS_MILES * c
}

// ── Commands: profiles ───────────────────────────────────────────────────────

#[tauri::command]
async fn load_profiles(app: tauri::AppHandle) -> Result<Vec<Profile>, String> {
    Ok(read_profiles(&app)?.profiles)
}

/// Creates or updates a profile (matched by `id`, if given) and republishes
/// it to the shared directory in the same call — "saving is what publishes
/// it," same convention as Gelder's `create_invoice`.
#[tauri::command]
async fn save_profile(
    app: tauri::AppHandle,
    id: Option<String>,
    category: String,
    business_name: Option<String>,
    bio: Option<String>,
    zip: String,
) -> Result<Profile, String> {
    if category_label(&category).is_none() {
        return Err(format!("Unknown category: {category}"));
    }

    let sessionless = create_sessionless(&app)?;
    let owner_pub_key = sessionless.public_key().to_hex();

    let mut store = read_profiles(&app)?;
    let now = unix_now_ms_string();

    let profile = if let Some(id) = id.filter(|id| !id.is_empty()) {
        match store.profiles.iter_mut().find(|p| p.id == id) {
            Some(existing) => {
                existing.category = category;
                existing.business_name = business_name;
                existing.bio = bio;
                existing.zip = zip;
                existing.updated_at = now;
                existing.clone()
            }
            None => return Err("Profile not found".to_string()),
        }
    } else {
        let canonical = load_canonical_profile(app.clone()).await.ok().flatten();
        let from_name = canonical
            .and_then(|p| p.fields.into_iter().find(|f| f.slug == "name"))
            .map(|f| f.value);

        let profile = Profile {
            id: new_id(),
            category,
            business_name,
            bio,
            zip,
            from_name,
            created_at: now.clone(),
            updated_at: now,
        };
        store.profiles.push(profile.clone());
        profile
    };

    write_profiles(&app, &store)?;
    publish_directory_entry(&owner_pub_key, &profile).await;

    Ok(profile)
}

#[tauri::command]
async fn delete_profile(app: tauri::AppHandle, id: String) -> Result<(), String> {
    let mut store = read_profiles(&app)?;
    store.profiles.retain(|p| p.id != id);
    write_profiles(&app, &store)?;
    remove_directory_entry(&id).await;
    Ok(())
}

#[tauri::command]
async fn discover_by_category(
    app: tauri::AppHandle,
    category: String,
    zip: Option<String>,
    radius_miles: Option<f64>,
) -> Result<Vec<DirectoryEntry>, String> {
    let sessionless = create_sessionless(&app)?;
    let own_pub_key = sessionless.public_key().to_hex();

    let mut entries = read_directory().await;
    entries.retain(|e| e.category == category && e.owner_pub_key != own_pub_key);

    if let Some(origin_zip) = &zip {
        if let Some((olat, olon)) = zip_centroid(origin_zip) {
            let radius = radius_miles.unwrap_or(DEFAULT_RADIUS_MILES);
            entries.retain(|e| match zip_centroid(&e.zip) {
                Some((elat, elon)) => haversine_distance_miles(olat, olon, elat, elon) <= radius,
                None => false,
            });
        }
        // If the origin zip itself isn't in the dataset, skip radius
        // filtering entirely rather than failing the whole query.
    }

    Ok(entries)
}

// ── Commands: liked profiles ─────────────────────────────────────────────────
//
// Persisted locally now — fixes the previous version's bug where likes were
// purely in-memory and vanished on navigating away from the Discover screen.

#[derive(Debug, Serialize, Deserialize, Default)]
struct LikedStore {
    liked: Vec<DirectoryEntry>,
}

fn liked_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    Ok(data_dir(app)?.join("liked.json"))
}

fn read_liked(app: &tauri::AppHandle) -> Result<LikedStore, String> {
    let path = liked_path(app)?;
    match fs::read_to_string(&path) {
        Ok(contents) => serde_json::from_str(&contents).map_err(|e| e.to_string()),
        Err(_) => Ok(LikedStore::default()),
    }
}

fn write_liked(app: &tauri::AppHandle, store: &LikedStore) -> Result<(), String> {
    let path = liked_path(app)?;
    let json = serde_json::to_string_pretty(store).map_err(|e| e.to_string())?;
    fs::write(path, json).map_err(|e| e.to_string())
}

#[tauri::command]
async fn load_liked_profiles(app: tauri::AppHandle) -> Result<Vec<DirectoryEntry>, String> {
    Ok(read_liked(&app)?.liked)
}

#[tauri::command]
async fn like_profile(app: tauri::AppHandle, entry: DirectoryEntry) -> Result<(), String> {
    let mut store = read_liked(&app)?;
    store.liked.retain(|e| e.profile_id != entry.profile_id);
    store.liked.push(entry);
    write_liked(&app, &store)
}

#[tauri::command]
async fn unlike_profile(app: tauri::AppHandle, profile_id: String) -> Result<(), String> {
    let mut store = read_liked(&app)?;
    store.liked.retain(|e| e.profile_id != profile_id);
    write_liked(&app, &store)
}

// ── Canonical profile ───────────────────────────────────────────────────────
//
// A separate, App-Group-shared record — copied byte-identical from
// BizBuz/Linkitylink/Gelder (same schema, same slugify, same commands).

const MAX_CANONICAL_FIELDS: usize = 20;

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct CanonicalField {
    pub slug: String,
    pub name: String,
    pub value: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct CanonicalProfile {
    pub photo: Option<String>,
    #[serde(default)]
    pub fields: Vec<CanonicalField>,
    pub updated_at: Option<String>,
}

fn canonical_slugify(s: &str) -> String {
    let mut slug = String::new();
    let mut last_was_sep = true;
    for ch in s.trim().chars() {
        if ch.is_ascii_alphanumeric() {
            slug.push(ch.to_ascii_lowercase());
            last_was_sep = false;
        } else if !last_was_sep {
            slug.push('_');
            last_was_sep = true;
        }
    }
    while slug.ends_with('_') {
        slug.pop();
    }
    slug
}

#[tauri::command]
async fn load_canonical_profile(app: tauri::AppHandle) -> Result<Option<CanonicalProfile>, String> {
    let raw = tauri_plugin_app_group::read_value_sync(&app, "canonical.profile")?;
    match raw {
        Some(json) => Ok(serde_json::from_str(&json).ok()),
        None => Ok(None),
    }
}

#[tauri::command]
async fn save_canonical_profile(app: tauri::AppHandle, mut profile: CanonicalProfile) -> Result<CanonicalProfile, String> {
    let mut deduped: Vec<CanonicalField> = Vec::new();
    for mut field in profile.fields.into_iter() {
        if field.slug.trim().is_empty() {
            field.slug = canonical_slugify(&field.name);
        }
        if field.slug.is_empty() {
            continue;
        }
        deduped.retain(|f| f.slug != field.slug);
        deduped.push(field);
    }
    deduped.truncate(MAX_CANONICAL_FIELDS);
    profile.fields = deduped;
    profile.updated_at = Some(unix_now_ms_string());
    let json = serde_json::to_string(&profile).map_err(|e| e.to_string())?;
    tauri_plugin_app_group::write_value_sync(&app, "canonical.profile", &json)?;
    Ok(profile)
}

// ── App entry ────────────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_app_group::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            get_sessionless_info,
            get_categories,
            load_profiles,
            save_profile,
            delete_profile,
            discover_by_category,
            load_liked_profiles,
            like_profile,
            unlike_profile,
            load_canonical_profile,
            save_canonical_profile
        ])
        .run(tauri::generate_context!())
        .expect("error while running idothis");
}
