// Load the menu catalog utilities
const fs = require('fs');
const path = require('path');

// Read the menu-catalog-utils.js file
const utilsCode = fs.readFileSync('ninefy/src/utils/menu-catalog-utils.js', 'utf8');

// Create a mock window object and execute the utils code
const mockWindow = { MenuCatalogUtils: {} };
const mockConsole = {
  log: (...args) => console.log('📋', ...args),
  warn: (...args) => console.log('⚠️ ', ...args),
  error: (...args) => console.log('❌', ...args)
};

// Execute the utils code in our context
eval(utilsCode.replace('window.MenuCatalogUtils', 'mockWindow.MenuCatalogUtils').replace(/console\./g, 'mockConsole.'));

// Your exact CSV data
const csvData = `,rider,time span,product,,,
,adult,two-hour,adult+two-hour$250,,,
,youth,day,adult+day$500,,,
,reduced,month,adult+month$10000,,,
,,,youth+two-hour$100,,,
,,,youth+day$200,,,
,,,youth+month$2000,,,
,,,reduced+two-hour$150,,,
,,,reduced+day$250,,,
,,,reduced+month$2500,,,`;

console.log('🧪 Testing CSV parsing with your data...');
console.log('📄 Input CSV:');
console.log(csvData);

try {
    const menuTree = mockWindow.MenuCatalogUtils.parseCSVToMenuTree(csvData);
    console.log('\n✅ Parsed menu tree:');
    console.log(JSON.stringify(menuTree, null, 2));
    
    console.log('\n📊 Menu Structure Analysis:');
    console.log('Menus created:', Object.keys(menuTree.menus));
    Object.entries(menuTree.menus).forEach(([menuName, menuData]) => {
        console.log(`  - ${menuName}:`, Object.keys(menuData));
    });
    
    console.log('\n🛍️ Products created:', menuTree.products.length);
    menuTree.products.forEach(product => {
        console.log(`  - ${product.name} ($${(product.price/100).toFixed(2)})`);
        console.log(`    selections: [${product.metadata.selections.join(', ')}]`);
    });
    
} catch (error) {
    console.error('❌ Error parsing CSV:', error.message);
    console.error(error.stack);
}