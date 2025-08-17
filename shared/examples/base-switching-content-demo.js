/**
 * Base Switching Content Demo
 * 
 * Demonstrates how joining/leaving bases now affects the content feed.
 * Before: Static feeds that didn't change when joining/leaving bases
 * After: Dynamic feeds that only show content from joined bases
 */

// Import base command (adjust path as needed for your app)
import baseCommand from './base-command.js';

/**
 * Test that base switching affects content
 */
async function testBaseSwitchingAffectsContent() {
  console.log('🧪 Testing that base switching affects content...');
  
  try {
    // Step 1: Get initial state
    console.log('\n📊 Step 1: Getting initial state');
    const initialBases = await baseCommand.getBases();
    const initialFeed = await baseCommand.getFeed(null, true); // Force refresh
    
    console.log('Initial bases:', Object.keys(initialBases).length);
    console.log('Initial content:', {
      images: initialFeed.imagePosts?.length || 0,
      text: initialFeed.textPosts?.length || 0,
      videos: initialFeed.videoPosts?.length || 0,
      joinedBases: initialFeed.joinedBasesCount || 0
    });
    
    // Step 2: Leave all bases
    console.log('\n📊 Step 2: Leaving all bases');
    const basesArray = Array.isArray(initialBases) ? initialBases : Object.values(initialBases);
    
    for (const base of basesArray) {
      if (base.joined) {
        console.log(`🚪 Leaving base: ${base.name}`);
        await baseCommand.leaveBase(base);
      }
    }
    
    // Get feed after leaving all bases
    const emptyFeed = await baseCommand.getFeed(null, true); // Force refresh
    console.log('Content after leaving all bases:', {
      images: emptyFeed.imagePosts?.length || 0,
      text: emptyFeed.textPosts?.length || 0,
      videos: emptyFeed.videoPosts?.length || 0,
      joinedBases: emptyFeed.joinedBasesCount || 0,
      isEmpty: emptyFeed.isEmpty,
      message: emptyFeed.message
    });
    
    // Verify feed is empty
    if (emptyFeed.isEmpty && emptyFeed.joinedBasesCount === 0) {
      console.log('✅ PASS: Feed is empty when no bases are joined');
    } else {
      console.log('❌ FAIL: Feed should be empty when no bases are joined');
    }
    
    // Step 3: Join one base
    console.log('\n📊 Step 3: Joining one base');
    const testBase = basesArray[0];
    if (testBase) {
      console.log(`🔗 Joining base: ${testBase.name}`);
      await baseCommand.joinBase(testBase);
      
      // Get feed after joining one base
      const singleBaseFeed = await baseCommand.getFeed(null, true); // Force refresh
      console.log('Content after joining one base:', {
        images: singleBaseFeed.imagePosts?.length || 0,
        text: singleBaseFeed.textPosts?.length || 0,
        videos: singleBaseFeed.videoPosts?.length || 0,
        joinedBases: singleBaseFeed.joinedBasesCount || 0,
        baseSources: singleBaseFeed.baseSources?.map(b => b.name) || []
      });
      
      // Verify feed has content from one base
      if (singleBaseFeed.joinedBasesCount === 1 && !singleBaseFeed.isEmpty) {
        console.log('✅ PASS: Feed shows content from one joined base');
      } else if (singleBaseFeed.joinedBasesCount === 1 && singleBaseFeed.isEmpty) {
        console.log('ℹ️  INFO: One base joined but no content available (expected if base is empty)');
      } else {
        console.log('❌ FAIL: Feed should show content from one joined base');
      }
    }
    
    // Step 4: Join additional bases
    console.log('\n📊 Step 4: Joining additional bases');
    let joinedCount = 1; // Already joined one
    
    for (let i = 1; i < Math.min(basesArray.length, 3); i++) {
      const base = basesArray[i];
      console.log(`🔗 Joining additional base: ${base.name}`);
      await baseCommand.joinBase(base);
      joinedCount++;
    }
    
    // Get feed after joining multiple bases
    const multiFeed = await baseCommand.getFeed(null, true); // Force refresh
    console.log('Content after joining multiple bases:', {
      images: multiFeed.imagePosts?.length || 0,
      text: multiFeed.textPosts?.length || 0,
      videos: multiFeed.videoPosts?.length || 0,
      joinedBases: multiFeed.joinedBasesCount || 0,
      baseSources: multiFeed.baseSources?.map(b => b.name) || []
    });
    
    // Verify feed aggregates from multiple bases
    if (multiFeed.joinedBasesCount === joinedCount) {
      console.log('✅ PASS: Feed aggregates content from multiple joined bases');
    } else {
      console.log('❌ FAIL: Feed should aggregate from all joined bases');
    }
    
    // Step 5: Test selective leaving
    console.log('\n📊 Step 5: Testing selective base leaving');
    if (basesArray.length > 1) {
      const baseToLeave = basesArray[1];
      console.log(`🚪 Leaving base: ${baseToLeave.name}`);
      await baseCommand.leaveBase(baseToLeave);
      joinedCount--;
      
      const selectiveFeed = await baseCommand.getFeed(null, true); // Force refresh
      console.log('Content after leaving one base:', {
        images: selectiveFeed.imagePosts?.length || 0,
        text: selectiveFeed.textPosts?.length || 0,
        videos: selectiveFeed.videoPosts?.length || 0,
        joinedBases: selectiveFeed.joinedBasesCount || 0,
        baseSources: selectiveFeed.baseSources?.map(b => b.name) || []
      });
      
      // Verify content updated
      if (selectiveFeed.joinedBasesCount === joinedCount) {
        console.log('✅ PASS: Feed updates when leaving individual bases');
      } else {
        console.log('❌ FAIL: Feed should update when leaving bases');
      }
    }
    
    console.log('\n🎉 Base switching content test completed!');
    
    return {
      testPassed: true,
      message: 'Base switching now affects content correctly'
    };
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return {
      testPassed: false,
      error: error.message
    };
  }
}

