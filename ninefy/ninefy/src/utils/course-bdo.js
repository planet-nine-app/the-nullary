/**
 * Course BDO Utilities
 *
 * Handles creation and management of shareable course BDOs with:
 * - Course and lesson metadata
 * - Lesson-by-lesson access control
 * - Payee arrays for revenue sharing
 * - Two-button interface (save/purchase)
 * - Progressive nineum assignment (1 nineum per lesson)
 */

/**
 * Example course product structure
 */
const EXAMPLE_COURSE = {
  id: 'course-web3-fundamentals-001',
  uuid: null, // Will be generated via sessionless
  type: 'course',
  title: 'Web3 Fundamentals: Building on Planet Nine',
  instructor: 'Dr. Elena Rodriguez',
  description: 'Master the fundamentals of decentralized web development on Planet Nine. Learn sessionless authentication, MAGIC protocol, BDO storage, and build your first allyabase application.',
  courseImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
  price: 9900, // $99.00 for entire course
  duration: '8 weeks',
  level: 'Intermediate',
  category: 'programming',
  tags: ['web3', 'blockchain', 'planet-nine', 'decentralized'],

  // Course structure
  lessons: [
    {
      id: 'lesson-01',
      title: 'Introduction to Decentralized Architecture',
      duration: '45 min',
      order: 1,
      description: 'Overview of decentralized systems and Planet Nine ecosystem',
      videoUrl: 'https://example.com/lessons/01-intro.mp4',
      materials: ['slides-01.pdf', 'exercises-01.md']
    },
    {
      id: 'lesson-02',
      title: 'Sessionless Authentication Deep Dive',
      duration: '60 min',
      order: 2,
      description: 'Understanding cryptographic keys and sessionless protocol',
      videoUrl: 'https://example.com/lessons/02-auth.mp4',
      materials: ['slides-02.pdf', 'code-samples-02.zip']
    },
    {
      id: 'lesson-03',
      title: 'MAGIC Protocol Fundamentals',
      duration: '50 min',
      order: 3,
      description: 'Learn spell casting, gateways, and experience granting',
      videoUrl: 'https://example.com/lessons/03-magic.mp4',
      materials: ['slides-03.pdf', 'exercises-03.md']
    },
    {
      id: 'lesson-04',
      title: 'BDO Storage and Retrieval',
      duration: '55 min',
      order: 4,
      description: 'Working with Business Data Objects and public/private data',
      videoUrl: 'https://example.com/lessons/04-bdo.mp4',
      materials: ['slides-04.pdf', 'code-samples-04.zip']
    },
    {
      id: 'lesson-05',
      title: 'Building Your First Allyabase App',
      duration: '90 min',
      order: 5,
      description: 'Hands-on project: Create a complete decentralized application',
      videoUrl: 'https://example.com/lessons/05-project.mp4',
      materials: ['project-template.zip', 'deployment-guide.md']
    }
  ],

  metadata: {
    available: true,
    certificate: true,
    lifetimeAccess: true,
    studentCount: 1247,
    rating: 4.8,
    reviews: 312,
    prerequisites: ['Basic JavaScript', 'Understanding of HTTP/REST'],
    learningOutcomes: [
      'Build decentralized applications on Planet Nine',
      'Implement sessionless authentication',
      'Create and cast MAGIC spells',
      'Store and retrieve data from BDO',
      'Deploy full allyabase applications'
    ]
  },

  // Shareable BDO specific fields
  payees: [], // Array of {pubKey: string, percentage: number}

  // Lesson access nineum (1 nineum per lesson)
  // Allows progressive unlock: purchase course → get all lesson nineum
  lessonNineum: [], // Will be populated on purchase

  // SVG content for AdvanceKey display
  svgContent: null // Will be generated
};

/**
 * Generate SVG content for course BDO display in AdvanceKey
 * @param {Object} course - Course product object
 * @returns {string} SVG markup for display
 */
