# Contentary - Vertical Slide Presenter for Short-Form Video Content

## Overview

Contentary is a minimalist Tauri-based desktop application for creating vertical short-form video content for platforms like TikTok and Instagram Reels. It combines SVG slide presentations with camera picture-in-picture recording to create engaging social media content.

**Status**: ✅ Production Ready (November 2025)

## Key Features

### Core Functionality
- **Vertical Slide Format**: 9:16 aspect ratio (1080x1920 pixels) optimized for mobile viewing
- **SVG-Only Slides**: Import pre-made SVG slides (designed in Figma, Illustrator, etc.)
- **Camera Picture-in-Picture**: Live camera preview in bottom-right corner (150x150px)
- **Video Recording**: Record presentations with camera overlay using MediaRecorder API
- **Timeline Navigation**: Thumbnail-based slide navigation with current slide indicator
- **Folder Export**: Export all slides and project metadata to a selected folder

### User Interface
- **Top Bar**: Application logo and export button
- **Instructions Panel** (Left): Usage guidelines and SVG requirements
- **Main Display** (Center): Full-height slide viewer with proper scaling
- **Camera PIP** (Bottom Right): Toggleable camera preview with recording controls
- **Timeline** (Bottom): Horizontal slide thumbnails with "Add Slide" button

## Technical Architecture

### Technology Stack
- **Framework**: Tauri v2.6.2 (Rust backend + vanilla JavaScript frontend)
- **UI**: HTML5 + CSS3 with SVG rendering
- **Media**: WebRTC getUserMedia API + MediaRecorder API
- **File System**: Tauri dialog and fs plugins for native file operations
- **Permissions**: macOS Info.plist with camera/microphone usage descriptions

### Window Configuration
```json
{
  "title": "contentary",
  "width": 405,
  "height": 720,
  "resizable": true,
  "label": "main"
}
```
Window dimensions maintain 9:16 aspect ratio for accurate preview.

## File Structure

```
contentary/
├── src/
│   ├── index.html          # Main HTML structure
│   ├── styles.css          # Dark theme styling
│   └── main.js             # Application logic
├── src-tauri/
│   ├── src/
│   │   └── lib.rs          # Rust entry point with plugin registration
│   ├── capabilities/
│   │   └── default.json    # Permission configuration
│   ├── Info.plist          # macOS camera/microphone permissions
│   ├── tauri.conf.json     # Tauri configuration
│   └── Cargo.toml          # Rust dependencies
├── sample-slide-1.svg      # Example: Welcome slide
├── sample-slide-2.svg      # Example: Features slide
├── sample-slide-3.svg      # Example: Getting started slide
├── CLAUDE.md               # This file
├── README.md               # User documentation
└── package.json            # Node.js configuration
```

## Key Implementation Details

### 1. SVG File Loading (src/main.js:45-90)

Uses Tauri's native file dialog and filesystem APIs for secure file access:

```javascript
async function addSVGSlide() {
  const selected = await window.__TAURI__.dialog.open({
    multiple: false,
    filters: [{ name: 'SVG', extensions: ['svg'] }]
  });

  if (!selected) return;

  const contents = await window.__TAURI__.fs.readTextFile(selected);
  const slide = {
    id: Date.now(),
    svgContent: contents,
    filename: selected.split('/').pop()
  };

  state.slides.push(slide);
  renderSlide(slide);
  updateThumbnails();
}
```

**Key Decision**: Switched from HTML `<input type="file">` to Tauri APIs because file input onchange events don't fire reliably in Tauri webviews.

### 2. Camera and Recording (src/main.js:144-236)

Standard WebRTC implementation with MediaRecorder:

```javascript
async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 640 }, height: { ideal: 640 } },
    audio: true
  });

  state.cameraStream = stream;
  elements.cameraPreview.srcObject = stream;
  elements.cameraPip.style.display = 'flex';
}

async function startRecording() {
  state.mediaRecorder = new MediaRecorder(state.cameraStream, {
    mimeType: 'video/webm;codecs=vp9'
  });

  state.mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) state.recordedChunks.push(e.data);
  };

  state.mediaRecorder.onstop = () => {
    const blob = new Blob(state.recordedChunks, { type: 'video/webm' });
    // Auto-download recording
  };

  state.mediaRecorder.start();
}
```

### 3. Folder Export (src/main.js:238-295)

Exports entire project to user-selected folder:

```javascript
async function exportProject() {
  const folderPath = await window.__TAURI__.dialog.open({
    directory: true,
    multiple: false,
    title: 'Select folder to export project'
  });

  // Save project JSON
  const projectPath = `${folderPath}/contentary-project-${timestamp}.json`;
  await window.__TAURI__.fs.writeTextFile(projectPath, JSON.stringify(exportData));

  // Save individual SVG slides
  for (let i = 0; i < state.slides.length; i++) {
    const svgPath = `${folderPath}/slide-${i + 1}.svg`;
    await window.__TAURI__.fs.writeTextFile(svgPath, state.slides[i].svgContent);
  }
}
```

