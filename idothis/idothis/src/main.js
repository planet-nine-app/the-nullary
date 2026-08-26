const { core, dialog, fs } = window.__TAURI__;

// Keep in sync with MAX_CANONICAL_FIELDS in src-tauri/src/lib.rs.
const MAX_PROFILE_FIELDS = 20;

const listView = document.getElementById('list-view');
const createView = document.getElementById('create-view');
const categoriesView = document.getElementById('categories-view');
const swipeView = document.getElementById('swipe-view');
const likedView = document.getElementById('liked-view');
const profileView = document.getElementById('profile-view');
const profileNavBtn = document.getElementById('profile-nav-btn');
const discoverNavBtn = document.getElementById('discover-nav-btn');
const statusMsg = document.getElementById('status-msg');

const newProfileBtn = document.getElementById('new-profile-btn');
const profileListEl = document.getElementById('profile-list');
const emptyHint = document.getElementById('empty-hint');

const createTitle = document.getElementById('create-title');
const profileForm = document.getElementById('profile-form');
const fromNote = document.getElementById('from-note');
const fieldCategory = document.getElementById('field-category');
const fieldBusinessName = document.getElementById('field-business-name');
const fieldBio = document.getElementById('field-bio');
const fieldZip = document.getElementById('field-zip');
const saveProfileBtn = document.getElementById('save-profile-btn');
const cancelProfileBtn = document.getElementById('cancel-profile-btn');
const deleteProfileBtn = document.getElementById('delete-profile-btn');

const discoverZip = document.getElementById('discover-zip');
const discoverRadius = document.getElementById('discover-radius');
const categoryListEl = document.getElementById('category-list');
const viewLikedBtn = document.getElementById('view-liked-btn');

const swipeTitle = document.getElementById('swipe-title');
const swipeStats = document.getElementById('swipe-stats');
const swipeStackEl = document.getElementById('swipe-stack');
const swipeEmptyHint = document.getElementById('swipe-empty-hint');
const passBtn = document.getElementById('pass-btn');
const likeBtn = document.getElementById('like-btn');
const swipeBackBtn = document.getElementById('swipe-back-btn');

const likedListEl = document.getElementById('liked-list');
const likedEmptyHint = document.getElementById('liked-empty-hint');
const likedBackBtn = document.getElementById('liked-back-btn');

const profileForm2 = document.getElementById('canonical-profile-form');
const profilePhotoPreview = document.getElementById('profile-photo-preview');
const profileChoosePhotoBtn = document.getElementById('profile-choose-photo-btn');
const profileFieldsEl = document.getElementById('profile-fields');
const profileNewFieldName = document.getElementById('profile-new-field-name');
const profileNewFieldValue = document.getElementById('profile-new-field-value');
const profileAddFieldBtn = document.getElementById('profile-add-field-btn');
const profileFieldLimitHint = document.getElementById('profile-field-limit-hint');
const profileCloseBtn = document.getElementById('profile-close-btn');

const PHOTO_SIZE = 480;
const PHOTO_QUALITY = 0.85;

let profiles = [];
let categories = []; // [{slug, label}], loaded once from Rust
let editingProfileId = null; // null while creating; set while editing
let currentCategory = null;
let discoverQueue = [];
let discoverIndex = 0;
let likedProfiles = [];

// ── View / status helpers ────────────────────────────────────────────────────

function showView(name) {
    listView.hidden = name !== 'list';
    createView.hidden = name !== 'create';
    categoriesView.hidden = name !== 'categories';
    swipeView.hidden = name !== 'swipe';
    likedView.hidden = name !== 'liked';
    profileView.hidden = name !== 'profile';
    const hideNav = ['create', 'swipe', 'liked', 'profile'].includes(name);
    profileNavBtn.hidden = hideNav;
    discoverNavBtn.hidden = hideNav;
}

let statusTimeout = null;
function setStatus(message) {
    statusMsg.textContent = message;
    statusMsg.classList.add('visible');
    clearTimeout(statusTimeout);
    statusTimeout = setTimeout(() => statusMsg.classList.remove('visible'), 2500);
}

function categoryLabel(slug) {
    return categories.find((c) => c.slug === slug)?.label || slug;
}

// ── My Profiles ──────────────────────────────────────────────────────────────

