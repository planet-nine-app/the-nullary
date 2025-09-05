/**
 * Covenant GUI - Magical Contract Management (No ES6 Modules)
 * A Nullary application for creating and managing covenant contracts with multi-party signatures
 */

// Global variables for Tauri API
let invoke;

// Environment Configuration (embedded)
const ENVIRONMENTS = {
    dev: {
        name: 'Development Server',
        covenant: 'https://dev.covenant.allyabase.com',
        bdo: 'https://dev.bdo.allyabase.com',
        sanora: 'https://dev.sanora.allyabase.com',
        description: 'Production dev server environment'
    },
    test: {
        name: '3-Base Test Ecosystem',
        covenant: 'http://127.0.0.1:5122',
        bdo: 'http://127.0.0.1:5113',
        sanora: 'http://127.0.0.1:5121',
        description: 'Local 3-base test ecosystem (ports 5111-5122)'
    },
    local: {
        name: 'Local Development',
        covenant: 'http://127.0.0.1:3011',
        bdo: 'http://127.0.0.1:3003',
        sanora: 'http://127.0.0.1:7243',
        description: 'Standard local development environment'
    }
};

let currentEnvironment = 'dev';

// Environment configuration functions
function getEnvironmentConfig() {
    // Check localStorage for saved preference
    const savedEnv = localStorage.getItem('nullary-env');
    if (savedEnv && ENVIRONMENTS[savedEnv]) {
        currentEnvironment = savedEnv;
    }
    
    return {
        env: currentEnvironment,
        name: ENVIRONMENTS[currentEnvironment].name,
        services: ENVIRONMENTS[currentEnvironment],
        description: ENVIRONMENTS[currentEnvironment].description
    };
}

function getServiceUrl(serviceName) {
    const config = getEnvironmentConfig();
    const url = config.services[serviceName];
    
    if (!url) {
        console.warn(`⚠️ Service '${serviceName}' not found in ${config.env} environment`);
        return ENVIRONMENTS.dev[serviceName] || '';
    }
    
    return url;
}

function switchEnvironment(envName) {
    if (!ENVIRONMENTS[envName]) {
        console.error(`❌ Unknown environment: ${envName}`);
        return false;
    }
    
    currentEnvironment = envName;
    localStorage.setItem('nullary-env', envName);
    
    console.log(`🌍 Switched to ${ENVIRONMENTS[envName].name} environment`);
    console.log(`📍 Covenant: ${ENVIRONMENTS[envName].covenant}`);
    console.log(`📍 BDO: ${ENVIRONMENTS[envName].bdo}`);
    
    return true;
}

function listEnvironments() {
    return Object.keys(ENVIRONMENTS).map(key => ({
        key,
        name: ENVIRONMENTS[key].name,
        description: ENVIRONMENTS[key].description,
        current: key === currentEnvironment
    }));
}

// Browser console helpers
window.covenantEnv = {
    switch: (env) => {
        if (switchEnvironment(env)) {
            console.log('🔄 Environment switched. You may need to refresh or restart the app.');
            return true;
        }
        return false;
    },
    current: () => {
        const config = getEnvironmentConfig();
        console.log(`🌍 Current environment: ${config.env} (${config.name})`);
        console.log(`📍 Services:`, config.services);
        return config;
    },
    list: () => {
        const envs = listEnvironments();
        console.log('🌍 Available environments:');
        envs.forEach(env => {
            const marker = env.current ? '→' : ' ';
            console.log(`${marker} ${env.key}: ${env.name} - ${env.description}`);
        });
        return envs;
    }
};

// Dynamic Form Widget Loading with Fallback Strategy
function loadFormWidget() {
    // Check if environment functions are available
    if (typeof getServiceUrl === 'undefined') {
        console.warn('⚠️ Environment config not ready, retrying in 100ms...');
        setTimeout(loadFormWidget, 100);
        return;
    }
    
    const currentEnv = getEnvironmentConfig().env;
    console.log(`📋 Current environment: ${currentEnv}`);
    
    // Form widget is only available locally in development
    // Remote servers (dev.sanora.allyabase.com) don't have form-widget files
    let baseUrl;
    
    if (currentEnv === 'local') {
        // Use sanora from environment config
        baseUrl = getServiceUrl('sanora').replace(/\/$/, '');
    } else if (currentEnv === 'test') {
        // Use sanora from environment config  
        baseUrl = getServiceUrl('sanora').replace(/\/$/, '');
    } else {
        // For dev environment, fallback to local sanora since form-widget isn't deployed
        console.log('📋 Dev environment detected, falling back to local sanora for form-widget');
        baseUrl = 'http://127.0.0.1:7243';
    }
    
    console.log(`📋 Loading form-widget from: ${baseUrl}`);
    
    // Load CSS dynamically with error handling
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = `${baseUrl}/form-widget.css`;
    cssLink.onload = () => console.log('✅ Form widget CSS loaded');
    cssLink.onerror = (e) => {
        console.warn('⚠️ Failed to load form widget CSS from:', cssLink.href);
        console.warn('💡 Make sure local sanora is running on port 3000');
        console.error('CSS load error:', e);
    };
    document.head.appendChild(cssLink);
    
    // Load JavaScript dynamically with error handling
    const jsScript = document.createElement('script');
    jsScript.src = `${baseUrl}/form-widget.js`;
    jsScript.onload = () => {
        console.log('✅ Form widget JS loaded');
        console.log('📝 window.getForm available:', typeof window.getForm);
    };
    jsScript.onerror = (e) => {
        console.warn('⚠️ Failed to load form widget JS from:', jsScript.src);
        console.warn('💡 Make sure local sanora is running on port 3000');
        console.warn('💡 You can start it with: cd /Users/zachbabb/Work/planet-nine/sanora && node src/server/node/sanora.js');
        console.error('JS load error:', e);
    };
    document.head.appendChild(jsScript);
}

