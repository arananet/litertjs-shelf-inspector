# litertjs-shelf-inspector

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black) ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white) ![OpenSpec](https://img.shields.io/badge/OpenSpec-enforced-blueviolet) ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

> Privacy-first retail shelf inspection in the browser using LiteRT.js, WebGPU and on-device object detection—no images or inference data leave the device.

---

## Quick start

```bash
# 1. Clone and install
git clone https://github.com/arananet/litertjs-shelf-inspector.git
cd litertjs-shelf-inspector
npm install

# 2. Run development server
npm run dev

# 3. Run tests
npm test

# 4. Build for production
npm run build
```

## Usage

1. Open the app in a WebGPU-capable browser (Chrome 113+, Edge 113+).
2. Upload an image or start your webcam.
3. The app loads a `.tflite` object-detection model entirely in the browser.
4. Bounding boxes, labels, and confidence scores are overlaid on the image/video.
5. View the shelf-analysis summary and export results as JSON.

**Privacy guarantee:** Images and camera frames are processed locally in your browser. They are not uploaded by this application.

### Model setup

The app expects a `.tflite` model at `public/models/detector.tflite`. See [`public/models/README.md`](public/models/README.md) for placement instructions. A mock inference engine is included for development and testing.

---

## Architecture

```
src/
  app/              — App shell, layout, providers
  components/       — Shared UI components
  features/
    capture/        — Image upload, webcam, drag-and-drop
    detection/      — Detection view, bounding boxes, overlays
    reporting/      — Shelf summary, JSON export
    performance/    — Timing metrics, FPS counter
  inference/        — Inference engine abstraction
    litert-adapter  — LiteRT.js WebGPU/Wasm implementation
    mock-adapter    — Mock engine for dev/tests
    postprocess/    — SSD/YOLO decoders, NMS
  hooks/            — Shared React hooks
  utils/            — Pure utility functions
  workers/          — Web Worker for NMS offloading
```

See [`docs/architecture.md`](docs/architecture.md) for details.

---

## Browser requirements

| Browser | WebGPU | Wasm fallback |
|---------|--------|---------------|
| Chrome 113+ | Yes | Yes |
| Edge 113+ | Yes | Yes |
| Safari 18+ | Yes | Yes |
| Firefox | Best effort | Yes |

When WebGPU is unavailable, the app falls back to CPU/Wasm inference automatically (slower).

---

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server
npm test          # Run tests
npm run lint      # Lint code
npm run build     # Production build
npm run preview   # Preview production build
```

---

## Privacy

- All inference runs locally in the browser using LiteRT.js.
- No images, camera frames, or detection results are sent to any server.
- The `.tflite` model and WebAssembly runtime are downloaded as static assets; user data stays on-device.
- See [`docs/privacy.md`](docs/privacy.md) for the full privacy statement.

---

## Known limitations

- Object detection accuracy depends on the supplied `.tflite` model.
- Occupancy and empty-space metrics are visual estimates, not precise measurements.
- True out-of-stock detection requires brand-specific training data not included here.
- WebGPU support varies by browser and GPU driver.
- WebNN is not part of the current release (experimental browser support).

---

## Roadmap

- [ ] WebNN backend when browser support stabilizes
- [ ] Multiple model comparison side-by-side
- [ ] Batch image processing
- [ ] PWA offline support
- [ ] Custom model upload from the UI

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Model not found" error | Place a `.tflite` file at `public/models/detector.tflite`. See `public/models/README.md`. |
| WebGPU not detected | Use Chrome 113+ or Edge 113+. Check `chrome://gpu` for WebGPU status. |
| Slow inference | WebGPU is unavailable; the app fell back to Wasm/CPU. Try a WebGPU-capable browser. |
| Camera not working | Grant camera permissions. HTTPS is required for camera access in most browsers. |
| Build fails | Ensure Node.js 20+ and run `npm install` first. |

---

## Contributing

This project uses **OpenSpec** for spec-driven development — every feature
or bugfix starts with a spec file under `.openspec/specs/`. See
[`docs/OPENSPEC.md`](docs/OPENSPEC.md) for the full workflow, or
[`CONTRIBUTING.md`](CONTRIBUTING.md) for the contributor checklist.

---

## Documentation

| Topic | Where |
|---|---|
| Architecture | [`docs/architecture.md`](docs/architecture.md) |
| Model integration | [`docs/model-integration.md`](docs/model-integration.md) |
| Privacy | [`docs/privacy.md`](docs/privacy.md) |
| Spec-driven workflow | [`docs/OPENSPEC.md`](docs/OPENSPEC.md) |
| Branch protection | [`docs/BRANCH_PROTECTION.md`](docs/BRANCH_PROTECTION.md) |
| Security policy | [`SECURITY.md`](SECURITY.md) |
| Support | [`SUPPORT.md`](SUPPORT.md) |
| Changelog | [`CHANGELOG.md`](CHANGELOG.md) |

---

## Deployment

This is a static site. Deploy the `dist/` folder to any static host:

**GitHub Pages:**
```bash
npm run build
# Push dist/ to gh-pages branch or configure GitHub Pages to serve from dist/
```

**Azure Static Web Apps:**
```bash
npm run build
# Configure app_location: "/" and output_location: "dist" in your workflow
```

Ensure `.tflite`, `.wasm`, and label files are served with correct MIME types. See [`docs/model-integration.md`](docs/model-integration.md).

---

## License

[MIT](LICENSE)

---

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/H2H51MPWG)