function renderProfileList() {
    profileListEl.innerHTML = '';
    emptyHint.hidden = profiles.length > 0;

    const sorted = [...profiles].sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
    for (const p of sorted) {
        const li = document.createElement('li');
        li.className = 'profile-list-item';

        const text = document.createElement('div');
        text.className = 'profile-list-text';
        text.innerHTML = '<div class="profile-list-category"></div><div class="profile-list-sub"></div>';
        text.querySelector('.profile-list-category').textContent = p.businessName || categoryLabel(p.category);
        text.querySelector('.profile-list-sub').textContent = [
            p.businessName ? categoryLabel(p.category) : null,
            p.zip,
        ].filter(Boolean).join(' · ');

        li.appendChild(text);
        li.addEventListener('click', () => openEditForm(p));
        profileListEl.appendChild(li);
    }
}

async function loadProfiles() {
    profiles = await core.invoke('load_profiles');
    renderProfileList();
}

// ── Create / Edit Profile ────────────────────────────────────────────────────

function populateCategorySelect() {
    fieldCategory.innerHTML = '';
    for (const c of categories) {
        const opt = document.createElement('option');
        opt.value = c.slug;
        opt.textContent = c.label;
        fieldCategory.appendChild(opt);
    }
}

async function openCreateForm() {
    editingProfileId = null;
    createTitle.textContent = 'New Profile';
    deleteProfileBtn.hidden = true;
    fieldCategory.value = categories[0]?.slug || '';
    fieldBusinessName.value = '';
    fieldBio.value = '';
    fieldZip.value = '';

    try {
        const profile = await core.invoke('load_canonical_profile');
        const nameField = (profile?.fields || []).find((f) => f.slug === 'name');
        fromNote.textContent = nameField?.value
            ? `From: ${nameField.value}`
            : 'No shared profile name set yet — set one in Profile so people know who this is.';
    } catch {
        fromNote.textContent = '';
    }

    showView('create');
}

function openEditForm(p) {
    editingProfileId = p.id;
    createTitle.textContent = 'Edit Profile';
    deleteProfileBtn.hidden = false;
    fieldCategory.value = p.category;
    fieldBusinessName.value = p.businessName || '';
    fieldBio.value = p.bio || '';
    fieldZip.value = p.zip || '';
    fromNote.textContent = p.fromName ? `From: ${p.fromName}` : '';
    showView('create');
}

newProfileBtn.addEventListener('click', openCreateForm);
cancelProfileBtn.addEventListener('click', () => showView('list'));

profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const category = fieldCategory.value;
    const zip = fieldZip.value.trim();
    if (!category || !/^\d{5}$/.test(zip)) {
        setStatus('Enter a valid 5-digit zip code.');
        return;
    }
    const businessName = fieldBusinessName.value.trim() || undefined;
    const bio = fieldBio.value.trim() || undefined;

    saveProfileBtn.disabled = true;
    setStatus('Saving & publishing…');
    try {
        const saved = await core.invoke('save_profile', {
            id: editingProfileId || undefined,
            category,
            businessName,
            bio,
            zip,
        });
        const index = profiles.findIndex((p) => p.id === saved.id);
        if (index === -1) profiles.push(saved); else profiles[index] = saved;
        renderProfileList();
        showView('list');
        setStatus('Profile saved!');
    } catch (err) {
        setStatus(`Couldn't save: ${err}`);
    } finally {
        saveProfileBtn.disabled = false;
    }
});

deleteProfileBtn.addEventListener('click', async () => {
    if (!editingProfileId) return;
    deleteProfileBtn.disabled = true;
    try {
        await core.invoke('delete_profile', { id: editingProfileId });
        profiles = profiles.filter((p) => p.id !== editingProfileId);
        renderProfileList();
        showView('list');
        setStatus('Profile deleted.');
    } catch (err) {
        setStatus(`Couldn't delete: ${err}`);
    } finally {
        deleteProfileBtn.disabled = false;
    }
});

// ── Discover: categories ─────────────────────────────────────────────────────

const DISCOVER_FILTER_KEY = 'idothis.discoverFilter';

function loadDiscoverFilter() {
    try {
        const stored = JSON.parse(localStorage.getItem(DISCOVER_FILTER_KEY) || '{}');
        discoverZip.value = stored.zip || '';
        discoverRadius.value = stored.radiusMiles || '25';
    } catch {
        // Ignore a corrupt/missing stored filter — the fields just stay blank.
    }
}

function saveDiscoverFilter() {
    localStorage.setItem(DISCOVER_FILTER_KEY, JSON.stringify({
        zip: discoverZip.value.trim(),
        radiusMiles: discoverRadius.value,
    }));
}

