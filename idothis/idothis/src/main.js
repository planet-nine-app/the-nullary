// IDothis - Professional Showcase Platform
// No-modules approach for Tauri compatibility

// Use the global environment configuration from environment-config.js
function getEnvironmentConfig() {
  if (window.PlanetNineEnvironment) {
    return window.PlanetNineEnvironment.getEnvironmentConfig();
  }
  console.error('🚨 PlanetNineEnvironment not available, environment-config.js may not have loaded');
  return { env: 'dev', services: {}, name: 'dev' };
}

function getServiceUrl(serviceName) {
  if (window.PlanetNineEnvironment) {
    return window.PlanetNineEnvironment.getServiceUrl(serviceName);
  }
  console.error('🚨 PlanetNineEnvironment not available, environment-config.js may not have loaded');
  return 'https://dev.sanora.allyabase.com/';
}

const { invoke } = window.__TAURI__.core;

// Global app state
const appState = {
    currentScreen: 'profiles',
    currentProfile: null,
    profiles: [], // All discovered profiles
    currentProfileIndex: 0,
    likedProfiles: [],
    passedProfiles: [],
    sessionless: null,
    loading: false,
    swipeThreshold: 100
};

// Initialize environment
async function initializeEnvironment() {
    try {
        if (invoke) {
            const envFromRust = await invoke('get_env_config');
            if (envFromRust && ['dev', 'test', 'local'].includes(envFromRust)) {
                console.log(`🌍 Environment from Rust: ${envFromRust}`);
                localStorage.setItem('nullary-env', envFromRust);
                return envFromRust;
            }
        }
    } catch (error) {
        console.log('⚠️ Could not get environment from Rust, using localStorage/default');
    }
    return localStorage.getItem('nullary-env') || 'dev';
}

// Screen Management
function showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Update navigation buttons
    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.remove('active');
        if (button.dataset.screen === screenName) {
            button.classList.add('active');
        }
    });
    
    // Show the requested screen
    const screen = document.getElementById(`${screenName}-screen`);
    if (screen) {
        screen.classList.add('active');
        appState.currentScreen = screenName;
        
        // Load screen-specific data
        loadScreenData(screenName);
    }
}

// Load data for specific screens
async function loadScreenData(screenName) {
    switch (screenName) {
        case 'profile':
            await loadMyProfile();
            break;
        case 'profiles':
            await loadProfilesForSwipe();
            break;
        case 'likes':
            displayLikedProfiles();
            break;
    }
}

// Profile Management
async function loadMyProfile() {
    try {
        appState.loading = true;
        updateUI();
        
        const profile = await invoke('get_profile');
        appState.currentProfile = profile;
        displayProfile(profile);
    } catch (error) {
        console.error('Error loading profile:', error);
        showCreateProfileForm();
    } finally {
        appState.loading = false;
        updateUI();
    }
}

function displayProfile(profile) {
    const container = document.getElementById('profileDisplay');
    
    if (!profile) {
        showCreateProfileForm();
        return;
    }
    
    // Create profile display
    container.innerHTML = `
        <div class="profile-card">
            <div class="profile-avatar-large">
                ${profile.imageFilename ? 
                    `<img src="${profile.imageUrl || '#'}" alt="Profile" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                     <div class="avatar-fallback" style="display:none;">${profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}</div>` :
                    `<div class="avatar-fallback">${profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}</div>`
                }
            </div>
            <div class="profile-name">${profile.name || 'No Name'}</div>
            <div class="profile-email">${profile.email || 'No Email'}</div>
            <div class="profile-idothis">${profile.idothis || 'What do you do?'}</div>
            ${profile.bio ? `<div class="profile-bio">${profile.bio}</div>` : ''}
            ${profile.website ? `<div class="profile-website"><a href="${profile.website}" target="_blank">${profile.website}</a></div>` : ''}
            ${profile.location ? `<div class="profile-location">📍 ${profile.location}</div>` : ''}
            
            <div class="profile-actions">
                <button class="form-button" onclick="showEditProfileForm()">Edit Profile</button>
                <button class="form-button danger" onclick="deleteProfile()">Delete Profile</button>
            </div>
        </div>
    `;
}

