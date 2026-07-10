# Model Files

This directory should contain the TFLite model and label files used by the Shelf Inspector.

## Expected files

- `detector.tflite` — The object detection model in TFLite format
- `labels.txt` — One class label per line (matching the model's class indices)

## Compatible models

The default configuration expects an SSD MobileNet V2 model. Compatible models include:

1. **SSD MobileNet V2** (COCO) — General object detection
   - Input: 300x300 RGB, float32, normalized 0-1
   - Output: SSD format (boxes, classes, scores, count)
   - Download from TensorFlow Hub or TF Model Garden

2. **EfficientDet-Lite** — Higher accuracy, slower
   - Input: varies by variant (320x320 to 640x640)
   - Output: SSD-style

## Setup

1. Download a compatible `.tflite` model
2. Place it in this directory as `detector.tflite`
3. Place the corresponding labels file as `labels.txt`
4. Update `src/inference/model-config.ts` if the model's input/output differs from the default

## Model configuration

Each model may have different:
- Input dimensions
- Normalization (0-1, -1 to 1, mean/std)
- Output tensor layout (SSD vs YOLO)
- Number of classes

Update the `ModelConfig` in `src/inference/model-config.ts` to match your model.

## Licensing

Do not commit model files to this repository unless their redistribution license has been verified. Many TFLite models from TensorFlow Hub are Apache 2.0 licensed — check before distributing.
