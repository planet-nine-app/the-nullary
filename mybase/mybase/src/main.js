// MyBase - Social Networking Platform
// No-modules approach for Tauri compatibility

const { invoke } = window.__TAURI__.core;

// Global app state
const appState = {
    currentScreen: 'feed',
    currentProfile: null,
    socialPosts: [],
    bases: [],
    sessionless: null,
    loading: false,
    currentPostType: 'text'
};

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
    
    // Show requested screen
    const screen = document.getElementById(`${screenName}-screen`);
    if (screen) {
        screen.classList.add('active');
        appState.currentScreen = screenName;
        loadScreenData(screenName);
    }
}

// Load screen-specific data
async function loadScreenData(screenName) {
    switch (screenName) {
        case 'feed':
            await loadSocialFeed();
            break;
        case 'profile':
            await loadProfileData();
            break;
        case 'bases':
            await loadBases();
            break;
        case 'planet-nine':
            loadPlanetNineContent();
            break;
    }
}

// Social Feed Functions
async function loadSocialFeed() {
    const content = document.querySelector('#feed-screen .content');
    if (!content) return;

    // Show loading state
    content.innerHTML = '<div class="loading-posts">Loading social feed...</div>';
    appState.loading = true;

    try {
        const result = await invoke('get_social_feed', { 
            baseName: null,
            limit: 20,
            offset: 0
        });
        
        if (result.success && result.data) {
            appState.socialPosts = result.data.posts;
            displaySocialFeed();
        } else {
            displaySocialFeedError(result.error || 'Failed to load social feed');
        }
    } catch (error) {
        console.error('Error loading social feed:', error);
        displaySocialFeedError('Failed to connect to social feed service');
    } finally {
        appState.loading = false;
    }
}

function displaySocialFeed() {
    const content = document.querySelector('#feed-screen .content');
    if (!content) return;

    if (appState.socialPosts.length === 0) {
        content.innerHTML = `
            <div class="empty-state">
                <h3>No posts yet</h3>
                <p>Be the first to share something with your base!</p>
                <button class="form-button" onclick="openCreatePostModal()">Create Post</button>
            </div>
        `;
        return;
    }

    const feedContainer = document.createElement('div');
    feedContainer.className = 'social-feed';
    
    appState.socialPosts.forEach(post => {
        const postElement = createSocialPostElement(post);
        feedContainer.appendChild(postElement);
    });

    content.innerHTML = '';
    content.appendChild(feedContainer);
}

function createSocialPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'social-post';
    
    // Post header with author info
    const header = document.createElement('div');
    header.className = 'post-header';
    
    const avatar = document.createElement('div');
    avatar.className = 'author-avatar';
    avatar.textContent = getInitials(post.author.name);
    if (post.author.image_url) {
        avatar.style.backgroundImage = `url(${post.author.image_url})`;
        avatar.style.backgroundSize = 'cover';
        avatar.textContent = '';
    }
    
    const authorInfo = document.createElement('div');
    authorInfo.className = 'author-info';
    
    const authorName = document.createElement('div');
    authorName.className = 'author-name';
    authorName.textContent = post.author.name;
    
    const postTime = document.createElement('div');
    postTime.className = 'post-time';
    postTime.textContent = formatTimeAgo(new Date(post.timestamp));
    
    const typeBadge = document.createElement('span');
    typeBadge.className = `post-type-badge ${post.post_type.toLowerCase()}`;
    typeBadge.textContent = post.post_type;
    
    authorInfo.appendChild(authorName);
    authorInfo.appendChild(postTime);
    
    header.appendChild(avatar);
    header.appendChild(authorInfo);
    header.appendChild(typeBadge);
    
    // Post content based on type
    const contentDiv = document.createElement('div');
    contentDiv.className = 'post-content';
    
    switch (post.post_type) {
        case 'Text':
            contentDiv.appendChild(createTextPostContent(post.content));
            break;
        case 'Photo':
            contentDiv.appendChild(createPhotoPostContent(post.content));
            break;
        case 'Video':
            contentDiv.appendChild(createVideoPostContent(post.content));
            break;
    }
    
    // Post actions
    const actions = document.createElement('div');
    actions.className = 'post-actions';
    
    const actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';
    
    const likeButton = document.createElement('button');
    likeButton.className = 'action-button';
    likeButton.innerHTML = `❤️ ${post.likes}`;
    
    const commentButton = document.createElement('button');
    commentButton.className = 'action-button';
    commentButton.innerHTML = `💬 ${post.comments}`;
    
    const shareButton = document.createElement('button');
    shareButton.className = 'action-button';
    shareButton.innerHTML = `🔗 ${post.shares}`;
    
    actionButtons.appendChild(likeButton);
    actionButtons.appendChild(commentButton);
    actionButtons.appendChild(shareButton);
    actions.appendChild(actionButtons);
    
    postDiv.appendChild(header);
    postDiv.appendChild(contentDiv);
    postDiv.appendChild(actions);
    
    return postDiv;
}

