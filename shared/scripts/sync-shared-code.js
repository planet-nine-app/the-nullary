#!/usr/bin/env node

/**
 * Sync Shared Code Script
 * 
 * Synchronizes shared code from /the-nullary/shared/ to individual Nullary apps
 * This ensures all apps have the latest shared components while maintaining Tauri compatibility
 * 
 * Usage: node sync-shared-code.js [--app=appname] [--component=componentname] [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SHARED_DIR = path.resolve(__dirname, '..');
const NULLARY_DIR = path.resolve(__dirname, '../..');
const DRY_RUN = process.argv.includes('--dry-run');
const TARGET_APP = process.argv.find(arg => arg.startsWith('--app='))?.split('=')[1];
const TARGET_COMPONENT = process.argv.find(arg => arg.startsWith('--component='))?.split('=')[1];

// Shared components that should be synced to apps
const SHARED_COMPONENTS = {
  'environment-config.js': {
    source: 'services/environment-config-master.js',
    targets: [
      'ninefy/ninefy/src/environment-config.js',
      'rhapsold/rhapsold/src/environment-config.js',
      'mybase/mybase/src/environment-config.js',
      'idothis/idothis/src/environment-config.js',
      'screenary/screenary/src/environment-config.js',
      'lexary/lexary/src/environment-config.js',
      'photary/photary/src/environment-config.js',
      'viewaris/viewaris/src/environment-config.js'
    ]
  },
  'base-command.js': {
    source: 'services/base-command.js',
    targets: [
      'mybase/mybase/src/base-command.js',
      'screenary/screenary/src/base-command.js',
      'idothis/idothis/src/base-command.js'
    ]
  },
  // Note: form-widget.js and post-widget.js sync disabled until service structure stabilizes
  // 'form-widget.js': {
  //   source: '../../../sanora/public/form-widget.js',
  //   targets: ['mybase/mybase/src/form-widget.js', 'idothis/idothis/src/form-widget.js']
  // },
  // 'post-widget.js': {
  //   source: '../../../dolores/public/post-widget.js', 
  //   targets: ['mybase/mybase/src/post-widget.js', 'screenary/screenary/src/post-widget.js']
  // }
};

// Helper functions
const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',    // cyan
    success: '\x1b[32m', // green
    warning: '\x1b[33m', // yellow
    error: '\x1b[31m',   // red
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
};

const fileExists = (filePath) => {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
};

const dirExists = (dirPath) => {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
};

const copyFile = (source, target) => {
  if (DRY_RUN) {
    log(`[DRY RUN] Would copy: ${source} → ${target}`, 'info');
    return true;
  }
  
  try {
    // Ensure target directory exists
    const targetDir = path.dirname(target);
    if (!dirExists(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      log(`Created directory: ${targetDir}`, 'success');
    }
    
    // Copy file
    fs.copyFileSync(source, target);
    log(`✅ Copied: ${path.basename(source)} → ${target}`, 'success');
    return true;
  } catch (error) {
    log(`❌ Failed to copy ${source} → ${target}: ${error.message}`, 'error');
    return false;
  }
};

const getFileStats = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return {
      exists: true,
      size: stats.size,
      modified: stats.mtime
    };
  } catch {
    return { exists: false };
  }
};

// Main sync function
const syncSharedCode = () => {
  log('🔄 Planet Nine Shared Code Synchronization', 'info');
  log('==========================================', 'info');
  
  if (DRY_RUN) {
    log('🧪 DRY RUN MODE - No files will be modified', 'warning');
  }
  
  let totalCopied = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  
  // Process each shared component
  Object.entries(SHARED_COMPONENTS).forEach(([componentName, config]) => {
    
    // Filter by target component if specified
    if (TARGET_COMPONENT && componentName !== TARGET_COMPONENT) {
      return;
    }
    
    log(`\n📦 Processing: ${componentName}`, 'info');
    
    // Resolve source path
    const sourcePath = path.resolve(SHARED_DIR, config.source);
    const sourceStats = getFileStats(sourcePath);
    
    if (!sourceStats.exists) {
      log(`⚠️ Source file not found: ${sourcePath}`, 'warning');
      totalErrors++;
      return;
    }
    
    log(`📄 Source: ${config.source} (${sourceStats.size} bytes, modified ${sourceStats.modified.toISOString()})`);
    
    // Process each target
    config.targets.forEach(targetPath => {
      const appName = targetPath.split('/')[0];
      
      // Filter by target app if specified
      if (TARGET_APP && appName !== TARGET_APP) {
        return;
      }
      
      const fullTargetPath = path.resolve(NULLARY_DIR, targetPath);
      const targetStats = getFileStats(fullTargetPath);
      
      // Check if update needed
      let needsUpdate = true;
      if (targetStats.exists) {
        // Compare modification times
        if (targetStats.modified >= sourceStats.modified) {
          log(`⏭️ Skipping ${appName}: target is up-to-date (${targetStats.modified.toISOString()})`, 'info');
          totalSkipped++;
          needsUpdate = false;
        }
      }
      
      if (needsUpdate) {
        if (copyFile(sourcePath, fullTargetPath)) {
          totalCopied++;
        } else {
          totalErrors++;
        }
      }
    });
  });
  
  // Summary
  log('\n📊 Synchronization Summary', 'info');
  log('=========================', 'info');
  log(`✅ Files copied: ${totalCopied}`, totalCopied > 0 ? 'success' : 'info');
  log(`⏭️ Files skipped: ${totalSkipped}`, 'info');
  log(`❌ Errors: ${totalErrors}`, totalErrors > 0 ? 'error' : 'info');
  
  if (DRY_RUN) {
    log('\n💡 Run without --dry-run to apply changes', 'info');
  } else if (totalCopied > 0) {
    log('\n🎉 Synchronization complete! Apps may need restart to load new code.', 'success');
  }
  
  return { copied: totalCopied, skipped: totalSkipped, errors: totalErrors };
};

// Validation function
const validateSharedCode = () => {
  log('🔍 Validating shared code structure...', 'info');
  
  let valid = true;
  
  // Check if shared directory exists
  if (!dirExists(SHARED_DIR)) {
    log(`❌ Shared directory not found: ${SHARED_DIR}`, 'error');
    valid = false;
  }
  
  // Check if each source file exists
  Object.entries(SHARED_COMPONENTS).forEach(([componentName, config]) => {
    const sourcePath = path.resolve(SHARED_DIR, config.source);
    if (!fileExists(sourcePath)) {
      log(`❌ Source file missing: ${componentName} at ${sourcePath}`, 'error');
      valid = false;
    }
  });
  
  return valid;
};

// CLI Help
const showHelp = () => {
  console.log(`
Planet Nine Shared Code Synchronization Tool

Usage:
  node sync-shared-code.js [options]

Options:
  --app=<name>        Sync only to specific app (e.g., --app=ninefy)
  --component=<name>  Sync only specific component (e.g., --component=environment-config.js)
  --dry-run          Show what would be copied without making changes
  --help             Show this help message

Examples:
  node sync-shared-code.js
  node sync-shared-code.js --dry-run
  node sync-shared-code.js --app=mybase
  node sync-shared-code.js --component=environment-config.js
  node sync-shared-code.js --app=ninefy --component=base-command.js --dry-run

Available components:
${Object.keys(SHARED_COMPONENTS).map(comp => `  - ${comp}`).join('\n')}

Available apps:
  - ninefy      (Digital goods marketplace)
  - rhapsold    (Blogging platform)
  - mybase      (Social networking)
  - idothis     (Professional discovery)
  - screenary   (Multi-purpose social)
  - lexary      (Text feeds)
  - photary     (Photo sharing)
  - viewaris    (Video platform)
`);
};

// Main execution
if (process.argv.includes('--help')) {
  showHelp();
  process.exit(0);
}

// Validate structure first
if (!validateSharedCode()) {
  log('❌ Shared code validation failed. Please fix the issues above.', 'error');
  process.exit(1);
}

// Run synchronization
try {
  const results = syncSharedCode();
  process.exit(results.errors > 0 ? 1 : 0);
} catch (error) {
  log(`💥 Synchronization failed: ${error.message}`, 'error');
  process.exit(1);
}