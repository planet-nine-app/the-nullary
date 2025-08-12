// StackChat - P2P Messaging with RPG-style Interface
// No-modules approach for Tauri compatibility


// Environment configuration for stackchat
let backendEnvironmentConfig = null;

async function initializeEnvironmentFromBackend() {
  try {
    const backendEnv = await invoke('get_env_config');
    console.log(`🔧 Backend environment: ${backendEnv}`);
    
    // Set frontend environment to match backend
    const currentFrontendEnv = localStorage.getItem('nullary-env') || 'dev';
    if (backendEnv !== currentFrontendEnv) {
      console.log(`🔄 Syncing frontend environment from ${currentFrontendEnv} to ${backendEnv}`);
      localStorage.setItem('nullary-env', backendEnv);
    }
  } catch (error) {
    console.warn('⚠️ Could not get backend environment config:', error);
  }
}

async function getBackendEnvironment() {
  if (window.__TAURI__) {
    try {
      const { invoke } = window.__TAURI__.core;
      return await invoke('get_env_config');
    } catch (e) {
      console.warn('Could not get backend environment:', e);
      return null;
    }
  }
  return null;
}

function getEnvironmentConfig() {
  const env = localStorage.getItem('nullary-env') || 'dev';
  
  const configs = {
    dev: {
      sanora: 'https://dev.sanora.allyabase.com/',
      bdo: 'https://dev.bdo.allyabase.com/',
      dolores: 'https://dev.dolores.allyabase.com/',
      fount: 'https://dev.fount.allyabase.com/',
      addie: 'https://dev.addie.allyabase.com/',
      pref: 'https://dev.pref.allyabase.com/',
      julia: 'https://dev.julia.allyabase.com/',
      continuebee: 'https://dev.continuebee.allyabase.com/',
      joan: 'https://dev.joan.allyabase.com/',
      aretha: 'https://dev.aretha.allyabase.com/',
      minnie: 'https://dev.minnie.allyabase.com/',
      covenant: 'https://dev.covenant.allyabase.com/'
    },
    test: {
      sanora: 'http://localhost:5121/',
      bdo: 'http://localhost:5114/',
      dolores: 'http://localhost:5118/',
      fount: 'http://localhost:5117/',
      addie: 'http://localhost:5116/',
      pref: 'http://localhost:5113/',
      julia: 'http://localhost:5111/',
      continuebee: 'http://localhost:5112/',
      joan: 'http://localhost:5115/',
      aretha: 'http://localhost:5120/',
      minnie: 'http://localhost:5119/',
      covenant: 'http://localhost:5122/'
    },
    local: {
      sanora: 'http://localhost:7243/',
      bdo: 'http://localhost:3003/',
      dolores: 'http://localhost:3005/',
      fount: 'http://localhost:3002/',
      addie: 'http://localhost:3005/',
      pref: 'http://localhost:3004/',
      julia: 'http://localhost:3000/',
      continuebee: 'http://localhost:2999/',
      joan: 'http://localhost:3004/',
      aretha: 'http://localhost:7277/',
      minnie: 'http://localhost:2525/',
      covenant: 'http://localhost:3011/'
    }
  };
  
  const config = configs[env] || configs.dev;
  return { env, services: config, name: env };
}

function getServiceUrl(serviceName) {
  const config = getEnvironmentConfig();
  return config.services[serviceName] || config.services.sanora;
}

// Environment switching functions for browser console
window.stackchatEnv = {
  switch: (env) => {
    const envs = { dev: 'dev', test: 'test', local: 'local' };
    if (!envs[env]) {
      console.error(`❌ Unknown environment: ${env}. Available: dev, test, local`);
      return false;
    }
    localStorage.setItem('nullary-env', env);
    console.log(`🔄 stackchat environment switched to ${env}. Refresh app to apply changes.`);
    console.log(`Run: location.reload() to refresh`);
    return true;
  },
  current: () => {
    const config = getEnvironmentConfig();
    console.log(`🌐 Current environment: ${config.env}`);
    console.log(`📍 Services:`, config.services);
    return config;
  },
  list: () => {
    console.log('🌍 Available environments for stackchat:');
    console.log('• dev - https://dev.*.allyabase.com (production dev server)');
    console.log('• test - localhost:5111-5122 (3-base test ecosystem)');
    console.log('• local - localhost:3000-3007 (local development)');
  }
};

