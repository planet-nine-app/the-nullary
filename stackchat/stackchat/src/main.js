// StackChat - P2P Messaging with RPG-style Interface
// No-modules approach for Tauri compatibility


// Environment configuration for stackchat
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
    loading: false
};

// Screen Management
function showScreen(screenName, data = null) {
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
        const result = await invoke('get_connections');
        
        if (result.success && result.data) {
            appState.connections = result.data;
            displayConnections();
        } else {
            displayConnectionsError(result.error || 'Failed to load connections');
        }
    } catch (error) {
        console.error('Error loading connections:', error);
        displayConnectionsError('Failed to connect to covenant service');
    } finally {
        appState.loading = false;
    }
}

function displayConnections() {
    const content = document.querySelector('#connections-screen .content');
    if (!content) return;

    if (appState.connections.length === 0) {
        content.innerHTML = `
            <div class="empty-state">
                <h3>No Connections Yet</h3>
                <p>Start a conversation by creating a new covenant connection!</p>
                <button class="form-button" onclick="createNewConnection()">Create Connection</button>
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

    content.innerHTML = '';
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

async function acceptConnection(covenantUuid, event) {
    if (event) event.stopPropagation();
    
    try {
        const result = await invoke('accept_connection', { covenantUuid });
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

async function blockConnection(covenantUuid, event) {
    if (event) event.stopPropagation();
    
    try {
        const result = await invoke('block_connection', { covenantUuid });
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

    // Set up messaging interface
    content.innerHTML = `
        <button class="back-button" onclick="showScreen('connections')">← Back</button>
        <div class="messaging-container">
            <div class="messages-area" id="messagesArea">
                <div class="loading-posts">Loading conversation...</div>
            </div>
        </div>
        <div class="input-area">
            <div class="input-dialog-box">
                <form class="input-form" id="messageForm">
                    <input type="text" class="message-input" id="messageInput" placeholder="Type your message..." required>
                    <button type="submit" class="send-button">Send 🚀</button>
                </form>
            </div>
        </div>
    `;

    // Add form handler
    document.getElementById('messageForm').addEventListener('submit', handleSendMessage);

    // Load conversation messages
    try {
        const result = await invoke('get_conversation', { covenantUuid: connection.uuid });
        
        if (result.success && result.data) {
            appState.messages = result.data.messages;
            displayMessages();
            
            // Mark messages as read
            await invoke('mark_messages_read', { covenantUuid: connection.uuid });
        } else {
            displayMessagesError(result.error || 'Failed to load conversation');
        }
    } catch (error) {
        console.error('Error loading conversation:', error);
        displayMessagesError('Failed to connect to messaging service');
    }
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
    const content = messageInput.value.trim();
    
    if (!content || !appState.currentConversation) return;

    // Create space flight animation
    createSpaceFlightAnimation(messageInput);
    
    // Clear input
    messageInput.value = '';
    messageInput.disabled = true;
    
    try {
        const result = await invoke('send_message', {
            covenantUuid: appState.currentConversation.uuid,
            content
        });
        
        if (result.success && result.data) {
            // Add message to display
            appState.messages.push(result.data);
            displayMessages();
        } else {
            alert(`Failed to send message: ${result.error}`);
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
    } finally {
        messageInput.disabled = false;
        messageInput.focus();
    }
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

// Planet Nine Content
function loadPlanetNineContent() {
    const content = document.querySelector('#planet-nine-screen .content');
    if (!content) return;

    content.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: white;">
            <h1 style="font-size: 48px; font-weight: 700; margin-bottom: 30px;">🚀 StackChat</h1>
            <p style="font-size: 18px; line-height: 1.6; max-width: 600px; margin: 0 auto 40px;">
                Welcome to StackChat - the peer-to-peer messaging platform of the Planet Nine ecosystem. 
                Communicate securely through covenant connections with RPG-style interfaces and 
                space-flight message animations!
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 30px; max-width: 800px; margin: 0 auto;">
                <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 12px;">
                    <div style="font-size: 36px; margin-bottom: 15px;">💬</div>
                    <h3 style="margin-bottom: 10px;">P2P Messaging</h3>
                    <p style="font-size: 14px; opacity: 0.8;">Direct communication through covenant connections</p>
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

// Global functions for window object
window.showScreen = showScreen;
window.loadConnections = loadConnections;
window.acceptConnection = acceptConnection;
window.blockConnection = blockConnection;
window.openConversation = openConversation;
window.createNewConnection = () => alert('Create new connection feature coming soon!');

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
                <h2>Failed to initialize StackChat</h2>
                <p>Please check your connection and try again.</p>
                <button onclick="window.location.reload()">Reload</button>
            </div>
        `;
    }
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);