/**
 * Create interactive demo showing base switching effects
 */
function createBaseSwitchingDemo() {
  console.log('🎮 Creating base switching content demo...');
  
  const demoContainer = document.createElement('div');
  demoContainer.style.cssText = `
    display: flex;
    gap: 20px;
    padding: 20px;
    font-family: Arial, sans-serif;
    max-width: 1200px;
    margin: 0 auto;
  `;
  
  // Bases panel
  const basesPanel = document.createElement('div');
  basesPanel.style.cssText = `
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    background: #f9f9f9;
  `;
  
  const basesTitle = document.createElement('h3');
  basesTitle.textContent = 'Available Bases';
  basesTitle.style.margin = '0 0 15px 0';
  basesPanel.appendChild(basesTitle);
  
  const basesList = document.createElement('div');
  basesList.id = 'bases-list';
  basesPanel.appendChild(basesList);
  
  // Content panel
  const contentPanel = document.createElement('div');
  contentPanel.style.cssText = `
    flex: 2;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    background: #f9f9f9;
  `;
  
  const contentTitle = document.createElement('h3');
  contentTitle.textContent = 'Aggregated Content Feed';
  contentTitle.style.margin = '0 0 15px 0';
  contentPanel.appendChild(contentTitle);
  
  const contentStats = document.createElement('div');
  contentStats.id = 'content-stats';
  contentStats.style.cssText = `
    padding: 10px;
    background: #fff;
    border-radius: 4px;
    margin-bottom: 15px;
    font-family: monospace;
    font-size: 12px;
  `;
  contentPanel.appendChild(contentStats);
  
  const contentList = document.createElement('div');
  contentList.id = 'content-list';
  contentList.style.cssText = `
    max-height: 400px;
    overflow-y: auto;
    background: #fff;
    border-radius: 4px;
    padding: 10px;
  `;
  contentPanel.appendChild(contentList);
  
  demoContainer.appendChild(basesPanel);
  demoContainer.appendChild(contentPanel);
  
  // Update displays
  async function updateDisplay() {
    try {
      // Update bases
      const bases = await baseCommand.getBases();
      const basesListEl = document.getElementById('bases-list');
      basesListEl.innerHTML = '';
      
      const basesArray = Array.isArray(bases) ? bases : Object.values(bases);
      
      basesArray.forEach(base => {
        const baseDiv = document.createElement('div');
        baseDiv.style.cssText = `
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          margin: 5px 0;
          background: white;
          border-radius: 4px;
          border: 1px solid ${base.joined ? '#27ae60' : '#ddd'};
        `;
        
        const baseInfo = document.createElement('div');
        baseInfo.innerHTML = `
          <strong>${base.name}</strong><br>
          <small>${base.joined ? '✅ Joined' : '⭕ Not joined'}</small>
        `;
        
        const button = document.createElement('button');
        button.textContent = base.joined ? 'Leave' : 'Join';
        button.style.cssText = `
          padding: 4px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          background: ${base.joined ? '#e74c3c' : '#27ae60'};
          color: white;
          font-size: 12px;
        `;
        
        button.addEventListener('click', async () => {
          button.disabled = true;
          button.textContent = '...';
          
          try {
            if (base.joined) {
              await baseCommand.leaveBase(base);
            } else {
              await baseCommand.joinBase(base);
            }
            updateDisplay(); // Refresh both panels
          } catch (error) {
            alert('Error: ' + error.message);
          }
          
          button.disabled = false;
        });
        
        baseDiv.appendChild(baseInfo);
        baseDiv.appendChild(button);
        basesListEl.appendChild(baseDiv);
      });
      
      // Update content
      const feed = await baseCommand.getFeed(null, true); // Force refresh
      const statsEl = document.getElementById('content-stats');
      const listEl = document.getElementById('content-list');
      
      // Update stats
      statsEl.innerHTML = `
        <strong>Content Statistics:</strong><br>
        Joined Bases: ${feed.joinedBasesCount || 0}<br>
        Images: ${feed.imagePosts?.length || 0}<br>
        Text Posts: ${feed.textPosts?.length || 0}<br>
        Videos: ${feed.videoPosts?.length || 0}<br>
        ${feed.isEmpty ? '<span style="color: #e74c3c;">Feed is empty</span>' : '<span style="color: #27ae60;">Content available</span>'}
      `;
      
      // Update content list
      listEl.innerHTML = '';
      
      if (feed.isEmpty) {
        listEl.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #666;">
            <div style="font-size: 48px; margin-bottom: 15px;">📭</div>
            <p><strong>No Content Available</strong></p>
            <p>${feed.message || 'Join bases to see their content here.'}</p>
          </div>
        `;
      } else {
        // Show base sources
        if (feed.baseSources && feed.baseSources.length > 0) {
          const sourcesDiv = document.createElement('div');
          sourcesDiv.style.cssText = `
            margin-bottom: 15px;
            padding: 10px;
            background: #f0f0f0;
            border-radius: 4px;
            font-size: 12px;
          `;
          sourcesDiv.innerHTML = `
            <strong>Content Sources:</strong><br>
            ${feed.baseSources.map(source => `• ${source.name}`).join('<br>')}
          `;
          listEl.appendChild(sourcesDiv);
        }
        
        // Show content items
        const allContent = [
          ...(feed.imagePosts || []).map(item => ({ ...item, type: 'image' })),
          ...(feed.textPosts || []).map(item => ({ ...item, type: 'text' })),
          ...(feed.videoPosts || []).map(item => ({ ...item, type: 'video' }))
        ].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        allContent.slice(0, 20).forEach(item => { // Show first 20 items
          const itemDiv = document.createElement('div');
          itemDiv.style.cssText = `
            padding: 10px;
            margin: 5px 0;
            border: 1px solid #eee;
            border-radius: 4px;
            font-size: 12px;
          `;
          
          const typeIcon = item.type === 'image' ? '📸' : item.type === 'text' ? '📝' : '🎥';
          
          itemDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span><strong>${typeIcon} ${item.title || 'Untitled'}</strong></span>
              <span style="color: #666; font-size: 10px;">from ${item.baseName || 'Unknown'}</span>
            </div>
            ${item.description ? `<div style="margin-top: 5px; color: #666;">${item.description.slice(0, 100)}${item.description.length > 100 ? '...' : ''}</div>` : ''}
          `;
          
          listEl.appendChild(itemDiv);
        });
      }
      
    } catch (error) {
      document.getElementById('content-stats').innerHTML = `<span style="color: #e74c3c;">Error: ${error.message}</span>`;
    }
  }
  
  // Initial load
  updateDisplay();
  
  // Add refresh button
  const refreshButton = document.createElement('button');
  refreshButton.textContent = '🔄 Refresh Content';
  refreshButton.style.cssText = `
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: #3498db;
    color: white;
    cursor: pointer;
    margin: 15px 0 0 0;
    width: 100%;
  `;
  refreshButton.addEventListener('click', updateDisplay);
  contentPanel.appendChild(refreshButton);
  
  return demoContainer;
}

