# Course BDO System - Complete Implementation

## Overview

The Course BDO (Business Data Object) system enables users to create shareable online course products with:
- **Structured lesson content** with progressive access
- **Two-button interface** (Save to carrierBag | Purchase)
- **Revenue sharing** via payee arrays
- **Lesson-by-lesson nineum** (1 nineum per lesson)
- **Progress tracking** and access control
- **Full SaVaGe integration** for AdvanceKey display

## Key Difference from Books & Tickets

**Books**: Purchase assigns **1 nineum** for download access to all artifacts

**Tickets**: Purchase assigns **N nineum** (1 per ticket) for individual ticket validation

**Courses**: Purchase assigns **N nineum** (1 per lesson) for progressive lesson access

## Architecture

### Core Components

**1. Course BDO Schema** (`/src/utils/course-bdo.js`)
```javascript
{
  id: 'course-web3-fundamentals-001',
  uuid: 'generated-uuid',
  type: 'course',
  title: 'Web3 Fundamentals: Building on Planet Nine',
  instructor: 'Dr. Elena Rodriguez',
  description: 'Master the fundamentals...',
  courseImage: 'https://...',
  price: 9900, // $99.00 for entire course
  duration: '8 weeks',
  level: 'Intermediate',
  category: 'programming',
  tags: ['web3', 'blockchain', 'planet-nine'],

  // Structured lesson content
  lessons: [
    {
      id: 'lesson-01',
      title: 'Introduction to Decentralized Architecture',
      duration: '45 min',
      order: 1,
      description: 'Overview of decentralized systems...',
      videoUrl: 'https://example.com/lessons/01-intro.mp4',
      materials: ['slides-01.pdf', 'exercises-01.md']
    },
    // ... more lessons
  ],

  metadata: {
    certificate: true,
    lifetimeAccess: true,
    studentCount: 1247,
    rating: 4.8,
    prerequisites: ['Basic JavaScript'],
    learningOutcomes: [...]
  },

  // Shareable BDO specific
  payees: [
    { pubKey: 'instructor-pubkey', percentage: 70 },
    { pubKey: 'platform-pubkey', percentage: 30 }
  ],

  // Lesson access nineum (1 per lesson)
  lessonNineum: [
    '01288800140103020404050606070100000001', // Lesson 1
    '01288800140103020404050606070100000002', // Lesson 2
    '01288800140103020404050606070100000003', // Lesson 3
    // ... one per lesson
  ],

  // SVG for AdvanceKey display
  svgContent: '<svg>...</svg>'
}
```

**2. Lesson Structure**
Each lesson contains:
- **ID**: Unique identifier
- **Title**: Lesson name
- **Duration**: Estimated time
- **Order**: Sequential position
- **Description**: What student will learn
- **Video URL**: Main lesson video
- **Materials**: Downloadable resources (PDFs, code samples, etc.)

**3. Progressive Access Control**
```javascript
// Check if user has access to specific lesson
const hasAccess = window.CourseBDO.hasLessonAccess(
  courseBDO,
  'lesson-03',
  user
);

// Get all accessible lessons
const accessibleLessons = window.CourseBDO.getAccessibleLessons(
  courseBDO,
  user
);

// Get lesson content (with access check)
const lesson = window.CoursePurchase.getLessonContent(
  courseBDO,
  'lesson-03',
  user
);
```

## Workflow

### 1. Creating a Course BDO

```javascript
// Define course with lessons
const courseData = {
  title: 'Advanced Web3 Development',
  instructor: 'Jane Doe',
  price: 14900, // $149
  lessons: [
    {
      id: 'lesson-01',
      title: 'Getting Started',
      duration: '30 min',
      order: 1,
      videoUrl: 'https://...',
      materials: ['intro.pdf']
    },
    // ... more lessons
  ]
};

// Create course BDO with payees
const courseBDO = window.CourseBDO.createCourseBDO(courseData, [
  { pubKey: 'instructor-key', percentage: 70 },
  { pubKey: 'platform-key', percentage: 30 }
]);
```

### 2. Displaying Course (Lesson List + Two Buttons)

The SVG includes:
- Course image
- Title, instructor, lesson count, duration
- Preview of first 3 lessons
- "Save" button (left)
- "Purchase" button (right)

