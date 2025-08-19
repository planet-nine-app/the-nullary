/**
 * Shared Menu Utilities for Ninefy
 * 
 * Menu detection and reconstruction utilities
 * Compatible with ninefy's non-module architecture
 */

const MenuUtils = {
    /**
     * Detect menu products from a list of products
     * @param {Array} products - Array of products
     * @returns {Object} Detection results
     */
    detectMenuProducts(products) {
        if (!products || !Array.isArray(products)) {
            return { hasMenus: false, menuProducts: [], regularProducts: products || [], menuCatalogs: new Map() };
        }

        const menuProducts = [];
        const regularProducts = [];
        const menuCatalogs = new Map();

        products.forEach(product => {
            // Check for menu indicators
            const isMenu = this.isMenuProduct(product);
            
            if (isMenu) {
                menuProducts.push(product);
                
                const catalogId = this.getMenuCatalogId(product);
                if (catalogId) {
                    if (!menuCatalogs.has(catalogId)) {
                        menuCatalogs.set(catalogId, {
                            structure: null,
                            catalog: null,
                            items: []
                        });
                    }
                    
                    const catalogData = menuCatalogs.get(catalogId);
                    
                    if (this.isMenuStructure(product)) {
                        catalogData.structure = this.extractMenuStructure(product);
                        catalogData.catalog = product;
                    } else {
                        catalogData.items.push(product);
                    }
                }
            } else {
                regularProducts.push(product);
            }
        });

        return {
            hasMenus: menuProducts.length > 0,
            menuProducts,
            regularProducts,
            menuCatalogs
        };
    },

    /**
     * Check if a product is a menu-related product
     * @param {Object} product - Product to check
     * @returns {boolean} True if product is menu-related
     */
    isMenuProduct(product) {
        if (!product) return false;
        
        // Check for menu product type and category
        if (product.productType === 'menu' || product.productType === 'menu-catalog' || product.category === 'menu') {
            return true;
        }
        
        // Check for menu catalog metadata
        if (product.metadata?.menuCatalogId || product.menuCatalogId) {
            return true;
        }
        
        // Check title patterns
        if (product.title && product.title.toLowerCase().includes('menu')) {
            return true;
        }
        
        // Check for catalog file (menu structure uploads)
        if (product.catalog || product.catalogFile) {
            return true;
        }
        
        return false;
    },

    /**
     * Check if a product contains menu structure data
     * @param {Object} product - Product to check
     * @returns {boolean} True if product contains menu structure
     */
    isMenuStructure(product) {
        if (!product) return false;
        
        // Check for structure indicators
        if (product.metadata?.isMenuStructure) {
            return true;
        }
        
        // Check for catalog file
        if (product.catalog || product.catalogFile) {
            return true;
        }
        
        // Check for menu data
        if (product.metadata?.menuData || product.menuData) {
            return true;
        }
        
        return false;
    },

    /**
     * Get menu catalog ID from product
     * @param {Object} product - Product
     * @returns {string|null} Menu catalog ID
     */
    getMenuCatalogId(product) {
        if (!product) return null;
        
        return product.metadata?.menuCatalogId || 
               product.menuCatalogId || 
               product.uuid || 
               product.id ||
               null;
    },

    /**
     * Extract menu structure from product
     * @param {Object} product - Product containing menu structure
     * @returns {Object|null} Menu structure data
     */
    extractMenuStructure(product) {
        if (!product) return null;
        
        // Try different structure sources
        if (product.metadata?.menuData) {
            return product.metadata.menuData;
        }
        
        if (product.menuData) {
            return product.menuData;
        }
        
        // For catalog-based menus, try to reconstruct from product data
        if (product.catalog || product.catalogFile) {
            return {
                title: product.title || 'Menu',
                description: product.description || 'Restaurant menu',
                menus: {} // Would be populated by CSV parsing
            };
        }
        
        return null;
    },

    /**
     * Reconstruct a complete menu catalog from products and structure
     * @param {Array} menuProducts - Array of menu-related products
     * @param {Object} structure - Menu structure data
     * @returns {Object|null} Reconstructed menu catalog
     */
    reconstructMenu(menuProducts, structure) {
        if (!structure || !menuProducts) {
            return null;
        }

        // Find the main catalog product
        const catalogProduct = menuProducts.find(p => this.isMenuStructure(p));
        if (!catalogProduct) {
            return null;
        }

        // Extract menu items (non-structure products)
        const menuItems = menuProducts.filter(p => !this.isMenuStructure(p));

        const products = menuItems.map(item => ({
            id: item.id || item.uuid,
            name: item.title,
            description: item.description,
            price: item.price,
            currency: item.currency || 'usd',
            category: item.metadata?.category || item.category
        }));

        return {
            id: this.getMenuCatalogId(catalogProduct),
            title: structure.title || catalogProduct.title,
            description: structure.description || catalogProduct.description,
            type: 'menu_catalog',
            menus: structure.menus || {},
            products: products,
            metadata: {
                totalProducts: products.length,
                menuCount: Object.keys(structure.menus || {}).length,
                created_at: catalogProduct.created_at || catalogProduct.metadata?.created_at
            },
            originalProduct: catalogProduct
        };
    },

    /**
     * Convert a regular product to menu catalog format if it's detected as a menu
     * @param {Object} product - Regular product that might be a menu
     * @returns {Object|null} Menu catalog or null if not a menu
     */
    convertProductToMenuCatalog(product) {
        if (!this.isMenuProduct(product)) {
            return null;
        }

        // For products uploaded as menu type, create a basic menu catalog
        const menuCatalog = {
            id: product.uuid || product.id,
            title: product.title,
            description: product.description,
            type: 'menu_catalog',
            menus: {},
            products: [],
            metadata: {
                totalProducts: 0,
                menuCount: 0,
                created_at: product.created_at,
                isConverted: true
            },
            originalProduct: product,
            // Include original product data for compatibility
            price: product.price,
            author: product.author,
            featuredImage: product.featuredImage,
            productType: product.productType
        };

        // If this product has menu structure data, use it
        const structure = this.extractMenuStructure(product);
        if (structure && structure.menus) {
            menuCatalog.menus = structure.menus;
            menuCatalog.metadata.menuCount = Object.keys(structure.menus).length;
        }

        return menuCatalog;
    }
};

// Export for global use
if (typeof window !== 'undefined') {
    window.MenuUtils = MenuUtils;
}

console.log('🍽️ Menu utilities loaded for Ninefy');