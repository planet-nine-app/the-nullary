// Julia Integration for StackChat
// Handles all julia service interactions from the frontend

/**
 * Get all julia connections
 * @returns {Promise<Array>} Array of julia connections
 */
async function getJuliaConnections() {
    try {
        console.log('🔍 Fetching julia connections...');
        const connections = await window.__TAURI__.core.invoke('get_connections');
        console.log(`📋 Retrieved ${connections.length} julia connections`);
        
        // Log each connection for debugging
        connections.forEach(conn => {
            console.log(`  - ${conn.partner_name} (${conn.status}): ${conn.uuid}`);
        });
        
        return connections;
    } catch (error) {
        console.error('❌ Failed to get julia connections:', error);
        return [];
    }
}

/**
 * Process a julia connection URL
 * @param {string} connectionUrl - The stackchat:// connection URL
 * @returns {Promise<Object|null>} The created connection or null if failed
 */
async function processJuliaConnectionUrl(connectionUrl) {
    try {
        console.log('🔗 Processing julia connection URL:', connectionUrl);
        const connection = await window.__TAURI__.core.invoke('process_connection_url', { 
            connectionUrl: connectionUrl 
        });
        
        console.log('✅ Julia connection processed successfully:', connection);
        return connection;
    } catch (error) {
        console.error('❌ Failed to process julia connection URL:', error);
        throw error;
    }
}

/**
 * Generate a julia connection URL for sharing
 * @returns {Promise<string|null>} The generated connection URL or null if failed
 */
async function generateJuliaConnectionUrl() {
    try {
        console.log('🔗 Generating julia connection URL...');
        const connectionUrl = await window.__TAURI__.core.invoke('generate_connection_url');
        
        console.log('✅ Julia connection URL generated:', connectionUrl);
        return connectionUrl;
    } catch (error) {
        console.error('❌ Failed to generate julia connection URL:', error);
        return null;
    }
}

/**
 * Accept a julia connection
 * @param {string} associationUuid - UUID of the association to accept
 * @returns {Promise<boolean>} True if successful
 */
async function acceptJuliaConnection(associationUuid) {
    try {
        console.log('🤝 Accepting julia connection:', associationUuid);
        const result = await window.__TAURI__.core.invoke('accept_connection', { 
            associationUuid: associationUuid 
        });
        
        if (result) {
            console.log('✅ Julia connection accepted successfully');
            return true;
        } else {
            console.log('❌ Failed to accept julia connection');
            return false;
        }
    } catch (error) {
        console.error('❌ Error accepting julia connection:', error);
        return false;
    }
}

/**
 * Block a julia connection
 * @param {string} associationUuid - UUID of the association to block
 * @returns {Promise<boolean>} True if successful
 */
async function blockJuliaConnection(associationUuid) {
    try {
        console.log('🚫 Blocking julia connection:', associationUuid);
        const result = await window.__TAURI__.core.invoke('block_connection', { 
            associationUuid: associationUuid 
        });
        
        if (result) {
            console.log('✅ Julia connection blocked successfully');
            return true;
        } else {
            console.log('❌ Failed to block julia connection');
            return false;
        }
    } catch (error) {
        console.error('❌ Error blocking julia connection:', error);
        return false;
    }
}

/**
 * Send a message via julia
 * @param {string} associationUuid - UUID of the association to send to
 * @param {string} content - Message content
 * @returns {Promise<Object|null>} The sent message or null if failed
 */
async function sendJuliaMessage(associationUuid, content) {
    try {
        console.log('📤 Sending julia message:', { associationUuid, content });
        const message = await window.__TAURI__.core.invoke('send_message', { 
            associationUuid: associationUuid,
            content: content
        });
        
        console.log('✅ Julia message sent successfully:', message);
        return message;
    } catch (error) {
        console.error('❌ Failed to send julia message:', error);
        return null;
    }
}

/**
 * Get conversation for a julia association
 * @param {string} associationUuid - UUID of the association
 * @returns {Promise<Object|null>} The conversation or null if failed
 */
async function getJuliaConversation(associationUuid) {
    try {
        console.log('💬 Getting julia conversation:', associationUuid);
        const conversation = await window.__TAURI__.core.invoke('get_conversation', { 
            associationUuid: associationUuid 
        });
        
        console.log('✅ Julia conversation retrieved:', conversation);
        return conversation;
    } catch (error) {
        console.error('❌ Failed to get julia conversation:', error);
        return null;
    }
}

/**
 * Mark messages as read for a julia association
 * @param {string} associationUuid - UUID of the association
 * @returns {Promise<boolean>} True if successful
 */
async function markJuliaMessagesRead(associationUuid) {
    try {
        console.log('👀 Marking julia messages as read:', associationUuid);
        const result = await window.__TAURI__.core.invoke('mark_messages_read', { 
            associationUuid: associationUuid 
        });
        
        if (result) {
            console.log('✅ Julia messages marked as read');
            return true;
        } else {
            console.log('❌ Failed to mark julia messages as read');
            return false;
        }
    } catch (error) {
        console.error('❌ Error marking julia messages as read:', error);
        return false;
    }
}

/**
 * Get julia user info
 * @returns {Promise<Object|null>} Julia user info or null if failed
 */
async function getJuliaUserInfo() {
    try {
        console.log('👤 Getting julia user info...');
        const userInfo = await window.__TAURI__.core.invoke('get_sessionless_info');
        
        console.log('✅ Julia user info retrieved:', userInfo);
        return userInfo;
    } catch (error) {
        console.error('❌ Failed to get julia user info:', error);
        return null;
    }
}

// Export all functions for use in main.js
window.juliaIntegration = {
    getConnections: getJuliaConnections,
    processConnectionUrl: processJuliaConnectionUrl,
    generateConnectionUrl: generateJuliaConnectionUrl,
    acceptConnection: acceptJuliaConnection,
    blockConnection: blockJuliaConnection,
    sendMessage: sendJuliaMessage,
    getConversation: getJuliaConversation,
    markMessagesRead: markJuliaMessagesRead,
    getUserInfo: getJuliaUserInfo
};

console.log('📦 Julia Integration module loaded');