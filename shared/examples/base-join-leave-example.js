/**
 * Example: Base Join/Leave Functionality Test
 * 
 * This example demonstrates the corrected local-only join/leave functionality
 * that doesn't require backend Rust functions.
 */

// Import base command (adjust path as needed for your app)
import baseCommand from './base-command.js';

/**
 * Test the join/leave functionality
 */
async function testBaseJoinLeave() {
  console.log('🧪 Testing base join/leave functionality...');
  
  try {
    // Get available bases
    console.log('📡 Getting available bases...');
    const bases = await baseCommand.getBases();
    console.log('Found bases:', Object.keys(bases).length);
    
    if (!bases || Object.keys(bases).length === 0) {
      console.log('No bases available for testing');
      return;
    }
    
    // Get the first base for testing
    let testBase;
    if (Array.isArray(bases)) {
      testBase = bases[0];
    } else {
      testBase = Object.values(bases)[0];
    }
    
    if (!testBase) {
      console.log('No test base found');
      return;
    }
    
    console.log('🎯 Using test base:', testBase.name);
    console.log('Initial joined status:', testBase.joined);
    
    // Test joining
    console.log('\n🔗 Testing join functionality...');
    const joinResult = await baseCommand.joinBase(testBase);
    console.log('Join result:', joinResult);
    console.log('Base joined status after join:', testBase.joined);
    
    // Verify join worked
    if (testBase.joined && joinResult) {
      console.log('✅ Join test PASSED');
    } else {
      console.log('❌ Join test FAILED');
      return;
    }
    
    // Test leaving
    console.log('\n🔗 Testing leave functionality...');
    const leaveResult = await baseCommand.leaveBase(testBase);
    console.log('Leave result:', leaveResult);
    console.log('Base joined status after leave:', testBase.joined);
    
    // Verify leave worked
    if (!testBase.joined && leaveResult) {
      console.log('✅ Leave test PASSED');
    } else {
      console.log('❌ Leave test FAILED');
      return;
    }
    
    // Test join by name
    console.log('\n🔗 Testing join by name...');
    const joinByNameResult = await baseCommand.joinBase(testBase.name);
    console.log('Join by name result:', joinByNameResult);
    console.log('Base joined status after join by name:', testBase.joined);
    
    if (testBase.joined && joinByNameResult) {
      console.log('✅ Join by name test PASSED');
    } else {
      console.log('❌ Join by name test FAILED');
    }
    
    // Test leave by name
    console.log('\n🔗 Testing leave by name...');
    const leaveByNameResult = await baseCommand.leaveBase(testBase.name);
    console.log('Leave by name result:', leaveByNameResult);
    console.log('Base joined status after leave by name:', testBase.joined);
    
    if (!testBase.joined && leaveByNameResult) {
      console.log('✅ Leave by name test PASSED');
    } else {
      console.log('❌ Leave by name test FAILED');
    }
    
    console.log('\n🎉 All base join/leave tests completed!');
    
    // Show final state
    console.log('\n📊 Final state:');
    console.log('Base name:', testBase.name);
    console.log('Joined status:', testBase.joined);
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

/**
 * Demo: Interactive base management
 */
function createBaseJoinLeaveDemo() {
  console.log('🎮 Creating interactive base join/leave demo...');
  
  const demoContainer = document.createElement('div');
  demoContainer.style.cssText = `
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin: 20px;
    background: #f9f9f9;
    font-family: Arial, sans-serif;
  `;
  
  const title = document.createElement('h3');
  title.textContent = 'Base Join/Leave Demo';
  title.style.margin = '0 0 15px 0';
  demoContainer.appendChild(title);
  
  const status = document.createElement('div');
  status.id = 'base-status';
  status.style.cssText = `
    padding: 10px;
    background: #fff;
    border-radius: 4px;
    margin-bottom: 15px;
    font-family: monospace;
    font-size: 12px;
  `;
  status.textContent = 'Loading bases...';
  demoContainer.appendChild(status);
  
  const basesList = document.createElement('div');
  basesList.id = 'bases-list';
  demoContainer.appendChild(basesList);
  
  // Load and display bases
  async function updateBasesDisplay() {
    try {
      const bases = await baseCommand.getBases();
      const statusEl = document.getElementById('base-status');
      const listEl = document.getElementById('bases-list');
      
      if (!bases || Object.keys(bases).length === 0) {
        statusEl.textContent = 'No bases available';
        return;
      }
      
      statusEl.textContent = `Found ${Object.keys(bases).length} bases`;
      listEl.innerHTML = '';
      
      const basesArray = Array.isArray(bases) ? bases : Object.values(bases);
      
      basesArray.forEach(base => {
        const baseDiv = document.createElement('div');
        baseDiv.style.cssText = `
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          margin: 5px 0;
          background: white;
          border-radius: 4px;
          border: 1px solid #ddd;
        `;
        
        const baseInfo = document.createElement('div');
        baseInfo.innerHTML = `
          <strong>${base.name}</strong><br>
          <small>Status: ${base.joined ? '✅ Joined' : '⭕ Not joined'}</small>
        `;
        
        const button = document.createElement('button');
        button.textContent = base.joined ? 'Leave' : 'Join';
        button.style.cssText = `
          padding: 5px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          background: ${base.joined ? '#e74c3c' : '#27ae60'};
          color: white;
        `;
        
        button.addEventListener('click', async () => {
          button.disabled = true;
          button.textContent = 'Working...';
          
          try {
            let result;
            if (base.joined) {
              result = await baseCommand.leaveBase(base);
            } else {
              result = await baseCommand.joinBase(base);
            }
            
            if (result) {
              updateBasesDisplay(); // Refresh display
            } else {
              alert('Operation failed');
            }
          } catch (error) {
            alert('Error: ' + error.message);
          }
          
          button.disabled = false;
        });
        
        baseDiv.appendChild(baseInfo);
        baseDiv.appendChild(button);
        listEl.appendChild(baseDiv);
      });
      
    } catch (error) {
      document.getElementById('base-status').textContent = 'Error: ' + error.message;
    }
  }
  
  // Initial load
  updateBasesDisplay();
  
  // Refresh button
  const refreshButton = document.createElement('button');
  refreshButton.textContent = '🔄 Refresh';
  refreshButton.style.cssText = `
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: #3498db;
    color: white;
    cursor: pointer;
    margin-top: 10px;
  `;
  refreshButton.addEventListener('click', updateBasesDisplay);
  demoContainer.appendChild(refreshButton);
  
  return demoContainer;
}

/**
 * Usage instructions
 */
function showUsageInstructions() {
  console.log(`
🔗 Base Join/Leave Usage Instructions
=====================================

The join/leave functionality is now purely local - no backend Rust functions needed!

Basic Usage:
-----------
import baseCommand from './base-command.js';

// Join a base (by object)
const base = { name: 'Test Base', joined: false };
await baseCommand.joinBase(base);
console.log(base.joined); // true

// Join a base (by name)
await baseCommand.joinBase('Test Base');

// Leave a base (by object)
await baseCommand.leaveBase(base);
console.log(base.joined); // false

// Leave a base (by name)
await baseCommand.leaveBase('Test Base');

What happens:
- ✅ Updates base.joined property locally
- ✅ Updates the bases collection in memory
- ✅ Saves to local storage (for home base)
- ✅ No backend/Rust calls required
- ✅ Works with both base objects and base names/IDs

Testing:
--------
// Run the test function
await testBaseJoinLeave();

// Or create an interactive demo
const demo = createBaseJoinLeaveDemo();
document.body.appendChild(demo);
  `);
}

// Export functions for use
export {
  testBaseJoinLeave,
  createBaseJoinLeaveDemo,
  showUsageInstructions
};

// If running in browser console, make functions available globally
if (typeof window !== 'undefined') {
  window.testBaseJoinLeave = testBaseJoinLeave;
  window.createBaseJoinLeaveDemo = createBaseJoinLeaveDemo;
  window.showUsageInstructions = showUsageInstructions;
  
  // Auto-show instructions
  showUsageInstructions();
}