function renderCategoryList() {
    categoryListEl.innerHTML = '';
    for (const c of categories) {
        const li = document.createElement('li');
        li.className = 'category-list-item';
        li.innerHTML = `<span></span><span class="arrow">→</span>`;
        li.querySelector('span').textContent = c.label;
        li.addEventListener('click', () => openCategory(c.slug));
        categoryListEl.appendChild(li);
    }
}

discoverNavBtn.addEventListener('click', () => {
    if (categories.length === 0) return;
    showView('categories');
});

viewLikedBtn.addEventListener('click', async () => {
    await loadLiked();
    showView('liked');
});

// ── Discover: swipe stack ────────────────────────────────────────────────────

async function openCategory(category) {
    currentCategory = category;
    saveDiscoverFilter();
    swipeTitle.textContent = categoryLabel(category);
    setStatus('Finding profiles…');
    try {
        const zip = discoverZip.value.trim() || undefined;
        const radiusMiles = zip ? Number(discoverRadius.value) : undefined;
        discoverQueue = await core.invoke('discover_by_category', { category, zip, radiusMiles });
        discoverIndex = 0;
        renderSwipeStack();
        showView('swipe');
    } catch (err) {
        setStatus(`Couldn't load profiles: ${err}`);
    }
}

function currentSwipeEntries() {
    return discoverQueue.slice(discoverIndex, discoverIndex + 3);
}

function renderSwipeStack() {
    swipeStackEl.innerHTML = '';
    const remaining = discoverQueue.length - discoverIndex;
    swipeStats.textContent = remaining > 0 ? `${remaining} remaining` : '';
    swipeEmptyHint.hidden = remaining > 0;
    passBtn.disabled = remaining === 0;
    likeBtn.disabled = remaining === 0;

    const visible = currentSwipeEntries();
    visible.forEach((entry, i) => {
        const card = document.createElement('div');
        card.className = 'swipe-card';
        card.style.zIndex = String(10 - i);
        card.style.transform = `scale(${1 - i * 0.04}) translateY(${i * 10}px)`;
        card.style.opacity = i === 0 ? '1' : String(1 - i * 0.3);
        card.innerHTML = `
            <div class="swipe-indicator like">LIKE</div>
            <div class="swipe-indicator pass">PASS</div>
            <div class="swipe-card-category"></div>
            <div class="swipe-card-name"></div>
            <div class="swipe-card-zip"></div>
            <div class="swipe-card-bio"></div>
        `;
        card.querySelector('.swipe-card-category').textContent = categoryLabel(entry.category);
        card.querySelector('.swipe-card-name').textContent = entry.businessName || entry.fromName || 'Someone';
        card.querySelector('.swipe-card-zip').textContent = entry.zip ? `📍 ${entry.zip}` : '';
        card.querySelector('.swipe-card-bio').textContent = entry.bio || '';

        if (i === 0) addSwipeListeners(card, entry);
        swipeStackEl.appendChild(card);
    });
}

function addSwipeListeners(card, entry) {
    let startX = 0;
    let currentX = 0;

    function onMove(clientX) {
        currentX = clientX - startX;
        card.style.transform = `translateX(${currentX}px) rotate(${currentX * 0.05}deg)`;
        const likeEl = card.querySelector('.swipe-indicator.like');
        const passEl = card.querySelector('.swipe-indicator.pass');
        likeEl.style.opacity = currentX > 30 ? String(Math.min(1, (currentX - 30) / 100)) : '0';
        passEl.style.opacity = currentX < -30 ? String(Math.min(1, (-currentX - 30) / 100)) : '0';
    }
    function onMouseMove(e) { onMove(e.clientX); }
    function onTouchMove(e) { onMove(e.touches[0].clientX); }

    function endDrag() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', endDrag);

        if (Math.abs(currentX) > 100) {
            commitSwipe(currentX > 0 ? 'like' : 'pass', card, entry);
        } else {
            card.style.transform = '';
            card.querySelector('.swipe-indicator.like').style.opacity = '0';
            card.querySelector('.swipe-indicator.pass').style.opacity = '0';
        }
    }

    function startDrag(clientX) {
        startX = clientX;
        currentX = 0;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', endDrag);
    }

    card.addEventListener('mousedown', (e) => startDrag(e.clientX));
    card.addEventListener('touchstart', (e) => startDrag(e.touches[0].clientX), { passive: true });
}