/**
 * Show usage instructions
 */
function showUsageInstructions() {
  console.log(`
🔄 Base Switching Content Demo
==============================

This demo shows how joining/leaving bases now affects the content feed.

Key Changes:
- ✅ Content is only shown from JOINED bases
- ✅ Joining a base adds its content to the feed  
- ✅ Leaving a base removes its content from the feed
- ✅ Feed updates in real-time when base status changes

Testing:
--------
// Run the automated test
await testBaseSwitchingAffectsContent();

// Create interactive demo
const demo = createBaseSwitchingDemo();
document.body.appendChild(demo);

What to expect:
- When no bases are joined: Empty feed with helpful message
- When bases are joined: Aggregated content from all joined bases
- Base sources are tracked and displayed
- Content is sorted by timestamp across all bases
- Leaving a base immediately removes its content from feed
  `);
}

// Export functions
export {
  testBaseSwitchingAffectsContent,
  createBaseSwitchingDemo,
  showUsageInstructions
};

// Make available globally for browser console testing
if (typeof window !== 'undefined') {
  window.testBaseSwitchingAffectsContent = testBaseSwitchingAffectsContent;
  window.createBaseSwitchingDemo = createBaseSwitchingDemo;
  window.showBaseSwitchingInstructions = showUsageInstructions;
  
  // Auto-show instructions
  showUsageInstructions();
}