// Load covenant form configuration
let covenantFormConfig = null;

async function loadCovenantFormConfig() {
    try {
        const response = await fetch('./covenant-form-config.json');
        const config = await response.json();
        covenantFormConfig = config.covenant.formConfig;
        console.log('✅ Covenant form config loaded');
        return covenantFormConfig;
    } catch (error) {
        console.error('❌ Failed to load covenant form config:', error);
        // Fallback config
        covenantFormConfig = {
            "Contract Title": { "type": "text" },
            "Description": { "type": "textarea", "charLimit": 1000 },
            "Participants": { "type": "textarea", "charLimit": 2000 },
            "Contract Steps": { "type": "textarea", "charLimit": 2000 }
        };
        return covenantFormConfig;
    }
}

// App state
const appState = {
    currentScreen: 'contracts', // contracts, create, view, connect
    currentContract: null,
    contracts: [],
    userInfo: null,
    loading: false,
    error: null
};

// SVG theme configuration
const theme = {
    colors: {
        primary: '#64b5f6',
        secondary: '#81c784',
        background: '#1a1a2e',
        surface: '#16213e',
        accent: '#ffb74d',
        text: '#ffffff',
        textSecondary: '#b0bec5',
        error: '#f44336',
        success: '#4caf50',
        warning: '#ff9800'
    },
    typography: {
        fontFamily: 'Arial, sans-serif',
        titleSize: 24,
        headerSize: 18,
        bodySize: 14,
        smallSize: 12
    },
    spacing: {
        small: 8,
        medium: 16,
        large: 24,
        xlarge: 32
    }
};

/**
 * Create SVG container with standard settings
 */
