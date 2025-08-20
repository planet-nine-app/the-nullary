/**
 * Interactive Menu Navigation Component
 * 
 * Creates a beautiful hierarchical menu selection interface for restaurant/transit menus
 * Transforms JSON menu structure into guided product selection UX
 */

const MenuNavigation = {
    /**
     * Create interactive menu navigation from menu catalog JSON
     * @param {Object} menuData - Complete menu catalog JSON with hierarchy
     * @param {Object} config - Configuration options
     * @returns {Object} Menu navigation interface with SVG elements
     */
    createMenuInterface(menuData, config = {}) {
        const finalConfig = {
            width: 600,
            height: 500,
            colors: {
                primary: '#9b59b6',      // Planet Nine purple
                secondary: '#27ae60',    // Success green
                accent: '#e91e63',       // Pink accent
                text: '#2c3e50',         // Dark text
                background: '#ffffff',   // White background
                border: '#bdc3c7',       // Light border
                hover: '#ecf0f1',        // Light hover
                selected: '#3498db'      // Blue selection
            },
            fontSize: 16,
            borderRadius: 8,
            ...config
        };

        // Parse menu structure for navigation
        const menuStructure = this.parseMenuStructure(menuData);
        
        // Create main container
        const container = this.createMenuContainer(finalConfig);
        
        // Create navigation state
        const navigationState = {
            currentLevel: 0,
            selections: {},
            selectedProduct: null,
            menuStructure: menuStructure,
            config: finalConfig,
            callbacks: {
                onProductSelected: null,
                onSelectionChanged: null
            }
        };

        // Create navigation elements
        const titleElement = this.createMenuTitle(menuData, finalConfig);
        const navigationElement = this.createNavigationSteps(navigationState);
        const contentElement = this.createContentArea(navigationState);
        const actionElement = this.createActionButtons(navigationState);

        // Assemble interface
        container.appendChild(titleElement);
        container.appendChild(navigationElement);
        container.appendChild(contentElement);
        container.appendChild(actionElement);

        // Initialize with first menu level
        this.showCurrentLevel(navigationState, contentElement);

        return {
            element: container,
            state: navigationState,
            onProductSelected: (callback) => {
                navigationState.callbacks.onProductSelected = callback;
            },
            onSelectionChanged: (callback) => {
                navigationState.callbacks.onSelectionChanged = callback;
            },
            reset: () => {
                navigationState.currentLevel = 0;
                navigationState.selections = {};
                navigationState.selectedProduct = null;
                this.showCurrentLevel(navigationState, contentElement);
                this.updateNavigationSteps(navigationState, navigationElement);
            },
            getSelectedProduct: () => navigationState.selectedProduct
        };
    },

    /**
     * Parse menu JSON into navigation-friendly structure for hierarchical menus
     */
    parseMenuStructure(menuData) {
        const structure = {
            menuLevels: [], // Ordered list of menu levels
            currentLevel: 0,
            selections: {},
            products: new Map()
        };

        // Create product lookup map
        if (menuData.products) {
            menuData.products.forEach(product => {
                structure.products.set(product.id, product);
            });
        }

        // Parse hierarchical menu structure
        if (menuData.menus) {
            // Find the menu levels and their order
            const menuLevels = Object.keys(menuData.menus);
            structure.menuLevels = menuLevels.map(levelName => ({
                name: levelName,
                options: Object.keys(menuData.menus[levelName]),
                menuData: menuData.menus[levelName]
            }));

            console.log('🍽️ Found menu levels:', structure.menuLevels.map(l => l.name));
        }

        console.log('🍽️ Parsed hierarchical menu structure:', structure);
        return structure;
    },

    /**
     * Create main menu container
     */
    createMenuContainer(config) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', config.width);
        svg.setAttribute('height', config.height);
        svg.setAttribute('viewBox', `0 0 ${config.width} ${config.height}`);
        svg.style.backgroundColor = config.colors.background;
        svg.style.border = `1px solid ${config.colors.border}`;
        svg.style.borderRadius = `${config.borderRadius}px`;

        // Add background
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        background.setAttribute('width', '100%');
        background.setAttribute('height', '100%');
        background.setAttribute('fill', config.colors.background);
        background.setAttribute('rx', config.borderRadius);
        svg.appendChild(background);

        return svg;
    },

    /**
     * Create menu title section
     */
    createMenuTitle(menuData, config) {
        const titleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Title background
        const titleBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        titleBg.setAttribute('x', '0');
        titleBg.setAttribute('y', '0');
        titleBg.setAttribute('width', '100%');
        titleBg.setAttribute('height', '60');
        titleBg.setAttribute('fill', config.colors.primary);
        titleBg.setAttribute('rx', config.borderRadius);
        titleGroup.appendChild(titleBg);

        // Title text
        const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        titleText.setAttribute('x', '20');
        titleText.setAttribute('y', '35');
        titleText.setAttribute('fill', 'white');
        titleText.setAttribute('font-size', config.fontSize + 4);
        titleText.setAttribute('font-weight', 'bold');
        titleText.textContent = `🍽️ ${menuData.title || 'Menu'}`;
        titleGroup.appendChild(titleText);

        // Description if available
        if (menuData.description) {
            const descText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            descText.setAttribute('x', '20');
            descText.setAttribute('y', '52');
            descText.setAttribute('fill', 'white');
            descText.setAttribute('font-size', config.fontSize - 2);
            descText.setAttribute('opacity', '0.9');
            descText.textContent = menuData.description;
            titleGroup.appendChild(descText);
        }

        return titleGroup;
    },

    /**
     * Create navigation breadcrumb steps
     */
    createNavigationSteps(state) {
        const navGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        navGroup.setAttribute('class', 'navigation-steps');
        
        const maxSteps = state.menuStructure.menuLevels.length + 1; // +1 for product selection
        const stepWidth = Math.min(180, (state.config.width - 40) / maxSteps);

        state.menuStructure.menuLevels.forEach((level, index) => {
            const stepGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            const x = 20 + (index * stepWidth);
            const y = 80;

            // Step background
            const isActive = state.currentLevel === index;
            const isCompleted = state.currentLevel > index;
            
            const stepBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            stepBg.setAttribute('x', x);
            stepBg.setAttribute('y', y);
            stepBg.setAttribute('width', stepWidth - 10);
            stepBg.setAttribute('height', '30');
            stepBg.setAttribute('rx', '4');
            stepBg.setAttribute('fill', isCompleted ? state.config.colors.secondary : 
                                     isActive ? state.config.colors.selected : 
                                     state.config.colors.hover);
            stepGroup.appendChild(stepBg);

            // Step text
            const stepText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            stepText.setAttribute('x', x + 10);
            stepText.setAttribute('y', y + 20);
            stepText.setAttribute('fill', isCompleted || isActive ? 'white' : state.config.colors.text);
            stepText.setAttribute('font-size', Math.min(state.config.fontSize - 2, 12));
            stepText.textContent = `${index + 1}. ${level.name}`;
            stepGroup.appendChild(stepText);

            navGroup.appendChild(stepGroup);
        });

        // Add final product step
        const finalIndex = state.menuStructure.menuLevels.length;
        const finalStepGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const finalX = 20 + (finalIndex * stepWidth);
        const finalY = 80;

        const finalBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        finalBg.setAttribute('x', finalX);
        finalBg.setAttribute('y', finalY);
        finalBg.setAttribute('width', stepWidth - 10);
        finalBg.setAttribute('height', '30');
        finalBg.setAttribute('rx', '4');
        finalBg.setAttribute('fill', state.selectedProduct ? state.config.colors.secondary : 
                                   state.currentLevel === finalIndex ? state.config.colors.selected : 
                                   state.config.colors.hover);
        finalStepGroup.appendChild(finalBg);

        const finalText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        finalText.setAttribute('x', finalX + 10);
        finalText.setAttribute('y', finalY + 20);
        finalText.setAttribute('fill', state.selectedProduct || state.currentLevel === finalIndex ? 'white' : state.config.colors.text);
        finalText.setAttribute('font-size', Math.min(state.config.fontSize - 2, 12));
        finalText.textContent = `${finalIndex + 1}. Product`;
        finalStepGroup.appendChild(finalText);

        navGroup.appendChild(finalStepGroup);

        return navGroup;
    },

    /**
     * Create main content area for menu selections
     */
    createContentArea(state) {
        const contentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        contentGroup.setAttribute('class', 'menu-content');
        contentGroup.setAttribute('transform', 'translate(0, 130)');
        return contentGroup;
    },

    /**
     * Create action buttons (back, next, add to cart)
     */
    createActionButtons(state) {
        const actionGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        actionGroup.setAttribute('class', 'action-buttons');
        actionGroup.setAttribute('transform', `translate(0, ${state.config.height - 60})`);

        // Back button
        const backButton = this.createButton({
            x: 20, y: 10, width: 100, height: 35,
            text: '← Back', 
            color: state.config.colors.border,
            textColor: state.config.colors.text,
            onClick: () => this.goBack(state)
        });
        actionGroup.appendChild(backButton);

        // Add to Cart button (shown when product is selected)
        const addToCartButton = this.createButton({
            x: state.config.width - 140, y: 10, width: 120, height: 35,
            text: '🛒 Add to Cart',
            color: state.config.colors.secondary,
            textColor: 'white',
            onClick: () => this.addToCart(state)
        });
        addToCartButton.style.display = 'none';
        addToCartButton.setAttribute('class', 'add-to-cart-button');
        actionGroup.appendChild(addToCartButton);

        return actionGroup;
    },

    /**
     * Show current menu level
     */
    showCurrentLevel(state, contentElement) {
        this.clearContent(contentElement);
        
        const currentLevel = state.menuStructure.menuLevels[state.currentLevel];
        
        if (!currentLevel) {
            // We're at the product level
            this.showProduct(state, contentElement);
            return;
        }

        const title = this.createSectionTitle(`Choose ${currentLevel.name}:`, 20, 20, state.config);
        contentElement.appendChild(title);

        currentLevel.options.forEach((option, index) => {
            const optionCard = this.createOptionCard(currentLevel.name, option, index, state);
            contentElement.appendChild(optionCard);
        });

        this.updateNavigationSteps(state, contentElement.parentNode.querySelector('.navigation-steps'));
        this.updateActionButtons(state, contentElement.parentNode.querySelector('.action-buttons'));
    },

    /**
     * Show final product selection
     */
    showProduct(state, contentElement) {
        this.clearContent(contentElement);
        
        // Find the product that matches our selections
        const product = this.findMatchingProduct(state);
        
        if (product) {
            state.selectedProduct = product;
            const productCard = this.createProductCard(product, state);
            contentElement.appendChild(productCard);
            
            // Trigger callback
            if (state.callbacks.onProductSelected) {
                state.callbacks.onProductSelected(product);
            }
        } else {
            // No matching product found
            const noProductMessage = this.createSectionTitle('No product found for these selections', 20, 50, state.config);
            noProductMessage.setAttribute('fill', state.config.colors.accent);
            contentElement.appendChild(noProductMessage);
        }

        this.updateNavigationSteps(state, contentElement.parentNode.querySelector('.navigation-steps'));
        this.updateActionButtons(state, contentElement.parentNode.querySelector('.action-buttons'));
    },

    /**
     * Find a product that matches the current selections
     * Supports "any" wildcard token for flexible matching
     */
    findMatchingProduct(state) {
        // Build ordered selections array based on menu level order
        const orderedSelections = [];
        for (const level of state.menuStructure.menuLevels) {
            const selection = state.selections[level.name];
            if (selection) {
                orderedSelections.push(selection);
            }
        }
        
        console.log('🔍 Looking for product matching ordered selections:', orderedSelections);
        console.log('📊 User selections object:', state.selections);
        console.log('🗂️ Menu levels order:', state.menuStructure.menuLevels.map(l => l.name));
        
        // Look for a product whose selections match our menu choices
        for (const [productId, product] of state.menuStructure.products) {
            if (product.metadata && product.metadata.selections) {
                const productSelections = product.metadata.selections;
                
                console.log(`🍽️ Checking product "${product.name}" with selections:`, productSelections);
                console.log(`   User ordered: [${orderedSelections.join(', ')}]`);
                console.log(`   Product pattern: [${productSelections.join(', ')}]`);
                
                // Check if selections match, considering "any" wildcards
                if (this.selectionsMatch(orderedSelections, productSelections)) {
                    console.log('✅ Found matching product:', product.name);
                    return product;
                }
            }
        }
        
        console.log('❌ No matching product found for ordered selections:', orderedSelections);
        
        // Debug: Let's also check what products are actually available
        console.log('🔍 Debug - All products in structure:');
        for (const [productId, product] of state.menuStructure.products) {
            console.log(`   - ${product.name} (${productId}):`, product.metadata?.selections || 'no selections');
        }
        
        return null;
    },

    /**
     * Check if user selections match product selections, considering "any" wildcards
     * @param {Array} userSelections - User's menu choices
     * @param {Array} productSelections - Product's selection pattern (may include "any")
     * @returns {boolean} True if selections match
     */
    selectionsMatch(userSelections, productSelections) {
        // Must have same number of selections
        if (userSelections.length !== productSelections.length) {
            return false;
        }

        // Check each position
        for (let i = 0; i < userSelections.length; i++) {
            const userSelection = userSelections[i];
            const productSelection = productSelections[i];

            // "any" wildcard matches anything
            if (productSelection === 'any') {
                continue;
            }

            // Exact match required for non-wildcard selections
            if (userSelection !== productSelection) {
                return false;
            }
        }

        return true;
    },

    /**
     * Create option selection card for any menu level
     */
    createOptionCard(menuName, option, index, state) {
        const y = 50 + (index * 70);
        const cardGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        cardGroup.setAttribute('class', 'option-card');
        cardGroup.style.cursor = 'pointer';

        // Card background
        const cardBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        cardBg.setAttribute('x', '20');
        cardBg.setAttribute('y', y);
        cardBg.setAttribute('width', state.config.width - 40);
        cardBg.setAttribute('height', '50');
        cardBg.setAttribute('rx', '6');
        cardBg.setAttribute('fill', state.config.colors.background);
        cardBg.setAttribute('stroke', state.config.colors.border);
        cardBg.setAttribute('stroke-width', '1');
        cardGroup.appendChild(cardBg);

        // Option icon and title
        const icon = this.getMenuIcon(menuName);
        const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        titleText.setAttribute('x', '40');
        titleText.setAttribute('y', y + 25);
        titleText.setAttribute('fill', state.config.colors.text);
        titleText.setAttribute('font-size', state.config.fontSize);
        titleText.setAttribute('font-weight', 'bold');
        titleText.textContent = `${icon} ${option.charAt(0).toUpperCase() + option.slice(1)}`;
        cardGroup.appendChild(titleText);

        // Submenu info
        const currentLevel = state.menuStructure.menuLevels[state.currentLevel];
        const optionData = currentLevel.menuData[option];
        const nextMenu = optionData?.subMenu;
        
        const subText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        subText.setAttribute('x', '40');
        subText.setAttribute('y', y + 40);
        subText.setAttribute('fill', state.config.colors.text);
        subText.setAttribute('font-size', state.config.fontSize - 2);
        subText.setAttribute('opacity', '0.7');
        subText.textContent = nextMenu === 'product' ? 'View product' : `Next: ${nextMenu}`;
        cardGroup.appendChild(subText);

        // Arrow indicator
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        arrow.setAttribute('x', state.config.width - 50);
        arrow.setAttribute('y', y + 30);
        arrow.setAttribute('fill', state.config.colors.primary);
        arrow.setAttribute('font-size', '20');
        arrow.textContent = '→';
        cardGroup.appendChild(arrow);

        // Click handler
        cardGroup.addEventListener('click', () => {
            // Record the selection
            state.selections[menuName] = option;
            
            // Move to next level or show product
            if (nextMenu === 'product') {
                // We're at the final selection, show product
                state.currentLevel = state.menuStructure.menuLevels.length; // Beyond last level
                this.showProduct(state, cardGroup.parentNode);
            } else {
                // Move to next menu level
                state.currentLevel++;
                this.showCurrentLevel(state, cardGroup.parentNode);
            }
            
            if (state.callbacks.onSelectionChanged) {
                state.callbacks.onSelectionChanged(state);
            }
        });

        // Hover effects
        cardGroup.addEventListener('mouseenter', () => {
            cardBg.setAttribute('fill', state.config.colors.hover);
            cardBg.setAttribute('stroke', state.config.colors.primary);
        });

        cardGroup.addEventListener('mouseleave', () => {
            cardBg.setAttribute('fill', state.config.colors.background);
            cardBg.setAttribute('stroke', state.config.colors.border);
        });

        return cardGroup;
    },

    /**
     * Get appropriate icon for menu type
     */
    getMenuIcon(menuName) {
        const icons = {
            'rider': '👤',
            'time span': '⏰',
            'type': '📋',
            'category': '📂',
            'size': '📏',
            'color': '🎨'
        };
        return icons[menuName.toLowerCase()] || '📋';
    },

    /**
     * Create time span selection card
     */
    createTimeSpanCard(timeSpan, index, state) {
        const y = 50 + (index * 70);
        const cardGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        cardGroup.setAttribute('class', 'timespan-card');
        cardGroup.style.cursor = 'pointer';

        // Card background
        const cardBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        cardBg.setAttribute('x', '20');
        cardBg.setAttribute('y', y);
        cardBg.setAttribute('width', state.config.width - 40);
        cardBg.setAttribute('height', '50');
        cardBg.setAttribute('rx', '6');
        cardBg.setAttribute('fill', state.config.colors.background);
        cardBg.setAttribute('stroke', state.config.colors.border);
        cardBg.setAttribute('stroke-width', '1');
        cardGroup.appendChild(cardBg);

        // Time span title
        const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        titleText.setAttribute('x', '40');
        titleText.setAttribute('y', y + 25);
        titleText.setAttribute('fill', state.config.colors.text);
        titleText.setAttribute('font-size', state.config.fontSize);
        titleText.setAttribute('font-weight', 'bold');
        titleText.textContent = `⏰ ${timeSpan.title.charAt(0).toUpperCase() + timeSpan.title.slice(1)}`;
        cardGroup.appendChild(titleText);

        // Products available
        const productCount = timeSpan.products.length;
        const subText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        subText.setAttribute('x', '40');
        subText.setAttribute('y', y + 40);
        subText.setAttribute('fill', state.config.colors.text);
        subText.setAttribute('font-size', state.config.fontSize - 2);
        subText.setAttribute('opacity', '0.7');
        subText.textContent = `${productCount} option${productCount !== 1 ? 's' : ''} available`;
        cardGroup.appendChild(subText);

        // Arrow indicator
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        arrow.setAttribute('x', state.config.width - 50);
        arrow.setAttribute('y', y + 30);
        arrow.setAttribute('fill', state.config.colors.primary);
        arrow.setAttribute('font-size', '20');
        arrow.textContent = '→';
        cardGroup.appendChild(arrow);

        // Click handler
        cardGroup.addEventListener('click', () => {
            state.selectedTimeSpan = timeSpan.key;
            state.currentStep = 'product';
            this.showProduct(state, cardGroup.parentNode);
            
            if (state.callbacks.onSelectionChanged) {
                state.callbacks.onSelectionChanged(state);
            }
        });

        // Hover effects
        cardGroup.addEventListener('mouseenter', () => {
            cardBg.setAttribute('fill', state.config.colors.hover);
            cardBg.setAttribute('stroke', state.config.colors.primary);
        });

        cardGroup.addEventListener('mouseleave', () => {
            cardBg.setAttribute('fill', state.config.colors.background);
            cardBg.setAttribute('stroke', state.config.colors.border);
        });

        return cardGroup;
    },

    /**
     * Create final product confirmation card
     */
    createProductCard(product, state) {
        const cardGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        cardGroup.setAttribute('class', 'product-card');

        // Card background
        const cardBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        cardBg.setAttribute('x', '20');
        cardBg.setAttribute('y', '50');
        cardBg.setAttribute('width', state.config.width - 40);
        cardBg.setAttribute('height', '180');
        cardBg.setAttribute('rx', '8');
        cardBg.setAttribute('fill', state.config.colors.background);
        cardBg.setAttribute('stroke', state.config.colors.secondary);
        cardBg.setAttribute('stroke-width', '2');
        cardGroup.appendChild(cardBg);

        // Success icon
        const successIcon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        successIcon.setAttribute('x', '40');
        successIcon.setAttribute('y', '85');
        successIcon.setAttribute('fill', state.config.colors.secondary);
        successIcon.setAttribute('font-size', '32');
        successIcon.textContent = '✅';
        cardGroup.appendChild(successIcon);

        // Product title
        const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        titleText.setAttribute('x', '90');
        titleText.setAttribute('y', '85');
        titleText.setAttribute('fill', state.config.colors.text);
        titleText.setAttribute('font-size', state.config.fontSize + 2);
        titleText.setAttribute('font-weight', 'bold');
        titleText.textContent = product.name;
        cardGroup.appendChild(titleText);

        // Product details
        const categoryText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        categoryText.setAttribute('x', '40');
        categoryText.setAttribute('y', '115');
        categoryText.setAttribute('fill', state.config.colors.text);
        categoryText.setAttribute('font-size', state.config.fontSize - 1);
        categoryText.textContent = `Category: ${state.selectedCategory} • Duration: ${state.selectedTimeSpan}`;
        cardGroup.appendChild(categoryText);

        // Price (if available)
        if (product.price !== undefined) {
            const priceText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            priceText.setAttribute('x', '40');
            priceText.setAttribute('y', '140');
            priceText.setAttribute('fill', state.config.colors.text);
            priceText.setAttribute('font-size', state.config.fontSize);
            priceText.setAttribute('font-weight', 'bold');
            priceText.textContent = `Price: $${(product.price / 100).toFixed(2)}`;
            cardGroup.appendChild(priceText);
        }

        // Product ID for reference
        const idText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        idText.setAttribute('x', '40');
        idText.setAttribute('y', '165');
        idText.setAttribute('fill', state.config.colors.text);
        idText.setAttribute('font-size', state.config.fontSize - 3);
        idText.setAttribute('opacity', '0.6');
        idText.textContent = `ID: ${product.id}`;
        cardGroup.appendChild(idText);

        // Ready to add message
        const readyText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        readyText.setAttribute('x', '40');
        readyText.setAttribute('y', '200');
        readyText.setAttribute('fill', state.config.colors.secondary);
        readyText.setAttribute('font-size', state.config.fontSize - 1);
        readyText.setAttribute('font-weight', 'bold');
        readyText.textContent = '🛒 Ready to add to cart!';
        cardGroup.appendChild(readyText);

        return cardGroup;
    },

    /**
     * Utility functions
     */
    createSectionTitle(text, x, y, config) {
        const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        titleText.setAttribute('x', x);
        titleText.setAttribute('y', y);
        titleText.setAttribute('fill', config.colors.text);
        titleText.setAttribute('font-size', config.fontSize + 2);
        titleText.setAttribute('font-weight', 'bold');
        titleText.textContent = text;
        return titleText;
    },

    createButton(options) {
        const buttonGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        buttonGroup.style.cursor = 'pointer';

        const buttonBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        buttonBg.setAttribute('x', options.x);
        buttonBg.setAttribute('y', options.y);
        buttonBg.setAttribute('width', options.width);
        buttonBg.setAttribute('height', options.height);
        buttonBg.setAttribute('rx', '4');
        buttonBg.setAttribute('fill', options.color);
        buttonGroup.appendChild(buttonBg);

        const buttonText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        buttonText.setAttribute('x', options.x + options.width / 2);
        buttonText.setAttribute('y', options.y + options.height / 2 + 4);
        buttonText.setAttribute('text-anchor', 'middle');
        buttonText.setAttribute('fill', options.textColor);
        buttonText.setAttribute('font-size', '14');
        buttonText.setAttribute('font-weight', 'bold');
        buttonText.textContent = options.text;
        buttonGroup.appendChild(buttonText);

        if (options.onClick) {
            buttonGroup.addEventListener('click', options.onClick);
        }

        return buttonGroup;
    },

    clearContent(contentElement) {
        while (contentElement.firstChild) {
            contentElement.removeChild(contentElement.firstChild);
        }
    },

    isStepActive(stepKey, state) {
        return state.currentStep === stepKey;
    },

    isStepCompleted(stepKey, state) {
        const steps = ['categories', 'timeSpans', 'product'];
        const currentIndex = steps.indexOf(state.currentStep);
        const stepIndex = steps.indexOf(stepKey);
        return stepIndex < currentIndex;
    },

    updateNavigationSteps(state, navigationElement) {
        // Clear existing navigation steps
        while (navigationElement.firstChild) {
            navigationElement.removeChild(navigationElement.firstChild);
        }
        
        // Re-create navigation steps with current state
        const newSteps = this.createNavigationSteps(state);
        
        // Copy all child elements from the new steps to the existing element
        while (newSteps.firstChild) {
            navigationElement.appendChild(newSteps.firstChild);
        }
    },

    updateActionButtons(state, actionElement) {
        const addToCartButton = actionElement.querySelector('.add-to-cart-button');
        if (addToCartButton) {
            addToCartButton.style.display = state.selectedProduct ? 'block' : 'none';
        }
    },

    goBack(state) {
        if (state.currentLevel > 0) {
            // Go back one level
            state.currentLevel--;
            
            // Remove the last selection
            const currentLevelName = state.menuStructure.menuLevels[state.currentLevel]?.name;
            if (currentLevelName && state.selections[currentLevelName]) {
                delete state.selections[currentLevelName];
            }
            
            // Clear selected product
            state.selectedProduct = null;
            
            // Re-render current level
            const contentElement = document.querySelector('.menu-content');
            if (contentElement) {
                this.showCurrentLevel(state, contentElement);
            }
        }
    },

    addToCart(state) {
        if (state.selectedProduct && state.callbacks.onProductSelected) {
            state.callbacks.onProductSelected(state.selectedProduct);
        }
    }
};

// Export for global use
if (typeof window !== 'undefined') {
    window.MenuNavigation = MenuNavigation;
}

console.log('🍽️ Menu Navigation component loaded');