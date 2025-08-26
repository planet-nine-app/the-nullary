/**
 * Test script to check MagiCard delete functionality and cleanup
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

function checkMagiCardStorage() {
    const homeDir = os.homedir();
    const magicardDir = path.join(homeDir, '.magicard');
    const stacksDir = path.join(magicardDir, 'stacks');
    const cardsDir = path.join(magicardDir, 'cards');
    
    console.log('🔍 Checking MagiCard storage structure...');
    console.log('📁 MagiCard directory:', magicardDir);
    
    // Check if directories exist
    const checks = [
        { name: 'MagiCard directory', path: magicardDir },
        { name: 'Stacks directory', path: stacksDir },
        { name: 'Cards directory', path: cardsDir }
    ];
    
    checks.forEach(check => {
        if (fs.existsSync(check.path)) {
            console.log(`✅ ${check.name} exists: ${check.path}`);
            
            try {
                const items = fs.readdirSync(check.path);
                console.log(`   📄 Contents (${items.length} items):`, items.slice(0, 10));
                if (items.length > 10) {
                    console.log(`   ... and ${items.length - 10} more items`);
                }
            } catch (e) {
                console.log(`   ❌ Could not read directory: ${e.message}`);
            }
        } else {
            console.log(`❌ ${check.name} does not exist: ${check.path}`);
        }
    });
}

function analyzeStorageSize() {
    const homeDir = os.homedir();
    const magicardDir = path.join(homeDir, '.magicard');
    
    if (!fs.existsSync(magicardDir)) {
        console.log('📊 No MagiCard storage found - nothing to analyze');
        return;
    }
    
    console.log('\n📊 Storage size analysis:');
    
    function getDirectorySize(dirPath) {
        let totalSize = 0;
        let fileCount = 0;
        
        function scanDirectory(currentPath) {
            try {
                const items = fs.readdirSync(currentPath);
                items.forEach(item => {
                    const fullPath = path.join(currentPath, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        scanDirectory(fullPath);
                    } else {
                        totalSize += stat.size;
                        fileCount++;
                    }
                });
            } catch (e) {
                console.log(`   ⚠️ Could not scan: ${currentPath} - ${e.message}`);
            }
        }
        
        scanDirectory(dirPath);
        return { totalSize, fileCount };
    }
    
    const { totalSize, fileCount } = getDirectorySize(magicardDir);
    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
    
    console.log(`💾 Total storage used: ${totalSizeMB} MB`);
    console.log(`📄 Total files: ${fileCount}`);
    
    // Check specific subdirectories
    const subdirs = ['stacks', 'cards'];
    subdirs.forEach(subdir => {
        const subdirPath = path.join(magicardDir, subdir);
        if (fs.existsSync(subdirPath)) {
            const { totalSize: subSize, fileCount: subCount } = getDirectorySize(subdirPath);
            const subSizeMB = (subSize / 1024 / 1024).toFixed(2);
            console.log(`   📁 ${subdir}/: ${subSizeMB} MB (${subCount} files)`);
        }
    });
}

function checkForOrphanedFiles() {
    console.log('\n🔍 Checking for orphaned files...');
    
    const homeDir = os.homedir();
    const stacksDir = path.join(homeDir, '.magicard', 'stacks');
    const cardsDir = path.join(homeDir, '.magicard', 'cards');
    
    if (!fs.existsSync(stacksDir) || !fs.existsSync(cardsDir)) {
        console.log('📁 Required directories not found - skipping orphan check');
        return;
    }
    
    try {
        // Get list of stack names
        const stackFiles = fs.readdirSync(stacksDir)
            .filter(file => file.endsWith('.json'))
            .map(file => file.replace('.json', ''));
        
        // Get list of card directories  
        const cardDirs = fs.readdirSync(cardsDir)
            .filter(item => {
                const fullPath = path.join(cardsDir, item);
                return fs.statSync(fullPath).isDirectory();
            });
        
        console.log(`📚 Found ${stackFiles.length} stacks`);
        console.log(`🎴 Found ${cardDirs.length} card directories`);
        
        // Check for orphaned card directories
        const orphanedCardDirs = cardDirs.filter(cardDir => !stackFiles.includes(cardDir));
        
        if (orphanedCardDirs.length > 0) {
            console.log('⚠️ Found orphaned card directories:');
            orphanedCardDirs.forEach(orphan => {
                const orphanPath = path.join(cardsDir, orphan);
                const { totalSize, fileCount } = getDirectorySize(orphanPath);
                const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
                console.log(`   🗑️ ${orphan} (${sizeMB} MB, ${fileCount} files)`);
            });
        } else {
            console.log('✅ No orphaned card directories found');
        }
        
        // Check for stacks without card directories
        const stacksWithoutCards = stackFiles.filter(stack => !cardDirs.includes(stack));
        if (stacksWithoutCards.length > 0) {
            console.log('📦 Stacks without card directories:');
            stacksWithoutCards.forEach(stack => {
                console.log(`   📄 ${stack}`);
            });
        }
        
    } catch (e) {
        console.log(`❌ Error checking for orphaned files: ${e.message}`);
    }
}

function getDirectorySize(dirPath) {
    let totalSize = 0;
    let fileCount = 0;
    
    function scanDirectory(currentPath) {
        try {
            const items = fs.readdirSync(currentPath);
            items.forEach(item => {
                const fullPath = path.join(currentPath, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scanDirectory(fullPath);
                } else {
                    totalSize += stat.size;
                    fileCount++;
                }
            });
        } catch (e) {
            // Skip files/dirs we can't access
        }
    }
    
    scanDirectory(dirPath);
    return { totalSize, fileCount };
}

function suggestCleanup() {
    console.log('\n🧹 Cleanup suggestions:');
    console.log('1. Delete orphaned card directories manually if any found');
    console.log('2. Consider running MagiCard and using the delete function to test cleanup');
    console.log('3. Check if localStorage in browser also needs cleanup');
    console.log('\n💡 To manually clean up:');
    console.log(`   rm -rf ~/.magicard/cards/{orphaned_directory_name}`);
    console.log(`   # Or delete entire MagiCard storage: rm -rf ~/.magicard`);
}

// Run the analysis
console.log('🪄 MagiCard Storage Analysis\n');
checkMagiCardStorage();
analyzeStorageSize();
checkForOrphanedFiles();
suggestCleanup();