function showCreateProfileForm() {
    const container = document.getElementById('profileDisplay');
    container.innerHTML = `
        <div class="profile-card">
            <h3>Create Your Professional Profile</h3>
            <div class="widget-container" id="profileFormContainer"></div>
        </div>
    `;
    
    // Create form configuration for profile creation
    const formConfig = {
        "Name": { type: "text", required: true },
        "Email": { type: "text", required: true },
        "I do this": { type: "text", required: true },
        "Bio": { type: "textarea", charLimit: 500, required: false },
        "Website": { type: "text", required: false },
        "Location": { type: "text", required: false },
        "Profile Image": { type: "image", required: false }
    };
    
    // Handle form submission
    function handleProfileCreation(formData) {
        console.log('🚀 Creating profile with form data:', formData);
        
        const profileData = {
            name: formData["Name"] || '',
            email: formData["Email"] || '',
            idothis: formData["I do this"] || '',
            bio: formData["Bio"] || '',
            website: formData["Website"] || '',
            location: formData["Location"] || ''
        };
        
        // Get image data if provided
        let imageData = null;
        if (formData["Profile Image"] && formData["Profile Image"].dataUrl) {
            imageData = formData["Profile Image"].dataUrl.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        }
        
        // Call the existing create profile function
        createProfileFromData(profileData, imageData);
    }
    
    // Create and append the form widget
    const formWidget = window.getForm(formConfig, handleProfileCreation);
    document.getElementById('profileFormContainer').appendChild(formWidget);
}

function showEditProfileForm() {
    if (!appState.currentProfile) return;
    
    const profile = appState.currentProfile;
    const container = document.getElementById('profileDisplay');
    
    container.innerHTML = `
        <div class="profile-card">
            <h3>Edit Your Profile</h3>
            <div class="widget-container" id="profileEditFormContainer"></div>
            <div style="margin-top: 20px; text-align: center;">
                <button type="button" class="form-button secondary" onclick="loadMyProfile()">Cancel</button>
            </div>
        </div>
    `;
    
    // Create form configuration for profile editing with current values
    const formConfig = {
        "Name": { type: "text", required: true },
        "Email": { type: "text", required: true },
        "I do this": { type: "text", required: true },
        "Bio": { type: "textarea", charLimit: 500, required: false },
        "Website": { type: "text", required: false },
        "Location": { type: "text", required: false },
        "Profile Image": { type: "image", required: false }
    };
    
    // Handle form submission
    function handleProfileUpdate(formData) {
        console.log('🚀 Updating profile with form data:', formData);
        
        const profileData = {
            name: formData["Name"] || '',
            email: formData["Email"] || '',
            idothis: formData["I do this"] || '',
            bio: formData["Bio"] || '',
            website: formData["Website"] || '',
            location: formData["Location"] || ''
        };
        
        // Get image data if provided
        let imageData = null;
        if (formData["Profile Image"] && formData["Profile Image"].dataUrl) {
            imageData = formData["Profile Image"].dataUrl.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        }
        
        // Call the existing update profile function
        updateProfileFromData(profileData, imageData);
    }
    
    // Create and append the form widget
    const formWidget = window.getForm(formConfig, handleProfileUpdate);
    document.getElementById('profileEditFormContainer').appendChild(formWidget);
    
    // Pre-populate the form with current profile data
    setTimeout(() => {
        // Fill in current values
        const nameInput = document.getElementById('NameInput');
        const emailInput = document.getElementById('EmailInput');
        const idothisInput = document.getElementById('IdothisInput');
        const bioTextarea = document.getElementById('BioTextarea');
        const websiteInput = document.getElementById('WebsiteInput');
        const locationInput = document.getElementById('LocationInput');
        
        if (nameInput) nameInput.value = profile.name || '';
        if (emailInput) emailInput.value = profile.email || '';
        if (idothisInput) idothisInput.value = profile.idothis || '';
        if (bioTextarea) bioTextarea.value = profile.bio || '';
        if (websiteInput) websiteInput.value = profile.website || '';
        if (locationInput) locationInput.value = profile.location || '';
        
        // Trigger validation after pre-populating
        if (window.validateFormAndUpdateSubmit && window.currentFormJSON) {
            window.validateFormAndUpdateSubmit(window.currentFormJSON);
        }
    }, 300);
}

// Profile creation and management
async function createProfile(event) {
    event.preventDefault();
    
    const profileData = {
        name: document.getElementById('profileName').value,
        email: document.getElementById('profileEmail').value,
        idothis: document.getElementById('profileIdothis').value,
        bio: document.getElementById('profileBio').value,
        website: document.getElementById('profileWebsite').value,
        location: document.getElementById('profileLocation').value
    };
    
    const imageFile = document.getElementById('profileImage').files[0];
    let imageData = null;
    
    if (imageFile) {
        imageData = await fileToBase64(imageFile);
    }
    
    await createProfileFromData(profileData, imageData);
}

