/**
 * Menu Display Components for Ninefy
 * 
 * Creates visual menu catalog cards and detailed menu displays
 * Compatible with ninefy's non-module architecture
 */

const MenuDisplay = {
    /**
     * Create a menu catalog card that matches ninefy's product card style
     * @param {Object} menuCatalog - Menu catalog data
     * @param {Object} config - Configuration options
     * @returns {HTMLElement} Menu catalog card element
     */
    createMenuCatalogCard(menuCatalog, config = {}) {
        const {
            onClick = null,
            showItemCount = true,
            theme = null
        } = config;

        const cardContainer = document.createElement('div');
        cardContainer.className = 'product-card menu-catalog-card';
        cardContainer.dataset.menuId = menuCatalog.id || menuCatalog.uuid;

        const currentTheme = theme || (window.appState && window.appState.currentTheme);
        
        cardContainer.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 0;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            cursor: pointer;
            transition: all 0.2s ease;
            overflow: hidden;
            min-height: 400px;
            display: flex;
            flex-direction: column;
            border: 3px solid #27ae60;
        `;

        // Menu icon "image" area
        const iconContainer = document.createElement('div');
        iconContainer.style.cssText = `
            width: 100%;
            height: 200px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 4rem;
            color: #27ae60;
        `;
        iconContainer.innerHTML = '🍽️';
        cardContainer.appendChild(iconContainer);

        // Card content
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
            padding: 20px;
            flex: 1;
            display: flex;
            flex-direction: column;
        `;

        // Menu metadata header
        const metaHeader = document.createElement('div');
        metaHeader.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            font-size: 12px;
            color: ${currentTheme?.colors?.secondary || '#27ae60'};
        `;

        const categoryAuthor = document.createElement('span');
        const itemCount = menuCatalog.metadata?.totalProducts || menuCatalog.products?.length || 0;
        const menuCount = menuCatalog.metadata?.menuCount || Object.keys(menuCatalog.menus || {}).length;
        categoryAuthor.textContent = `🍽️ Menu • ${itemCount} items • ${menuCount} categories`;

        const menuBadge = document.createElement('span');
        menuBadge.textContent = 'MENU CATALOG';
        menuBadge.style.cssText = `
            background: #27ae60;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        `;

        metaHeader.appendChild(categoryAuthor);
        metaHeader.appendChild(menuBadge);

        // Title
        const titleElement = document.createElement('h3');
        titleElement.textContent = menuCatalog.title;
        titleElement.style.cssText = `
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 600;
            color: ${currentTheme?.colors?.text || '#2c3e50'};
            line-height: 1.3;
        `;

        // Description
        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = menuCatalog.description || 'Complete restaurant menu catalog';
        descriptionElement.style.cssText = `
            margin: 0 0 16px 0;
            font-size: 14px;
            color: ${currentTheme?.colors?.textSecondary || '#6c757d'};
            line-height: 1.4;
            flex: 1;
        `;

        // Menu stats
        const statsContainer = document.createElement('div');
        statsContainer.style.cssText = `
            display: flex;
            gap: 12px;
            margin-bottom: 12px;
            font-size: 12px;
            color: ${currentTheme?.colors?.textSecondary || '#6c757d'};
        `;

        if (menuCatalog.products && menuCatalog.products.length > 0) {
            const priceRange = this.calculatePriceRange(menuCatalog.products);
            const priceElement = document.createElement('span');
            priceElement.textContent = priceRange;
            priceElement.style.cssText = `
                font-weight: bold;
                color: ${currentTheme?.colors?.accent || '#e74c3c'};
            `;
            statsContainer.appendChild(priceElement);
        }

        contentContainer.appendChild(metaHeader);
        contentContainer.appendChild(titleElement);
        contentContainer.appendChild(descriptionElement);
        contentContainer.appendChild(statsContainer);

        cardContainer.appendChild(contentContainer);

        // Add click handler
        if (onClick) {
            cardContainer.addEventListener('click', () => onClick(menuCatalog));
        }

        // Add hover effects
        cardContainer.addEventListener('mouseenter', () => {
            cardContainer.style.transform = 'translateY(-4px)';
            cardContainer.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        });

        cardContainer.addEventListener('mouseleave', () => {
            cardContainer.style.transform = 'translateY(0)';
            cardContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        });

        return cardContainer;
    },

    /**
     * Calculate price range for menu items
     * @param {Array} products - Array of menu products
     * @returns {string} Price range string
     */
    calculatePriceRange(products) {
        if (!products || products.length === 0) return 'Price varies';
        
        const prices = products.map(p => p.price || 0).filter(p => p > 0);
        if (prices.length === 0) return 'Price varies';
        
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        
        if (min === max) {
            return this.formatPrice(min);
        } else {
            return `${this.formatPrice(min)} - ${this.formatPrice(max)}`;
        }
    },

    /**
     * Format price from cents to dollars
     * @param {number} priceInCents - Price in cents
     * @returns {string} Formatted price
     */
    formatPrice(priceInCents) {
        if (typeof priceInCents !== 'number' || priceInCents < 0) return '$0.00';
        return `$${(priceInCents / 100).toFixed(2)}`;
    },

    /**
     * Create a detailed menu structure display for details view
     * @param {Object} menuCatalog - Menu catalog data
     * @param {Object} config - Configuration options
     * @returns {HTMLElement} Menu structure display element
     */
    createMenuStructureDisplay(menuCatalog, config = {}) {
        const {
            showPrices = true,
            onItemClick = null,
            theme = null
        } = config;

        const container = document.createElement('div');
        container.className = 'menu-structure-display';
        container.style.cssText = `
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
        `;

        const currentTheme = theme || (window.appState && window.appState.currentTheme);

        // Header
        const header = document.createElement('div');
        header.className = 'menu-header';
        header.style.cssText = `
            text-align: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid ${currentTheme?.colors?.primary || '#9b59b6'};
        `;

        const title = document.createElement('h2');
        title.textContent = menuCatalog.title;
        title.style.cssText = `
            color: ${currentTheme?.colors?.primary || '#9b59b6'};
            margin: 0 0 0.5rem 0;
            font-size: 2rem;
        `;

        const description = document.createElement('p');
        description.textContent = menuCatalog.description || '';
        description.style.cssText = `
            color: ${currentTheme?.colors?.textSecondary || '#6c757d'};
            margin: 0;
            font-size: 1.1rem;
        `;

        header.appendChild(title);
        header.appendChild(description);
        container.appendChild(header);

        // Menu sections
        if (menuCatalog.menus) {
            Object.entries(menuCatalog.menus).forEach(([menuKey, menu]) => {
                const section = this.createMenuSection(menu, menuCatalog.products, showPrices, onItemClick, currentTheme);
                container.appendChild(section);
            });
        }

        return container;
    },

    /**
     * Create a menu section
     * @param {Object} menu - Menu section data
     * @param {Array} allProducts - All menu products
     * @param {boolean} showPrices - Whether to show prices
     * @param {Function} onItemClick - Click handler for items
     * @param {Object} theme - Theme configuration
     * @returns {HTMLElement} Menu section element
     */
    createMenuSection(menu, allProducts, showPrices, onItemClick, theme) {
        const section = document.createElement('div');
        section.className = 'menu-section';
        section.style.cssText = `
            margin-bottom: 2rem;
        `;

        // Section title
        const title = document.createElement('h3');
        title.textContent = menu.title;
        title.style.cssText = `
            color: ${theme?.colors?.primary || '#9b59b6'};
            border-bottom: 2px solid ${theme?.colors?.primary || '#9b59b6'};
            padding-bottom: 0.5rem;
            margin-bottom: 1rem;
            font-size: 1.5rem;
        `;
        section.appendChild(title);

        // Direct products in this menu
        if (menu.products && menu.products.length > 0) {
            menu.products.forEach(productId => {
                const product = allProducts?.find(p => p.id === productId);
                if (product) {
                    const item = this.createMenuItem(product, showPrices, onItemClick, theme);
                    section.appendChild(item);
                }
            });
        }

        // Submenus
        if (menu.submenus) {
            Object.entries(menu.submenus).forEach(([submenuKey, submenu]) => {
                const subsection = document.createElement('div');
                subsection.className = 'menu-subsection';
                subsection.style.cssText = `
                    margin-left: 1rem;
                    margin-bottom: 1.5rem;
                `;

                const subtitle = document.createElement('h4');
                subtitle.textContent = submenu.title;
                subtitle.style.cssText = `
                    color: ${theme?.colors?.secondary || '#27ae60'};
                    margin-bottom: 0.75rem;
                    font-size: 1.2rem;
                `;
                subsection.appendChild(subtitle);

                if (submenu.products && submenu.products.length > 0) {
                    submenu.products.forEach(productId => {
                        const product = allProducts?.find(p => p.id === productId);
                        if (product) {
                            const item = this.createMenuItem(product, showPrices, onItemClick, theme);
                            subsection.appendChild(item);
                        }
                    });
                }

                section.appendChild(subsection);
            });
        }

        return section;
    },

    /**
     * Create a menu item
     * @param {Object} product - Product data
     * @param {boolean} showPrice - Whether to show price
     * @param {Function} onItemClick - Click handler
     * @param {Object} theme - Theme configuration
     * @returns {HTMLElement} Menu item element
     */
    createMenuItem(product, showPrice, onItemClick, theme) {
        const item = document.createElement('div');
        item.className = 'menu-item';
        item.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 0.75rem 0;
            border-bottom: 1px solid #eee;
            transition: background-color 0.2s ease;
            ${onItemClick ? 'cursor: pointer;' : ''}
        `;

        const info = document.createElement('div');
        info.className = 'menu-item-info';
        info.style.cssText = `
            flex: 1;
        `;

        const name = document.createElement('div');
        name.className = 'menu-item-name';
        name.textContent = product.name || product.title;
        name.style.cssText = `
            font-weight: 600;
            color: ${theme?.colors?.text || '#2c3e50'};
            margin-bottom: 0.25rem;
        `;

        const description = document.createElement('div');
        description.className = 'menu-item-description';
        description.textContent = product.description || '';
        description.style.cssText = `
            color: ${theme?.colors?.textSecondary || '#6c757d'};
            font-size: 0.9rem;
            line-height: 1.4;
        `;

        info.appendChild(name);
        info.appendChild(description);
        item.appendChild(info);

        if (showPrice && product.price) {
            const price = document.createElement('div');
            price.className = 'menu-item-price';
            price.textContent = this.formatPrice(product.price);
            price.style.cssText = `
                font-weight: bold;
                color: ${theme?.colors?.primary || '#9b59b6'};
                min-width: 60px;
                text-align: right;
                margin-left: 1rem;
            `;
            item.appendChild(price);
        }

        // Click handler
        if (onItemClick) {
            item.addEventListener('click', () => onItemClick(product));
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#f8f9fa';
            });
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'transparent';
            });
        }

        return item;
    },

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Export for global use
if (typeof window !== 'undefined') {
    window.MenuDisplay = MenuDisplay;
}

console.log('🍽️ Menu display components loaded for Ninefy');