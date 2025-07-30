/**
 * IDothis - Main Application
 * A platform for showcasing what you do with profile and product management
 */

import { invoke } from '@tauri-apps/api/core';

// Application state
const appState = {
    currentScreen: 'profile',
    profile: null,
    products: [],
    contracts: [],
    sessionless: null,
    loading: false
};

// Utility functions
function showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    
    const container = document.querySelector('.content');
    container.insertBefore(messageEl, container.firstChild);
    
    setTimeout(() => {
        messageEl.remove();
    }, 5000);
}

function setLoading(loading) {
    appState.loading = loading;
    const buttons = document.querySelectorAll('.form-button');
    buttons.forEach(btn => {
        btn.disabled = loading;
    });
}

// Screen management
function showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show requested screen
    const screen = document.getElementById(`${screenName}-screen`);
    if (screen) {
        screen.classList.add('active');
        appState.currentScreen = screenName;
        
        // Update navigation
        document.querySelectorAll('.nav-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const navBtn = document.querySelector(`[data-screen="${screenName}"]`);
        if (navBtn) {
            navBtn.classList.add('active');
        }
        
        // Load screen data
        loadScreenData(screenName);
    }
}

async function loadScreenData(screenName) {
    switch (screenName) {
        case 'profile':
            await loadProfile();
            break;
        case 'products':
            await loadUserProducts();
            break;
        case 'feed':
            await loadTagFeed();
            break;
        case 'contracts':
            await loadMyContracts();
            break;
    }
}

// Profile management
async function loadProfile() {
    try {
        const result = await invoke('get_profile');
        if (result.success && result.data) {
            appState.profile = result.data;
            displayProfile(result.data);
        } else {
            displayEmptyProfile();
        }
    } catch (error) {
        console.error('Failed to load profile:', error);
        displayEmptyProfile();
    }
}

function displayProfile(profile) {
    const container = document.getElementById('profile-display');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <div class="card-title">Your Profile</div>
            <div class="card-content">
                <p><strong>Name:</strong> ${profile.name}</p>
                <p><strong>Email:</strong> ${profile.email}</p>
                ${profile.bio ? `<p><strong>Bio:</strong> ${profile.bio}</p>` : ''}
                ${profile.skills ? `<p><strong>Skills:</strong> ${profile.skills.join(', ')}</p>` : ''}
                ${profile.website ? `<p><strong>Website:</strong> <a href="${profile.website}" target="_blank" style="color: #4CAF50;">${profile.website}</a></p>` : ''}
                ${profile.location ? `<p><strong>Location:</strong> ${profile.location}</p>` : ''}
                <p><strong>Created:</strong> ${new Date(profile.createdAt).toLocaleDateString()}</p>
            </div>
            <div style="margin-top: 15px;">
                <button class="form-button" onclick="showProfileForm(true)">Edit Profile</button>
                <button class="form-button" onclick="deleteProfile()" style="background: #f44336; border-color: #f44336; margin-left: 10px;">Delete Profile</button>
            </div>
        </div>
    `;
    
    // Load profile image if available
    loadProfileImage();
}

function displayEmptyProfile() {
    const container = document.getElementById('profile-display');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <div class="card-title">Create Your Profile</div>
            <div class="card-content">
                <p>Start by creating your profile to showcase who you are and what you do.</p>
                <button class="form-button primary" onclick="showProfileForm(false)" style="margin-top: 15px;">Create Profile</button>
            </div>
        </div>
    `;
}

async function loadProfileImage() {
    try {
        const result = await invoke('get_profile_image_url');
        if (result.success && result.data) {
            const profileDisplay = document.getElementById('profile-display');
            if (profileDisplay) {
                const imageEl = document.createElement('img');
                imageEl.src = result.data;
                imageEl.style.cssText = `
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    object-fit: cover;
                    margin-bottom: 15px;
                    border: 3px solid rgba(255, 255, 255, 0.3);
                `;
                
                const card = profileDisplay.querySelector('.card');
                if (card) {
                    card.insertBefore(imageEl, card.querySelector('.card-title'));
                }
            }
        }
    } catch (error) {
        console.log('No profile image available');
    }
}