// Make functions globally available
window.getEnvironmentConfig = getEnvironmentConfig;
window.getServiceUrl = getServiceUrl;

const { invoke } = window.__TAURI__.core;

// Global app state
const appState = {
    currentScreen: 'connections',
    currentConversation: null,
    connections: [],
    messages: [],
    sessionless: null,
    loading: false,
    messageRefreshInterval: null
};

// Screen Management
function showScreen(screenName, data = null) {
    // Clean up messaging screen if leaving it
    if (appState.currentScreen === 'messaging' && screenName !== 'messaging') {
        if (appState.messageRefreshInterval) {
            clearInterval(appState.messageRefreshInterval);
            appState.messageRefreshInterval = null;
        }
    }
    
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
        loadScreenData(screenName, data);
    }
}

// Load screen-specific data
async function loadScreenData(screenName, data = null) {
    switch (screenName) {
        case 'connections':
            await loadConnections();
            break;
        case 'messaging':
            if (data && data.connection) {
                await loadConversation(data.connection);
            }
            break;
        case 'planet-nine':
            loadPlanetNineContent();
            break;
    }
}

// Connections Management
async function loadConnections() {
    const content = document.querySelector('#connections-screen .content');
    if (!content) return;

    content.innerHTML = '<div class="loading-posts">Loading connections...</div>';
    appState.loading = true;

    try {
        const connections = await invoke('get_connections');
        console.log('📋 Loaded connections:', connections);
        
        // Rust returns array directly, not wrapped in success/data
        appState.connections = connections || [];
        displayConnections();
    } catch (error) {
        console.error('Error loading connections:', error);
        appState.connections = [];
        displayConnections(); // Show empty state with Create Connection button
    } finally {
        appState.loading = false;
    }
}

function displayConnections() {
    const content = document.querySelector('#connections-screen .content');
    if (!content) return;

    // Always show the Create Connection button at the top
    content.innerHTML = `
        <div style="margin-bottom: 20px; text-align: center;">
            <button class="form-button" onclick="createNewConnection()" style="background: #27ae60; color: white; padding: 12px 24px; border-radius: 8px; font-size: 16px; cursor: pointer; border: none;">
                🤝 Create New Connection
            </button>
        </div>
    `;

    if (appState.connections.length === 0) {
        content.innerHTML += `
            <div class="empty-state">
                <h3>No Connections Yet</h3>
                <p>Start a conversation by creating a new julia connection!</p>
                <p style="color: rgba(255,255,255,0.6); font-size: 14px;">Click "Create New Connection" above to generate a connection URL or process one from a partner.</p>
            </div>
        `;
        return;
    }

    const connectionsContainer = document.createElement('div');
    connectionsContainer.className = 'connections-list';
    
    appState.connections.forEach(connection => {
        const connectionCard = createConnectionCard(connection);
        connectionsContainer.appendChild(connectionCard);
    });

    const buttonDiv = content.querySelector('div');
    content.appendChild(connectionsContainer);
}