function createTextPostContent(content) {
    const container = document.createElement('div');
    
    if (content.title) {
        const title = document.createElement('div');
        title.className = 'post-title';
        title.textContent = content.title;
        container.appendChild(title);
    }
    
    const description = document.createElement('div');
    description.className = 'post-description';
    description.textContent = content.content;
    container.appendChild(description);
    
    if (content.tags && content.tags.length > 0) {
        const tags = document.createElement('div');
        tags.className = 'post-tags';
        
        content.tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'tag';
            tagSpan.textContent = `#${tag}`;
            tags.appendChild(tagSpan);
        });
        
        container.appendChild(tags);
    }
    
    return container;
}

function createPhotoPostContent(content) {
    const container = document.createElement('div');
    
    if (content.title) {
        const title = document.createElement('div');
        title.className = 'post-title';
        title.textContent = content.title;
        container.appendChild(title);
    }
    
    const description = document.createElement('div');
    description.className = 'post-description';
    description.textContent = content.description;
    container.appendChild(description);
    
    if (content.images && content.images.length > 0) {
        const imagesContainer = document.createElement('div');
        imagesContainer.className = 'post-images';
        
        content.images.forEach(imageUrl => {
            const img = document.createElement('img');
            img.className = 'post-image';
            img.src = imageUrl;
            img.alt = 'Post image';
            imagesContainer.appendChild(img);
        });
        
        container.appendChild(imagesContainer);
    }
    
    if (content.tags && content.tags.length > 0) {
        const tags = document.createElement('div');
        tags.className = 'post-tags';
        
        content.tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'tag';
            tagSpan.textContent = `#${tag}`;
            tags.appendChild(tagSpan);
        });
        
        container.appendChild(tags);
    }
    
    return container;
}

function createVideoPostContent(content) {
    const container = document.createElement('div');
    
    if (content.title) {
        const title = document.createElement('div');
        title.className = 'post-title';
        title.textContent = content.title;
        container.appendChild(title);
    }
    
    const description = document.createElement('div');
    description.className = 'post-description';
    description.textContent = content.description;
    container.appendChild(description);
    
    const videoContainer = document.createElement('div');
    videoContainer.className = 'post-video';
    
    // For now, show placeholder - in real implementation would embed video
    videoContainer.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">🎥</div>
            <div>Video: ${content.url}</div>
            ${content.duration ? `<div style="font-size: 12px; opacity: 0.7;">${formatDuration(content.duration)}</div>` : ''}
        </div>
    `;
    
    container.appendChild(videoContainer);
    
    if (content.tags && content.tags.length > 0) {
        const tags = document.createElement('div');
        tags.className = 'post-tags';
        
        content.tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'tag';
            tagSpan.textContent = `#${tag}`;
            tags.appendChild(tagSpan);
        });
        
        container.appendChild(tags);
    }
    
    return container;
}