```xml
<!-- Lesson preview -->
<rect x="50" y="400" ... /> <!-- Lesson 1 box -->
<text>Lesson 1</text>
<text>Introduction to...</text>
<text>45 min</text>

<!-- More lesson previews... -->

<!-- Save button -->
<rect id="button1" data-spell="saveToCarrierBag" ... />

<!-- Purchase button -->
<rect id="button2" data-spell="purchaseCourse" ... />
```

### 3. Saving to CarrierBag

When user clicks "Save":
```javascript
window.CarrierBag.save(courseBDO);
// ✅ Saved "Web3 Fundamentals" to carrier bag!
```

### 4. Purchasing Flow (All Lessons)

When user clicks "Purchase":

**Step 1: Payment Intent**
```javascript
const totalAmount = 9900; // $99 for entire course

const payeeSplits = [
  { pubKey: 'instructor', percentage: 70, amount: 6930 }, // $69.30
  { pubKey: 'platform', percentage: 30, amount: 2970 }    // $29.70
];
```

**Step 2: Process Payment**
- Opens Stripe payment modal
- User pays $99.00
- Revenue split automatically

**Step 3: Generate 5 Lesson Nineum**
```javascript
const lessonCount = 5;
const lessonNineum = await createLessonNineum(
  courseBDO,
  lessonCount,
  user,
  fountUrl
);

// Returns:
[
  '01288800140103020404050606070100000001', // Lesson 1 access
  '01288800140103020404050606070100000002', // Lesson 2 access
  '01288800140103020404050606070100000003', // Lesson 3 access
  '01288800140103020404050606070100000004', // Lesson 4 access
  '01288800140103020404050606070100000005'  // Lesson 5 access
]
```

**Step 4: Save Purchase Record**
```javascript
const purchaseRecord = {
  ...courseBDO,
  lessonNineum: lessonNineum,
  purchasedAt: '2025-01-15T10:30:00.000Z'
};

window.CarrierBag.save(purchaseRecord);
```

### 5. Accessing Lessons

**Check Access Before Playing Video:**
```javascript
// User clicks on Lesson 3
const lesson = window.CoursePurchase.getLessonContent(
  courseBDO,
  'lesson-03',
  user
);

if (lesson) {
  // ✅ Access granted - load video
  const videoPlayer = document.getElementById('player');
  videoPlayer.src = lesson.videoUrl;

  // Show downloadable materials
  lesson.materials.forEach(material => {
    // Display download links
  });
} else {
  // 🔒 Access denied
  alert('Please purchase the course to access this lesson');
}
```

**Track Progress:**
```javascript
const progress = window.CoursePurchase.getProgress(courseBDO, user);

console.log(`Progress: ${progress.progress}%`);
console.log(`Accessible: ${progress.accessibleCount}/${progress.totalLessons} lessons`);
console.log(`Complete: ${progress.isComplete}`);
```

## Use Cases

### Complete Course Purchase
```javascript
// User buys entire course
// Pays $99 once
// Receives all 5 lesson nineum immediately
// Can access all lessons in any order
```

### Progressive Learning
```javascript
// Platform could restrict nineum distribution
// Give 1 nineum at a time as user completes lessons
// Encourages sequential learning
// (Requires custom nineum granting logic)
```

### Course Subscription
```javascript
// Monthly subscription model
// Grant 1-2 lesson nineum per month
// Spread content delivery over time
// Keep students engaged longer
```

### Certificate Generation
```javascript
// Check if user has completed all lessons
const progress = window.CoursePurchase.getProgress(courseBDO, user);

if (progress.isComplete) {
  // User has access to all lessons
  // Generate certificate with user's name
  // Sign certificate with course nineum
}
```

## API Reference

### CourseBDO Functions

```javascript
window.CourseBDO = {
  EXAMPLE_COURSE,                       // Sample course structure
  generateCourseSVG(course),            // Create SVG with lessons
  createCourseBDO(data, payees),        // Create complete BDO
  addPayee(bdo, pubKey, percent),       // Add revenue share
  removePayee(bdo, pubKey),             // Remove payee
  calculatePayeeAmounts(bdo, amt),      // Calculate split amounts
  hasLessonAccess(bdo, lessonId, user), // Check lesson access
  getAccessibleLessons(bdo, user)       // Get all accessible lessons
}
```

### CoursePurchase Functions

