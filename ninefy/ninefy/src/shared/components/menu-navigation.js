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
            currentStep: 'categories',  // categories -> timeSpans -> product
            selectedCategory: null,
            selectedTimeSpan: null,
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

        // Initialize with categories view
        this.showCategories(navigationState, contentElement);

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
                navigationState.currentStep = 'categories';
                navigationState.selectedCategory = null;
                navigationState.selectedTimeSpan = null;
                navigationState.selectedProduct = null;
                this.showCategories(navigationState, contentElement);
                this.updateNavigationSteps(navigationState, navigationElement);
            },
            getSelectedProduct: () => navigationState.selectedProduct
        };
    },

    /**
     * Parse menu JSON into navigation-friendly structure
     */
    parseMenuStructure(menuData) {
        const structure = {
            categories: new Map(),
            timeSpans: new Set(),
            products: new Map()
        };

        // Create product lookup map
        if (menuData.products) {
            menuData.products.forEach(product => {
                structure.products.set(product.id, product);
            });
        }

        // Parse menu hierarchy
        if (menuData.menus) {
            Object.entries(menuData.menus).forEach(([categoryKey, categoryData]) => {
                const category = {
                    key: categoryKey,
                    title: categoryData.title || categoryKey,
                    timeSpans: new Map(),
                    directProducts: categoryData.products || []
                };

                // Parse submenus (time spans)
                if (categoryData.submenus) {
                    Object.entries(categoryData.submenus).forEach(([timeKey, timeData]) => {
                        structure.timeSpans.add(timeKey);
                        category.timeSpans.set(timeKey, {
                            key: timeKey,
                            title: timeData.title || timeKey,
                            products: timeData.products || []
                        });
                    });
                }

                structure.categories.set(categoryKey, category);
            });
        }

        // Convert timeSpans Set to sorted array
        structure.timeSpansArray = Array.from(structure.timeSpans).sort();

        console.log('🍽️ Parsed menu structure:', structure);
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
        titleBg.setAttribute('rx', `${config.borderRadius} ${config.borderRadius} 0 0`);
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
        
        const steps = [
            { key: 'categories', label: '1. Choose Category', icon: '📋' },
            { key: 'timeSpans', label: '2. Select Duration', icon: '⏰' },
            { key: 'product', label: '3. Confirm Selection', icon: '✅' }
        ];

        steps.forEach((step, index) => {
            const stepGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            const x = 20 + (index * 180);
            const y = 80;

            // Step background
            const isActive = this.isStepActive(step.key, state);
            const isCompleted = this.isStepCompleted(step.key, state);
            
            const stepBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            stepBg.setAttribute('x', x);
            stepBg.setAttribute('y', y);
            stepBg.setAttribute('width', '160');
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
            stepText.setAttribute('font-size', state.config.fontSize - 2);
            stepText.textContent = `${step.icon} ${step.label}`;
            stepGroup.appendChild(stepText);

            navGroup.appendChild(stepGroup);
        });

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
     * Show categories selection
     */
    showCategories(state, contentElement) {
        this.clearContent(contentElement);
        
        const categories = Array.from(state.menuStructure.categories.values());
        const title = this.createSectionTitle('Choose a Category:', 20, 20, state.config);
        contentElement.appendChild(title);

        categories.forEach((category, index) => {
            const categoryCard = this.createCategoryCard(category, index, state);
            contentElement.appendChild(categoryCard);
        });

        this.updateNavigationSteps(state, contentElement.parentNode.querySelector('.navigation-steps'));
        this.updateActionButtons(state, contentElement.parentNode.querySelector('.action-buttons'));
    },

    /**
     * Show time spans for selected category
     */
    showTimeSpans(state, contentElement) {
        this.clearContent(contentElement);
        
        const category = state.menuStructure.categories.get(state.selectedCategory);
        const title = this.createSectionTitle(`Choose Duration for ${category.title}:`, 20, 20, state.config);
        contentElement.appendChild(title);

        const timeSpans = Array.from(category.timeSpans.values());
        timeSpans.forEach((timeSpan, index) => {
            const timeSpanCard = this.createTimeSpanCard(timeSpan, index, state);
            contentElement.appendChild(timeSpanCard);
        });

        this.updateNavigationSteps(state, contentElement.parentNode.querySelector('.navigation-steps'));
        this.updateActionButtons(state, contentElement.parentNode.querySelector('.action-buttons'));
    },

    /**
     * Show final product selection
     */
    showProduct(state, contentElement) {
        this.clearContent(contentElement);
        
        const category = state.menuStructure.categories.get(state.selectedCategory);
        const timeSpan = category.timeSpans.get(state.selectedTimeSpan);
        
        if (timeSpan.products.length > 0) {
            const productId = timeSpan.products[0]; // Take first product
            const product = state.menuStructure.products.get(productId);
            
            if (product) {
                state.selectedProduct = product;
                const productCard = this.createProductCard(product, state);
                contentElement.appendChild(productCard);
                
                // Trigger callback
                if (state.callbacks.onProductSelected) {
                    state.callbacks.onProductSelected(product);
                }
            }
        }

        this.updateNavigationSteps(state, contentElement.parentNode.querySelector('.navigation-steps'));
        this.updateActionButtons(state, contentElement.parentNode.querySelector('.action-buttons'));
    },

    /**
     * Create category selection card
     */
    createCategoryCard(category, index, state) {
        const y = 50 + (index * 70);
        const cardGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        cardGroup.setAttribute('class', 'category-card');
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

        // Category icon and title
        const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        titleText.setAttribute('x', '40');
        titleText.setAttribute('y', y + 25);
        titleText.setAttribute('fill', state.config.colors.text);
        titleText.setAttribute('font-size', state.config.fontSize);
        titleText.setAttribute('font-weight', 'bold');
        titleText.textContent = `👤 ${category.title.charAt(0).toUpperCase() + category.title.slice(1)}`;
        cardGroup.appendChild(titleText);

        // Time spans available
        const timeSpanCount = category.timeSpans.size;
        const subText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        subText.setAttribute('x', '40');
        subText.setAttribute('y', y + 40);
        subText.setAttribute('fill', state.config.colors.text);
        subText.setAttribute('font-size', state.config.fontSize - 2);
        subText.setAttribute('opacity', '0.7');
        subText.textContent = `${timeSpanCount} duration${timeSpanCount !== 1 ? 's' : ''} available`;
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
            state.selectedCategory = category.key;
            state.currentStep = 'timeSpans';
            this.showTimeSpans(state, cardGroup.parentNode);
            
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
        // Re-render navigation steps with current state
        // This would update the visual state of the breadcrumb
    },

    updateActionButtons(state, actionElement) {
        const addToCartButton = actionElement.querySelector('.add-to-cart-button');
        if (addToCartButton) {
            addToCartButton.style.display = state.selectedProduct ? 'block' : 'none';
        }
    },

    goBack(state) {
        if (state.currentStep === 'timeSpans') {
            state.currentStep = 'categories';
            state.selectedCategory = null;
            // Trigger re-render
        } else if (state.currentStep === 'product') {
            state.currentStep = 'timeSpans';
            state.selectedProduct = null;
            // Trigger re-render
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