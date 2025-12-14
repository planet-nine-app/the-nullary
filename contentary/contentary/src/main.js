// Contentary - Vertical Slide Presenter for Short-Form Video Content
// State Management
const state = {
  slides: [], // Array of { id, svgContent }
  currentSlideIndex: -1,
  cameraStream: null,
  isRecording: false,
  mediaRecorder: null,
  recordedChunks: []
};

// DOM Elements
let elements = {};

// Initialize the app
window.addEventListener("DOMContentLoaded", () => {
  initializeElements();
  setupEventListeners();
  updateUI();
});

function initializeElements() {
  elements = {
    slideDisplay: document.getElementById('slide-display'),
    emptyState: document.getElementById('empty-state'),
    thumbnails: document.getElementById('slide-thumbnails'),
    cameraPreview: document.getElementById('camera-preview'),
    cameraPip: document.getElementById('camera-pip'),
    toggleCamera: document.getElementById('toggle-camera'),
    toggleRecording: document.getElementById('toggle-recording'),
    exportBtn: document.getElementById('export')
  };
}

function setupEventListeners() {
  // Camera controls
  elements.toggleCamera.addEventListener('click', toggleCamera);
  elements.toggleRecording.addEventListener('click', toggleRecording);

  // Export
  elements.exportBtn.addEventListener('click', exportProject);
}

// Slide Management
async function addSVGSlide() {
  console.log('addSVGSlide called');

  try {
    // Use Tauri's dialog API for file selection
    const selected = await window.__TAURI__.dialog.open({
      multiple: false,
      filters: [{
        name: 'SVG',
        extensions: ['svg']
      }]
    });

    console.log('File selected:', selected);

    if (!selected) {
      console.log('No file selected');
      return;
    }

    // Read file using Tauri's fs API
    const contents = await window.__TAURI__.fs.readTextFile(selected);
    console.log('File loaded, content length:', contents.length);

    // Get filename from path
    const filename = selected.split('/').pop().split('\\').pop();

    // Create slide object
    const slide = {
      id: Date.now(),
      svgContent: contents,
      filename: filename
    };

    console.log('Adding slide:', slide.filename);
    state.slides.push(slide);
    state.currentSlideIndex = state.slides.length - 1;
    console.log('Current slides:', state.slides.length);

    renderSlide(slide);
    updateThumbnails();
  } catch (error) {
    console.error('Error loading SVG:', error);
    alert('Error loading SVG file: ' + error);
  }
}

function renderSlide(slide) {
  console.log('Rendering slide:', slide.filename);
  console.log('SVG content preview:', slide.svgContent.substring(0, 100));

  elements.slideDisplay.innerHTML = slide.svgContent;
  elements.emptyState.style.display = 'none';
  elements.slideDisplay.style.display = 'flex';

  console.log('Slide rendered, display element:', elements.slideDisplay);
}

function updateThumbnails() {
  console.log('Updating thumbnails, slide count:', state.slides.length);
  elements.thumbnails.innerHTML = '';

  // Add the "Add Slide" button as first thumbnail
  const addSlideThumb = document.createElement('div');
  addSlideThumb.className = 'add-slide-thumb';
  addSlideThumb.innerHTML = `
    <div>+</div>
    <div class="add-slide-text">Add Slide</div>
  `;
  addSlideThumb.addEventListener('click', addSVGSlide);
  elements.thumbnails.appendChild(addSlideThumb);

  // Add slide thumbnails
  state.slides.forEach((slide, index) => {
    console.log('Creating thumbnail for slide', index);
    const thumb = document.createElement('div');
    thumb.className = 'slide-thumb';
    if (index === state.currentSlideIndex) {
      thumb.classList.add('active');
    }

    // Insert SVG content into thumbnail
    thumb.innerHTML = slide.svgContent;

    const slideNum = document.createElement('div');
    slideNum.className = 'slide-number';
    slideNum.textContent = index + 1;
    thumb.appendChild(slideNum);

    thumb.addEventListener('click', () => {
      state.currentSlideIndex = index;
      renderSlide(state.slides[index]);
      updateThumbnails();
    });

    elements.thumbnails.appendChild(thumb);
  });
}

