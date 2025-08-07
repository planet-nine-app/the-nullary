#!/usr/bin/env node

/**
 * Batch CLAUDE.md Environment Documentation Update Script
 * Adds environment configuration documentation to app CLAUDE.md files
 */

const fs = require('fs');
const path = require('path');

// Environment documentation template
const ENV_DOCS_TEMPLATE = (appName) => `
### Environment Configuration

${appName} supports three environments for connecting to different allyabase infrastructures:

- **\`dev\`** - Production dev server (https://dev.*.allyabase.com)
- **\`test\`** - Local 3-base test ecosystem (localhost:5111-5122)  
- **\`local\`** - Standard local development (localhost:3000-3007)

#### Environment Switching

**Via Browser Console** (while app is running):
\`\`\`javascript
// Switch to test ecosystem
${appName}Env.switch('test')
location.reload()

// Check current environment
${appName}Env.current()

// List all environments
${appName}Env.list()
\`\`\`

**Via Package Scripts**:
\`\`\`bash
npm run dev:dev    # Dev server (default)
npm run dev:test   # Test ecosystem  
npm run dev:local  # Local development
\`\`\`

#### Programming API
\`\`\`javascript
// Get current environment config
const config = getEnvironmentConfig();
console.log(config.env);        // 'dev', 'test', or 'local'
console.log(config.services);   // Service URLs

// Get specific service URL
const sanoraUrl = getServiceUrl('sanora');
const bdoUrl = getServiceUrl('bdo');
\`\`\`
`;

// Apps with CLAUDE.md files (excluding already updated ones)
const APPS_WITH_CLAUDE_MD = [
  'photary', 'viewary', 'grocary', 'mybase', 'nexus', 'stackchat', 'idothis'
];

function updateClaudeMd(appName) {
  const claudeMdPath = path.join(__dirname, '..', '..', appName, 'CLAUDE.md');
  
  if (!fs.existsSync(claudeMdPath)) {
    console.log(`⚠️ Skipping ${appName} - CLAUDE.md not found`);
    return false;
  }

  try {
    let content = fs.readFileSync(claudeMdPath, 'utf8');
    
    // Skip if already has environment configuration
    if (content.includes('Environment Configuration') || 
        content.includes('getEnvironmentConfig') ||
        content.includes('switch(\'test\')')) {
      console.log(`✅ ${appName} already has environment documentation`);
      return true;
    }

    const envDocs = ENV_DOCS_TEMPLATE(appName.toLowerCase());

    // Try to find development/workflow section to insert after
    const developmentPatterns = [
      /## Development Workflow/,
      /## Development/,
      /### Running/,
      /### Development/,
      /## Usage/,
      /## Getting Started/
    ];

    let insertionPoint = -1;
    let insertAfter = false;
    
    for (const pattern of developmentPatterns) {
      const match = content.search(pattern);
      if (match !== -1) {
        insertionPoint = match;
        insertAfter = true;
        break;
      }
    }

    if (insertionPoint === -1) {
      // If no development section found, add before the end
      const lines = content.split('\n');
      // Insert before last few lines (likely just whitespace/end)
      insertionPoint = Math.max(0, lines.length - 3);
      lines.splice(insertionPoint, 0, '## Development', envDocs);
      content = lines.join('\n');
    } else {
      // Insert after the development section header
      const lines = content.split('\n');
      
      // Find the line with the development header
      for (let i = 0; i < lines.length; i++) {
        for (const pattern of developmentPatterns) {
          if (pattern.test(lines[i])) {
            // Insert after this line (and any immediate content)
            let insertAt = i + 1;
            
            // Skip any immediate content until we find a good insertion point
            while (insertAt < lines.length && 
                   lines[insertAt].trim() !== '' && 
                   !lines[insertAt].startsWith('#')) {
              insertAt++;
            }
            
            lines.splice(insertAt, 0, envDocs);
            content = lines.join('\n');
            break;
          }
        }
      }
    }

    // Write updated content
    fs.writeFileSync(claudeMdPath, content);
    console.log(`✅ Updated ${appName} CLAUDE.md`);
    return true;

  } catch (error) {
    console.error(`❌ Error updating ${appName}:`, error.message);
    return false;
  }
}

function main() {
  console.log('📝 Updating CLAUDE.md files with environment configuration documentation...\n');
  
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const appName of APPS_WITH_CLAUDE_MD) {
    const result = updateClaudeMd(appName);
    if (result === true) updated++;
    else if (result === false) skipped++;
    else errors++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Updated: ${updated}`);
  console.log(`⚠️ Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`\n📋 Environment configuration documentation added to CLAUDE.md files!`);
}

if (require.main === module) {
  main();
}

module.exports = { updateClaudeMd, ENV_DOCS_TEMPLATE };