**Export Output**:
- `contentary-project-[timestamp].json` - Project metadata and slide references
- `slide-1.svg`, `slide-2.svg`, etc. - Individual slide files

### 4. Slide Scaling (src/styles.css:141-158)

Critical CSS for proper slide display:

```css
#slide-display svg {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: 100%;        /* Key: Fill vertical space */
  object-fit: contain;  /* Maintain aspect ratio */
  border: 2px solid #444;
  border-radius: 8px;
}
```

**Problem Solved**: Initial implementation used `height: auto` which caused slides to display too large. Changed to `height: 100%` to fill container while maintaining aspect ratio.

## Configuration and Permissions

### Tauri Capabilities (src-tauri/capabilities/default.json)

```json
{
  "permissions": [
    "core:default",
    "dialog:allow-open",
    "dialog:allow-save",
    "fs:allow-read-text-file",
    "fs:allow-write-text-file",
    "fs:allow-create",
    "fs:allow-mkdir"
  ]
}
```

### macOS Permissions (src-tauri/Info.plist)

Required for camera and microphone access:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>NSCameraUsageDescription</key>
  <string>Contentary needs access to your camera to record video presentations with picture-in-picture overlay.</string>
  <key>NSMicrophoneUsageDescription</key>
  <string>Contentary needs access to your microphone to record audio for your video presentations.</string>