function createSVGContainer(width = '100%', height = '100%', viewHeight = 600) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    // If height is 'auto', convert to percentage for SVG compatibility
    if (height === 'auto') {
        svg.setAttribute('height', '100%');
        svg.style.height = 'auto';  // Use CSS for auto height behavior
    } else {
        svg.setAttribute('height', height);
    }
    svg.setAttribute('viewBox', `0 0 800 ${viewHeight}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMin meet');
    svg.style.background = theme.colors.background;
    svg.style.minHeight = '100vh';
    svg.style.height = viewHeight + 'px';  // Set explicit height to ensure scrolling works
    svg.style.display = 'block';
    return svg;
}

/**
 * Create SVG text element
 */
function createSVGText(text, x, y, options = {}) {
    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textElement.setAttribute('x', x);
    textElement.setAttribute('y', y);
    textElement.setAttribute('fill', options.color || theme.colors.text);
    textElement.setAttribute('font-family', options.fontFamily || theme.typography.fontFamily);
    textElement.setAttribute('font-size', options.fontSize || theme.typography.bodySize);
    textElement.setAttribute('font-weight', options.fontWeight || 'normal');
    textElement.textContent = text;
    return textElement;
}

/**
 * Create SVG rectangle
 */
function createSVGRect(x, y, width, height, options = {}) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);
    rect.setAttribute('fill', options.fill || theme.colors.surface);
    rect.setAttribute('stroke', options.stroke || 'none');
    rect.setAttribute('stroke-width', options.strokeWidth || '0');
    rect.setAttribute('rx', options.rx || '8');
    rect.setAttribute('ry', options.ry || '8');
    return rect;
}

/**
 * Create interactive SVG button
 */
function createSVGButton(text, x, y, width, height, onclick, options = {}) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.style.cursor = 'pointer';
    
    const rect = createSVGRect(x, y, width, height, {
        fill: options.fill || theme.colors.primary,
        stroke: options.stroke || theme.colors.primary,
        strokeWidth: 2,
        rx: 6
    });
    
    const textElement = createSVGText(text, x + width/2, y + height/2 + 5, {
        color: options.textColor || '#ffffff',
        fontSize: options.fontSize || theme.typography.bodySize,
        fontWeight: 'bold'
    });
    textElement.setAttribute('text-anchor', 'middle');
    
    g.appendChild(rect);
    g.appendChild(textElement);
    
    // Add hover effects
    g.addEventListener('mouseenter', () => {
        rect.setAttribute('fill', options.hoverFill || theme.colors.secondary);
        rect.setAttribute('transform', 'scale(1.05)');
        rect.style.transformOrigin = `${x + width/2}px ${y + height/2}px`;
    });
    
    g.addEventListener('mouseleave', () => {
        rect.setAttribute('fill', options.fill || theme.colors.primary);
        rect.setAttribute('transform', 'scale(1)');
    });
    
    g.addEventListener('click', onclick);
    
    return g;
}

/**
 * Create loading spinner
 */
function createLoadingSpinner(x, y, size = 30) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', size/2);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', theme.colors.primary);
    circle.setAttribute('stroke-width', '3');
    circle.setAttribute('stroke-dasharray', `${size} ${size}`);
    circle.setAttribute('stroke-linecap', 'round');
    
    // Add rotation animation
    const animateTransform = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
    animateTransform.setAttribute('attributeName', 'transform');
    animateTransform.setAttribute('attributeType', 'XML');
    animateTransform.setAttribute('type', 'rotate');
    animateTransform.setAttribute('from', `0 ${x} ${y}`);
    animateTransform.setAttribute('to', `360 ${x} ${y}`);
    animateTransform.setAttribute('dur', '1s');
    animateTransform.setAttribute('repeatCount', 'indefinite');
    
    circle.appendChild(animateTransform);
    g.appendChild(circle);
    
    return g;
}

/**
 * Create contract card
 */
function createContractCard(contract, y) {
    const cardHeight = 120;
    const cardWidth = 750;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.style.cursor = 'pointer';
    
    // Card background
    const bg = createSVGRect(25, y, cardWidth, cardHeight, {
        fill: theme.colors.surface,
        stroke: theme.colors.primary,
        strokeWidth: 1
    });
    
    // Title
    const title = createSVGText(contract.title, 40, y + 25, {
        fontSize: theme.typography.headerSize,
        fontWeight: 'bold',
        color: theme.colors.primary
    });
    
    // Description
    const description = createSVGText(
        contract.description.length > 80 
            ? contract.description.substring(0, 80) + '...' 
            : contract.description,
        40, y + 50, {
            fontSize: theme.typography.bodySize,
            color: theme.colors.textSecondary
        }
    );
    
    // Status
    const statusColor = contract.status === 'active' ? theme.colors.success : theme.colors.warning;
    const status = createSVGText(`Status: ${contract.status.toUpperCase()}`, 40, y + 70, {
        fontSize: theme.typography.smallSize,
        color: statusColor,
        fontWeight: 'bold'
    });
    
    // Progress bar
    const progressBg = createSVGRect(40, y + 85, 300, 8, {
        fill: theme.colors.background,
        rx: 4
    });
    
    const progressFg = createSVGRect(40, y + 85, (contract.progress || 0) * 3, 8, {
        fill: theme.colors.secondary,
        rx: 4
    });
    
    // Progress text
    const progressText = createSVGText(
        `${Math.round(contract.progress || 0)}% complete`,
        350, y + 92, {
            fontSize: theme.typography.smallSize,
            color: theme.colors.textSecondary
        }
    );
    
    // Participants count
    const participants = createSVGText(
        `👥 ${contract.participants.length} participants`,
        550, y + 70, {
            fontSize: theme.typography.smallSize,
            color: theme.colors.textSecondary
        }
    );
    
    // Created date
    const created = createSVGText(
        `Created: ${new Date(contract.created_at).toLocaleDateString()}`,
        550, y + 92, {
            fontSize: theme.typography.smallSize,
            color: theme.colors.textSecondary
        }
    );
    
    g.appendChild(bg);
    g.appendChild(title);
    g.appendChild(description);
    g.appendChild(status);
    g.appendChild(progressBg);
    g.appendChild(progressFg);
    g.appendChild(progressText);
    g.appendChild(participants);
    g.appendChild(created);
    
    // Add hover effect
    g.addEventListener('mouseenter', () => {
        bg.setAttribute('stroke', theme.colors.secondary);
        bg.setAttribute('stroke-width', '2');
    });
    
    g.addEventListener('mouseleave', () => {
        bg.setAttribute('stroke', theme.colors.primary);
        bg.setAttribute('stroke-width', '1');
    });
    
    // Click to view contract
    g.addEventListener('click', () => {
        appState.currentContract = contract;
        switchToScreen('view');
    });
    
    return g;
}

/**
 * Create contracts screen
 */
function createContractsScreen() {
    // Calculate dynamic height based on number of contracts
    const contractCount = appState.contracts.length || 0;
    const minHeight = 600;
    const contractHeight = 140;
    const viewHeight = Math.max(minHeight, 250 + (contractCount * contractHeight));
    
    const svg = createSVGContainer('100%', 'auto', viewHeight);
    
    // Header
    const title = createSVGText('🏛️ Covenant Contracts', 50, 50, {
        fontSize: theme.typography.titleSize,
        fontWeight: 'bold',
        color: theme.colors.primary
    });
    
    const subtitle = createSVGText(
        'Manage your magical covenant contracts with multi-party signatures',
        50, 80, {
            fontSize: theme.typography.bodySize,
            color: theme.colors.textSecondary
        }
    );
    
    svg.appendChild(title);
    svg.appendChild(subtitle);
    
    // New Contract button
    const newContractBtn = createSVGButton(
        '➕ New Contract', 50, 100, 150, 40,
        () => switchToScreen('create'), {
            fill: theme.colors.secondary
        }
    );
    svg.appendChild(newContractBtn);
    
    // Connect button
    const connectBtn = createSVGButton(
        '🔗 Connect', 220, 100, 120, 40,
        () => switchToScreen('connect'), {
            fill: theme.colors.accent
        }
    );
    svg.appendChild(connectBtn);
    
    // Refresh button
    const refreshBtn = createSVGButton(
        '🔄 Refresh', 360, 100, 120, 40,
        loadContracts, {
            fill: theme.colors.primary
        }
    );
    svg.appendChild(refreshBtn);
    
    // Show My UUID button
    const myUuidBtn = createSVGButton(
        '🆔 Copy My Public Key', 500, 100, 160, 40,
        showMyUUID, {
            fill: theme.colors.accent,
            hoverFill: theme.colors.warning
        }
    );
    svg.appendChild(myUuidBtn);
    
    // Add helper text for UUID management
    const uuidHelper = createSVGText(
        '💡 Click "Copy My Public Key" to copy your public key for sharing with other participants',
        50, 160, {
            fontSize: theme.typography.smallSize,
            color: theme.colors.textSecondary
        }
    );
    svg.appendChild(uuidHelper);
    
    // Loading state
    if (appState.loading) {
        const spinner = createLoadingSpinner(400, 250, 40);
        const loadingText = createSVGText('Loading contracts...', 350, 300, {
            fontSize: theme.typography.bodySize,
            color: theme.colors.textSecondary
        });
        svg.appendChild(spinner);
        svg.appendChild(loadingText);
    }
    
    // Error state
    if (appState.error) {
        const errorText = createSVGText(`❌ Error: ${appState.error}`, 50, 200, {
            fontSize: theme.typography.bodySize,
            color: theme.colors.error
        });
        svg.appendChild(errorText);
    }
    
    // Contracts list
    if (appState.contracts.length === 0 && !appState.loading && !appState.error) {
        const emptyText = createSVGText('📋 No contracts yet. Create your first covenant!', 50, 250, {
            fontSize: theme.typography.bodySize,
            color: theme.colors.textSecondary
        });
        svg.appendChild(emptyText);
    } else {
        appState.contracts.forEach((contract, index) => {
            const card = createContractCard(contract, 170 + (index * 140));
            svg.appendChild(card);
        });
    }
    
    return svg;
}

/**
 * Create contract creation screen
 */
function createContractCreationScreen() {
    // Increase viewHeight to ensure submit button is visible
    const svg = createSVGContainer('100%', 'auto', 900);
    
    // Header
    const title = createSVGText('✨ Create New Covenant', 50, 50, {
        fontSize: theme.typography.titleSize,
        fontWeight: 'bold',
        color: theme.colors.primary
    });
    
    svg.appendChild(title);
    
    // Back button
    const backBtn = createSVGButton(
        '← Back', 50, 70, 80, 30,
        () => switchToScreen('contracts'), {
            fill: theme.colors.textSecondary,
            fontSize: theme.typography.smallSize
        }
    );
    svg.appendChild(backBtn);
    
    // Form instructions
    const instructions = createSVGText(
        'Fill out the form below to create a new magical covenant contract',
        50, 120, {
            fontSize: theme.typography.bodySize,
            color: theme.colors.textSecondary
        }
    );
    svg.appendChild(instructions);
    
    // Add My UUID button on creation screen too
    const myUuidBtnCreate = createSVGButton(
        '🆔 Copy My Public Key', 550, 80, 160, 35,
        async () => {
            await showMyUUID();
            // Auto-insert into participants field if it exists and is empty
            const participantsField = document.querySelector('textarea[placeholder*="participant"]');
            if (participantsField && !participantsField.value.trim() && invoke) {
                try {
                    const [userUuid] = await invoke('get_user_info');
                    participantsField.value = userUuid + '\n';
                    participantsField.dispatchEvent(new Event('input'));
                    console.log('✅ Auto-inserted your UUID into Participants field');
                } catch (error) {
                    console.warn('⚠️ Could not auto-insert UUID:', error);
                }
            }
        }, {
            fill: theme.colors.accent,
            fontSize: theme.typography.smallSize
        }
    );
    svg.appendChild(myUuidBtnCreate);
    
    // Create form widget container - increased height to show submit button
    const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    foreignObject.setAttribute('x', '50');
    foreignObject.setAttribute('y', '150');
    foreignObject.setAttribute('width', '700');
    foreignObject.setAttribute('height', '700');
    
    const formContainer = document.createElement('div');
    formContainer.id = 'covenantFormContainer';
    formContainer.style.width = '100%';
    formContainer.style.height = '100%';
    
    foreignObject.appendChild(formContainer);
    svg.appendChild(foreignObject);
    
    // Load and render form widget
    setTimeout(async () => {
        await loadCovenantForm();
    }, 100);
    
    return svg;
}

/**
 * Load and render the covenant form widget
 */
async function loadCovenantForm() {
    const container = document.getElementById('covenantFormContainer');
    if (!container) {
        console.warn('⚠️ Form container not found');
        return;
    }
    
    // Check if form widget is available
    if (typeof window.getForm !== 'function') {
        console.warn('⚠️ Form widget not loaded, retrying in 500ms...');
        setTimeout(loadCovenantForm, 500);
        return;
    }
    
    // Load form configuration
    const formConfig = await loadCovenantFormConfig();
    if (!formConfig) {
        console.error('❌ Failed to load form configuration');
        return;
    }
    
    console.log('📋 Creating covenant form with config:', formConfig);
    
    // Create form using form widget
    const form = window.getForm(formConfig, handleCovenantFormSubmit);
    
    // Clear container and add form
    container.innerHTML = '';
    container.appendChild(form);
    
    // The form widget creates an SVG submit button at y=730
    // Just log that we expect it to be there
    setTimeout(() => {
        const svgForm = container.querySelector('svg');
        if (svgForm) {
            const submitRect = svgForm.querySelector('#submitButton');
            if (submitRect) {
                console.log('✅ Form has SVG submit button at y=' + submitRect.getAttribute('y'));
                console.log('💡 Tip: Fill all fields to enable the submit button');
            } else {
                console.log('⚠️ No submit button found in SVG form');
            }
        }
    }, 100);
    
    console.log('✅ Covenant form rendered');
}

/**
 * Create connection screen for multi-instance testing
 */
function createConnectionScreen() {
    const svg = createSVGContainer('100%', 'auto', 600);
    
    // Header
    const title = createSVGText('🔗 Multi-Instance Connection', 50, 50, {
        fontSize: theme.typography.titleSize,
        fontWeight: 'bold',
        color: theme.colors.primary
    });
    
    svg.appendChild(title);
    
    // Back button
    const backBtn = createSVGButton(
        '← Back', 50, 70, 80, 30,
        () => switchToScreen('contracts'), {
            fill: theme.colors.textSecondary,
            fontSize: theme.typography.smallSize
        }
    );
    svg.appendChild(backBtn);
    
    // Instructions
    const instructions = createSVGText(
        'Connect multiple covenant app instances for collaborative contract management',
        50, 120, {
            fontSize: theme.typography.bodySize,
            color: theme.colors.textSecondary
        }
    );
    svg.appendChild(instructions);
    
    // Generate URL button
    const generateBtn = createSVGButton(
        '📤 Generate Connection URL', 50, 150, 200, 40,
        generateConnectionURL, {
            fill: theme.colors.secondary
        }
    );
    svg.appendChild(generateBtn);
    
    // Connection form
    const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    foreignObject.setAttribute('x', '50');
    foreignObject.setAttribute('y', '220');
    foreignObject.setAttribute('width', '700');
    foreignObject.setAttribute('height', '300');
    
    const formHtml = `
        <div style="
            background: ${theme.colors.surface};
            padding: 20px;
            border-radius: 8px;
            border: 1px solid ${theme.colors.primary};
            color: ${theme.colors.text};
            font-family: ${theme.typography.fontFamily};
        ">
            <h3 style="color: ${theme.colors.primary}; margin-top: 0;">🔗 Process Connection URL</h3>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; color: ${theme.colors.primary};">
                    Connection URL from another instance:
                </label>
                <input 
                    type="text" 
                    id="connectionUrl" 
                    placeholder="covenant://connect?publicKey=..." 
                    style="
                        width: 100%;
                        padding: 10px;
                        border: 1px solid ${theme.colors.primary};
                        border-radius: 4px;
                        background: ${theme.colors.background};
                        color: ${theme.colors.text};
                        font-family: ${theme.typography.fontFamily};
                    "
                />
            </div>
            
            <button 
                onclick="processConnectionURL()"
                style="
                    padding: 12px 24px;
                    background: ${theme.colors.primary};
                    border: none;
                    border-radius: 6px;
                    color: white;
                    font-family: ${theme.typography.fontFamily};
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 14px;
                "
            >
                🔗 Process URL
            </button>
            
            <div id="connectionStatus" style="margin-top: 10px; font-size: 12px;"></div>
            <div id="generatedUrl" style="margin-top: 10px; font-size: 12px; word-break: break-all;"></div>
        </div>
    `;
    
    foreignObject.innerHTML = formHtml;
    svg.appendChild(foreignObject);
    
    return svg;
}

/**
 * Create contract view screen to display SVG
 */
function createContractViewScreen() {
    const svg = createSVGContainer('100%', '100%', 900);
    
    if (!appState.currentContract) {
        // No contract selected, show error
        const errorText = createSVGText('❌ No contract selected', 50, 300, {
            fontSize: theme.typography.titleSize,
            color: theme.colors.error
        });
        
        const backBtn = createSVGButton(
            '← Back to Contracts', 50, 350, 200, 40,
            () => switchToScreen('contracts'), {
                fill: theme.colors.primary
            }
        );
        
        svg.appendChild(errorText);
        svg.appendChild(backBtn);
        return svg;
    }
    
    // Header with contract info
    const title = createSVGText(`📜 ${appState.currentContract.title}`, 50, 50, {
        fontSize: theme.typography.titleSize,
        fontWeight: 'bold',
        color: theme.colors.primary
    });
    
    const subtitle = createSVGText(
        `UUID: ${appState.currentContract.uuid}`,
        50, 80, {
            fontSize: theme.typography.smallSize,
            color: theme.colors.textSecondary
        }
    );
    
    svg.appendChild(title);
    svg.appendChild(subtitle);
    
    // Back button
    const backBtn = createSVGButton(
        '← Back', 50, 100, 80, 30,
        () => switchToScreen('contracts'), {
            fill: theme.colors.textSecondary,
            fontSize: theme.typography.smallSize
        }
    );
    svg.appendChild(backBtn);
    
    // Loading container for SVG
    const loadingText = createSVGText('⏳ Loading contract visualization...', 50, 200, {
        fontSize: theme.typography.bodySize,
        color: theme.colors.textSecondary
    });
    svg.appendChild(loadingText);
    
    // Load and display the contract SVG
    setTimeout(async () => {
        try {
            if (!invoke) {
                throw new Error('Tauri API not available');
            }
            
            console.log('🎨 Loading SVG for contract:', appState.currentContract.uuid);
            const contractSvg = await invoke('get_contract_svg', {
                contractUuid: appState.currentContract.uuid,
                theme: 'dark'
            });
            
            // Remove loading text
            svg.removeChild(loadingText);
            
            // Create foreignObject to embed the contract SVG with proper centering
            const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
            foreignObject.setAttribute('x', '20');
            foreignObject.setAttribute('y', '140');
            foreignObject.setAttribute('width', '760');
            foreignObject.setAttribute('height', '600');
            
            const svgContainer = document.createElement('div');
            svgContainer.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
                box-sizing: border-box;
                background: rgba(255, 255, 255, 0.02);
                border-radius: 8px;
                border: 1px solid ${theme.colors.primary}40;
            `;
            
            // Parse and fix the SVG directly
            svgContainer.innerHTML = contractSvg;
            
            // Fix SVG dimensions to be responsive
            const embeddedSvg = svgContainer.querySelector('svg');
            if (embeddedSvg) {
                // Remove hardcoded width/height and use viewBox for scaling
                const width = embeddedSvg.getAttribute('width');
                const height = embeddedSvg.getAttribute('height');
                
                if (width && height) {
                    // Set viewBox if not already present
                    if (!embeddedSvg.getAttribute('viewBox')) {
                        embeddedSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
                    }
                }
                
                // Make SVG responsive and properly sized
                embeddedSvg.setAttribute('width', '100%');
                embeddedSvg.setAttribute('height', 'auto');
                embeddedSvg.style.cssText = `
                    max-width: 100%;
                    max-height: 100%;
                    width: auto;
                    height: auto;
                `;
            }
            
            foreignObject.appendChild(svgContainer);
            svg.appendChild(foreignObject);
            
            console.log('✅ Contract SVG loaded successfully');
            
        } catch (error) {
            console.error('❌ Failed to load contract SVG:', error);
            
            // Remove loading text and show error
            if (svg.contains(loadingText)) {
                svg.removeChild(loadingText);
            }
            
            const errorText = createSVGText(`❌ Failed to load contract: ${error}`, 50, 200, {
                fontSize: theme.typography.bodySize,
                color: theme.colors.error
            });
            svg.appendChild(errorText);
        }
    }, 100);
    
    // Add extension-compatible step signing buttons
    addExtensionCovenantButtons(svg);
    
    return svg;
}