function showProfileForm(isEdit) {
    const container = document.getElementById('profile-form-container');
    if (!container) return;
    
    const profile = isEdit ? appState.profile : {};
    
    container.innerHTML = `
        <div class="card">
            <div class="card-title">${isEdit ? 'Edit' : 'Create'} Profile</div>
            <form id="profile-form" onsubmit="handleProfileSubmit(event)">
                <div class="form-group">
                    <label class="form-label">Name *</label>
                    <input type="text" class="form-input" name="name" value="${profile.name || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Email *</label>
                    <input type="email" class="form-input" name="email" value="${profile.email || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Bio</label>
                    <textarea class="form-input form-textarea" name="bio" placeholder="Tell people what you do...">${profile.bio || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Skills (comma-separated)</label>
                    <input type="text" class="form-input" name="skills" value="${profile.skills ? profile.skills.join(', ') : ''}" placeholder="JavaScript, Design, Photography...">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Website</label>
                    <input type="url" class="form-input" name="website" value="${profile.website || ''}" placeholder="https://yourwebsite.com">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Location</label>
                    <input type="text" class="form-input" name="location" value="${profile.location || ''}" placeholder="City, Country">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Profile Image</label>
                    <input type="file" class="form-input" name="image" accept="image/*">
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button type="submit" class="form-button primary">${isEdit ? 'Update' : 'Create'} Profile</button>
                    <button type="button" class="form-button" onclick="hideProfileForm()">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    container.style.display = 'block';
}

function hideProfileForm() {
    const container = document.getElementById('profile-form-container');
    if (container) {
        container.style.display = 'none';
    }
}

async function handleProfileSubmit(event) {
    event.preventDefault();
    setLoading(true);
    
    try {
        const formData = new FormData(event.target);
        const profileData = {
            name: formData.get('name'),
            email: formData.get('email'),
            bio: formData.get('bio') || null,
            skills: formData.get('skills') ? formData.get('skills').split(',').map(s => s.trim()).filter(s => s) : null,
            website: formData.get('website') || null,
            location: formData.get('location') || null,
            additional_fields: {}
        };
        
        // Handle image upload
        let imageData = null;
        const imageFile = formData.get('image');
        if (imageFile && imageFile.size > 0) {
            imageData = await fileToBase64(imageFile);
        }
        
        const isEdit = appState.profile !== null;
        const result = await invoke(isEdit ? 'update_profile' : 'create_profile', {
            profileData,
            imageData
        });
        
        if (result.success) {
            showMessage(`Profile ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
            hideProfileForm();
            await loadProfile();
        } else {
            showMessage(result.error || 'Failed to save profile', 'error');
        }
    } catch (error) {
        showMessage('Error saving profile: ' + error.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function deleteProfile() {
    if (!confirm('Are you sure you want to delete your profile? This cannot be undone.')) {
        return;
    }
    
    setLoading(true);
    
    try {
        const result = await invoke('delete_profile');
        if (result.success) {
            showMessage('Profile deleted successfully', 'success');
            appState.profile = null;
            displayEmptyProfile();
        } else {
            showMessage(result.error || 'Failed to delete profile', 'error');
        }
    } catch (error) {
        showMessage('Error deleting profile: ' + error.message, 'error');
    } finally {
        setLoading(false);
    }
}

// Product management
async function loadUserProducts() {
    try {
        const result = await invoke('get_user_products');
        if (result.success && result.data) {
            appState.products = result.data.products || [];
            displayProducts(appState.products);
        } else {
            displayEmptyProducts();
        }
    } catch (error) {
        console.error('Failed to load products:', error);
        displayEmptyProducts();
    }
}

function displayProducts(products) {
    const container = document.getElementById('products-display');
    if (!container) return;
    
    if (products.length === 0) {
        displayEmptyProducts();
        return;
    }
    
    container.innerHTML = `
        <div class="card">
            <div class="card-title">Your Products & Services</div>
            <button class="form-button primary" onclick="showProductForm(false)" style="margin-bottom: 20px;">Add New Product</button>
            ${products.map(product => `
                <div class="card" style="margin-top: 15px;">
                    <h3 style="color: white; margin-bottom: 10px;">${product.title}</h3>
                    <p style="color: rgba(255,255,255,0.9); margin-bottom: 10px;">${product.description}</p>
                    <p style="color: #4CAF50; font-weight: 600;">$${(product.price / 100).toFixed(2)}</p>
                    ${product.tags ? `<p style="color: rgba(255,255,255,0.7); font-size: 14px;">Tags: ${product.tags.join(', ')}</p>` : ''}
                    <div style="margin-top: 10px;">
                        <button class="form-button" onclick="editProduct('${product.id}')">Edit</button>
                        <button class="form-button" onclick="deleteProduct('${product.id}')" style="background: #f44336; border-color: #f44336; margin-left: 10px;">Delete</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function displayEmptyProducts() {
    const container = document.getElementById('products-display');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <div class="card-title">Your Products & Services</div>
            <div class="card-content">
                <p>Start showcasing what you do by adding your first product or service.</p>
                <button class="form-button primary" onclick="showProductForm(false)" style="margin-top: 15px;">Add Your First Product</button>
            </div>
        </div>
    `;
}

function showProductForm(isEdit, productId = null) {
    const container = document.getElementById('product-form-container');
    if (!container) return;
    
    const product = isEdit ? appState.products.find(p => p.id === productId) : {};
    
    container.innerHTML = `
        <div class="card">
            <div class="card-title">${isEdit ? 'Edit' : 'Add'} Product/Service</div>
            <form id="product-form" onsubmit="handleProductSubmit(event, ${isEdit}, '${productId}')">
                <div class="form-group">
                    <label class="form-label">Title *</label>
                    <input type="text" class="form-input" name="title" value="${product.title || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Description *</label>
                    <textarea class="form-input form-textarea" name="description" required>${product.description || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Price (USD) *</label>
                    <input type="number" class="form-input" name="price" value="${product.price ? (product.price / 100).toFixed(2) : ''}" step="0.01" min="0" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Category *</label>
                    <select class="form-input" name="category" required>
                        <option value="">Select a category</option>
                        <option value="service" ${product.category === 'service' ? 'selected' : ''}>Service</option>
                        <option value="digital_product" ${product.category === 'digital_product' ? 'selected' : ''}>Digital Product</option>
                        <option value="consultation" ${product.category === 'consultation' ? 'selected' : ''}>Consultation</option>
                        <option value="course" ${product.category === 'course' ? 'selected' : ''}>Course</option>
                        <option value="physical_product" ${product.category === 'physical_product' ? 'selected' : ''}>Physical Product</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Tags (comma-separated) *</label>
                    <input type="text" class="form-input" name="tags" value="${product.tags ? product.tags.join(', ') : ''}" placeholder="web, design, development, photography..." required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Content Type</label>
                    <select class="form-input" name="content_type">
                        <option value="service" ${product.content_type === 'service' ? 'selected' : ''}>Service</option>
                        <option value="digital_product" ${product.content_type === 'digital_product' ? 'selected' : ''}>Digital Product</option>
                        <option value="consultation" ${product.content_type === 'consultation' ? 'selected' : ''}>Consultation</option>
                        <option value="course" ${product.content_type === 'course' ? 'selected' : ''}>Course</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Preview URL</label>
                    <input type="url" class="form-input" name="preview_url" value="${product.preview_url || ''}" placeholder="https://example.com/preview">
                </div>
                
                <div class="form-group">
                    <label style="color: rgba(255,255,255,0.9); font-size: 16px; margin-bottom: 10px; display: block;">
                        <input type="checkbox" name="include_contract" onchange="toggleProductContract()" style="margin-right: 8px;">
                        🪄 Include Magical Contract
                    </label>
                    <div id="product-contract-section" style="display: none; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px; margin-top: 10px;">
                        <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin-bottom: 15px;">
                            Define project steps and automatic MAGIC spells that trigger when each step is completed by all parties.
                        </p>
                        
                        <div style="margin-bottom: 15px;">
                            <label class="form-label" style="font-size: 14px;">Contract Title</label>
                            <input type="text" name="contract_title" class="form-input" placeholder="e.g., Web Development Delivery Contract">
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label class="form-label" style="font-size: 14px;">Client/Participant UUID</label>
                            <input type="text" name="contract_participant" class="form-input" placeholder="Client's sessionless UUID">
                            <div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 5px;">
                                Your UUID (${appState.sessionless?.uuid?.substring(0, 8) || 'loading...'}...) will be automatically included
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label class="form-label" style="font-size: 14px;">Quick Contract Template</label>
                            <select name="contract_template" class="form-input" onchange="applyContractTemplate()">
                                <option value="">Select a template (optional)</option>
                                <option value="web_development">Web Development (3 steps)</option>
                                <option value="design_project">Design Project (4 steps)</option>
                                <option value="consultation">Consultation Service (2 steps)</option>
                                <option value="custom">Custom Contract</option>
                            </select>
                        </div>
                        
                        <div style="color: rgba(255,255,255,0.7); font-size: 13px; line-height: 1.4;">
                            💡 <strong>Tip:</strong> Templates create common project workflows with milestone payments. 
                            You can customize them after creation or build your own from scratch.
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button type="submit" class="form-button primary">${isEdit ? 'Update' : 'Add'} Product</button>
                    <button type="button" class="form-button" onclick="hideProductForm()">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    container.style.display = 'block';
}

function hideProductForm() {
    const container = document.getElementById('product-form-container');
    if (container) {
        container.style.display = 'none';
    }
}

async function handleProductSubmit(event, isEdit, productId) {
    event.preventDefault();
    setLoading(true);
    
    try {
        const formData = new FormData(event.target);
        const productData = {
            title: formData.get('title'),
            description: formData.get('description'),
            price: Math.round(parseFloat(formData.get('price')) * 100), // Convert to cents
            category: formData.get('category'),
            tags: formData.get('tags').split(',').map(t => t.trim()).filter(t => t),
            content_type: formData.get('content_type'),
            preview_url: formData.get('preview_url') || null
        };
        
        // Add magical contract if included
        const includeContract = formData.get('include_contract');
        if (includeContract) {
            const contractTitle = formData.get('contract_title');
            const contractParticipant = formData.get('contract_participant');
            const contractTemplate = formData.get('contract_template');
            
            if (contractTitle && contractParticipant && appState.sessionless?.uuid) {
                const participants = [appState.sessionless.uuid, contractParticipant.trim()];
                const steps = getContractTemplateSteps(contractTemplate, productData.price);
                
                productData.magical_contract = {
                    title: contractTitle,
                    description: `Delivery contract for: ${productData.title}`,
                    participants,
                    steps
                };
            }
        }
        
        const result = await invoke(isEdit ? 'update_product' : 'create_product', 
            isEdit ? { productId, productData } : { productData }
        );
        
        if (result.success) {
            let message = `Product ${isEdit ? 'updated' : 'created'} successfully!`;
            if (result.data?.contract_uuid) {
                message += ' 🪄 Magical contract created and linked!';
            }
            showMessage(message, 'success');
            hideProductForm();
            await loadUserProducts();
        } else {
            showMessage(result.error || 'Failed to save product', 'error');
        }
    } catch (error) {
        showMessage('Error saving product: ' + error.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    setLoading(true);
    
    try {
        const result = await invoke('delete_product', { productId });
        if (result.success) {
            showMessage('Product deleted successfully', 'success');
            await loadUserProducts();
        } else {
            showMessage(result.error || 'Failed to delete product', 'error');
        }
    } catch (error) {
        showMessage('Error deleting product: ' + error.message, 'error');
    } finally {
        setLoading(false);
    }
}

// Tag-based feed
async function loadTagFeed() {
    const tagInput = document.getElementById('tag-input');
    const tags = tagInput ? tagInput.value.split(',').map(t => t.trim()).filter(t => t) : ['web', 'design'];
    
    await loadProductsByTags(tags);
}

async function loadProductsByTags(tags) {
    try {
        const result = await invoke('get_products_by_tags', { tags });
        if (result.success && result.data) {
            displaySwipableFeed(result.data);
        } else {
            displayEmptyFeed();
        }
    } catch (error) {
        console.error('Failed to load tag feed:', error);
        displayEmptyFeed();
    }
}

function displaySwipableFeed(products) {
    const container = document.getElementById('feed-display');
    if (!container) return;
    
    if (products.length === 0) {
        displayEmptyFeed();
        return;
    }
    
    // Create swipable feed
    container.innerHTML = `
        <div class="card">
            <div class="card-title">Discover Products & Services</div>
            <div style="margin-bottom: 20px;">
                <input type="text" id="tag-input" class="form-input" placeholder="Enter tags: web, design, development..." value="web, design">
                <button class="form-button" onclick="searchByTags()" style="margin-top: 10px;">Search</button>
            </div>
            <div id="swipable-container" style="height: 500px; position: relative;">
                ${createSwipableCards(products)}
            </div>
            <div id="feed-stats" style="margin-top: 20px; text-align: center; color: rgba(255,255,255,0.8);">
                <div>Swipe right to like, left to pass</div>
                <div id="stats-text">Showing ${products.length} products</div>
            </div>
        </div>
    `;
    
    initializeSwipableCards(products);
}

function displayEmptyFeed() {
    const container = document.getElementById('feed-display');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <div class="card-title">Discover Products & Services</div>
            <div style="margin-bottom: 20px;">
                <input type="text" id="tag-input" class="form-input" placeholder="Enter tags: web, design, development..." value="web, design">
                <button class="form-button" onclick="searchByTags()" style="margin-top: 10px;">Search</button>
            </div>
            <div class="card-content">
                <p>No products found for the selected tags. Try different tags or check back later.</p>
            </div>
        </div>
    `;
}

function createSwipableCards(products) {
    return products.map((product, index) => `
        <div class="swipe-card" data-index="${index}" style="
            position: absolute;
            width: 100%;
            height: 400px;
            background: rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 20px;
            cursor: grab;
            transform: scale(${1 - index * 0.05}) translateY(${index * 10}px);
            z-index: ${100 - index};
            border: 1px solid rgba(255,255,255,0.2);
            ${index > 2 ? 'display: none;' : ''}
        ">
            <div style="height: 100%; display: flex; flex-direction: column;">
                <h3 style="color: white; margin-bottom: 10px; font-size: 20px;">${product.title}</h3>
                <p style="color: rgba(255,255,255,0.9); margin-bottom: 15px; flex: 1; overflow: hidden;">${product.description}</p>
                <div style="color: #4CAF50; font-size: 18px; font-weight: 600; margin-bottom: 10px;">$${(product.price / 100).toFixed(2)}</div>
                <div style="color: rgba(255,255,255,0.7); font-size: 14px; margin-bottom: 10px;">
                    <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 12px; margin-right: 5px;">${product.category}</span>
                </div>
                <div style="color: rgba(255,255,255,0.6); font-size: 12px;">
                    Tags: ${product.tags.join(', ')}
                </div>
                <div style="color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 10px;">
                    by ${product.author}
                </div>
            </div>
            
            <!-- Swipe indicators -->
            <div class="swipe-indicator like" style="
                position: absolute;
                top: 50%;
                right: 20px;
                transform: translateY(-50%) scale(0);
                background: #4CAF50;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: bold;
                opacity: 0;
                transition: all 0.2s ease;
            ">❤️ LIKE</div>
            
            <div class="swipe-indicator pass" style="
                position: absolute;
                top: 50%;
                left: 20px;
                transform: translateY(-50%) scale(0);
                background: #f44336;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: bold;
                opacity: 0;
                transition: all 0.2s ease;
            ">✖️ PASS</div>
        </div>
    `).join('');
}

let currentCardIndex = 0;
let likedProducts = [];
let passedProducts = [];

function initializeSwipableCards(products) {
    currentCardIndex = 0;
    likedProducts = [];
    passedProducts = [];
    
    const cards = document.querySelectorAll('.swipe-card');
    cards.forEach((card, index) => {
        if (index === 0) {
            addSwipeListeners(card, products[index]);
        }
    });
    
    updateStats();
}

function addSwipeListeners(card, product) {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    card.addEventListener('mousedown', startDrag);
    card.addEventListener('touchstart', startDrag);
    
    function startDrag(e) {
        isDragging = true;
        startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        currentX = startX;
        card.style.cursor = 'grabbing';
        card.style.transition = 'none';
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }
    
    function drag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const deltaX = currentX - startX;
        const rotation = deltaX * 0.1;
        
        card.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
        
        // Show indicators
        const likeIndicator = card.querySelector('.swipe-indicator.like');
        const passIndicator = card.querySelector('.swipe-indicator.pass');
        
        if (deltaX > 50) {
            likeIndicator.style.opacity = Math.min(1, (deltaX - 50) / 100);
            likeIndicator.style.transform = `translateY(-50%) scale(${Math.min(1, (deltaX - 50) / 100)})`;
            passIndicator.style.opacity = 0;
            passIndicator.style.transform = 'translateY(-50%) scale(0)';
        } else if (deltaX < -50) {
            passIndicator.style.opacity = Math.min(1, (Math.abs(deltaX) - 50) / 100);
            passIndicator.style.transform = `translateY(-50%) scale(${Math.min(1, (Math.abs(deltaX) - 50) / 100)})`;
            likeIndicator.style.opacity = 0;
            likeIndicator.style.transform = 'translateY(-50%) scale(0)';
        } else {
            likeIndicator.style.opacity = 0;
            likeIndicator.style.transform = 'translateY(-50%) scale(0)';
            passIndicator.style.opacity = 0;
            passIndicator.style.transform = 'translateY(-50%) scale(0)';
        }
    }
    
    function endDrag() {
        if (!isDragging) return;
        
        isDragging = false;
        card.style.cursor = 'grab';
        
        const deltaX = currentX - startX;
        const threshold = 100;
        
        if (Math.abs(deltaX) > threshold) {
            // Swipe out
            const direction = deltaX > 0 ? 'right' : 'left';
            swipeCard(card, product, direction);
        } else {
            // Snap back
            card.style.transition = 'transform 0.3s ease';
            card.style.transform = 'translateX(0) rotate(0deg)';
            
            // Hide indicators
            const indicators = card.querySelectorAll('.swipe-indicator');
            indicators.forEach(indicator => {
                indicator.style.opacity = 0;
                indicator.style.transform = 'translateY(-50%) scale(0)';
            });
        }
        
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchend', endDrag);
    }
}

function swipeCard(card, product, direction) {
    const containerWidth = card.parentElement.offsetWidth;
    const targetX = direction === 'right' ? containerWidth + 100 : -(containerWidth + 100);
    const rotation = direction === 'right' ? 30 : -30;
    
    card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    card.style.transform = `translateX(${targetX}px) rotate(${rotation}deg)`;
    card.style.opacity = '0';
    
    // Add to appropriate collection
    if (direction === 'right') {
        likedProducts.push(product);
        showMessage(`Liked: ${product.title}`, 'success');
    } else {
        passedProducts.push(product);
        showMessage(`Passed: ${product.title}`, 'info');
    }
    
    setTimeout(() => {
        card.remove();
        showNextCard();
        updateStats();
    }, 300);
}

function showNextCard() {
    currentCardIndex++;
    const cards = document.querySelectorAll('.swipe-card');
    
    if (cards.length === 0) {
        showFeedComplete();
        return;
    }
    
    // Update card positions
    cards.forEach((card, index) => {
        const newScale = 1 - index * 0.05;
        const newTranslateY = index * 10;
        
        card.style.transform = `scale(${newScale}) translateY(${newTranslateY}px)`;
        card.style.zIndex = 100 - index;
        
        if (index < 3) {
            card.style.display = 'block';
        }
        
        if (index === 0) {
            // Add swipe listeners to new top card
            const productIndex = parseInt(card.dataset.index);
            // Note: In a real app, you'd need to maintain the products array
            addSwipeListeners(card, { title: 'Product ' + productIndex });
        }
    });
}

function showFeedComplete() {
    const container = document.getElementById('swipable-container');
    if (!container) return;
    
    container.innerHTML = `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            text-align: center;
            color: white;
        ">
            <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
            <h3 style="margin-bottom: 10px;">All done!</h3>
            <p style="color: rgba(255,255,255,0.8); margin-bottom: 20px;">You've reviewed all products for these tags.</p>
            <button class="form-button primary" onclick="searchByTags()">Load More</button>
        </div>
    `;
}

function updateStats() {
    const statsEl = document.getElementById('stats-text');
    if (statsEl) {
        const remaining = document.querySelectorAll('.swipe-card').length;
        statsEl.textContent = `Remaining: ${remaining} | Liked: ${likedProducts.length} | Passed: ${passedProducts.length}`;
    }
}

async function searchByTags() {
    const tagInput = document.getElementById('tag-input');
    if (tagInput) {
        const tags = tagInput.value.split(',').map(t => t.trim()).filter(t => t);
        if (tags.length > 0) {
            await loadProductsByTags(tags);
        }
    }
}

// Utility functions
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64 = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}

// Application initialization
async function initializeApp() {
    try {
        // Get sessionless info
        const sessionlessResult = await invoke('get_sessionless_info');
        if (sessionlessResult.success) {
            appState.sessionless = sessionlessResult.data;
            console.log('Sessionless UUID:', appState.sessionless.uuid);
        }
        
        // Create app structure
        createAppStructure();
        
        // Show initial screen
        showScreen('profile');
        
        console.log('IDothis app initialized successfully');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showMessage('Failed to initialize app: ' + error.message, 'error');
    }
}

function createAppStructure() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <!-- Navigation -->
        <div class="nav-bar">
            <div class="nav-title">IDothis</div>
            <div class="nav-buttons">
                <button class="nav-button active" data-screen="profile" onclick="showScreen('profile')">Profile</button>
                <button class="nav-button" data-screen="products" onclick="showScreen('products')">Products</button>
                <button class="nav-button" data-screen="contracts" onclick="showScreen('contracts')">🪄 Contracts</button>
                <button class="nav-button" data-screen="feed" onclick="showScreen('feed')">Discover</button>
            </div>
        </div>
        
        <!-- Profile Screen -->
        <div id="profile-screen" class="screen active">
            <div class="content">
                <div id="profile-form-container" style="display: none;"></div>
                <div id="profile-display"></div>
            </div>
        </div>
        
        <!-- Products Screen -->
        <div id="products-screen" class="screen">
            <div class="content">
                <div id="product-form-container" style="display: none;"></div>
                <div id="products-display"></div>
            </div>
        </div>
        
        <!-- Contracts Screen -->
        <div id="contracts-screen" class="screen">
            <div class="content">
                <div id="contract-form-container" style="display: none;"></div>
                <div id="contracts-display"></div>
            </div>
        </div>
        
        <!-- Feed Screen -->
        <div id="feed-screen" class="screen">
            <div class="content">
                <div id="feed-display"></div>
            </div>
        </div>
    `;
}

// Magical contract management
async function loadMyContracts() {
    try {
        setLoading(true);
        const result = await invoke('get_my_contracts');
        
        if (result.success && result.data) {
            appState.contracts = result.data;
            displayContracts(result.data);
        } else {
            displayEmptyContracts();
        }
    } catch (error) {
        console.error('Failed to load contracts:', error);
        displayEmptyContracts();
        showMessage('Failed to load contracts: ' + error.message, 'error');
    } finally {
        setLoading(false);
    }
}

function displayContracts(contracts) {
    const container = document.getElementById('contracts-display');
    if (!container) return;
    
    if (contracts.length === 0) {
        displayEmptyContracts();
        return;
    }
    
    container.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div class="card-title">🪄 My Magical Contracts</div>
                <button class="form-button primary" onclick="showContractForm()">Create Contract</button>
            </div>
            ${contracts.map(contract => createContractCard(contract)).join('')}
        </div>
    `;
}

function displayEmptyContracts() {
    const container = document.getElementById('contracts-display');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div class="card-title">🪄 My Magical Contracts</div>
                <button class="form-button primary" onclick="showContractForm()">Create Contract</button>
            </div>
            <div class="card-content">
                <p>No magical contracts yet. Create your first contract to define multi-step workflows with automatic MAGIC spell execution!</p>
                <p style="margin-top: 15px; color: rgba(255,255,255,0.7); font-size: 14px;">
                    💡 Tip: Contracts can be attached to products to define deliverables, payment schedules, and automated actions.
                </p>
            </div>
        </div>
    `;
}

function createContractCard(contract) {
    const progress = calculateContractProgress(contract);
    
    return `
        <div class="card" style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                <div>
                    <h3 style="color: white; margin-bottom: 5px;">${contract.title}</h3>
                    <div style="color: rgba(255,255,255,0.7); font-size: 14px; margin-bottom: 10px;">
                        ${contract.participants.length} participants • ${contract.step_count} steps
                    </div>
                    <div style="color: rgba(255,255,255,0.6); font-size: 12px;">
                        Created ${new Date(contract.created_at).toLocaleDateString()}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="color: #4CAF50; font-weight: 600; margin-bottom: 5px;">
                        ${contract.completed_steps}/${contract.step_count} Complete
                    </div>
                    <div style="background: rgba(255,255,255,0.2); height: 4px; width: 100px; border-radius: 2px; overflow: hidden;">
                        <div style="background: #4CAF50; height: 100%; width: ${progress}%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="form-button" onclick="viewContract('${contract.uuid}')">👁️ View</button>
                <button class="form-button" onclick="viewContractSVG('${contract.uuid}')">🎨 Visualize</button>
                ${progress < 100 ? `<button class="form-button" onclick="signContractSteps('${contract.uuid}')">✍️ Sign</button>` : ''}
            </div>
        </div>
    `;
}

function calculateContractProgress(contract) {
    if (contract.step_count === 0) return 0;
    return Math.round((contract.completed_steps / contract.step_count) * 100);
}

function showContractForm() {
    const container = document.getElementById('contract-form-container');
    if (!container) return;
    
    container.style.display = 'block';
    container.innerHTML = `
        <div class="card">
            <div class="card-title">🪄 Create Magical Contract</div>
            <form onsubmit="handleContractSubmit(event)">
                <div class="form-group">
                    <label class="form-label">Contract Title *</label>
                    <input type="text" name="title" class="form-input" placeholder="e.g., Web Development Project" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea name="description" class="form-input form-textarea" placeholder="Describe the overall contract and expectations..."></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Participants (UUIDs) *</label>
                    <input type="text" name="participants" class="form-input" placeholder="Enter participant UUIDs separated by commas" required>
                    <div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 5px;">
                        Include your UUID (${appState.sessionless?.uuid?.substring(0, 8) || 'loading...'}...) and other participants
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Contract Steps *</label>
                    <div id="contract-steps">
                        <div class="contract-step" data-step="0">
                            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                <span style="color: white; margin-right: 10px;">Step 1:</span>
                                <button type="button" onclick="removeContractStep(0)" style="background: #f44336; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">Remove</button>
                            </div>
                            <input type="text" name="step_description_0" class="form-input" placeholder="e.g., Complete project proposal and wireframes" required style="margin-bottom: 10px;">
                            <div style="margin-bottom: 15px;">
                                <label style="color: rgba(255,255,255,0.8); font-size: 14px;">
                                    <input type="checkbox" name="has_magic_0" onchange="toggleMagicSpell(0)"> Add MAGIC Spell
                                </label>
                                <div id="magic-spell-0" style="display: none; margin-top: 10px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                                    <label class="form-label" style="font-size: 14px;">Payment Amount (USD)</label>
                                    <input type="number" name="magic_amount_0" class="form-input" placeholder="0.00" step="0.01" style="margin-bottom: 10px;">
                                    <label class="form-label" style="font-size: 14px;">Spell Description</label>
                                    <textarea name="magic_description_0" class="form-input" placeholder="e.g., Pay $500 to freelancer upon step completion" style="height: 60px;"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button type="button" onclick="addContractStep()" class="form-button" style="margin-top: 10px;">+ Add Step</button>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button type="submit" class="form-button primary">Create Contract</button>
                    <button type="button" onclick="hideContractForm()" class="form-button">Cancel</button>
                </div>
            </form>
        </div>
    `;
}

function hideContractForm() {
    const container = document.getElementById('contract-form-container');
    if (container) {
        container.style.display = 'none';
    }
}

let contractStepCounter = 1;

function addContractStep() {
    const stepsContainer = document.getElementById('contract-steps');
    if (!stepsContainer) return;
    
    const stepDiv = document.createElement('div');
    stepDiv.className = 'contract-step';
    stepDiv.setAttribute('data-step', contractStepCounter);
    
    stepDiv.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <span style="color: white; margin-right: 10px;">Step ${contractStepCounter + 1}:</span>
            <button type="button" onclick="removeContractStep(${contractStepCounter})" style="background: #f44336; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">Remove</button>
        </div>
        <input type="text" name="step_description_${contractStepCounter}" class="form-input" placeholder="Describe what needs to be completed in this step" required style="margin-bottom: 10px;">
        <div style="margin-bottom: 15px;">
            <label style="color: rgba(255,255,255,0.8); font-size: 14px;">
                <input type="checkbox" name="has_magic_${contractStepCounter}" onchange="toggleMagicSpell(${contractStepCounter})"> Add MAGIC Spell
            </label>
            <div id="magic-spell-${contractStepCounter}" style="display: none; margin-top: 10px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                <label class="form-label" style="font-size: 14px;">Payment Amount (USD)</label>
                <input type="number" name="magic_amount_${contractStepCounter}" class="form-input" placeholder="0.00" step="0.01" style="margin-bottom: 10px;">
                <label class="form-label" style="font-size: 14px;">Spell Description</label>
                <textarea name="magic_description_${contractStepCounter}" class="form-input" placeholder="e.g., Release milestone payment" style="height: 60px;"></textarea>
            </div>
        </div>
    `;
    
    stepsContainer.appendChild(stepDiv);
    contractStepCounter++;
}

function removeContractStep(stepIndex) {
    const stepDiv = document.querySelector(`[data-step="${stepIndex}"]`);
    if (stepDiv) {
        stepDiv.remove();
        // Renumber remaining steps
        const remainingSteps = document.querySelectorAll('.contract-step');
        remainingSteps.forEach((step, index) => {
            const stepLabel = step.querySelector('span');
            if (stepLabel) {
                stepLabel.textContent = `Step ${index + 1}:`;
            }
        });
    }
}

function toggleMagicSpell(stepIndex) {
    const checkbox = document.querySelector(`input[name="has_magic_${stepIndex}"]`);
    const spellDiv = document.getElementById(`magic-spell-${stepIndex}`);
    
    if (checkbox && spellDiv) {
        spellDiv.style.display = checkbox.checked ? 'block' : 'none';
    }
}

async function handleContractSubmit(event) {
    event.preventDefault();
    
    try {
        setLoading(true);
        const formData = new FormData(event.target);
        
        // Parse participants
        const participantsStr = formData.get('participants');
        const participants = participantsStr.split(',').map(p => p.trim()).filter(p => p);
        
        if (participants.length < 2) {
            showMessage('At least 2 participants are required', 'error');
            return;
        }
        
        // Parse steps
        const steps = [];
        const stepElements = document.querySelectorAll('.contract-step');
        
        stepElements.forEach((stepEl, index) => {
            const stepIndex = stepEl.getAttribute('data-step');
            const description = formData.get(`step_description_${stepIndex}`);
            const hasMagic = formData.get(`has_magic_${stepIndex}`);
            
            if (description) {
                const step = { description };
                
                if (hasMagic) {
                    const amount = parseFloat(formData.get(`magic_amount_${stepIndex}`) || '0');
                    const magicDescription = formData.get(`magic_description_${stepIndex}`) || '';
                    
                    step.magic_spell = {
                        type: 'payment',
                        amount: amount,
                        description: magicDescription,
                        currency: 'USD'
                    };
                }
                
                steps.push(step);
            }
        });
        
        if (steps.length === 0) {
            showMessage('At least one step is required', 'error');
            return;
        }
        
        // Create contract
        const contractData = {
            title: formData.get('title'),
            description: formData.get('description') || '',
            participants,
            steps
        };
        
        const result = await invoke('create_contract', { contractData });
        
        if (result.success) {
            showMessage('Magical contract created successfully! 🪄', 'success');
            hideContractForm();
            await loadMyContracts();
            contractStepCounter = 1; // Reset counter
        } else {
            showMessage('Failed to create contract: ' + (result.error || 'Unknown error'), 'error');
        }
        
    } catch (error) {
        console.error('Failed to create contract:', error);
        showMessage('Error creating contract: ' + error.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function viewContract(uuid) {
    try {
        const result = await invoke('get_contract', { uuid });
        
        if (result.success && result.data) {
            const contract = result.data;
            
            // Create modal-style display
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.8); z-index: 1000; 
                display: flex; align-items: center; justify-content: center;
                padding: 20px; box-sizing: border-box;
            `;
            
            modal.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 12px; padding: 30px; max-width: 800px; width: 100%;
                    max-height: 80vh; overflow-y: auto; color: white;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="margin: 0;">🪄 ${contract.title}</h2>
                        <button onclick="this.closest('.modal').remove()" style="
                            background: none; border: none; color: white; font-size: 24px; 
                            cursor: pointer; padding: 0; width: 30px; height: 30px;
                        ">×</button>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <strong>Description:</strong> ${contract.description || 'No description provided'}
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <strong>Participants:</strong>
                        <div style="margin-top: 5px;">
                            ${contract.participants.map(p => `
                                <div style="background: rgba(255,255,255,0.2); padding: 8px; border-radius: 6px; margin-bottom: 5px;">
                                    ${p.substring(0, 8)}... ${p === appState.sessionless?.uuid ? '(You)' : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <strong>Contract Steps:</strong>
                        <div style="margin-top: 10px;">
                            ${contract.steps.map((step, index) => {
                                const signedCount = Object.values(step.signatures).filter(sig => sig !== null).length;
                                const requiredCount = contract.participants.length;
                                const isCompleted = step.completed;
                                const userSigned = step.signatures[appState.sessionless?.uuid] !== null;
                                
                                return `
                                    <div style="
                                        background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; 
                                        margin-bottom: 10px; border-left: 4px solid ${isCompleted ? '#4CAF50' : '#ff9800'};
                                    ">
                                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                            <div style="flex: 1;">
                                                <div style="font-weight: 600; margin-bottom: 8px;">
                                                    ${isCompleted ? '✅' : userSigned ? '⏳' : '⭕'} Step ${index + 1}: ${step.description}
                                                </div>
                                                <div style="font-size: 14px; color: rgba(255,255,255,0.7);">
                                                    Signatures: ${signedCount}/${requiredCount} 
                                                    ${userSigned ? '(You signed)' : '(Not signed by you)'}
                                                </div>
                                                ${step.magic_spell ? `
                                                    <div style="margin-top: 8px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 4px;">
                                                        🪄 MAGIC: ${step.magic_spell.description || 'Payment: $' + (step.magic_spell.amount || 0)}
                                                    </div>
                                                ` : ''}
                                            </div>
                                            ${!isCompleted && !userSigned ? `
                                                <button onclick="signStep('${contract.uuid}', '${step.id}')" style="
                                                    background: #4CAF50; color: white; border: none; 
                                                    padding: 6px 12px; border-radius: 4px; cursor: pointer;
                                                    margin-left: 10px; font-size: 12px;
                                                ">Sign</button>
                                            ` : ''}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="viewContractSVG('${contract.uuid}')" class="form-button" style="margin-right: 10px;">
                            🎨 View SVG Visualization
                        </button>
                        <button onclick="this.closest('.modal').remove()" class="form-button">Close</button>
                    </div>
                </div>
            `;
            
            modal.className = 'modal';
            document.body.appendChild(modal);
            
        } else {
            showMessage('Failed to load contract details', 'error');
        }
    } catch (error) {
        console.error('Failed to view contract:', error);
        showMessage('Error loading contract: ' + error.message, 'error');
    }
}

async function viewContractSVG(uuid) {
    try {
        const result = await invoke('get_contract_svg', { 
            uuid, 
            theme: 'dark', 
            width: 1000, 
            height: 800 
        });
        
        if (result.success && result.data) {
            // Create modal to display SVG
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.9); z-index: 1000; 
                display: flex; align-items: center; justify-content: center;
                padding: 20px; box-sizing: border-box;
            `;
            
            modal.innerHTML = `
                <div style="
                    background: white; border-radius: 12px; padding: 20px; 
                    max-width: 95vw; max-height: 95vh; overflow: auto;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3 style="margin: 0; color: #333;">Contract Visualization</h3>
                        <button onclick="this.closest('.modal').remove()" style="
                            background: none; border: none; color: #333; font-size: 24px; 
                            cursor: pointer; padding: 0; width: 30px; height: 30px;
                        ">×</button>
                    </div>
                    <div style="text-align: center;">
                        ${result.data}
                    </div>
                </div>
            `;
            
            modal.className = 'modal';
            document.body.appendChild(modal);
            
        } else {
            showMessage('Failed to load contract visualization', 'error');
        }
    } catch (error) {
        console.error('Failed to load contract SVG:', error);
        showMessage('Error loading visualization: ' + error.message, 'error');
    }
}

async function signStep(contractUuid, stepId) {
    try {
        const message = prompt('Add a message with your signature (optional):') || 'Step completed and signed';
        
        const result = await invoke('sign_contract_step', { 
            contractUuid, 
            stepId, 
            message 
        });
        
        if (result.success) {
            showMessage('Step signed successfully! ✍️', 'success');
            
            if (result.data.magic_triggered) {
                showMessage('🪄 MAGIC spell triggered! Payment processing...', 'success');
            }
            
            // Close modal and refresh
            const modal = document.querySelector('.modal');
            if (modal) modal.remove();
            
            await loadMyContracts();
            
        } else {
            showMessage('Failed to sign step: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Failed to sign step:', error);
        showMessage('Error signing step: ' + error.message, 'error');
    }
}

// Product contract integration helpers
function toggleProductContract() {
    const checkbox = document.querySelector('input[name="include_contract"]');
    const section = document.getElementById('product-contract-section');
    
    if (checkbox && section) {
        section.style.display = checkbox.checked ? 'block' : 'none';
    }
}

function applyContractTemplate() {
    const templateSelect = document.querySelector('select[name="contract_template"]');
    if (!templateSelect) return;
    
    const template = templateSelect.value;
    if (!template || template === 'custom') return;
    
    // Auto-fill contract title based on template
    const contractTitleInput = document.querySelector('input[name="contract_title"]');
    const productTitleInput = document.querySelector('input[name="title"]');
    
    if (contractTitleInput && productTitleInput) {
        const productTitle = productTitleInput.value || 'Project';
        const templateTitles = {
            'web_development': `${productTitle} - Web Development Contract`,
            'design_project': `${productTitle} - Design Project Contract`,
            'consultation': `${productTitle} - Consultation Agreement`
        };
        
        contractTitleInput.value = templateTitles[template] || `${productTitle} - Service Contract`;
    }
}

function getContractTemplateSteps(template, productPrice) {
    const templates = {
        'web_development': [
            {
                description: 'Project planning, wireframes, and initial setup',
                magic_spell: {
                    type: 'payment',
                    amount: Math.round(productPrice * 0.3 / 100), // 30% upfront
                    description: `30% upfront payment ($${(productPrice * 0.3 / 100).toFixed(2)})`,
                    currency: 'USD'
                }
            },
            {
                description: 'Development phase - core functionality implementation',
                magic_spell: {
                    type: 'payment',
                    amount: Math.round(productPrice * 0.4 / 100), // 40% at milestone
                    description: `Milestone payment ($${(productPrice * 0.4 / 100).toFixed(2)})`,
                    currency: 'USD'
                }
            },
            {
                description: 'Final testing, deployment, and project handover',
                magic_spell: {
                    type: 'payment',
                    amount: Math.round(productPrice * 0.3 / 100), // 30% on completion
                    description: `Final payment ($${(productPrice * 0.3 / 100).toFixed(2)})`,
                    currency: 'USD'
                }
            }
        ],
        'design_project': [
            {
                description: 'Discovery phase - requirements gathering and research',
                magic_spell: {
                    type: 'payment',
                    amount: Math.round(productPrice * 0.25 / 100),
                    description: `Discovery phase payment ($${(productPrice * 0.25 / 100).toFixed(2)})`,
                    currency: 'USD'
                }
            },
            {
                description: 'Concept development and initial designs',
                magic_spell: {
                    type: 'payment',
                    amount: Math.round(productPrice * 0.25 / 100),
                    description: `Concept phase payment ($${(productPrice * 0.25 / 100).toFixed(2)})`,
                    currency: 'USD'
                }
            },
            {
                description: 'Design refinement and client feedback integration',
                magic_spell: {
                    type: 'payment',
                    amount: Math.round(productPrice * 0.25 / 100),
                    description: `Refinement phase payment ($${(productPrice * 0.25 / 100).toFixed(2)})`,
                    currency: 'USD'
                }
            },
            {
                description: 'Final deliverables and asset handover',
                magic_spell: {
                    type: 'payment',
                    amount: Math.round(productPrice * 0.25 / 100),
                    description: `Final payment ($${(productPrice * 0.25 / 100).toFixed(2)})`,
                    currency: 'USD'
                }
            }
        ],
        'consultation': [
            {
                description: 'Consultation session delivery',
                magic_spell: {
                    type: 'payment',
                    amount: Math.round(productPrice * 0.5 / 100),
                    description: `Session payment ($${(productPrice * 0.5 / 100).toFixed(2)})`,
                    currency: 'USD'
                }
            },
            {
                description: 'Follow-up report and recommendations delivery',
                magic_spell: {
                    type: 'payment',
                    amount: Math.round(productPrice * 0.5 / 100),
                    description: `Final payment ($${(productPrice * 0.5 / 100).toFixed(2)})`,
                    currency: 'USD'
                }
            }
        ]
    };
    
    return templates[template] || [
        {
            description: 'Service delivery and completion',
            magic_spell: {
                type: 'payment',
                amount: Math.round(productPrice / 100),
                description: `Full payment ($${(productPrice / 100).toFixed(2)})`,
                currency: 'USD'
            }
        }
    ];
}

// Global functions for HTML event handlers
window.showScreen = showScreen;
window.showProfileForm = showProfileForm;
window.hideProfileForm = hideProfileForm;
window.handleProfileSubmit = handleProfileSubmit;
window.deleteProfile = deleteProfile;
window.showProductForm = showProductForm;
window.hideProductForm = hideProductForm;
window.handleProductSubmit = handleProductSubmit;
window.deleteProduct = deleteProduct;
window.searchByTags = searchByTags;
window.showContractForm = showContractForm;
window.hideContractForm = hideContractForm;
window.addContractStep = addContractStep;
window.removeContractStep = removeContractStep;
window.toggleMagicSpell = toggleMagicSpell;
window.handleContractSubmit = handleContractSubmit;
window.viewContract = viewContract;
window.viewContractSVG = viewContractSVG;
window.signStep = signStep;
window.toggleProductContract = toggleProductContract;
window.applyContractTemplate = applyContractTemplate;

// Start the application
document.addEventListener('DOMContentLoaded', initializeApp);