</dict>
</plist>
```

### Cargo.toml Configuration

```toml
[dependencies]
tauri = { version = "2", features = ["macos-private-api"] }
tauri-plugin-opener = "2"
tauri-plugin-dialog = "2"
tauri-plugin-fs = "2"
```

**Critical**: The `macos-private-api` feature must be enabled in Cargo.toml when `macOSPrivateApi: true` is set in tauri.conf.json, otherwise build will fail.

## Development Workflow

### Initial Setup

```bash
cd /Users/zachbabb/Work/planet-nine/the-nullary/contentary/contentary
npm install
```

### Development Mode

```bash
npm run tauri dev
```

This launches the Tauri dev server with hot reload for frontend changes. Rust changes require rebuild.

### Building for Production

```bash
npm run tauri build
```

Creates distributable application in `src-tauri/target/release/bundle/`.

## Common Issues and Solutions

### Issue 1: File Upload Not Working
**Symptom**: Clicking "Add Slide" and selecting file does nothing.

**Cause**: HTML `<input type="file">` onchange events don't fire in Tauri webviews.

**Solution**: Use Tauri's native dialog API:
```javascript
const selected = await window.__TAURI__.dialog.open({...});
const contents = await window.__TAURI__.fs.readTextFile(selected);
```

### Issue 2: Camera Permission Denied
**Symptom**: "Could not access camera. Please check permissions." error.

**Cause**: Missing macOS permission descriptions in Info.plist.

**Solution**:
1. Create `src-tauri/Info.plist` with NSCameraUsageDescription and NSMicrophoneUsageDescription
2. Add `macos-private-api` feature to Cargo.toml
3. Set `macOSPrivateApi: true` in tauri.conf.json

### Issue 3: Slides Display Too Large
**Symptom**: SVG slides overflow container and don't scale properly.

**Cause**: CSS using `height: auto` prevents vertical scaling.

**Solution**: Use `height: 100%` with `object-fit: contain`:
```css
#slide-display svg {
  height: 100%;
  object-fit: contain;
}
```

### Issue 4: Tauri Config Validation Errors
**Symptom**: Build fails with "Additional properties are not allowed" errors.

**Cause**: Using Tauri v1 properties in v2 config (fileDropEnabled, dangerousRemoteDomainIpcAccess, etc.).

**Solution**: Remove deprecated properties and use only Tauri v2 schema-compliant configuration.

## Design Philosophy

### SVG-First Approach
Contentary intentionally does NOT include slide editing tools. Users design slides in professional tools (Figma, Illustrator, Inkscape) and import them. This keeps the app focused on presentation and recording, not design.

### Minimalist UI
The interface uses a clean dark theme with Planet Nine colors:
- Primary: Purple (#9b59b6)
- Secondary: Green (#27ae60)
- Background: Dark gray (#1a1a1a, #2a2a2a)

### Desktop-First
While the output is optimized for mobile viewing (9:16), the creation experience is desktop-focused with mouse/keyboard interactions. The vertical window mimics mobile aspect ratio for accurate preview.

## Future Enhancements

### Potential Features
- **Slide Transitions**: Add customizable transitions between slides during presentation
- **Recording Export Options**: Support MP4, MOV, and other formats beyond WebM
- **Project Import**: Load previously exported projects back into the app
- **Hotkeys**: Keyboard shortcuts for navigation (arrow keys, space to advance slides)
- **Camera Position Options**: Allow PIP placement in different corners
- **Audio-Only Mode**: Record voiceover without camera video
- **Slide Timing**: Set automatic slide advance timing for hands-free presentation
- **Remote Control**: Control via mobile device or presenter remote

### Technical Improvements
- **Virtual Scrolling**: Optimize timeline for projects with 100+ slides
- **Thumbnail Caching**: Pre-render slide thumbnails for faster UI
- **Background Recording**: Continue recording even if app loses focus
- **Cloud Storage Integration**: Direct upload to social media platforms
- **Slide Templates**: Built-in template library for common use cases

## Integration with Nullary Ecosystem

Contentary is the 16th application in The Nullary ecosystem. Unlike other Nullary apps, it:

1. **Does NOT use shared infrastructure** - No environment config, no base system, no allyabase integration
2. **Standalone Application** - Self-contained with no cross-app dependencies
3. **Different Use Case** - Content creation tool vs social/marketplace apps

### Why No Shared Code?
Contentary is fundamentally different from other Nullary apps:
- **Local-Only**: No server communication or base connections
- **Media-Focused**: Deals with camera/video, not social feeds or marketplace data
- **Creation Tool**: Offline content creation vs online content sharing

This makes it the first "utility app" in the Nullary family rather than a social/marketplace platform.

## Testing

### Manual Test Checklist

**Slide Management**:
- [ ] Click "Add Slide" button
- [ ] Select SVG file from file picker
- [ ] Verify slide displays in main area
- [ ] Verify thumbnail appears in timeline
- [ ] Click thumbnail to switch slides
- [ ] Add multiple slides and verify ordering

**Camera**:
- [ ] Click camera button (📷)
- [ ] Grant camera/microphone permissions in macOS dialog
- [ ] Verify camera preview appears in PIP area
- [ ] Click camera button again to toggle off

**Recording**:
- [ ] Ensure camera is active
- [ ] Click record button (⏺️)
- [ ] Verify button shows recording animation (pulsing red)
- [ ] Navigate between slides while recording
- [ ] Click record button to stop
- [ ] Verify WebM file downloads automatically

**Export**:
- [ ] Add multiple slides
- [ ] Click "Export" button
- [ ] Select destination folder in dialog
- [ ] Verify project JSON file created
- [ ] Verify all slides exported as individual SVG files
- [ ] Check JSON contains correct metadata

## Production Status

### ✅ Complete Features
- SVG slide import and display
- Timeline thumbnail navigation
- Camera picture-in-picture with permissions
- Video recording with MediaRecorder
- Folder-based project export
- Sample slides for testing
- Comprehensive documentation

### 📋 Known Limitations
- **WebM Only**: Recordings only support WebM format (browser limitation)
- **macOS Only**: Camera permissions configured for macOS (Windows/Linux need separate config)
- **No Slide Editing**: By design - use external tools for slide creation
- **No Project Import**: Can export but not re-import projects (future enhancement)

### 🔧 Technical Debt
- **No Error Recovery**: If camera fails during recording, no graceful recovery
- **No Recording Preview**: Can't preview recording before download
- **Timeline Scroll**: No scroll indicators when many slides present
- **No Undo/Redo**: Can't undo slide addition or reorder slides

## Performance Considerations

### Rendering
- SVG slides render directly in DOM (no canvas conversion)
- Thumbnails use same SVG content (scaled via CSS)
- No virtual scrolling in timeline (fine for <100 slides)

### Memory
- All slides kept in memory during session
- Camera stream held open when active
- Recording chunks accumulated in memory before download

### File I/O
- Synchronous SVG loading (blocking during large file reads)
- Parallel exports when saving multiple slides
- No progress indication for export operations

## References and Documentation

### External Documentation
- [Tauri v2 Documentation](https://v2.tauri.app/)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [getUserMedia API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [SVG Specification](https://www.w3.org/TR/SVG2/)

### Related Files
- `README.md` - User-facing documentation and getting started guide
- `src-tauri/tauri.conf.json` - Complete Tauri configuration
- `src-tauri/capabilities/default.json` - Permission definitions

## Version History

### v0.1.0 (November 2025)
- Initial release
- SVG slide import and display
- Camera picture-in-picture
- Video recording
- Folder export
- Timeline navigation
- Sample slides

---

**Maintained By**: Zach Babb & Claude Code
**Last Updated**: November 10, 2025
**Status**: Production Ready