/**
 * Add extension-compatible covenant spell buttons for contract steps
 */
function addExtensionCovenantButtons(svg) {
    if (!appState.currentContract || !appState.currentContract.steps) {
        return;
    }
    
    console.log('🔧 Adding extension covenant buttons for contract:', appState.currentContract.uuid);
    
    // Check if The Advancement extension is available
    const hasExtension = typeof window.AdvancementExtension !== 'undefined' || 
                        typeof window.castSpell === 'function';
    
    if (!hasExtension) {
        console.log('ℹ️ The Advancement extension not detected, skipping covenant spell buttons');
        return;
    }
    
    console.log('✅ The Advancement extension detected, adding covenant spell buttons');
    
    // Add header for extension integration section
    const extensionHeader = createSVGText('🚀 The Advancement Extension Integration', 50, 750, {
        fontSize: theme.typography.headerSize,
        fontWeight: 'bold',
        color: theme.colors.secondary
    });
    svg.appendChild(extensionHeader);
    
    const instructionText = createSVGText(
        'Click buttons below to sign contract steps using The Advancement browser extension',
        50, 780, {
            fontSize: theme.typography.bodySize,
            color: theme.colors.textSecondary
        }
    );
    svg.appendChild(instructionText);
    
    // Add covenant spell button for each contract step
    appState.currentContract.steps.forEach((step, index) => {
        const yPos = 820 + (index * 60);
        
        // Step title
        const stepTitle = createSVGText(`Step ${index + 1}: ${step.description}`, 70, yPos, {
            fontSize: theme.typography.bodySize,
            fontWeight: 'bold',
            color: theme.colors.text
        });
        svg.appendChild(stepTitle);
        
        // Check if current user has already signed this step
        const userPubKey = appState.userInfo?.publicKey;
        const hasUserSigned = step.signatures && step.signatures[userPubKey];
        const isStepCompleted = step.completed;
        
        // Step status
        let statusText = '⏳ Awaiting signatures';
        let statusColor = theme.colors.textSecondary;
        
        if (isStepCompleted) {
            statusText = '✅ Completed';
            statusColor = theme.colors.secondary;
        } else if (hasUserSigned) {
            statusText = '✍️ You signed';
            statusColor = theme.colors.accent;
        }
        
        const stepStatus = createSVGText(statusText, 70, yPos + 20, {
            fontSize: theme.typography.smallSize,
            color: statusColor
        });
        svg.appendChild(stepStatus);
        
        // Create covenant spell button (always visible for extension users)
        const buttonText = hasUserSigned ? '🔄 Re-sign Step' : '✍️ Sign Step';
        const buttonColor = hasUserSigned ? theme.colors.accent : theme.colors.primary;
        
        // Create invisible rect for spell casting
        const spellRect = createSVGElement('rect', {
            x: '500',
            y: (yPos - 10).toString(),
            width: '150',
            height: '35',
            rx: '6',
            ry: '6',
            fill: buttonColor,
            stroke: 'none',
            cursor: 'pointer',
            spell: 'covenant',
            'spell-components': JSON.stringify({
                contractUuid: appState.currentContract.uuid,
                stepId: step.id,
                action: 'signStep'
            })
        });
        
        // Button text
        const buttonTextElement = createSVGText(buttonText, 575, yPos + 8, {
            fontSize: theme.typography.bodySize,
            fontWeight: 'bold',
            color: '#ffffff',
            textAnchor: 'middle',
            spell: 'covenant',
            'spell-components': JSON.stringify({
                contractUuid: appState.currentContract.uuid,
                stepId: step.id,
                action: 'signStep'
            })
        });
        
        // Add hover effects
        spellRect.addEventListener('mouseenter', () => {
            spellRect.setAttribute('fill', `${buttonColor}cc`);
        });
        spellRect.addEventListener('mouseleave', () => {
            spellRect.setAttribute('fill', buttonColor);
        });
        
        svg.appendChild(spellRect);
        svg.appendChild(buttonTextElement);
        
        console.log(`🔧 Added covenant spell button for step: ${step.id}`);
    });
    
    // Add listener for covenant step signing events from the extension
    document.addEventListener('covenantStepSigned', (event) => {
        console.log('📜 Received covenant step signed event:', event.detail);
        
        // Refresh the contract view to show updated signatures
        if (event.detail.contractUuid === appState.currentContract.uuid) {
            console.log('🔄 Refreshing contract view after step signing');
            
            // Refresh the current contract data and redisplay
            setTimeout(async () => {
                try {
                    const updatedContract = await invoke('get_contract', {
                        contractUuid: appState.currentContract.uuid
                    });
                    
                    appState.currentContract = updatedContract;
                    switchToScreen('view'); // Refresh the view
                } catch (error) {
                    console.error('❌ Failed to refresh contract after signing:', error);
                }
            }, 1000);
        }
    });
}