async function commitSwipe(direction, card, entry) {
    card.style.transform = `translateX(${direction === 'like' ? '120vw' : '-120vw'}) rotate(${direction === 'like' ? 30 : -30}deg)`;
    card.style.opacity = '0';

    if (direction === 'like') {
        try {
            await core.invoke('like_profile', { entry });
        } catch {
            // Non-fatal — the swipe still advances even if persisting the like fails.
        }
    }

    discoverIndex++;
    setTimeout(renderSwipeStack, 300);
}

passBtn.addEventListener('click', () => {
    const card = swipeStackEl.querySelector('.swipe-card');
    const entry = currentSwipeEntries()[0];
    if (card && entry) commitSwipe('pass', card, entry);
});

likeBtn.addEventListener('click', () => {
    const card = swipeStackEl.querySelector('.swipe-card');
    const entry = currentSwipeEntries()[0];
    if (card && entry) commitSwipe('like', card, entry);
});

swipeBackBtn.addEventListener('click', () => showView('categories'));

// ── Liked ─────────────────────────────────────────────────────────────────────

function renderLikedList() {
    likedListEl.innerHTML = '';
    likedEmptyHint.hidden = likedProfiles.length > 0;

    for (const entry of likedProfiles) {
        const li = document.createElement('li');
        li.className = 'profile-list-item';

        const text = document.createElement('div');
        text.className = 'profile-list-text';
        text.innerHTML = '<div class="profile-list-category"></div><div class="profile-list-sub"></div>';
        text.querySelector('.profile-list-category').textContent = entry.businessName || entry.fromName || categoryLabel(entry.category);
        text.querySelector('.profile-list-sub').textContent = [categoryLabel(entry.category), entry.zip].filter(Boolean).join(' · ');

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'profile-list-remove';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                await core.invoke('unlike_profile', { profileId: entry.profileId });
                likedProfiles = likedProfiles.filter((l) => l.profileId !== entry.profileId);
                renderLikedList();
            } catch (err) {
                setStatus(`Couldn't remove: ${err}`);
            }
        });

        li.append(text, removeBtn);
        likedListEl.appendChild(li);
    }
}

async function loadLiked() {
    likedProfiles = await core.invoke('load_liked_profiles');
    renderLikedList();
}

likedBackBtn.addEventListener('click', () => showView('list'));

// ── Canonical profile ────────────────────────────────────────────────────────
//
// A separate, App-Group-shared record — independent of `profiles` above.
// Mirrors slugify() in src-tauri/src/lib.rs.

let preProfileView = 'list';
let pendingProfilePhoto = null;
let pendingProfileFields = [];
let editingProfileFieldIndex = null;

