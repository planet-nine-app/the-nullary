/**
 * Membership Utilities
 * 
 * Handles CSV to JSON transformation and membership tier structure creation
 * for Ninefy membership products.
 */

/**
 * Parse CSV content and convert to membership structure
 * @param {string} csvContent - Raw CSV content with tiers and perks
 * @returns {Object} Membership structure with tiers and perk definitions
 */
function parseCSVToMembershipStructure(csvContent) {
  try {
    console.log('👑 Parsing membership CSV content...');
    
    const lines = csvContent.trim().split('\n');
    const membership = {
      tiers: [],
      perks: {},
      metadata: {
        totalTiers: 0,
        totalPerks: 0,
        createdAt: new Date().toISOString()
      }
    };

    if (lines.length < 2) {
      throw new Error('CSV must have at least header rows and data');
    }

    // Find the divider between tiers and perks sections
    let dividerIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '' || line.toLowerCase().includes('perk_id')) {
        dividerIndex = i;
        break;
      }
    }

    if (dividerIndex === -1) {
      throw new Error('Could not find perk definitions section in CSV. Expected empty line or Perk_ID header.');
    }

    // Parse tiers section (before divider)
    const tierLines = lines.slice(0, dividerIndex);
    if (tierLines.length < 2) {
      throw new Error('Tiers section must have header and at least one tier');
    }

    const tierHeaders = parseCSVLine(tierLines[0]);
    console.log('📊 Tier headers found:', tierHeaders);

    // Validate tier headers
    const requiredTierHeaders = ['tier', 'annual_cost', 'monthly_cost', 'included_perks'];
    const headerMap = {};
    tierHeaders.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().replace(/[^a-z_]/g, '_');
      headerMap[normalizedHeader] = index;
    });

    for (const required of requiredTierHeaders) {
      if (!(required in headerMap)) {
        throw new Error(`Missing required tier header: ${required}`);
      }
    }

    // Process tier data
    for (let i = 1; i < tierLines.length; i++) {
      const tierData = parseCSVLine(tierLines[i]);
      if (tierData.length === 0 || tierData.every(cell => !cell.trim())) continue;

      const tier = {
        name: tierData[headerMap.tier] || `Tier ${i}`,
        annualCost: parseFloat(tierData[headerMap.annual_cost] || 0),
        monthlyCost: parseFloat(tierData[headerMap.monthly_cost] || 0),
        includedPerks: []
      };

      // Parse included perks (comma-separated)
      const perksField = tierData[headerMap.included_perks] || '';
      if (perksField.trim()) {
        tier.includedPerks = perksField.split(',').map(p => p.trim()).filter(p => p);
      }

      membership.tiers.push(tier);
    }

    // Parse perks section (after divider)
    const perkLines = lines.slice(dividerIndex + 1).filter(line => line.trim());
    if (perkLines.length === 0) {
      console.log('⚠️ No perk definitions found, using perk IDs as names');
    } else {
      // Find perk header
      const perkHeaderLine = perkLines.find(line => 
        line.toLowerCase().includes('perk_id') || line.toLowerCase().includes('perk_name')
      );
      
      if (perkHeaderLine) {
        const perkHeaders = parseCSVLine(perkHeaderLine);
        const perkHeaderIndex = perkLines.findIndex(line => line === perkHeaderLine);
        
        // Process perk definitions
        for (let i = perkHeaderIndex + 1; i < perkLines.length; i++) {
          const perkData = parseCSVLine(perkLines[i]);
          if (perkData.length < 2) continue;

          const perkId = perkData[0].trim();
          const perkName = perkData[1].trim();
          if (perkId && perkName) {
            membership.perks[perkId] = perkName;
          }
        }
      }
    }

    // Validate that all referenced perks have definitions
    const allReferencedPerks = new Set();
    membership.tiers.forEach(tier => {
      tier.includedPerks.forEach(perkId => allReferencedPerks.add(perkId));
    });

    allReferencedPerks.forEach(perkId => {
      if (!membership.perks[perkId]) {
        console.warn(`⚠️ No definition found for perk: ${perkId}, using ID as name`);
        membership.perks[perkId] = perkId;
      }
    });

    membership.metadata.totalTiers = membership.tiers.length;
    membership.metadata.totalPerks = Object.keys(membership.perks).length;

    console.log('✅ Parsed membership structure:', {
      tiers: membership.metadata.totalTiers,
      perks: membership.metadata.totalPerks
    });

    return membership;

  } catch (error) {
    console.error('❌ Failed to parse membership CSV:', error);
    throw error;
  }
}