/**
 * Switch between screens
 */
function switchToScreen(screenName) {
    appState.currentScreen = screenName;
    renderCurrentScreen();
}

/**
 * Render the current screen
 */
function renderCurrentScreen() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = '';
    
    let screen;
    switch (appState.currentScreen) {
        case 'contracts':
            screen = createContractsScreen();
            break;
        case 'create':
            screen = createContractCreationScreen();
            break;
        case 'connect':
            screen = createConnectionScreen();
            break;
        case 'view':
            screen = createContractViewScreen();
            break;
        default:
            screen = createContractsScreen();
    }
    
    appContainer.appendChild(screen);
}

/**
 * Load contracts from backend
 */
async function loadContracts() {
    if (!invoke) {
        console.warn('⚠️ Tauri invoke not available');
        return;
    }
    
    appState.loading = true;
    appState.error = null;
    renderCurrentScreen();
    
    try {
        const contracts = await invoke('get_contracts');
        appState.contracts = contracts || [];
        console.log(`📋 Loaded ${appState.contracts.length} contracts`);
    } catch (error) {
        console.error('❌ Failed to load contracts:', error);
        appState.error = error.toString();
    } finally {
        appState.loading = false;
        renderCurrentScreen();
    }
}

/**
 * Show user's UUID and public key
 */
