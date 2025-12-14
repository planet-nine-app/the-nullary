# Contentary

A vertical slide presenter app for creating short-form video content optimized for TikTok and Instagram Reels.

## Overview

Contentary is a **slide presenter** - not a slide editor. You create beautiful vertical SVG slides in your favorite design tool (Figma, Illustrator, Inkscape, etc.), then import them into contentary to present them with your camera overlay. Perfect for creating engaging educational content, tutorials, and marketing videos for social media.

## Key Features

### SVG-Only Slide System
- Import pre-made SVG slides (1080x1920)
- Timeline view with thumbnails
- Click to navigate between slides
- Clean, professional presentation interface

### Camera Picture-in-Picture
- Live camera preview in bottom-right corner (always visible)
- Toggle camera on/off
- Appears over your slides during recording
- Optimized for talking-head style videos

### Video Recording
- Record yourself presenting your slides
- Camera overlay automatically included
- Recordings download as WebM files
- Ready to upload to TikTok, Instagram, YouTube Shorts

### Simple Export
- Export project data as JSON
- Camera recordings automatically saved
- All files ready for post-production

## Getting Started

### Development
```bash
npm install
npm run tauri dev
```

### Build for Production
```bash
npm run tauri build
```

## How to Use

1. **Design Your Slides**
   - Create vertical SVG slides (1080x1920) in Figma, Illustrator, Inkscape, or any design tool
   - Export as SVG files
   - Keep your branding consistent across slides

2. **Import to Contentary**
   - Click the "+ Add Slide" button in the timeline
   - Select your SVG file
   - Repeat for all slides

3. **Present & Record**
   - Click slides in the timeline to navigate
   - Click 📷 to enable camera (appears in bottom-right)
   - Click ⏺️ to start recording
   - Present your slides naturally
   - Click ⏺️ again to stop recording

4. **Export**
   - Recording automatically downloads when you stop
   - Click "Export" to save project data
   - Upload videos to your social platforms

## SVG Requirements

- **Dimensions**: 1080x1920 pixels (9:16 aspect ratio)
- **Format**: SVG files only
- **Orientation**: Vertical (portrait mode)
- **Design Tools**: Works with SVGs from any tool:
  - Figma (export as SVG)
  - Adobe Illustrator
  - Inkscape
  - Sketch
  - Canva (Pro)
  - Any other SVG-capable design tool

## Sample Slides

Three sample slides are included in the project directory:
- `sample-slide-1.svg` - Welcome slide
- `sample-slide-2.svg` - Features list
- `sample-slide-3.svg` - Getting started steps

Use these to test the app or as templates for your own designs.

## Technical Details

- **Framework**: Tauri v2 with Vanilla JavaScript
- **UI**: Clean, minimal interface focused on presentation
- **Video**: WebRTC MediaRecorder API
- **Output Format**: WebM video files
- **Window Size**: 405x720 (maintains 9:16 ratio)

## Perfect For

- Educational content creators
- Tutorial videos
- Product demonstrations
- Marketing presentations
- Quick tips and how-tos
- Social media content
- TikTok videos
- Instagram Reels
- YouTube Shorts

## Design Workflow

**Recommended Workflow:**

1. **Figma/Illustrator**: Design all your slides
2. **Export**: Save each frame as SVG
3. **Contentary**: Import and present
4. **Record**: Add your voice and presence
5. **Edit** (optional): Touch up in video editor
6. **Publish**: Upload to social media

## Why SVG-Only?

- **Quality**: Infinite scalability, always crisp
- **Flexibility**: Create slides in tools you already know
- **Speed**: No in-app editing means faster workflow
- **Professional**: Better results from dedicated design tools
- **Reusable**: Use the same SVGs across multiple presentations

## Future Enhancements

- Slide transitions and timing
- Audio narration with waveform
- Template marketplace
- Direct upload to social platforms
- Slide notes/teleprompter
- Multi-camera support
- Green screen effects

---

**Part of the-nullary collection** | Built with the Planet Nine ecosystem

Create your slides anywhere. Present them here.
