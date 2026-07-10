export function MissingModelScreen() {
  return (
    <div className="missing-model-screen">
      <h2>No model file found</h2>
      <p>
        The application expects a <code>.tflite</code> object detection model at:
      </p>
      <pre>public/models/detector.tflite</pre>
      <h3>How to add a model</h3>
      <ol>
        <li>
          Download a compatible TFLite object-detection model (e.g., SSD MobileNet V2 from
          TensorFlow Hub).
        </li>
        <li>
          Place it at <code>public/models/detector.tflite</code>.
        </li>
        <li>
          If the model comes with a labels file, place it at{' '}
          <code>public/models/labels.txt</code>.
        </li>
        <li>Restart the development server.</li>
      </ol>
      <p>
        See <code>public/models/README.md</code> for detailed instructions and compatible models.
      </p>
      <div className="mock-notice">
        <strong>Development mode:</strong> The app is running with a mock inference engine that
        generates random detections for UI development and testing.
      </div>
    </div>
  );
}