/**
 * Parse a CSV line handling quotes and commas
 * @param {string} line - CSV line to parse
 * @returns {Array<string>} Parsed fields
 */
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  fields.push(current.trim());
  return fields;
}

/**
 * Create membership tier display structure for UI
 * @param {Object} membershipData - Parsed membership structure
 * @returns {string} HTML structure for displaying membership tiers
 */
function createMembershipTierDisplay(membershipData) {
  let html = '<div class="membership-display">';
  
  // Header
  html += `<h3>Membership Tiers (${membershipData.metadata.totalTiers} total)</h3>`;
  
  // Tiers
  membershipData.tiers.forEach((tier, index) => {
    html += `<div class="tier-card" style="border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 8px;">`;
    html += `<h4>${tier.name}</h4>`;
    
    // Pricing
    html += '<div class="pricing">';
    if (tier.annualCost > 0) {
      html += `<span class="annual">Annual: $${(tier.annualCost / 100).toFixed(2)}</span>`;
    }
    if (tier.monthlyCost > 0) {
      html += `<span class="monthly">Monthly: $${(tier.monthlyCost / 100).toFixed(2)}</span>`;
    }
    if (tier.annualCost === 0 && tier.monthlyCost === 0) {
      html += '<span class="free">Free</span>';
    }
    html += '</div>';
    
    // Perks
    if (tier.includedPerks.length > 0) {
      html += '<div class="perks"><strong>Included:</strong><ul>';
      tier.includedPerks.forEach(perkId => {
        const perkName = membershipData.perks[perkId] || perkId;
        html += `<li>${perkName}</li>`;
      });
      html += '</ul></div>';
    }
    
    html += '</div>';
  });
  
  // Perks legend
  if (Object.keys(membershipData.perks).length > 0) {
    html += '<div class="perks-legend" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">';
    html += `<h4>Available Perks (${membershipData.metadata.totalPerks} total)</h4>`;
    html += '<ul>';
    Object.entries(membershipData.perks).forEach(([id, name]) => {
      html += `<li><strong>${id}:</strong> ${name}</li>`;
    });
    html += '</ul></div>';
  }
  
  html += '</div>';
  return html;
}

/**
 * Validate membership CSV structure
 * @param {string} csvContent - Raw CSV content
 * @returns {Object} Validation result with success/error details
 */
function validateMembershipCSV(csvContent) {
  try {
    const structure = parseCSVToMembershipStructure(csvContent);
    
    // Validation checks
    const errors = [];
    
    if (structure.tiers.length === 0) {
      errors.push('No membership tiers found');
    }
    
    structure.tiers.forEach((tier, index) => {
      if (!tier.name || tier.name.trim() === '') {
        errors.push(`Tier ${index + 1} missing name`);
      }
      
      if (tier.annualCost === 0 && tier.monthlyCost === 0) {
        console.warn(`⚠️ Tier "${tier.name}" has no cost (free tier)`);
      }
      
      if (tier.includedPerks.length === 0) {
        console.warn(`⚠️ Tier "${tier.name}" has no perks`);
      }
    });
    
    return {
      success: errors.length === 0,
      errors: errors,
      structure: structure
    };
    
  } catch (error) {
    return {
      success: false,
      errors: [error.message],
      structure: null
    };
  }
}

// Export for use in main application
window.MembershipUtils = {
  parseCSVToMembershipStructure,
  createMembershipTierDisplay,
  validateMembershipCSV,
  parseCSVLine
};

console.log('👑 Membership utilities loaded');