```javascript
window.CoursePurchase = {
  purchase(bdo, user, config),          // Complete purchase flow
  calculateSplits(bdo, total),          // Calculate payee splits
  handleSpell(spell, comp, ...),        // Handle spell events
  createLessonNineum(bdo, count, user), // Generate N nineum
  getLessonContent(bdo, lessonId, user),// Get lesson with access check
  getProgress(bdo, user)                // Get progress info
}
```

### CarrierBag Integration

Same as book/ticket systems:
```javascript
window.CarrierBag.save(courseBDO);
window.CarrierBag.get();
window.CarrierBag.getPurchased(user);
```

## Example Usage

### Complete Course Creation and Purchase

```javascript
// 1. Create course BDO
const course = window.CourseBDO.createCourseBDO({
  title: 'Mastering MAGIC Protocol',
  instructor: 'Alex Chen',
  price: 7900, // $79
  duration: '6 weeks',
  level: 'Advanced',
  lessons: [
    {
      id: 'lesson-01',
      title: 'MAGIC Protocol Overview',
      duration: '40 min',
      order: 1,
      videoUrl: 'https://...',
      materials: ['overview.pdf']
    },
    {
      id: 'lesson-02',
      title: 'Spell Creation',
      duration: '60 min',
      order: 2,
      videoUrl: 'https://...',
      materials: ['spell-guide.pdf', 'examples.zip']
    },
    // ... 8 more lessons
  ]
}, [
  { pubKey: 'instructor-key', percentage: 80 },
  { pubKey: 'platform-key', percentage: 20 }
]);

// 2. Display in AdvanceKey
document.body.innerHTML = course.svgContent;

// 3. User clicks "Purchase"
// Button has: data-spell="purchaseCourse"

// 4. Purchase flow executes:
//    - Payment: $79
//    - Split: $63.20 instructor, $15.80 platform
//    - 10 lesson nineum generated and assigned
//    - Purchase record saved

// 5. User accesses lessons
const user = await fountClient.getUser(userUUID);

// Start with Lesson 1
const lesson1 = window.CoursePurchase.getLessonContent(
  course,
  'lesson-01',
  user
);

if (lesson1) {
  playVideo(lesson1.videoUrl);
  displayMaterials(lesson1.materials);
}

// Check progress
const progress = window.CoursePurchase.getProgress(course, user);
console.log(`Completed: ${progress.progress}%`);
```

## Advanced Features

### Drip Content Release

```javascript
// Grant 1 lesson nineum per week
async function grantNextLesson(user, courseBDO) {
  const progress = window.CoursePurchase.getProgress(courseBDO, user);
  const nextLessonIndex = progress.accessibleCount;

  if (nextLessonIndex < courseBDO.lessons.length) {
    // Generate 1 nineum for next lesson
    const nineum = await createLessonNineum(courseBDO, 1, user, fountUrl);

    // Update course record
    courseBDO.lessonNineum[nextLessonIndex] = nineum[0];

    // Notify user
    notifyUser(`New lesson unlocked: ${courseBDO.lessons[nextLessonIndex].title}`);
  }
}

// Run weekly
setInterval(() => grantNextLesson(user, course), 7 * 24 * 60 * 60 * 1000);
```

### Course Bundles

```javascript
// Create bundle of multiple courses
const bundle = {
  title: 'Complete Web3 Developer Path',
  courses: [
    courseBDO_Fundamentals,
    courseBDO_Advanced,
    courseBDO_MasterClass
  ],
  price: 24900, // $249 (save $50)
  bundleDiscount: 5000
};

// Purchase all courses at once
// Receive nineum for all lessons in all courses
```

### Interactive Assignments

```javascript
// Lesson with assignment submission
const lesson = {
  id: 'lesson-05',
  title: 'Build Your First dApp',
  videoUrl: '...',
  materials: ['assignment.md'],
  assignment: {
    required: true,
    submissionUrl: 'https://submit.example.com/course/assignment/05',
    graded: true
  }
};

// Check assignment completion before granting next nineum
if (hasCompletedAssignment(user, 'lesson-05')) {
  grantNextLesson(user, course);
}
```

### Course Completion Certificate