async function showMyUUID() {
    if (!invoke) {
        console.error('❌ Invoke function not available. Tauri API status:', {
            tauriAvailable: !!window.__TAURI__,
            invokeFunction: invoke,
            tauriObject: window.__TAURI__
        });
        alert('Tauri API not available. Please ensure the app is running in Tauri environment.');
        return;
    }
    
    try {
        // First get the user info
        const [userUuid, pubKey] = await invoke('get_user_info');
        
        // Then copy public key to clipboard using Tauri command
        try {
            await invoke('copy_user_pubkey_to_clipboard');
            console.log('✅ Public key copied to clipboard via Tauri: ' + appState.userInfo?.publicKey);
        } catch (clipboardError) {
            // Fallback to browser clipboard if Tauri clipboard fails
            console.warn('⚠️ Tauri clipboard failed, trying browser clipboard:', clipboardError);
            if (navigator.clipboard && navigator.clipboard.writeText) {
                try {
                    await navigator.clipboard.writeText(appState.userInfo?.publicKey || '');
                    console.log('✅ Public key copied to clipboard via browser API: ' + appState.userInfo?.publicKey);
                } catch (browserError) {
                    console.error('❌ Browser clipboard also failed:', browserError);
                }
            }
        }
        
        // Create a nice display
        const message = `🔑 Your Covenant User Information\n\n` +
                       `UUID: ${userUuid}\n` +
                       `(Share this with others to be added as a participant)\n\n` +
                       `Public Key: ${pubKey.substring(0, 20)}...${pubKey.substring(pubKey.length - 20)}\n\n` +
                       `💡 UUID has been copied to your clipboard!\n` +
                       `📋 You can paste this directly into the Participants field`;
        
        alert(message);
        
    } catch (error) {
        console.error('❌ Failed to get user info:', error);
        alert(`Failed to get user info: ${error}`);
    }
}