function createConnectionCard(connection) {
    const card = document.createElement('div');
    card.className = 'connection-card';
    card.onclick = () => openConversation(connection);
    
    const statusClass = connection.status.toLowerCase();
    const unreadBadge = connection.unread_count > 0 ? 
        `<span style="background: #e74c3c; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${connection.unread_count}</span>` : '';
    
    card.innerHTML = `
        <div class="connection-header">
            <div class="partner-name">${connection.partner_name}</div>
            <div class="connection-status ${statusClass}">${connection.status}</div>
        </div>
        
        <div class="connection-info">
            <div>Created: ${formatTimeAgo(new Date(connection.created_at))}</div>
            ${connection.last_message_at ? `<div>Last message: ${formatTimeAgo(new Date(connection.last_message_at))}</div>` : ''}
            ${unreadBadge}
        </div>
        
        <div class="connection-actions">
            ${connection.status === 'Pending' ? `
                <button class="action-button success" onclick="acceptConnection('${connection.uuid}', event)">Accept</button>
                <button class="action-button danger" onclick="blockConnection('${connection.uuid}', event)">Block</button>
            ` : `
                <button class="action-button primary" onclick="openConversation(${JSON.stringify(connection).replace(/"/g, '&quot;')}, event)">Message</button>
            `}
        </div>
    `;
    
    return card;
}

async function acceptConnection(associationUuid, event) {
    if (event) event.stopPropagation();
    
    try {
        const result = await invoke('accept_connection', { associationUuid });
        if (result.success) {
            await loadConnections(); // Refresh connections
        } else {
            alert(`Failed to accept connection: ${result.error}`);
        }
    } catch (error) {
        console.error('Error accepting connection:', error);
        alert('Failed to accept connection');
    }
}

async function blockConnection(associationUuid, event) {
    if (event) event.stopPropagation();
    
    try {
        const result = await invoke('block_connection', { associationUuid });
        if (result.success) {
            await loadConnections(); // Refresh connections
        } else {
            alert(`Failed to block connection: ${result.error}`);
        }
    } catch (error) {
        console.error('Error blocking connection:', error);
        alert('Failed to block connection');
    }
}

function displayConnectionsError(error) {
    const content = document.querySelector('#connections-screen .content');
    if (!content) return;

    content.innerHTML = `
        <div class="empty-state">
            <h3>Error Loading Connections</h3>
            <p>${error}</p>
            <button class="form-button" onclick="loadConnections()">Retry</button>
        </div>
    `;
}

// Messaging Functions
async function openConversation(connection, event) {
    if (event) event.stopPropagation();
    
    appState.currentConversation = connection;
    showScreen('messaging', { connection });
}

async function loadConversation(connection) {
    const content = document.querySelector('#messaging-screen .content');
    if (!content) return;

    // Set up messaging interface with conversation header
    content.innerHTML = `
        <button class="back-button" onclick="showScreen('connections')">← Back</button>
        <div class="conversation-header">
            <div class="partner-info">
                <div class="partner-name">💬 ${connection.partner_name}</div>
                <div class="connection-status">Julia Association • Active</div>
            </div>
            <button class="refresh-button" onclick="refreshMessages()" title="Refresh Messages">🔄</button>
        </div>
        <div class="messaging-container">
            <div class="messages-area" id="messagesArea">
                <div class="loading-posts">Loading conversation...</div>
            </div>
        </div>
        <div class="input-area">
            <div class="input-dialog-box">
                <form class="input-form" id="messageForm">
                    <input type="text" class="message-input" id="messageInput" placeholder="Type your message..." required maxlength="500">
                    <button type="submit" class="send-button" id="sendButton">Send 🚀</button>
                </form>
                <div class="message-status" id="messageStatus"></div>
            </div>
        </div>
    `;

    // Add form handler
    document.getElementById('messageForm').addEventListener('submit', handleSendMessage);

    // Load conversation messages
    await loadMessages();
    
    // Start auto-refresh for new messages every 10 seconds
    if (appState.messageRefreshInterval) {
        clearInterval(appState.messageRefreshInterval);
    }
    appState.messageRefreshInterval = setInterval(async () => {
        if (appState.currentScreen === 'messaging' && appState.currentConversation) {
            await loadMessages(true); // Silent refresh
        }
    }, 10000);
}