// Camera Management
async function toggleCamera() {
  if (state.cameraStream) {
    stopCamera();
  } else {
    await startCamera();
  }
}

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 640 }
      },
      audio: true
    });

    state.cameraStream = stream;
    elements.cameraPreview.srcObject = stream;
    elements.cameraPip.style.display = 'flex';
  } catch (error) {
    console.error('Error accessing camera:', error);
    alert('Could not access camera. Please check permissions.');
  }
}

function stopCamera() {
  if (state.cameraStream) {
    state.cameraStream.getTracks().forEach(track => track.stop());
    state.cameraStream = null;
    elements.cameraPreview.srcObject = null;
    elements.cameraPip.style.display = 'none';
  }
}

// Recording Management
async function toggleRecording() {
  if (state.isRecording) {
    stopRecording();
  } else {
    await startRecording();
  }
}

async function startRecording() {
  if (!state.cameraStream) {
    await startCamera();
    if (!state.cameraStream) return;
  }

  try {
    state.recordedChunks = [];
    state.mediaRecorder = new MediaRecorder(state.cameraStream, {
      mimeType: 'video/webm;codecs=vp9'
    });

    state.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        state.recordedChunks.push(e.data);
      }
    };

    state.mediaRecorder.onstop = () => {
      const blob = new Blob(state.recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);

      // Download the recording
      const a = document.createElement('a');
      a.href = url;
      a.download = `contentary-recording-${Date.now()}.webm`;
      a.click();

      URL.revokeObjectURL(url);
    };

    state.mediaRecorder.start();
    state.isRecording = true;
    elements.toggleRecording.classList.add('recording');
  } catch (error) {
    console.error('Error starting recording:', error);
    alert('Could not start recording.');
  }
}

function stopRecording() {
  if (state.mediaRecorder && state.isRecording) {
    state.mediaRecorder.stop();
    state.isRecording = false;
    elements.toggleRecording.classList.remove('recording');
  }
}

// Export Functionality
async function exportProject() {
  if (state.slides.length === 0) {
    alert('No slides to export!');
    return;
  }

  try {
    // Let user select a folder to save to
    const folderPath = await window.__TAURI__.dialog.open({
      directory: true,
      multiple: false,
      title: 'Select folder to export project'
    });

    if (!folderPath) {
      console.log('No folder selected');
      return;
    }

    console.log('Exporting to folder:', folderPath);

    // Create export data
    const timestamp = Date.now();
    const exportData = {
      slides: state.slides.map((slide, index) => ({
        id: slide.id,
        filename: slide.filename,
        slideNumber: index + 1,
        svgFilename: `slide-${index + 1}.svg`
      })),
      metadata: {
        created: new Date().toISOString(),
        slideCount: state.slides.length,
        format: 'vertical-9:16',
        resolution: '1080x1920'
      }
    };

    // Save project JSON
    const projectPath = `${folderPath}/contentary-project-${timestamp}.json`;
    await window.__TAURI__.fs.writeTextFile(projectPath, JSON.stringify(exportData, null, 2));
    console.log('Saved project JSON to:', projectPath);

    // Save individual SVG slides
    for (let i = 0; i < state.slides.length; i++) {
      const slide = state.slides[i];
      const svgPath = `${folderPath}/slide-${i + 1}.svg`;
      await window.__TAURI__.fs.writeTextFile(svgPath, slide.svgContent);
      console.log(`Saved slide ${i + 1} to:`, svgPath);
    }

    alert(`Project exported successfully!\n\nFiles saved to:\n${folderPath}\n\n- Project JSON file\n- ${state.slides.length} SVG slide(s)`);
  } catch (error) {
    console.error('Error exporting project:', error);
    alert('Error exporting project: ' + error);
  }
}

function updateUI() {
  updateThumbnails();

  if (state.slides.length === 0) {
    elements.emptyState.style.display = 'block';
    elements.slideDisplay.style.display = 'none';
  }
}