function displaySocialFeedError(error) {
    const content = document.querySelector('#feed-screen .content');
    if (!content) return;

    content.innerHTML = `
        <div class="empty-state">
            <h3>Error Loading Feed</h3>
            <p>${error}</p>
            <button class="form-button" onclick="loadSocialFeed()">Retry</button>
        </div>
    `;
}

// Profile Management Functions
async function loadProfileData() {
    const content = document.querySelector('#profile-screen .content');
    if (!content) return;

    try {
        const sessionlessResult = await invoke('get_sessionless_info');
        if (sessionlessResult.success) {
            const profileResult = await invoke('get_profile', { 
                uuid: sessionlessResult.data.uuid 
            });
            
            if (profileResult.success && profileResult.data) {
                appState.currentProfile = profileResult.data;
                displayProfile();
            } else {
                displayCreateProfileForm();
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        displayCreateProfileForm();
    }
}

function displayProfile() {
    const content = document.querySelector('#profile-screen .content');
    if (!content || !appState.currentProfile) return;

    const profile = appState.currentProfile;
    
    content.innerHTML = `
        <div class="profile-card">
            <div class="profile-avatar-large">
                ${profile.image_url ? `<img src="${profile.image_url}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : getInitials(profile.name)}
            </div>
            
            <div class="profile-name">${profile.name}</div>
            
            ${profile.bio ? `<div class="profile-bio">${profile.bio}</div>` : ''}
            
            <div class="profile-details">
                ${profile.email ? `<div class="profile-detail">📧 ${profile.email}</div>` : ''}
                ${profile.location ? `<div class="profile-detail">📍 ${profile.location}</div>` : ''}
                ${profile.website ? `<div class="profile-detail">🌐 <a href="${profile.website}" target="_blank">${profile.website}</a></div>` : ''}
            </div>
            
            ${profile.skills && profile.skills.length > 0 ? `
                <div class="profile-skills">
                    ${profile.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            ` : ''}
            
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="form-button" onclick="editProfile()">Edit Profile</button>
                <button class="form-button secondary" onclick="viewMyPosts()">My Posts</button>
            </div>
        </div>
    `;
}

function displayCreateProfileForm() {
    const content = document.querySelector('#profile-screen .content');
    if (!content) return;

    content.innerHTML = `
        <div class="profile-card">
            <h2 style="margin-bottom: 20px;">Create Your Profile</h2>
            <form id="createProfileForm">
                <div class="form-group">
                    <label class="form-label">Name *</label>
                    <input type="text" class="form-input" id="profileName" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Email *</label>
                    <input type="email" class="form-input" id="profileEmail" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Bio</label>
                    <textarea class="form-input form-textarea" id="profileBio" placeholder="Tell us about yourself..."></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Skills (comma-separated)</label>
                    <input type="text" class="form-input" id="profileSkills" placeholder="JavaScript, Design, Photography">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Website</label>
                    <input type="url" class="form-input" id="profileWebsite" placeholder="https://yourwebsite.com">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Location</label>
                    <input type="text" class="form-input" id="profileLocation" placeholder="City, Country">
                </div>
                
                <button type="submit" class="form-button">Create Profile</button>
            </form>
        </div>
    `;

    // Add form submission handler
    document.getElementById('createProfileForm').addEventListener('submit', handleCreateProfile);
}

async function handleCreateProfile(e) {
    e.preventDefault();
    
    const profileData = {
        name: document.getElementById('profileName').value,
        email: document.getElementById('profileEmail').value,
        bio: document.getElementById('profileBio').value || null,
        skills: document.getElementById('profileSkills').value ? 
            document.getElementById('profileSkills').value.split(',').map(s => s.trim()) : null,
        website: document.getElementById('profileWebsite').value || null,
        location: document.getElementById('profileLocation').value || null,
    };

    try {
        const result = await invoke('create_profile', { 
            profileData: profileData,
            imageData: null 
        });
        
        if (result.success) {
            appState.currentProfile = result.data;
            displayProfile();
        } else {
            alert(`Failed to create profile: ${result.error}`);
        }
    } catch (error) {
        console.error('Error creating profile:', error);
        alert('Failed to create profile');
    }
}

// Base Management Functions
async function loadBases() {
    const content = document.querySelector('#bases-screen .content');
    if (!content) return;

    try {
        const result = await invoke('get_bases');
        
        if (result.success && result.data) {
            appState.bases = result.data;
            displayBases();
        } else {
            displayBasesError(result.error || 'Failed to load bases');
        }
    } catch (error) {
        console.error('Error loading bases:', error);
        displayBasesError('Failed to connect to base service');
    }
}

function displayBases() {
    const content = document.querySelector('#bases-screen .content');
    if (!content) return;

    content.innerHTML = '';
    
    appState.bases.forEach(base => {
        const baseCard = document.createElement('div');
        baseCard.className = 'base-card';
        
        baseCard.innerHTML = `
            <div class="base-header">
                <div class="base-name">${base.name}</div>
                <div class="base-status ${base.joined ? 'joined' : 'not-joined'}">
                    ${base.joined ? 'Joined' : 'Available'}
                </div>
            </div>
            
            <div class="base-description">${base.description}</div>
            
            <div class="base-stats">
                <div class="base-stat">
                    <span>👥</span>
                    <span>${base.profile_count}/999 profiles</span>
                </div>
                <div class="base-stat">
                    <span>📝</span>
                    <span>${base.post_count}/999 posts</span>
                </div>
            </div>
            
            <div class="base-actions">
                ${base.joined 
                    ? `<button class="form-button danger" onclick="leaveBase('${base.name}')">Leave Base</button>`
                    : `<button class="form-button" onclick="joinBase('${base.name}')" ${base.profile_count >= 999 ? 'disabled' : ''}>
                        ${base.profile_count >= 999 ? 'Base Full' : 'Join Base'}
                       </button>`
                }
                <button class="form-button secondary" onclick="viewBaseProfiles('${base.name}')">View Profiles</button>
            </div>
        `;
        
        content.appendChild(baseCard);
    });
}

function displayBasesError(error) {
    const content = document.querySelector('#bases-screen .content');
    if (!content) return;

    content.innerHTML = `
        <div class="empty-state">
            <h3>Error Loading Bases</h3>
            <p>${error}</p>
            <button class="form-button" onclick="loadBases()">Retry</button>
        </div>
    `;
}

async function joinBase(baseName) {
    try {
        const result = await invoke('join_base', { baseName });
        if (result.success) {
            await loadBases(); // Refresh the bases list
            await loadSocialFeed(); // Refresh the feed with new base content
        } else {
            alert(`Failed to join base: ${result.error}`);
        }
    } catch (error) {
        console.error('Error joining base:', error);
        alert('Failed to join base');
    }
}

async function leaveBase(baseName) {
    try {
        const result = await invoke('leave_base', { baseName });
        if (result.success) {
            await loadBases(); // Refresh the bases list
            await loadSocialFeed(); // Refresh the feed
        } else {
            alert(`Failed to leave base: ${result.error}`);
        }
    } catch (error) {
        console.error('Error leaving base:', error);
        alert('Failed to leave base');
    }
}

// Post Creation Functions
function openCreatePostModal() {
    const modal = document.getElementById('createPostModal');
    modal.classList.add('active');
    
    // Reset form
    document.getElementById('createPostForm').reset();
    switchPostType('text');
    
    // Add post type selector handlers
    document.querySelectorAll('.post-type-button').forEach(button => {
        button.addEventListener('click', () => {
            const postType = button.dataset.type;
            switchPostType(postType);
        });
    });
    
    // Add form submission handler
    document.getElementById('createPostForm').addEventListener('submit', handleCreatePost);
}

function closeCreatePostModal() {
    const modal = document.getElementById('createPostModal');
    modal.classList.remove('active');
}

function switchPostType(type) {
    appState.currentPostType = type;
    
    // Update active button
    document.querySelectorAll('.post-type-button').forEach(button => {
        button.classList.remove('active');
        if (button.dataset.type === type) {
            button.classList.add('active');
        }
    });
    
    // Show/hide content groups
    document.getElementById('textContentGroup').style.display = type === 'text' ? 'block' : 'none';
    document.getElementById('photoContentGroup').style.display = type === 'photo' ? 'block' : 'none';
    document.getElementById('videoContentGroup').style.display = type === 'video' ? 'block' : 'none';
}

async function handleCreatePost(e) {
    e.preventDefault();
    
    const title = document.getElementById('postTitle').value || null;
    const tags = document.getElementById('postTags').value ? 
        document.getElementById('postTags').value.split(',').map(s => s.trim()) : [];
    
    try {
        let result;
        
        switch (appState.currentPostType) {
            case 'text':
                const content = document.getElementById('postContent').value;
                result = await invoke('create_text_post', { title, content, tags });
                break;
                
            case 'photo':
                const description = document.getElementById('photoDescription').value;
                const images = document.getElementById('photoUrls').value ? 
                    document.getElementById('photoUrls').value.split('\n').map(s => s.trim()).filter(s => s) : [];
                result = await invoke('create_photo_post', { title, description, images, tags });
                break;
                
            case 'video':
                const videoDescription = document.getElementById('videoDescription').value;
                const url = document.getElementById('videoUrl').value;
                const thumbnail = document.getElementById('videoThumbnail').value || null;
                result = await invoke('create_video_post', { 
                    title, 
                    description: videoDescription, 
                    url, 
                    thumbnail, 
                    duration: null, 
                    tags 
                });
                break;
        }
        
        if (result.success) {
            closeCreatePostModal();
            await loadSocialFeed(); // Refresh the feed
        } else {
            alert(`Failed to create post: ${result.error}`);
        }
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post');
    }
}

// Planet Nine Content
function loadPlanetNineContent() {
    const content = document.querySelector('#planet-nine-screen .content');
    if (!content) return;

    content.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: white;">
            <h1 style="font-size: 48px; font-weight: 700; margin-bottom: 30px;">🪐 Planet Nine</h1>
            <p style="font-size: 18px; line-height: 1.6; max-width: 600px; margin: 0 auto 40px;">
                Welcome to MyBase - the social networking platform of the Planet Nine ecosystem. 
                Connect with people across decentralized bases, share your thoughts, photos, and videos 
                without algorithmic manipulation or advertising interference.
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 30px; max-width: 800px; margin: 0 auto;">
                <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 12px;">
                    <div style="font-size: 36px; margin-bottom: 15px;">👥</div>
                    <h3 style="margin-bottom: 10px;">Social Networking</h3>
                    <p style="font-size: 14px; opacity: 0.8;">Connect with real people across the decentralized network</p>
                </div>
                <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 12px;">
                    <div style="font-size: 36px; margin-bottom: 15px;">🔒</div>
                    <h3 style="margin-bottom: 10px;">Privacy First</h3>
                    <p style="font-size: 14px; opacity: 0.8;">Your data stays with you, no tracking or surveillance</p>
                </div>
                <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 12px;">
                    <div style="font-size: 36px; margin-bottom: 15px;">🌐</div>
                    <h3 style="margin-bottom: 10px;">Decentralized</h3>
                    <p style="font-size: 14px; opacity: 0.8;">No single point of control, truly distributed network</p>
                </div>
            </div>
        </div>
    `;
}

// Utility Functions
function getInitials(name) {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
}

function formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
}

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// App Structure Creation
function createAppStructure() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <!-- Social Feed Screen -->
        <div id="feed-screen" class="screen active">
            <nav class="nav-bar">
                <div class="nav-title">👥 MyBase</div>
                <div class="nav-buttons">
                    <button class="nav-button active" data-screen="feed">Feed</button>
                    <button class="nav-button" data-screen="profile">Profile</button>
                    <button class="nav-button" data-screen="bases">Bases</button>
                    <button class="nav-button" data-screen="planet-nine">Planet Nine</button>
                </div>
            </nav>
            <div class="content">
                <div class="loading-posts">Loading social feed...</div>
            </div>
        </div>

        <!-- Profile Screen -->
        <div id="profile-screen" class="screen">
            <nav class="nav-bar">
                <div class="nav-title">👤 Profile</div>
                <div class="nav-buttons">
                    <button class="nav-button" data-screen="feed">Feed</button>
                    <button class="nav-button active" data-screen="profile">Profile</button>
                    <button class="nav-button" data-screen="bases">Bases</button>
                    <button class="nav-button" data-screen="planet-nine">Planet Nine</button>
                </div>
            </nav>
            <div class="content">
                <div class="loading-posts">Loading profile...</div>
            </div>
        </div>

        <!-- Bases Screen -->
        <div id="bases-screen" class="screen">
            <nav class="nav-bar">
                <div class="nav-title">🏗️ Base Management</div>
                <div class="nav-buttons">
                    <button class="nav-button" data-screen="feed">Feed</button>
                    <button class="nav-button" data-screen="profile">Profile</button>
                    <button class="nav-button active" data-screen="bases">Bases</button>
                    <button class="nav-button" data-screen="planet-nine">Planet Nine</button>
                </div>
            </nav>
            <div class="content">
                <div class="loading-posts">Loading bases...</div>
            </div>
        </div>

        <!-- Planet Nine Screen -->
        <div id="planet-nine-screen" class="screen">
            <nav class="nav-bar">
                <div class="nav-title">🪐 Planet Nine</div>
                <div class="nav-buttons">
                    <button class="nav-button" data-screen="feed">Feed</button>
                    <button class="nav-button" data-screen="profile">Profile</button>
                    <button class="nav-button" data-screen="bases">Bases</button>
                    <button class="nav-button active" data-screen="planet-nine">Planet Nine</button>
                </div>
            </nav>
            <div class="content">
                <div class="loading-posts">Loading Planet Nine info...</div>
            </div>
        </div>
        
        <!-- Floating Action Button -->
        <button class="fab" onclick="openCreatePostModal()" title="Create Post">✨</button>
    `;
    
    // Add navigation event listeners
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', () => {
            const screenName = button.dataset.screen;
            if (screenName) {
                showScreen(screenName);
            }
        });
    });
}

// Global functions for window object
window.showScreen = showScreen;
window.loadSocialFeed = loadSocialFeed;
window.loadBases = loadBases;
window.joinBase = joinBase;
window.leaveBase = leaveBase;
window.openCreatePostModal = openCreatePostModal;
window.closeCreatePostModal = closeCreatePostModal;
window.editProfile = () => alert('Edit profile feature coming soon!');
window.viewMyPosts = () => alert('View my posts feature coming soon!');
window.viewBaseProfiles = (baseName) => alert(`View profiles for ${baseName} coming soon!`);

// Initialize the application
async function initApp() {
    try {
        // Get sessionless info
        const sessionlessResult = await invoke('get_sessionless_info');
        if (sessionlessResult.success) {
            appState.sessionless = sessionlessResult.data;
        }

        // Create app structure
        createAppStructure();

        // Load initial screen data
        await loadScreenData(appState.currentScreen);

    } catch (error) {
        console.error('Failed to initialize app:', error);
        
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="loading">
                <h2>Failed to initialize MyBase</h2>
                <p>Please check your connection and try again.</p>
                <button onclick="window.location.reload()">Reload</button>
            </div>
        `;
    }
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);