async function loadMessages(silent = false) {
    const connection = appState.currentConversation;
    if (!connection) return;

    if (!silent) {
        const messagesArea = document.getElementById('messagesArea');
        if (messagesArea) {
            messagesArea.innerHTML = '<div class="loading-posts">Loading conversation...</div>';
        }
    }

    try {
        const result = await invoke('get_conversation', { associationUuid: connection.uuid });
        
        if (result.success && result.data) {
            const previousMessageCount = appState.messages.length;
            appState.messages = result.data.messages;
            displayMessages();
            
            // Show notification if new messages arrived during silent refresh
            if (silent && result.data.messages.length > previousMessageCount) {
                showMessageStatus('💬 New messages received', 'success');
            }
            
            // Mark messages as read
            await invoke('mark_messages_read', { associationUuid: connection.uuid });
        } else {
            if (!silent) {
                displayMessagesError(result.error || 'Failed to load conversation');
            }
        }
    } catch (error) {
        console.error('Error loading conversation:', error);
        if (!silent) {
            displayMessagesError('Failed to connect to messaging service');
        }
    }
}

async function refreshMessages() {
    showMessageStatus('🔄 Refreshing messages...', 'info');
    await loadMessages();
    showMessageStatus('✅ Messages refreshed', 'success');
}

