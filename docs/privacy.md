# Privacy Statement

## Core principle

LiteRT.js Shelf Inspector processes all images and camera frames locally in your browser. No image data, camera frames, or inference results are transmitted to any server.

## What stays on your device

- All uploaded images
- All camera frames
- All inference results (bounding boxes, labels, confidence scores)
- All shelf analysis summaries
- All exported JSON reports

## What is downloaded

The following static assets are downloaded from the hosting server when you first load the application:

- The application code (HTML, CSS, JavaScript)
- The TFLite model file (`.tflite`)
- The WebAssembly runtime for CPU fallback
- The label definitions file

These are standard web assets served like any static website. They do not contain or transmit your data.

## No analytics on user content

This application does not:
- Upload images to any server
- Send inference inputs or results to any backend
- Log filenames or detection results remotely
- Use cloud-based inference as a fallback
- Include analytics that capture image content

## JSON export

When you export a JSON report, it is generated and downloaded entirely in the browser. The report contains detection metadata (bounding boxes, labels, confidence scores) but does not include image pixels or base64-encoded image data.

## Network requests

The only network requests made by this application are:
1. Initial page load (HTML, CSS, JS assets)
2. Model file download (`.tflite`)
3. Labels file download (`.txt`)
4. WebAssembly runtime download (if CPU fallback is needed)

All of these are static asset requests. No user data is included in any request.