```javascript
// Generate certificate when all lessons accessed
const progress = window.CoursePurchase.getProgress(course, user);

if (progress.isComplete) {
  // Create certificate BDO
  const certificate = {
    type: 'certificate',
    courseName: course.title,
    studentName: user.name,
    instructor: course.instructor,
    completionDate: new Date().toISOString(),
    verificationNineum: course.lessonNineum[0], // Link to course
    certificateNumber: generateCertNumber(),
    signedBy: course.instructor
  };

  // Store certificate in BDO
  await bdo.store(certificate, { pub: true });

  // Send certificate to user
  notifyUser('🎓 Congratulations! Your certificate is ready');
}
```

## Comparison: Books vs Tickets vs Courses

| Feature | Books | Tickets | Courses |
|---------|-------|---------|---------|
| **Structure** | Flat (artifacts) | Flat (tickets) | Hierarchical (lessons) |
| **Nineum Count** | 1 | N (1 per ticket) | N (1 per lesson) |
| **Access Pattern** | All-or-nothing | Individual tickets | Progressive lessons |
| **Transferable** | No (DRM) | Yes | Lesson-specific |
| **Progress Tracking** | No | No | Yes |
| **Time-based** | No | Event date | Course duration |

## Testing

### Local Testing Checklist

- [ ] Load ninefy - course utilities load without errors
- [ ] Create course BDO - SVG generated with lesson list
- [ ] Lesson preview - first 3 lessons displayed
- [ ] Click "Save" - saves to carrierBag
- [ ] Click "Purchase" - payment flow initiates
- [ ] Verify nineum count - receives N nineum for N lessons
- [ ] Check lesson access - `hasLessonAccess()` returns correct results
- [ ] Get progress - progress tracking works correctly
- [ ] Access lesson content - videos/materials load with valid nineum

### Integration Testing

```javascript
// Test course creation with lessons
const testCourse = window.CourseBDO.createCourseBDO(
  window.CourseBDO.EXAMPLE_COURSE,
  [{ pubKey: 'test-key', percentage: 100 }]
);

console.assert(
  testCourse.lessons.length === 5,
  'Course has 5 lessons'
);
console.assert(
  testCourse.svgContent.includes('Lesson 1'),
  'Lesson preview in SVG'
);

// Test purchase (requires fount + addie)
const result = await window.CoursePurchase.purchase(
  testCourse,
  user,
  config
);

console.assert(result.success === true, 'Purchase succeeded');
console.assert(
  result.lessonNineum.length === 5,
  '5 lesson nineum assigned'
);

// Test access control
const hasAccess = window.CourseBDO.hasLessonAccess(
  testCourse,
  'lesson-01',
  user
);
console.assert(hasAccess === true, 'User has access to lesson 1');

// Test progress tracking
const progress = window.CoursePurchase.getProgress(testCourse, user);
console.assert(progress.progress === 100, 'Course 100% complete');
```

## File Locations

```
/the-nullary/ninefy/ninefy/
  src/
    utils/
      course-bdo.js         - Course BDO schema and SVG generation
      course-purchase.js    - Purchase flow with lesson nineum
      carrier-bag.js        - Reused from book/ticket systems
    index.html             - Loads course utilities
  COURSE-BDO-SYSTEM.md    - This documentation
```

## Support & Troubleshooting

### Common Issues

**Q: User can't access lesson they purchased**
- Check user.nineum array contains required nineum
- Verify lesson nineum matches course nineum array
- Ensure carrierBag has correct purchase record

**Q: Progress shows 0% after purchase**
- Verify lessonNineum array populated
- Check user object has updated nineum
- Confirm nineum match lesson order

**Q: Lesson materials won't download**
- Check lesson.materials array exists
- Verify URLs are accessible
- Ensure user has lesson access

**Q: Certificate not generating**
- Verify all lessons accessed
- Check progress.isComplete === true
- Ensure certificate logic triggered

## Future Enhancements

### Potential Features

1. **Quizzes & Assessments**
   - Require passing quiz before next nineum
   - Track quiz scores in nineum metadata

2. **Discussion Forums**
   - Nineum-gated lesson discussions
   - Verified student comments

3. **Live Sessions**
   - Calendar integration
   - Zoom/streaming links for course nineum holders

4. **Course Updates**
   - New lessons added after purchase
   - Automatic nineum grant for existing students

5. **Instructor Dashboard**
   - Student progress analytics
   - Revenue tracking per lesson
   - Engagement metrics

## Last Updated
January 2025 - Initial implementation with complete course BDO system including lesson structure, progressive nineum access, and full carrierBag integration.