/**
 * Handle covenant form submission from form-widget
 */
async function handleCovenantFormSubmit(formData) {
    if (!invoke) {
        console.error('❌ Tauri API not available');
        showStatusMessage('❌ Tauri API not available', 'error');
        return;
    }
    
    console.log('📝 Form submitted, processing data directly from form widget...');
    console.log('📊 Received form data:', formData);
    
    // Validate that we have form data
    if (!formData || typeof formData !== 'object') {
        console.error('❌ No form data received');
        showStatusMessage('❌ No form data received', 'error');
        return;
    }
    
    // Extract and validate data
    const title = formData['Contract Title'] || '';
    const description = formData['Description'] || '';
    const participantsText = formData['Participants'] || '';
    const stepsText = formData['Contract Steps'] || '';
    
    // Validation
    if (!title.trim() || !description.trim() || !participantsText.trim() || !stepsText.trim()) {
        const errorMsg = '❌ Please fill in all required fields';
        console.error(errorMsg);
        showStatusMessage(errorMsg, 'error');
        return;
    }
    
    // Parse participants and steps from textarea
    const participants = participantsText.split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);
    
    const steps = stepsText.split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    
    if (participants.length === 0 || steps.length === 0) {
        const errorMsg = '❌ Please provide at least one participant and one step';
        console.error(errorMsg);
        showStatusMessage(errorMsg, 'error');
        return;
    }
    
    try {
        console.log('⏳ Creating contract...');
        showStatusMessage('⏳ Creating contract...', 'info');
        
        const result = await invoke('create_contract', {
            title: title.trim(),
            description: description.trim(),
            participants,
            steps
        });
        
        console.log('✅ Contract created successfully!', result);
        showStatusMessage('✅ Contract created successfully!', 'success');
        
        // Switch back to contracts screen and reload
        setTimeout(() => {
            switchToScreen('contracts');
            loadContracts();
        }, 1500);
        
    } catch (error) {
        const errorMsg = '❌ Failed to create contract: ' + error;
        console.error(errorMsg);
        showStatusMessage(errorMsg, 'error');
    }
}

/**
 * Legacy function for backward compatibility (not used with form-widget)
 */
async function handleCreateContract() {
    console.warn('⚠️ Legacy handleCreateContract called - use handleCovenantFormSubmit instead');
}

function updateCreateStatus(message, color) {
    console.log(`Status: ${message}`);
}

/**
 * Generate connection URL
 */
async function generateConnectionURL() {
    if (!invoke) {
        updateConnectionStatus('❌ Tauri API not available', theme.colors.error);
        return;
    }
    
    try {
        updateConnectionStatus('⏳ Generating connection URL...', theme.colors.primary);
        
        const url = await invoke('generate_connection_url');
        
        updateConnectionStatus('✅ Connection URL generated!', theme.colors.success);
        updateGeneratedUrl(`🔗 Share this URL: ${url}`, theme.colors.primary);
        
        // Copy to clipboard if possible
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            updateConnectionStatus('✅ URL copied to clipboard!', theme.colors.success);
        }
        
    } catch (error) {
        console.error('❌ Failed to generate connection URL:', error);
        updateConnectionStatus(`❌ Failed to generate URL: ${error}`, theme.colors.error);
    }
}