function generateCourseSVG(course) {
  // Extract course details
  const title = course.title || 'Untitled Course';
  const instructor = course.instructor || 'Unknown Instructor';
  const price = course.price ? `$${(course.price / 100).toFixed(2)}` : 'Free';
  const courseImage = course.courseImage || '';
  const lessonCount = course.lessons ? course.lessons.length : 0;
  const duration = course.duration || 'Self-paced';
  const level = course.level || 'All levels';

  // Word wrap title
  const maxTitleLength = 35;
  const titleLines = [];
  const words = title.split(' ');
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).length > maxTitleLength) {
      titleLines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += (currentLine ? ' ' : '') + word;
    }
  }
  if (currentLine) titleLines.push(currentLine.trim());

  // Preview first 3 lessons
  const previewLessons = course.lessons ? course.lessons.slice(0, 3) : [];

  // Generate SVG (400x700 to accommodate lesson list)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="700" viewBox="0 0 400 700">
  <defs>
    <linearGradient id="courseBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#34495e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2c3e50;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="saveBtn" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3498db;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2980b9;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="purchaseBtn" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#27ae60;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#229954;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="400" height="700" fill="url(#courseBg)" rx="10"/>

  <!-- Course image -->
  <rect x="50" y="30" width="300" height="160" fill="#1a1a1a" rx="5"/>
  ${courseImage ? `<image href="${courseImage}" x="50" y="30" width="300" height="160" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 5px)"/>` : ''}

  <!-- Course info section -->
  <text x="200" y="215" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ecf0f1" text-anchor="middle">${titleLines[0] || ''}</text>
  ${titleLines[1] ? `<text x="200" y="235" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ecf0f1" text-anchor="middle">${titleLines[1]}</text>` : ''}
  ${titleLines[2] ? `<text x="200" y="255" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ecf0f1" text-anchor="middle">${titleLines[2]}</text>` : ''}

  <text x="200" y="${titleLines[2] ? 280 : titleLines[1] ? 260 : 240}" font-family="Arial, sans-serif" font-size="14" fill="#bdc3c7" text-anchor="middle">by ${instructor}</text>

  <!-- Course details -->
  <text x="200" y="${titleLines[2] ? 310 : titleLines[1] ? 290 : 270}" font-family="Arial, sans-serif" font-size="13" fill="#95a5a6" text-anchor="middle">📚 ${lessonCount} lessons • ${duration} • ${level}</text>

  <!-- Price -->
  <text x="200" y="${titleLines[2] ? 340 : titleLines[1] ? 320 : 300}" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#f39c12" text-anchor="middle">${price}</text>

  <!-- Lessons preview -->
  <text x="50" y="${titleLines[2] ? 375 : titleLines[1] ? 355 : 335}" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ecf0f1">Course Content:</text>

  ${previewLessons.map((lesson, idx) => {
    const baseY = titleLines[2] ? 400 : titleLines[1] ? 380 : 360;
    const y = baseY + (idx * 55);
    const lessonTitle = lesson.title.length > 30 ? lesson.title.substring(0, 30) + '...' : lesson.title;

    return `
  <!-- Lesson ${idx + 1} -->
  <rect x="50" y="${y}" width="300" height="45" fill="#2c3e50" stroke="#7f8c8d" stroke-width="1" rx="5"/>
  <text x="60" y="${y + 18}" font-family="Arial, sans-serif" font-size="11" fill="#3498db" font-weight="bold">Lesson ${lesson.order}</text>
  <text x="60" y="${y + 32}" font-family="Arial, sans-serif" font-size="12" fill="#ecf0f1">${lessonTitle}</text>
  <text x="340" y="${y + 25}" font-family="Arial, sans-serif" font-size="10" fill="#95a5a6" text-anchor="end">${lesson.duration}</text>`;
  }).join('')}

  ${lessonCount > 3 ? `<text x="200" y="${titleLines[2] ? 575 : titleLines[1] ? 555 : 535}" font-family="Arial, sans-serif" font-size="12" fill="#7f8c8d" text-anchor="middle">+ ${lessonCount - 3} more lessons...</text>` : ''}

  <!-- Two-button layout (Save | Purchase) -->
  <!-- Save button (left) -->
  <rect id="button1" data-spell="saveToCarrierBag" data-spell-component="courseBdo"
        x="30" y="640" width="165" height="45" fill="url(#saveBtn)" rx="8" style="cursor:pointer"/>
  <text x="112.5" y="668" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#fff" text-anchor="middle" pointer-events="none">💾 Save</text>

  <!-- Purchase button (right) -->
  <rect id="button2" data-spell="purchaseCourse" data-spell-component="courseBdo"
        x="205" y="640" width="165" height="45" fill="url(#purchaseBtn)" rx="8" style="cursor:pointer"/>
  <text x="287.5" y="668" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#fff" text-anchor="middle" pointer-events="none">📖 Purchase</text>
</svg>`;
}

/**
 * Create a complete course BDO ready for sharing
 * @param {Object} courseData - Course product data
 * @param {Array} payees - Array of {pubKey, percentage} objects
 * @returns {Object} Complete BDO structure
 */
function createCourseBDO(courseData, payees = []) {
  // Validate payees add up to 100%
  const totalPercentage = payees.reduce((sum, p) => sum + (p.percentage || 0), 0);
  if (payees.length > 0 && Math.abs(totalPercentage - 100) > 0.01) {
    console.warn(`⚠️ Payee percentages total ${totalPercentage}% instead of 100%`);
  }

  // Generate UUID if not provided
  const uuid = courseData.uuid || (window.sessionless ? window.sessionless.generateUUID() : 'temp-' + Date.now());

  // Create complete course object
  const course = {
    ...courseData,
    uuid,
    payees: [...payees], // Clone payees array
    lessonNineum: [], // Will be populated on purchase
    svgContent: generateCourseSVG(courseData)
  };

  console.log('📖 Created course BDO:', course.title);
  console.log('📚 Lessons:', course.lessons?.length || 0);
  console.log('💰 Payees:', course.payees.length);

  return course;
}

/**
 * Add a payee to a course BDO
 * @param {Object} courseBDO - Course BDO object
 * @param {string} pubKey - Public key of payee
 * @param {number} percentage - Percentage of revenue (0-100)
 * @returns {Object} Updated course BDO
 */
function addPayee(courseBDO, pubKey, percentage) {
  if (!courseBDO.payees) {
    courseBDO.payees = [];
  }

  const existingIndex = courseBDO.payees.findIndex(p => p.pubKey === pubKey);

  if (existingIndex >= 0) {
    courseBDO.payees[existingIndex].percentage = percentage;
    console.log('✏️ Updated payee percentage:', pubKey.substring(0, 10) + '...', percentage + '%');
  } else {
    courseBDO.payees.push({ pubKey, percentage });
    console.log('➕ Added new payee:', pubKey.substring(0, 10) + '...', percentage + '%');
  }

  return courseBDO;
}

/**
 * Remove a payee from a course BDO
 * @param {Object} courseBDO - Course BDO object
 * @param {string} pubKey - Public key of payee to remove
 * @returns {Object} Updated course BDO
 */
function removePayee(courseBDO, pubKey) {
  if (!courseBDO.payees) {
    return courseBDO;
  }

  const originalLength = courseBDO.payees.length;
  courseBDO.payees = courseBDO.payees.filter(p => p.pubKey !== pubKey);

  if (courseBDO.payees.length < originalLength) {
    console.log('➖ Removed payee:', pubKey.substring(0, 10) + '...');
  }

  return courseBDO;
}

/**
 * Calculate payee amounts from total price
 * @param {Object} courseBDO - Course BDO object
 * @param {number} totalAmount - Total purchase amount in cents
 * @returns {Array} Array of {pubKey, amount} objects
 */
function calculatePayeeAmounts(courseBDO, totalAmount) {
  if (!courseBDO.payees || courseBDO.payees.length === 0) {
    return [];
  }

  return courseBDO.payees.map(payee => ({
    pubKey: payee.pubKey,
    percentage: payee.percentage,
    amount: Math.round((totalAmount * payee.percentage) / 100)
  }));
}

/**
 * Check if user has access to a specific lesson
 * @param {Object} courseBDO - Course BDO object
 * @param {string} lessonId - Lesson ID to check
 * @param {Object} user - Fount user object
 * @returns {boolean} True if user has access
 */
function hasLessonAccess(courseBDO, lessonId, user) {
  if (!courseBDO.lessonNineum || courseBDO.lessonNineum.length === 0) {
    return false;
  }

  if (!user || !user.nineum || !Array.isArray(user.nineum)) {
    return false;
  }

  // Find lesson index
  const lessonIndex = courseBDO.lessons?.findIndex(l => l.id === lessonId);
  if (lessonIndex < 0) return false;

  // Check if user has the nineum for this lesson
  const lessonNineum = courseBDO.lessonNineum[lessonIndex];
  return lessonNineum && user.nineum.includes(lessonNineum);
}

/**
 * Get all accessible lessons for user
 * @param {Object} courseBDO - Course BDO object
 * @param {Object} user - Fount user object
 * @returns {Array} Array of accessible lessons
 */
function getAccessibleLessons(courseBDO, user) {
  if (!courseBDO.lessons) return [];

  return courseBDO.lessons.filter(lesson =>
    hasLessonAccess(courseBDO, lesson.id, user)
  );
}

// Export functions
if (typeof window !== 'undefined') {
  window.CourseBDO = {
    EXAMPLE_COURSE,
    generateCourseSVG,
    createCourseBDO,
    addPayee,
    removePayee,
    calculatePayeeAmounts,
    hasLessonAccess,
    getAccessibleLessons
  };
}

console.log('📖 Course BDO utilities loaded');