// Helper function for profile creation from widget data
async function createProfileFromData(profileData, imageData) {
    try {
        appState.loading = true;
        updateUI();
        
        const result = await invoke('create_profile', { profileData, imageData });
        console.log('Profile created:', result);
        
        await loadMyProfile();
    } catch (error) {
        console.error('Error creating profile:', error);
        alert('Error creating profile: ' + error);
    } finally {
        appState.loading = false;
        updateUI();
    }
}

async function updateProfile(event) {
    event.preventDefault();
    
    const profileData = {
        name: document.getElementById('profileName').value,
        email: document.getElementById('profileEmail').value,
        idothis: document.getElementById('profileIdothis').value,
        bio: document.getElementById('profileBio').value,
        website: document.getElementById('profileWebsite').value,
        location: document.getElementById('profileLocation').value
    };
    
    const imageFile = document.getElementById('profileImage').files[0];
    let imageData = null;
    
    if (imageFile) {
        imageData = await fileToBase64(imageFile);
    }
    
    await updateProfileFromData(profileData, imageData);
}

// Helper function for profile update from widget data
async function updateProfileFromData(profileData, imageData) {
    try {
        appState.loading = true;
        updateUI();
        
        const result = await invoke('update_profile', { profileData, imageData });
        console.log('Profile updated:', result);
        
        await loadMyProfile();
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile: ' + error);
    } finally {
        appState.loading = false;
        updateUI();
    }
}

async function deleteProfile() {
    if (!confirm('Are you sure you want to delete your profile? This cannot be undone.')) {
        return;
    }
    
    try {
        appState.loading = true;
        updateUI();
        
        await invoke('delete_profile');
        console.log('Profile deleted');
        
        appState.currentProfile = null;
        showCreateProfileForm();
    } catch (error) {
        console.error('Error deleting profile:', error);
        alert('Error deleting profile: ' + error);
    } finally {
        appState.loading = false;
        updateUI();
    }
}

// Swipeable Profile Discovery
async function loadProfilesForSwipe() {
    try {
        appState.loading = true;
        updateUI();
        
        // Get all profiles except our own
        const profiles = await invoke('get_all_profiles');
        appState.profiles = profiles.filter(profile => 
            profile.uuid !== appState.currentProfile?.uuid
        );
        appState.currentProfileIndex = 0;
        
        displaySwipeableProfiles();
    } catch (error) {
        console.error('Error loading profiles:', error);
        displayNoProfiles();
    } finally {
        appState.loading = false;
        updateUI();
    }
}

function displaySwipeableProfiles() {
    const container = document.getElementById('swipeContainer');
    
    if (!appState.profiles || appState.profiles.length === 0) {
        displayNoProfiles();
        return;
    }
    
    const remainingProfiles = appState.profiles.slice(appState.currentProfileIndex);
    
    if (remainingProfiles.length === 0) {
        displayNoMoreProfiles();
        return;
    }
    
    container.innerHTML = `
        <div class="swipe-stats">
            <div class="stat">
                <span class="stat-number">${remainingProfiles.length}</span>
                <span class="stat-label">Remaining</span>
            </div>
            <div class="stat">
                <span class="stat-number">${appState.likedProfiles.length}</span>
                <span class="stat-label">Liked</span>
            </div>
            <div class="stat">
                <span class="stat-number">${appState.passedProfiles.length}</span>
                <span class="stat-label">Passed</span>
            </div>
        </div>
        
        <div class="swipe-area">
            <div class="swipe-instructions">
                Swipe right to like, left to pass
            </div>
            <div class="swipe-stack" id="swipeStack">
                ${generateSwipeCards(remainingProfiles.slice(0, 3))}
            </div>
            <div class="swipe-actions">
                <button class="swipe-button pass" onclick="swipeProfile('pass')">👎 Pass</button>
                <button class="swipe-button like" onclick="swipeProfile('like')">👍 Like</button>
            </div>
        </div>
    `;
    
    // Add swipe listeners to the top card
    const topCard = container.querySelector('.swipe-card:first-child');
    if (topCard) {
        addSwipeListeners(topCard);
    }
}