function displayMessages() {
    const messagesArea = document.getElementById('messagesArea');
    if (!messagesArea) return;

    messagesArea.innerHTML = '';
    
    appState.messages.forEach(message => {
        const messageElement = createRPGMessageElement(message);
        messagesArea.appendChild(messageElement);
    });

    // Scroll to bottom
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

function createRPGMessageElement(message) {
    const messageDiv = document.createElement('div');
    const isSent = message.sender_name === 'You';
    
    messageDiv.className = `rpg-dialog-box ${isSent ? 'sent' : 'received'}`;
    
    messageDiv.innerHTML = `
        ${!isSent ? '<div class="dialog-corner top-left"></div>' : ''}
        ${isSent ? '<div class="dialog-corner bottom-right"></div>' : ''}
        
        <div class="message-header">
            <div class="sender-name">${message.sender_name}</div>
            <div class="message-time">${formatTimeAgo(new Date(message.timestamp))}</div>
        </div>
        
        <div class="message-content">${message.content}</div>
    `;
    
    return messageDiv;
}

async function handleSendMessage(e) {
    e.preventDefault();
    
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const content = messageInput.value.trim();
    
    if (!content || !appState.currentConversation) return;

    // Disable input and show sending status
    messageInput.disabled = true;
    sendButton.disabled = true;
    sendButton.innerHTML = 'Sending... ⏳';
    showMessageStatus('🚀 Sending message to julia...', 'info');

    // Create space flight animation
    createSpaceFlightAnimation(messageInput);
    
    // Clear input
    messageInput.value = '';
    
    try {
        const result = await invoke('send_message', {
            associationUuid: appState.currentConversation.uuid,
            content
        });
        
        if (result.success && result.data) {
            // Add message to display
            appState.messages.push(result.data);
            displayMessages();
            showMessageStatus('✅ Message sent successfully!', 'success');
        } else {
            showMessageStatus(`❌ Failed to send: ${result.error}`, 'error');
            // Restore message in input if sending failed
            messageInput.value = content;
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showMessageStatus('❌ Network error - message not sent', 'error');
        // Restore message in input if sending failed
        messageInput.value = content;
    } finally {
        messageInput.disabled = false;
        sendButton.disabled = false;
        sendButton.innerHTML = 'Send 🚀';
        messageInput.focus();
    }
}

function showMessageStatus(message, type = 'info') {
    const statusDiv = document.getElementById('messageStatus');
    if (!statusDiv) return;

    const colors = {
        success: '#2ecc71',
        error: '#e74c3c', 
        info: '#3498db'
    };

    statusDiv.innerHTML = message;
    statusDiv.style.color = colors[type] || colors.info;
    statusDiv.style.fontSize = '12px';
    statusDiv.style.padding = '5px 0';
    statusDiv.style.textAlign = 'center';

    // Clear status after 3 seconds
    setTimeout(() => {
        if (statusDiv) statusDiv.innerHTML = '';
    }, 3000);
}

function createSpaceFlightAnimation(inputElement) {
    // Create a clone of the input content for animation
    const inputRect = inputElement.getBoundingClientRect();
    const animationElement = document.createElement('div');
    
    animationElement.className = 'space-flight-message rpg-dialog-box sent';
    animationElement.style.position = 'fixed';
    animationElement.style.left = inputRect.left + 'px';
    animationElement.style.top = inputRect.top + 'px';
    animationElement.style.width = inputRect.width + 'px';
    animationElement.style.zIndex = '200';
    
    animationElement.innerHTML = `
        <div class="message-content">${inputElement.value}</div>
    `;
    
    document.body.appendChild(animationElement);
    
    // Remove after animation completes
    setTimeout(() => {
        if (animationElement.parentNode) {
            animationElement.parentNode.removeChild(animationElement);
        }
    }, 2000);
}

function displayMessagesError(error) {
    const messagesArea = document.getElementById('messagesArea');
    if (!messagesArea) return;

    messagesArea.innerHTML = `
        <div class="empty-state">
            <h3>Error Loading Messages</h3>
            <p>${error}</p>
            <button class="form-button" onclick="loadConversation(appState.currentConversation)">Retry</button>
        </div>
    `;
}

// Teleportation Functions
async function getBasePubKeyForTeleportation(baseUrl) {
    try {
        console.log(`🔍 Getting base pubKey for teleportation from: ${baseUrl}`);
        const sanoraUser = await invoke('create_sanora_user', { sanoraUrl: baseUrl });
        
        // Rust function returns direct JSON object
        if (sanoraUser && (sanoraUser.basePubKey || sanoraUser.base_pub_key)) {
            const basePubKey = sanoraUser.basePubKey || sanoraUser.base_pub_key;
            console.log(`🔑 Got base pubKey: ${basePubKey}`);
            return basePubKey;
        } else {
            console.warn(`⚠️ Failed to get basePubKey from Sanora user:`, sanoraUser);
            throw new Error('No basePubKey found in Sanora user response');
        }
    } catch (error) {
        console.error(`❌ Error getting base pubKey from ${baseUrl}:`, error);
        throw error; // Don't use fallback, let caller handle error
    }
}

async function fetchTeleportedContentFromBases() {
    console.log('🔍 Starting teleported content fetch for StackChat...');
    
    try {
        const config = getEnvironmentConfig();
        console.log(`🌐 Using environment: ${config.env}`);
        
        // Get available bases 
        const bases = [
            {
                id: 'HOME',
                name: 'Home Base',
                dns: {
                    sanora: config.services.sanora,
                    bdo: config.services.bdo
                }
            }
        ];

        let allItems = [];

        for (const base of bases) {
            console.log(`🔍 Teleporting from ${base.name} - Sanora: ${base.dns.sanora}, BDO: ${base.dns.bdo}`);
            
            try {
                const teleportableUrl = `allyabase://sanora/teleportable-products`;
                const pubKey = await getBasePubKeyForTeleportation(base.dns.sanora);
                const teleportUrl = `${teleportableUrl}?pubKey=${pubKey}`;
                
                console.log(`🔗 Using allyabase:// protocol for container networking: ${teleportUrl}`);
                
                const teleportedData = await invoke('teleport_content', {
                    bdoUrl: base.dns.bdo,
                    teleportUrl: teleportUrl
                });
                
                console.log('📄 Parsing teleported HTML content...');
                const processedItems = await processTeleportedData(teleportedData, base.id, base.name, base.dns.sanora);
                allItems = allItems.concat(processedItems);
                
                console.log(`✅ Processed ${processedItems.length} teleported items from ${base.name}`);
                
            } catch (error) {
                console.error(`❌ Error teleporting from ${base.name}:`, error);
            }
        }

        return allItems;
        
    } catch (error) {
        console.error('❌ Failed to load teleported content:', error);
        return [];
    }
}

async function processTeleportedData(teleportedData, baseId, baseName, baseUrl) {
    console.log('🔍 Processing teleported data:', teleportedData);
    
    if (!teleportedData || !teleportedData.html) {
        console.warn('⚠️ No HTML content in teleported data');
        return [];
    }
    
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(teleportedData.html, 'text/html');
        const teleportals = doc.querySelectorAll('teleportal');
        
        console.log(`🔍 Found ${teleportals.length} teleportal elements`);
        
        const items = [];
        
        teleportals.forEach((teleportal, index) => {
            const item = {
                id: `${baseId}-${index}`,
                title: teleportal.getAttribute('title') || 'Untitled Product',
                price: teleportal.getAttribute('price') || 'Free',
                description: teleportal.getAttribute('description') || 'No description available',
                author: teleportal.getAttribute('author') || 'Unknown Author',
                type: teleportal.getAttribute('type') || 'product',
                url: teleportal.getAttribute('url') || '#',
                baseName: baseName,
                baseUrl: baseUrl
            };
            items.push(item);
        });
        
        return items;
    } catch (error) {
        console.error('❌ Error parsing teleported HTML:', error);
        return [];
    }
}

// Planet Nine Content
async function loadPlanetNineContent() {
    const content = document.querySelector('#planet-nine-screen .content');
    if (!content) return;

    // Show loading state
    content.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: white;">
            <h1 style="font-size: 48px; font-weight: 700; margin-bottom: 30px;">🚀 StackChat</h1>
            <p style="font-size: 18px; line-height: 1.6; max-width: 600px; margin: 0 auto 40px;">
                Welcome to StackChat - the peer-to-peer messaging platform of the Planet Nine ecosystem. 
                Communicate securely through julia associations with RPG-style interfaces and 
                space-flight message animations!
            </p>
            <div class="loading-posts">Loading teleported content...</div>
        </div>
    `;

    // Fetch teleported content
    const teleportedItems = await fetchTeleportedContentFromBases();
    
    // Build content with teleported items
    let teleportedContentHTML = '';
    if (teleportedItems.length > 0) {
        teleportedContentHTML = `
            <div style="margin-top: 40px; max-width: 800px; margin-left: auto; margin-right: auto;">
                <h2 style="color: white; margin-bottom: 20px; text-align: center;">🌐 Teleported from Planet Nine Ecosystem</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                    ${teleportedItems.map(item => `
                        <div style="background: rgba(255,255,255,0.9); padding: 20px; border-radius: 12px; color: #333;">
                            <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">${item.title}</h3>
                            <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.8;">${item.description}</p>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-weight: 600; color: #27ae60;">${item.price}</span>
                                <span style="font-size: 12px; opacity: 0.6;">from ${item.baseName}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        teleportedContentHTML = `
            <div style="margin-top: 40px; text-align: center;">
                <p style="color: rgba(255,255,255,0.6); font-size: 16px;">🔌 No teleported content available</p>
                <p style="color: rgba(255,255,255,0.5); font-size: 14px;">Content will appear here when bases are connected</p>
            </div>
        `;
    }

    content.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: white;">
            <h1 style="font-size: 48px; font-weight: 700; margin-bottom: 30px;">🚀 StackChat</h1>
            <p style="font-size: 18px; line-height: 1.6; max-width: 600px; margin: 0 auto 40px;">
                Welcome to StackChat - the peer-to-peer messaging platform of the Planet Nine ecosystem. 
                Communicate securely through julia associations with RPG-style interfaces and 
                space-flight message animations!
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 30px; max-width: 800px; margin: 0 auto;">
                <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 12px;">
                    <div style="font-size: 36px; margin-bottom: 15px;">💬</div>
                    <h3 style="margin-bottom: 10px;">P2P Messaging</h3>
                    <p style="font-size: 14px; opacity: 0.8;">Direct communication through julia associations</p>
                </div>
                <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 12px;">
                    <div style="font-size: 36px; margin-bottom: 15px;">🎮</div>
                    <h3 style="margin-bottom: 10px;">RPG Interface</h3>
                    <p style="font-size: 14px; opacity: 0.8;">Classic dialog boxes with modern functionality</p>
                </div>
                <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 12px;">
                    <div style="font-size: 36px; margin-bottom: 15px;">🚀</div>
                    <h3 style="margin-bottom: 10px;">Space Animations</h3>
                    <p style="font-size: 14px; opacity: 0.8;">Messages fly off to space when sent</p>
                </div>
            </div>
            ${teleportedContentHTML}
        </div>
    `;
}

// Utility Functions
function formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
}

// App Structure Creation
function createAppStructure() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <!-- Connections Screen -->
        <div id="connections-screen" class="screen active">
            <nav class="nav-bar">
                <div class="nav-title">💬 StackChat</div>
                <div class="nav-buttons">
                    <button class="nav-button active" data-screen="connections">Connections</button>
                    <button class="nav-button" data-screen="planet-nine">Planet Nine</button>
                </div>
            </nav>
            <div class="content">
                <div class="loading-posts">Loading connections...</div>
            </div>
        </div>

        <!-- Messaging Screen -->
        <div id="messaging-screen" class="screen">
            <nav class="nav-bar">
                <div class="nav-title">💬 Conversation</div>
                <div class="nav-buttons">
                    <button class="nav-button" data-screen="connections">Connections</button>
                    <button class="nav-button" data-screen="planet-nine">Planet Nine</button>
                </div>
            </nav>
            <div class="content">
                <div class="loading-posts">Loading conversation...</div>
            </div>
        </div>

        <!-- Planet Nine Screen -->
        <div id="planet-nine-screen" class="screen">
            <nav class="nav-bar">
                <div class="nav-title">🚀 Planet Nine</div>
                <div class="nav-buttons">
                    <button class="nav-button" data-screen="connections">Connections</button>
                    <button class="nav-button active" data-screen="planet-nine">Planet Nine</button>
                </div>
            </nav>
            <div class="content">
                <div class="loading-posts">Loading Planet Nine info...</div>
            </div>
        </div>
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

// Connection Creation Functions
function showConnectionModal() {
    const modalHTML = `
        <div id="connectionModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center;">
            <div style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); border: 3px solid #ecf0f1; border-radius: 15px; padding: 30px; max-width: 500px; width: 90%;">
                <h3 style="color: white; margin: 0 0 20px 0; text-align: center;">🤝 Create New Connection</h3>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="color: #f39c12; margin: 0 0 10px 0;">📤 Share Your Connection URL</h4>
                    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                        <input type="text" id="connectionUrl" readonly style="width: 100%; background: transparent; border: none; color: white; font-size: 12px;" placeholder="Generating connection URL...">
                    </div>
                    <button onclick="generateConnectionUrl()" style="background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-right: 10px;">Generate URL</button>
                    <button onclick="copyConnectionUrl()" style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Copy URL</button>
                </div>
                
                <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 20px; margin-top: 20px;">
                    <h4 style="color: #f39c12; margin: 0 0 10px 0;">📥 Connect via URL</h4>
                    <div style="display: flex; gap: 10px;">
                        <input type="text" id="partnerUrl" placeholder="Paste connection URL from partner..." style="flex: 1; background: rgba(255,255,255,0.9); border: 2px solid rgba(255,255,255,0.3); border-radius: 6px; padding: 10px; color: #333;">
                        <button onclick="processPartnerUrl()" style="background: #e74c3c; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Connect</button>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="closeConnectionModal()" style="background: #7f8c8d; color: white; border: none; padding: 10px 30px; border-radius: 6px; cursor: pointer;">Close</button>
                </div>
                
                <div id="connectionStatus" style="margin-top: 15px; text-align: center; color: white;"></div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeConnectionModal() {
    const modal = document.getElementById('connectionModal');
    if (modal) {
        modal.remove();
    }
}

async function generateConnectionUrl() {
    const statusDiv = document.getElementById('connectionStatus');
    const urlInput = document.getElementById('connectionUrl');
    
    try {
        statusDiv.innerHTML = '🔄 Generating connection URL...';
        
        // Rust returns the URL string directly
        const connectionUrl = await invoke('generate_connection_url');
        console.log('📋 Generated connection URL:', connectionUrl);
        
        if (connectionUrl) {
            urlInput.value = connectionUrl;
            statusDiv.innerHTML = '✅ Connection URL generated! Share this with your partner.';
            statusDiv.style.color = '#2ecc71';
        } else {
            statusDiv.innerHTML = '❌ Failed to generate URL: No URL returned';
            statusDiv.style.color = '#e74c3c';
        }
    } catch (error) {
        console.error('Error generating connection URL:', error);
        statusDiv.innerHTML = '❌ Error generating URL: ' + error;
        statusDiv.style.color = '#e74c3c';
    }
}

function copyConnectionUrl() {
    const urlInput = document.getElementById('connectionUrl');
    const statusDiv = document.getElementById('connectionStatus');
    
    if (urlInput.value) {
        navigator.clipboard.writeText(urlInput.value).then(() => {
            statusDiv.innerHTML = '📋 URL copied to clipboard!';
            statusDiv.style.color = '#2ecc71';
        }).catch(() => {
            // Fallback for older browsers
            urlInput.select();
            document.execCommand('copy');
            statusDiv.innerHTML = '📋 URL copied to clipboard!';
            statusDiv.style.color = '#2ecc71';
        });
    } else {
        statusDiv.innerHTML = '⚠️ Generate a URL first';
        statusDiv.style.color = '#f39c12';
    }
}

async function processPartnerUrl() {
    const partnerUrlInput = document.getElementById('partnerUrl');
    const statusDiv = document.getElementById('connectionStatus');
    
    const url = partnerUrlInput.value.trim();
    if (!url) {
        statusDiv.innerHTML = '⚠️ Please enter a connection URL';
        statusDiv.style.color = '#f39c12';
        return;
    }
    
    if (!url.startsWith('stackchat://connect')) {
        statusDiv.innerHTML = '⚠️ Invalid StackChat connection URL';
        statusDiv.style.color = '#f39c12';
        return;
    }
    
    try {
        statusDiv.innerHTML = '🔄 Processing connection...';
        statusDiv.style.color = '#3498db';
        
        // Rust returns the JuliaConnection directly
        const connection = await invoke('process_connection_url', { connectionUrl: url });
        console.log('📋 Processed connection:', connection);
        
        if (connection) {
            statusDiv.innerHTML = '✅ Connection created! Refresh connections to see new partner.';
            statusDiv.style.color = '#2ecc71';
            
            // Clear the input
            partnerUrlInput.value = '';
            
            // Add the new connection to our state
            appState.connections.push(connection);
            
            // Refresh connections after a delay
            setTimeout(() => {
                closeConnectionModal();
                loadConnections();
            }, 2000);
        } else {
            statusDiv.innerHTML = '❌ Failed to create connection: No connection returned';
            statusDiv.style.color = '#e74c3c';
        }
    } catch (error) {
        console.error('Error processing connection URL:', error);
        statusDiv.innerHTML = '❌ Error processing connection: ' + error;
        statusDiv.style.color = '#e74c3c';
    }
}

// Global functions for window object
window.showScreen = showScreen;
window.loadConnections = loadConnections;
window.acceptConnection = acceptConnection;
window.blockConnection = blockConnection;
window.openConversation = openConversation;
window.createNewConnection = () => showConnectionModal();
window.generateConnectionUrl = generateConnectionUrl;
window.copyConnectionUrl = copyConnectionUrl;
window.processPartnerUrl = processPartnerUrl;
window.closeConnectionModal = closeConnectionModal;
window.refreshMessages = refreshMessages;

// Initialize the application
async function initApp() {
    try {
        // Initialize environment configuration from backend
        await initializeEnvironmentFromBackend();
        
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
                <h2>Failed to initialize StackChat</h2>
                <p>Please check your connection and try again.</p>
                <button onclick="window.location.reload()">Reload</button>
            </div>
        `;
    }
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);