/**
 * Process connection URL
 */
async function processConnectionURL() {
    if (!invoke) {
        updateConnectionStatus('❌ Tauri API not available', theme.colors.error);
        return;
    }
    
    const url = document.getElementById('connectionUrl').value.trim();
    
    if (!url) {
        updateConnectionStatus('❌ Please enter a connection URL', theme.colors.error);
        return;
    }
    
    try {
        updateConnectionStatus('⏳ Processing connection URL...', theme.colors.primary);
        
        const result = await invoke('process_connection_url', { connectionUrl: url });
        
        updateConnectionStatus(`✅ ${result}`, theme.colors.success);
        
        // Clear the input
        document.getElementById('connectionUrl').value = '';
        
    } catch (error) {
        console.error('❌ Failed to process connection URL:', error);
        updateConnectionStatus(`❌ ${error}`, theme.colors.error);
    }
}

function updateConnectionStatus(message, color) {
    const statusDiv = document.getElementById('connectionStatus');
    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.style.color = color;
    }
}

function updateGeneratedUrl(message, color) {
    const urlDiv = document.getElementById('generatedUrl');
    if (urlDiv) {
        urlDiv.textContent = message;
        urlDiv.style.color = color;
    }
}

/**
 * Show status message to user
 */
function showStatusMessage(message, type = 'info') {
    console.log('📢 Status:', message, type);
    
    // Create or update status message element
    let statusDiv = document.getElementById('statusMessage');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'statusMessage';
        statusDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 10000;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(statusDiv);
    }
    
    // Set colors based on type
    const colors = {
        success: { bg: 'rgba(76, 175, 80, 0.9)', text: '#ffffff' },
        error: { bg: 'rgba(244, 67, 54, 0.9)', text: '#ffffff' },
        info: { bg: 'rgba(33, 150, 243, 0.9)', text: '#ffffff' },
        warning: { bg: 'rgba(255, 193, 7, 0.9)', text: '#333333' }
    };
    
    const colorScheme = colors[type] || colors.info;
    statusDiv.style.background = colorScheme.bg;
    statusDiv.style.color = colorScheme.text;
    statusDiv.textContent = message;
    statusDiv.style.opacity = '1';
    
    // Auto-hide after 5 seconds for success/info, 8 seconds for errors
    const hideDelay = type === 'error' ? 8000 : 5000;
    setTimeout(() => {
        if (statusDiv) {
            statusDiv.style.opacity = '0';
            setTimeout(() => {
                if (statusDiv && statusDiv.parentNode) {
                    statusDiv.parentNode.removeChild(statusDiv);
                }
            }, 300);
        }
    }, hideDelay);
}

/**
 * Initialize the application
 */
async function initializeApp() {
    // Check if we're in Tauri environment
    if (window.__TAURI__) {
        try {
            // Try different ways to get invoke function based on Tauri version
            if (window.__TAURI__.core && window.__TAURI__.core.invoke) {
                invoke = window.__TAURI__.core.invoke;
            } else if (window.__TAURI__.invoke) {
                invoke = window.__TAURI__.invoke;
            } else if (window.__TAURI__.tauri && window.__TAURI__.tauri.invoke) {
                invoke = window.__TAURI__.tauri.invoke;
            } else if (window.__TAURI__.primitives && window.__TAURI__.primitives.invoke) {
                invoke = window.__TAURI__.primitives.invoke;
            }
            
            if (invoke) {
                console.log('🎯 Tauri environment detected, invoke function found');
                
                // Get environment from Rust backend first
                try {
                    const backendEnv = await invoke('get_environment');
                    console.log(`🌍 Backend environment: ${backendEnv}`);
                    // Set localStorage so environment config functions work correctly
                    localStorage.setItem('nullary-env', backendEnv);
                    console.log(`✅ Set frontend environment to match backend: ${backendEnv}`);
                } catch (error) {
                    console.log(`🌍 Could not get backend environment, using frontend default: ${error}`);
                }
                
                // Load user info
                try {
                    appState.userInfo = await invoke('get_user_info');
                    console.log('👤 User info loaded:', appState.userInfo);
                } catch (error) {
                    console.warn('⚠️ Failed to load user info:', error);
                }
            } else {
                console.error('❌ Could not find invoke function in Tauri API');
                console.log('Available Tauri API structure:', window.__TAURI__);
            }
            
        } catch (error) {
            console.error('❌ Failed to initialize Tauri:', error);
        }
    } else {
        console.warn('⚠️ Not running in Tauri environment');
    }
    
    // Render initial screen
    renderCurrentScreen();
    
    // Load contracts if Tauri is available
    if (invoke) {
        loadContracts();
    }
    
    // Load form widget
    loadFormWidget();
    
    console.log('🎯 Covenant GUI initialized');
    console.log('💡 Environment controls: covenantEnv.switch("test"), covenantEnv.current(), covenantEnv.list()');
}

// Global functions for HTML onclick handlers
window.handleCreateContract = handleCreateContract;
window.processConnectionURL = processConnectionURL;
window.generateConnectionURL = generateConnectionURL;

// Wait for Tauri API to be available
async function waitForTauri(retries = 20) {
    for (let i = 0; i < retries; i++) {
        if (window.__TAURI__) {
            console.log(`✅ Tauri API found after ${i * 100}ms`);
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.warn('⚠️ Tauri API not found after', retries * 100, 'ms');
    return false;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        await waitForTauri();
        initializeApp();
    });
} else {
    waitForTauri().then(() => initializeApp());
}