function generateSwipeCards(profiles) {
    return profiles.map((profile, index) => `
        <div class="swipe-card" data-profile-uuid="${profile.uuid}" style="z-index: ${10 - index}; transform: scale(${1 - index * 0.05}) translateY(${index * 10}px);">
            <div class="card-content">
                <div class="profile-header">
                    <div class="profile-avatar">
                        ${profile.imageFilename ? 
                            `<img src="${profile.imageUrl || '#'}" alt="Profile" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                             <div class="avatar-fallback" style="display:none;">${profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}</div>` :
                            `<div class="avatar-fallback">${profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}</div>`
                        }
                    </div>
                    <div class="profile-info">
                        <h3 class="profile-name">${profile.name || 'No Name'}</h3>
                        <p class="profile-idothis">${profile.idothis || 'Professional'}</p>
                        ${profile.location ? `<p class="profile-location">📍 ${profile.location}</p>` : ''}
                    </div>
                </div>
                
                ${profile.bio ? `<div class="profile-bio">${profile.bio}</div>` : ''}
                ${profile.website ? `<div class="profile-website"><a href="${profile.website}" target="_blank">🌐 Website</a></div>` : ''}
                
                <div class="swipe-indicator left">PASS</div>
                <div class="swipe-indicator right">LIKE</div>
            </div>
        </div>
    `).join('');
}

// Swipe functionality
function addSwipeListeners(card) {
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;
    
    function handleStart(e) {
        isDragging = true;
        const point = e.touches ? e.touches[0] : e;
        startX = point.clientX;
        startY = point.clientY;
        card.style.transition = 'none';
    }
    
    function handleMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        const point = e.touches ? e.touches[0] : e;
        currentX = point.clientX - startX;
        currentY = point.clientY - startY;
        
        // Apply transform
        const rotation = currentX * 0.1;
        card.style.transform = `translateX(${currentX}px) translateY(${currentY}px) rotate(${rotation}deg)`;
        
        // Show indicators
        const leftIndicator = card.querySelector('.swipe-indicator.left');
        const rightIndicator = card.querySelector('.swipe-indicator.right');
        
        if (currentX < -50) {
            leftIndicator.style.opacity = Math.min(1, Math.abs(currentX) / 100);
            rightIndicator.style.opacity = 0;
        } else if (currentX > 50) {
            rightIndicator.style.opacity = Math.min(1, currentX / 100);
            leftIndicator.style.opacity = 0;
        } else {
            leftIndicator.style.opacity = 0;
            rightIndicator.style.opacity = 0;
        }
    }
    
    function handleEnd() {
        if (!isDragging) return;
        isDragging = false;
        
        card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        
        // Determine swipe direction
        if (Math.abs(currentX) > appState.swipeThreshold) {
            const direction = currentX > 0 ? 'like' : 'pass';
            swipeCard(card, direction);
        } else {
            // Snap back
            card.style.transform = 'translateX(0) translateY(0) rotate(0deg)';
            card.querySelectorAll('.swipe-indicator').forEach(indicator => {
                indicator.style.opacity = 0;
            });
        }
        
        currentX = 0;
        currentY = 0;
    }
    
    // Mouse events
    card.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    
    // Touch events
    card.addEventListener('touchstart', handleStart);
    card.addEventListener('touchmove', handleMove);
    card.addEventListener('touchend', handleEnd);
}

function swipeProfile(direction) {
    const topCard = document.querySelector('.swipe-card:first-child');
    if (topCard) {
        swipeCard(topCard, direction);
    }
}

function swipeCard(card, direction) {
    const profileUuid = card.dataset.profileUuid;
    const profile = appState.profiles.find(p => p.uuid === profileUuid);
    
    if (profile) {
        if (direction === 'like') {
            appState.likedProfiles.push(profile);
        } else {
            appState.passedProfiles.push(profile);
        }
    }
    
    // Animate card out
    const translateX = direction === 'like' ? '100vw' : '-100vw';
    card.style.transform = `translateX(${translateX}) rotate(${direction === 'like' ? '30' : '-30'}deg)`;
    card.style.opacity = '0';
    
    // Move to next profile
    appState.currentProfileIndex++;
    
    setTimeout(() => {
        displaySwipeableProfiles();
    }, 300);
}

// Display functions for empty states
function displayNoProfiles() {
    const container = document.getElementById('swipeContainer');
    container.innerHTML = `
        <div class="empty-state">
            <h3>No Profiles Found</h3>
            <p>There are no other profiles to discover yet.</p>
            <button class="form-button" onclick="loadProfilesForSwipe()">Refresh</button>
        </div>
    `;
}

