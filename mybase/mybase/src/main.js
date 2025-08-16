// MyBase - Social Networking Platform
// No-modules approach for Tauri compatibility

// Use the global environment configuration from environment-config.js
function getEnvironmentConfig() {
  if (window.PlanetNineEnvironment) {
    return window.PlanetNineEnvironment.getEnvironmentConfig();
  }
  // This shouldn't happen if environment-config.js loads properly
  console.error('🚨 PlanetNineEnvironment not available, environment-config.js may not have loaded');
  return { env: 'dev', services: {}, name: 'dev' };
}

function getServiceUrl(serviceName) {
  if (window.PlanetNineEnvironment) {
    return window.PlanetNineEnvironment.getServiceUrl(serviceName);
  }
  // This shouldn't happen if environment-config.js loads properly
  console.error('🚨 PlanetNineEnvironment not available, environment-config.js may not have loaded');
  return 'https://dev.sanora.allyabase.com/';
}

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
        const currentEnv = window.mybaseEnv ? window.mybaseEnv.current() : 'unknown';
        displaySocialFeedError(`Failed to connect to social feed service (${currentEnv} environment). Try switching environments: mybaseEnv.switch('dev')`);
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
        const postElement = createPostWidgetElement(post);
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

    // Show loading state
    content.innerHTML = '<div class="loading-posts">Loading profile...</div>';

    try {
        const profileResult = await invoke('get_profile');
        
        if (profileResult.success && profileResult.profile) {
            appState.currentProfile = profileResult.profile;
            displayProfile();
        } else if (profileResult.error === 'profile_not_found') {
            displayCreateProfileForm();
        } else {
            displayProfileError(profileResult.message || 'Failed to load profile');
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
    
    // Parse interests if it's a string
    let interests = [];
    if (profile.interests) {
        if (typeof profile.interests === 'string') {
            interests = profile.interests.split(',').map(i => i.trim()).filter(i => i);
        } else if (Array.isArray(profile.interests)) {
            interests = profile.interests;
        }
    }
    
    content.innerHTML = `
        <div class="profile-card">
            <div class="profile-avatar-large">
                ${profile.image_url ? `<img src="${profile.image_url}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : getInitials(profile.name)}
            </div>
            
            <div class="profile-name">${profile.name}</div>
            
            ${profile.bio ? `<div class="profile-bio">${profile.bio}</div>` : ''}
            
            <div class="profile-details">
                ${profile.homepage ? `<div class="profile-detail">🌐 <a href="${profile.homepage}" target="_blank">${profile.homepage}</a></div>` : ''}
            </div>
            
            ${interests.length > 0 ? `
                <div class="profile-skills">
                    <div style="margin-bottom: 10px; font-weight: 500; color: #666;">Interests:</div>
                    ${interests.map(interest => `<span class="skill-tag">${interest}</span>`).join('')}
                </div>
            ` : ''}
            
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                <button class="form-button" onclick="showEditProfileForm()">Edit Profile</button>
                <button class="form-button secondary" onclick="viewMyPosts()">My Posts</button>
            </div>
        </div>
    `;
}

function displayCreateProfileForm() {
    const content = document.querySelector('#profile-screen .content');
    if (!content) return;

    // Create profile form using form widget
    const profileFormConfig = {
        'Name': { 
            type: 'text', 
            required: true, 
            placeholder: 'Enter your full name' 
        },
        'About Me': { 
            type: 'textarea', 
            required: false, 
            charLimit: 500, 
            placeholder: 'Tell us about yourself...' 
        },
        'Interests': { 
            type: 'text', 
            required: false, 
            placeholder: 'Technology, Music, Photography (comma-separated)' 
        },
        'Profile Image URL': { 
            type: 'text', 
            required: false, 
            placeholder: 'https://example.com/image.jpg' 
        },
        'Homepage': { 
            type: 'text', 
            required: false, 
            placeholder: 'https://yourwebsite.com' 
        },
        form: {
            submitText: 'CREATE PROFILE'
        }
    };

    // Clear content and add the form widget
    content.innerHTML = '<div style="max-width: 600px; margin: 0 auto;"></div>';
    const formContainer = content.querySelector('div');

    // Create the form using the widget
    const formWidget = window.getForm(profileFormConfig, handleCreateProfile, 'CREATE YOUR PROFILE');
    formContainer.appendChild(formWidget);
}

function showEditProfileForm() {
    if (!appState.currentProfile) return;
    
    const content = document.querySelector('#profile-screen .content');
    if (!content) return;
    
    const profile = appState.currentProfile;
    
    // Parse interests if it's a string
    let interestsStr = '';
    if (profile.interests) {
        if (typeof profile.interests === 'string') {
            interestsStr = profile.interests;
        } else if (Array.isArray(profile.interests)) {
            interestsStr = profile.interests.join(', ');
        }
    }

    // Create edit profile form using form widget
    const editFormConfig = {
        'Name': { 
            type: 'text', 
            required: true, 
            placeholder: 'Enter your full name' 
        },
        'About Me': { 
            type: 'textarea', 
            required: false, 
            charLimit: 500, 
            placeholder: 'Tell us about yourself...' 
        },
        'Interests': { 
            type: 'text', 
            required: false, 
            placeholder: 'Technology, Music, Photography (comma-separated)' 
        },
        'Profile Image URL': { 
            type: 'text', 
            required: false, 
            placeholder: 'https://example.com/image.jpg' 
        },
        'Homepage': { 
            type: 'text', 
            required: false, 
            placeholder: 'https://yourwebsite.com' 
        },
        form: {
            submitText: 'UPDATE PROFILE'
        }
    };

    // Clear content and add the form widget
    content.innerHTML = '<div style="max-width: 600px; margin: 0 auto;"></div>';
    const formContainer = content.querySelector('div');

    // Create the form using the widget
    const formWidget = window.getForm(editFormConfig, handleUpdateProfile, 'EDIT YOUR PROFILE');
    formContainer.appendChild(formWidget);

    // Pre-populate the form fields
    setTimeout(() => {
        const nameInput = document.getElementById('NameInput');
        const bioTextarea = document.getElementById('AboutMeTextarea');
        const interestsInput = document.getElementById('InterestsInput');
        const imageUrlInput = document.getElementById('ProfileImageURLInput');
        const homepageInput = document.getElementById('HomepageInput');

        if (nameInput) nameInput.value = profile.name || '';
        if (bioTextarea) bioTextarea.value = profile.bio || '';
        if (interestsInput) interestsInput.value = interestsStr;
        if (imageUrlInput) imageUrlInput.value = profile.image_url || '';
        if (homepageInput) homepageInput.value = profile.homepage || '';

        // Trigger validation to update button state
        if (window.validateFormAndUpdateSubmit && window.currentFormJSON) {
            window.validateFormAndUpdateSubmit(window.currentFormJSON);
        }
    }, 300);

    // Add cancel button below the form
    setTimeout(() => {
        const cancelButton = document.createElement('button');
        cancelButton.className = 'form-button secondary';
        cancelButton.style.width = '100%';
        cancelButton.style.marginTop = '10px';
        cancelButton.textContent = 'Cancel';
        cancelButton.onclick = displayProfile;
        formContainer.appendChild(cancelButton);
    }, 100);
}

function displayProfileError(error) {
    const content = document.querySelector('#profile-screen .content');
    if (!content) return;

    content.innerHTML = `
        <div class="empty-state">
            <h3>Error Loading Profile</h3>
            <p>${error}</p>
            <button class="form-button" onclick="loadProfileData()">Retry</button>
        </div>
    `;
}

async function handleCreateProfile(formData) {
    console.log('Creating profile with form data:', formData);
    
    try {
        const result = await invoke('create_profile', { 
            name: formData.Name,
            bio: formData['About Me'] || null,
            interests: formData.Interests || null,
            homepage: formData.Homepage || null,
            image_url: formData['Profile Image URL'] || null
        });
        
        if (result.success) {
            appState.currentProfile = result.profile;
            displayProfile();
        } else {
            alert(`Failed to create profile: ${result.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error creating profile:', error);
        alert('Failed to create profile');
    }
}

async function handleUpdateProfile(formData) {
    console.log('Updating profile with form data:', formData);
    
    try {
        const result = await invoke('update_profile', { 
            name: formData.Name,
            bio: formData['About Me'] || null,
            interests: formData.Interests || null,
            homepage: formData.Homepage || null,
            image_url: formData['Profile Image URL'] || null
        });
        
        if (result.success) {
            appState.currentProfile = result.profile;
            displayProfile();
        } else {
            alert(`Failed to update profile: ${result.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile');
    }
}

// Import base command for real base discovery
// Note: This would normally be an import in a module system
// For now, we'll use the window.baseCommand object set by base-command.js

// Base Management Functions
async function loadBases() {
    const content = document.querySelector('#bases-screen .content');
    if (!content) return;

    try {
        // Use real BDO-based base discovery
        if (window.baseCommand) {
            const bases = await window.baseCommand.getBases();
            if (bases) {
                // Convert to array format expected by MyBase
                appState.bases = Object.values(bases);
                displayBases();
            } else {
                displayBasesError('No bases discovered');
            }
        } else {
            // Fallback to simple get_bases function
            const result = await invoke('get_bases_simple');
            
            if (result) {
                // Convert to array format expected by MyBase
                appState.bases = Object.values(result);
                displayBases();
            } else {
                displayBasesError('Failed to load bases');
            }
        }
    } catch (error) {
        console.error('Error loading bases:', error);
        const currentEnv = window.mybaseEnv ? window.mybaseEnv.current() : 'unknown';
        displayBasesError(`Failed to connect to base service (${currentEnv} environment). Try switching environments: mybaseEnv.switch('dev')`);
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
        let success = false;
        
        // Use real base command if available
        if (window.baseCommand) {
            success = await window.baseCommand.joinBase(baseName);
        } else {
            // Fallback to direct invoke
            const result = await invoke('join_base', { baseName });
            success = result.success;
        }
        
        if (success) {
            await loadBases(); // Refresh the bases list
            await loadSocialFeed(); // Refresh the feed with new base content
        } else {
            alert(`Failed to join base: ${baseName}`);
        }
    } catch (error) {
        console.error('Error joining base:', error);
        alert('Failed to join base');
    }
}

async function leaveBase(baseName) {
    try {
        let success = false;
        
        // Use real base command if available
        if (window.baseCommand) {
            success = await window.baseCommand.leaveBase(baseName);
        } else {
            // Fallback to direct invoke
            const result = await invoke('leave_base', { baseName });
            success = result.success;
        }
        
        if (success) {
            await loadBases(); // Refresh the bases list
            await loadSocialFeed(); // Refresh the feed
        } else {
            alert(`Failed to leave base: ${baseName}`);
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
    
    // Initialize the Sanora form widget for post creation
    initializePostCreationWidget();
}

function closeCreatePostModal() {
    const modal = document.getElementById('createPostModal');
    modal.classList.remove('active');
    
    // Clean up the form widget
    const container = document.getElementById('postFormContainer');
    if (container) {
        container.innerHTML = '';
    }
}

// Widget Integration Functions
function initializePostCreationWidget() {
    const container = document.getElementById('postFormContainer');
    if (!container) {
        console.error('Post form container not found');
        return;
    }
    
    // Clear existing content
    container.innerHTML = '';
    
    // Create form configuration for generic post
    const formConfig = {
        "Title": { type: "text", required: false },
        "Content": { type: "textarea", charLimit: 1000, required: true },
        "Tags": { type: "text", required: false }
    };
    
    // Create the form widget
    if (window.getForm) {
        const formWidget = window.getForm(formConfig, handlePostSubmission);
        container.appendChild(formWidget);
    } else {
        console.error('Form widget not available. Make sure form-widget.js is loaded.');
    }
}

async function handlePostSubmission(formData) {
    console.log('📝 Post submission received:', formData);
    
    try {
        // Extract form data
        const title = formData.Title || '';
        const content = formData.Content || '';
        const tagsString = formData.Tags || '';
        const tags = tagsString ? tagsString.split(',').map(s => s.trim()).filter(s => s) : [];
        
        // Create the post object for Dolores
        const post = {
            title,
            content,
            tags,
            timestamp: Date.now()
        };
        
        console.log('🚀 Submitting post to Dolores:', post);
        
        // Get sessionless info for authentication
        const sessionlessResult = await invoke('get_sessionless_info');
        if (!sessionlessResult || !sessionlessResult.publicKey) {
            throw new Error('Failed to get sessionless authentication');
        }
        
        const doloresUrl = getServiceUrl('dolores');
        const uuid = sessionlessResult.publicKey;
        
        // Submit to Dolores using the new generic post endpoint
        const response = await fetch(`${doloresUrl}user/${uuid}/post`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                post,
                timestamp: Date.now().toString(),
                signature: 'placeholder_signature' // TODO: Implement proper signing
            })
        });
        
        if (response.ok) {
            console.log('✅ Post created successfully');
            closeCreatePostModal();
            await loadSocialFeed(); // Refresh the feed
        } else {
            const error = await response.text();
            console.error('❌ Failed to create post:', error);
            alert('Failed to create post. Please try again.');
        }
        
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post: ' + error.message);
    }
}

function createPostWidgetElement(post) {
    // Create container for the post widget
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'post-widget-container';
    
    try {
        // Use the PostWidget from post-widget.js
        if (window.PostWidgetBuilder) {
            const widget = new window.PostWidgetBuilder(widgetContainer)
                .description(post.content.content || post.content.title || 'No content')
                .name(`${post.author.name} - ${formatTimeAgo(new Date(post.timestamp))}`)
                .spacer() // Push any buttons to bottom
                .button('💬 Comment')
                .build();
            
            return widgetContainer;
        } else {
            console.warn('PostWidget not available, falling back to basic display');
            return createFallbackPostElement(post);
        }
    } catch (error) {
        console.error('Error creating post widget:', error);
        return createFallbackPostElement(post);
    }
}

function createFallbackPostElement(post) {
    // Simple fallback if post widget fails
    const postDiv = document.createElement('div');
    postDiv.className = 'social-post';
    postDiv.innerHTML = `
        <div class="post-header">
            <div class="author-avatar">${getInitials(post.author.name)}</div>
            <div class="author-info">
                <div class="author-name">${post.author.name}</div>
                <div class="post-time">${formatTimeAgo(new Date(post.timestamp))}</div>
            </div>
        </div>
        <div class="post-content">
            <div class="post-description">${post.content.content || post.content.title || 'No content'}</div>
        </div>
    `;
    return postDiv;
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
window.showEditProfileForm = showEditProfileForm;
window.viewMyPosts = () => alert('View my posts feature coming soon!');
window.viewBaseProfiles = (baseName) => alert(`View profiles for ${baseName} coming soon!`);

// Initialize environment from Rust environment variables
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

// Initialize the application
async function initApp() {
    try {
        // Initialize environment from Rust first
        await initializeEnvironment();
        
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
