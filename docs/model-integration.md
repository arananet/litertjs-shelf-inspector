# Model Integration Guide

## Supported model formats

The application accepts TFLite (`.tflite`) models for object detection. The model runs via LiteRT.js in the browser.

## Default model configuration

The app expects:
- **Model path:** `public/models/detector.tflite`
- **Labels path:** `public/models/labels.txt`
- **Input:** 300x300 RGB, float32, NHWC layout, normalized 0-1
- **Output:** SSD format (boxes, classes, scores, count tensors)

## Adding a model

1. Download a compatible TFLite model
2. Place it at `public/models/detector.tflite`
3. Place labels at `public/models/labels.txt` (one label per line)
4. If the model differs from the default config, update `src/inference/model-config.ts`

## Model configuration fields

```typescript
interface ModelConfig {
  id: string;              // Unique identifier
  name: string;            // Display name
  modelUrl: string;        // Path to .tflite file
  labelsUrl: string;       // Path to labels.txt
  input: {
    width: number;         // Model input width
    height: number;        // Model input height
    layout: 'NHWC' | 'NCHW';
    dataType: 'float32' | 'uint8' | 'int8';
    normalization: ...;    // How to normalize pixel values
  };
  output: {
    decoder: 'ssd' | 'yolo' | 'custom';
    tensorIndexes: Record<string, number>;
  };
  confidenceThreshold: number;
  iouThreshold: number;
  maxDetections: number;
}
```

## Output decoders

### SSD decoder
Expects 4 output tensors:
- `boxes` — [N, 4] bounding boxes (ymin, xmin, ymax, xmax), normalized
- `classes` — [N] class indices
- `scores` — [N] confidence scores
- `count` — [1] number of valid detections

### YOLO decoder
Expects 1 output tensor:
- Format: [N, 5 + num_classes] per detection (cx, cy, w, h, objectness, class_scores...)

## MIME types for deployment

Ensure your static host serves these MIME types:

| Extension | MIME Type |
|-----------|-----------|
| `.tflite` | `application/octet-stream` |
| `.wasm` | `application/wasm` |
| `.txt` | `text/plain` |

## Model licensing

Always verify the redistribution license of any model before including it in a deployment. Common licenses for TFLite models from TensorFlow Hub include Apache 2.0.