function getInitials(name) {
    if (!name) return '?';
    return name
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function setAvatarContent(el, photo, name) {
    if (photo) {
        el.style.backgroundImage = `url(data:image/jpeg;base64,${photo})`;
        el.textContent = '';
    } else {
        el.style.backgroundImage = '';
        el.textContent = getInitials(name);
    }
}

async function resizeImageToJpegBase64(bytes) {
    const blob = new Blob([bytes]);
    const bitmap = await createImageBitmap(blob);

    const scale = Math.min(1, PHOTO_SIZE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', PHOTO_QUALITY);
    return dataUrl.split(',')[1];
}

function slugify(s) {
    return s
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

function renderProfileFields() {
    profileFieldsEl.innerHTML = '';

    pendingProfileFields.forEach((entry, index) => {
        const li = document.createElement('li');
        li.className = 'link-entry';

        if (index === editingProfileFieldIndex) {
            const fields = document.createElement('div');
            fields.className = 'link-entry-edit-fields';

            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.placeholder = 'Field';
            nameInput.maxLength = 40;
            nameInput.value = entry.name;

            const valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.placeholder = 'Value';
            valueInput.value = entry.value;

            const commit = () => {
                entry.name = nameInput.value.trim();
                entry.value = valueInput.value.trim();
                entry.slug = slugify(entry.name);
                editingProfileFieldIndex = null;
                renderProfileFields();
            };
            const onEnter = (e) => { if (e.key === 'Enter') commit(); };
            nameInput.addEventListener('keydown', onEnter);
            valueInput.addEventListener('keydown', onEnter);

            fields.append(nameInput, valueInput);
            li.appendChild(fields);

            const doneBtn = document.createElement('button');
            doneBtn.type = 'button';
            doneBtn.textContent = '✓';
            doneBtn.addEventListener('click', commit);

            const actions = document.createElement('div');
            actions.className = 'link-entry-actions';
            actions.appendChild(doneBtn);
            li.appendChild(actions);

            profileFieldsEl.appendChild(li);
            nameInput.focus();
            return;
        }

        const text = document.createElement('div');
        text.className = 'link-entry-text';
        text.innerHTML = '<div class="link-entry-label"></div><div class="link-entry-url"></div>';
        text.querySelector('.link-entry-label').textContent = entry.name || entry.slug;
        text.querySelector('.link-entry-url').textContent = entry.value;
        text.addEventListener('click', () => {
            editingProfileFieldIndex = index;
            renderProfileFields();
        });
        li.appendChild(text);

        const actions = document.createElement('div');
        actions.className = 'link-entry-actions';

        const upBtn = document.createElement('button');
        upBtn.type = 'button';
        upBtn.textContent = '↑';
        upBtn.disabled = index === 0;
        upBtn.addEventListener('click', () => {
            [pendingProfileFields[index - 1], pendingProfileFields[index]] = [pendingProfileFields[index], pendingProfileFields[index - 1]];
            renderProfileFields();
        });

        const downBtn = document.createElement('button');
        downBtn.type = 'button';
        downBtn.textContent = '↓';
        downBtn.disabled = index === pendingProfileFields.length - 1;
        downBtn.addEventListener('click', () => {
            [pendingProfileFields[index], pendingProfileFields[index + 1]] = [pendingProfileFields[index + 1], pendingProfileFields[index]];
            renderProfileFields();
        });

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => {
            pendingProfileFields.splice(index, 1);
            if (editingProfileFieldIndex === index) editingProfileFieldIndex = null;
            renderProfileFields();
        });

        actions.append(upBtn, downBtn, removeBtn);
        li.appendChild(actions);
        profileFieldsEl.appendChild(li);
    });

    const atLimit = pendingProfileFields.length >= MAX_PROFILE_FIELDS;
    profileAddFieldBtn.disabled = atLimit;
    profileFieldLimitHint.hidden = !atLimit;
}

profileAddFieldBtn.addEventListener('click', () => {
    const name = profileNewFieldName.value.trim();
    const value = profileNewFieldValue.value.trim();
    if (!name || !value || pendingProfileFields.length >= MAX_PROFILE_FIELDS) return;

    pendingProfileFields.push({ slug: slugify(name), name, value });
    profileNewFieldName.value = '';
    profileNewFieldValue.value = '';
    renderProfileFields();
});

profileChoosePhotoBtn.addEventListener('click', async () => {
    try {
        const path = await dialog.open({
            multiple: false,
            filters: [{ name: 'Image', extensions: ['png', 'jpg', 'jpeg', 'heic'] }],
        });
        if (!path) return;

        const bytes = await fs.readFile(path);
        pendingProfilePhoto = await resizeImageToJpegBase64(bytes);
        setAvatarContent(profilePhotoPreview, pendingProfilePhoto, '');
    } catch (err) {
        setStatus(`Couldn't set photo: ${err}`);
    }
});

function fillProfileForm(profile) {
    pendingProfilePhoto = profile?.photo || null;
    pendingProfileFields = (profile?.fields || []).map((f) => ({ ...f }));
    editingProfileFieldIndex = null;
    setAvatarContent(profilePhotoPreview, profile?.photo, '');
    renderProfileFields();
}

function canonicalProfileFromForm() {
    return {
        photo: pendingProfilePhoto || undefined,
        fields: pendingProfileFields,
    };
}

function currentViewName() {
    if (!createView.hidden) return 'create';
    if (!categoriesView.hidden) return 'categories';
    if (!swipeView.hidden) return 'swipe';
    if (!likedView.hidden) return 'liked';
    return 'list';
}

profileNavBtn.addEventListener('click', async () => {
    preProfileView = currentViewName();
    try {
        const profile = await core.invoke('load_canonical_profile');
        fillProfileForm(profile);
        showView('profile');
    } catch (err) {
        setStatus(`Couldn't load profile: ${err}`);
    }
});

profileForm2.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await core.invoke('save_canonical_profile', { profile: canonicalProfileFromForm() });
        setStatus('Profile saved — shared across your apps.');
        showView(preProfileView);
    } catch (err) {
        setStatus(`Couldn't save: ${err}`);
    }
});

profileCloseBtn.addEventListener('click', () => showView(preProfileView));

// ── Startup ───────────────────────────────────────────────────────────────────

async function init() {
    try {
        categories = await core.invoke('get_categories');
    } catch {
        categories = [];
    }
    populateCategorySelect();
    renderCategoryList();
    loadDiscoverFilter();
    showView('list');
    await loadProfiles();
}

init();