function displayNoMoreProfiles() {
    const container = document.getElementById('swipeContainer');
    container.innerHTML = `
        <div class="empty-state">
            <h3>All Done! 🎉</h3>
            <p>You've seen all available profiles.</p>
            <div class="swipe-stats">
                <div class="stat">
                    <span class="stat-number">${appState.likedProfiles.length}</span>
                    <span class="stat-label">Liked</span>
                </div>
                <div class="stat">
                    <span class="stat-number">${appState.passedProfiles.length}</span>
                    <span class="stat-label">Passed</span>
                </div>
            </div>
            <button class="form-button" onclick="loadProfilesForSwipe()">Start Over</button>
        </div>
    `;
}

// Liked profiles display
function displayLikedProfiles() {
    const container = document.getElementById('likedProfilesContainer');
    
    if (appState.likedProfiles.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Liked Profiles Yet</h3>
                <p>Profiles you like will appear here.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="liked-profiles-grid">
            ${appState.likedProfiles.map(profile => `
                <div class="profile-card liked-profile">
                    <div class="profile-avatar">
                        ${profile.imageFilename ? 
                            `<img src="${profile.imageUrl || '#'}" alt="Profile">` :
                            `<div class="avatar-fallback">${profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}</div>`
                        }
                    </div>
                    <h4 class="profile-name">${profile.name || 'No Name'}</h4>
                    <p class="profile-idothis">${profile.idothis || 'Professional'}</p>
                    ${profile.location ? `<p class="profile-location">📍 ${profile.location}</p>` : ''}
                    ${profile.website ? `<a href="${profile.website}" target="_blank" class="profile-website">🌐 Website</a>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

// Utility functions
async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

function previewImage(input) {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <div class="image-preview-container">
                    <img src="${e.target.result}" alt="Preview" class="image-preview-img">
                    <p class="image-preview-text">Image selected</p>
                </div>
            `;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// UI Update
function updateUI() {
    // Update loading states
    const loadingElements = document.querySelectorAll('.loading-posts');
    loadingElements.forEach(el => {
        el.style.display = appState.loading ? 'flex' : 'none';
    });
    
    // Update main loading
    const mainLoading = document.querySelector('.loading');
    if (mainLoading) {
        mainLoading.style.display = appState.loading ? 'flex' : 'none';
    }
}

// App Initialization
async function initializeApp() {
    console.log('🚀 Initializing IDothis...');
    
    // Initialize environment
    await initializeEnvironment();
    
    try {
        // Get sessionless info
        const sessionlessInfo = await invoke('get_sessionless_info');
        appState.sessionless = sessionlessInfo;
        console.log('🔑 Sessionless initialized:', sessionlessInfo.uuid);
        
        // Create app structure
        createAppStructure();
        
        // Show initial screen
        showScreen('profile');
        
        console.log('✅ IDothis initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize IDothis:', error);
        
        // Show error state
        document.getElementById('app').innerHTML = `
            <div class="loading">
                <div style="text-align: center; color: white;">
                    <h2>Failed to Initialize</h2>
                    <p>Error: ${error}</p>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: white; color: #667eea; border: none; border-radius: 5px; cursor: pointer;">
                        Retry
                    </button>
                </div>
            </div>
        `;
    }
}

// App Structure Creation
function createAppStructure() {
    document.getElementById('app').innerHTML = `
        <!-- Navigation -->
        <nav class="nav-bar">
            <div class="nav-title">
                💼 IDothis
            </div>
            <div class="nav-buttons">
                <button class="nav-button" data-screen="profile" onclick="showScreen('profile')">Profile</button>
                <button class="nav-button active" data-screen="profiles" onclick="showScreen('profiles')">Discover</button>
                <button class="nav-button" data-screen="likes" onclick="showScreen('likes')">Likes</button>
            </div>
        </nav>

        <!-- Profile Screen -->
        <div id="profile-screen" class="screen">
            <div class="content">
                <div id="profileDisplay"></div>
            </div>
        </div>

        <!-- Profiles Discovery Screen -->
        <div id="profiles-screen" class="screen active">
            <div class="content">
                <div id="swipeContainer"></div>
            </div>
        </div>

        <!-- Liked Profiles Screen -->
        <div id="likes-screen" class="screen">
            <div class="content">
                <h2 style="color: white; margin-bottom: 20px;">Liked Profiles</h2>
                <div id="likedProfilesContainer"></div>
            </div>
        </div>
    `;
}

// Start the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}