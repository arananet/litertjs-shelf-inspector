import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useInferenceEngine } from './hooks/useInferenceEngine';
import { useCamera } from './hooks/useCamera';
import { StatusBanner } from './components/StatusBanner';
import { PrivacyNotice } from './components/PrivacyNotice';
import { MissingModelScreen } from './components/MissingModelScreen';
import { ErrorDisplay } from './components/ErrorDisplay';
import { ImageUpload } from './features/capture/ImageUpload';
import { CameraControls } from './features/capture/CameraControls';
import { SampleImageLoader } from './features/capture/SampleImageLoader';
import { DetectionCanvas } from './features/detection/DetectionCanvas';
import { ConfidenceSlider } from './features/detection/ConfidenceSlider';
import { ShelfSummaryPanel } from './features/reporting/ShelfSummaryPanel';
import { ExportButton } from './features/reporting/ExportButton';
import { PerformancePanel } from './features/performance/PerformancePanel';
import { computeShelfSummary } from './utils/shelf-analysis';
import { createReport } from './utils/report';
import type { AnalysisReport, ShelfSummary } from './inference/types';
import './App.css';

export default function App() {
  const {
    status,
    error,
    detections,
    metrics,
    backend,
    isMock,
    confidenceThreshold,
    setConfidenceThreshold,
    initAndLoad,
    runInference,
    clearDetections,
  } = useInferenceEngine();

  const camera = useCamera();
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const runningRef = useRef(false);
  const videoRef = camera.videoRef as React.RefObject<HTMLVideoElement | null>;

  useEffect(() => {
    initAndLoad();
  }, [initAndLoad]);

  const summary: ShelfSummary | null = useMemo(() => {
    if (detections.length === 0) return null;
    const w = imageData?.width || 640;
    const h = imageData?.height || 480;
    return computeShelfSummary(detections, w, h);
  }, [detections, imageData]);

  const report: AnalysisReport | null = useMemo(() => {
    if (!summary || !metrics) return null;
    return createReport({
      sourceType: isVideoMode ? 'camera' : 'image',
      width: imageData?.width || 640,
      height: imageData?.height || 480,
      filename: sourceFile?.name,
      metrics,
      modelId: 'ssd-mobilenet-v2',
      modelName: 'SSD MobileNet V2',
      summary,
      detections,
    });
  }, [summary, metrics, isVideoMode, imageData, sourceFile, detections]);

  const handleImageLoad = useCallback(
    async (data: ImageData, file: File) => {
      setImageData(data);
      setSourceFile(file);
      setIsVideoMode(false);
      camera.stop();
      if (status === 'ready') {
        await runInference(data);
      }
    },
    [status, runInference, camera],
  );

  const handleCameraStart = useCallback(async () => {
    setIsVideoMode(true);
    setImageData(null);
    clearDetections();
    await camera.start();
  }, [camera, clearDetections]);

  const handleCameraStop = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
    camera.stop();
    setIsVideoMode(false);
  }, [camera]);

  const startCameraInference = useCallback(async () => {
    if (!videoRef.current || status !== 'ready') return;
    runningRef.current = true;
    setIsRunning(true);

    const loop = async () => {
      if (!runningRef.current || !videoRef.current) {
        setIsRunning(false);
        return;
      }
      await runInference(videoRef.current);
      if (runningRef.current) {
        requestAnimationFrame(() => {
          loop();
        });
      }
    };
    loop();
  }, [status, runInference, videoRef]);

  const pauseCameraInference = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
  }, []);

  const handleClear = useCallback(() => {
    setImageData(null);
    setSourceFile(null);
    setIsVideoMode(false);
    clearDetections();
    camera.stop();
    runningRef.current = false;
    setIsRunning(false);
  }, [clearDetections, camera]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>LiteRT.js Shelf Inspector</h1>
        <PrivacyNotice />
      </header>

      <StatusBanner status={status} backend={backend} isMock={isMock} error={error} />

      {isMock && status === 'ready' && <MissingModelScreen />}

      {error && status === 'failed' && (
        <ErrorDisplay
          title="Initialization Error"
          message="Failed to load the inference engine."
          detail={error}
        />
      )}

      <main className="app-main">
        <section className="capture-section">
          <h2>Input</h2>
          <div className="capture-controls">
            <ImageUpload onImageLoad={handleImageLoad} disabled={status !== 'ready'} />
            <div className="capture-actions">
              <SampleImageLoader onLoad={handleImageLoad} disabled={status !== 'ready'} />
              <CameraControls
                isActive={camera.isActive}
                onStart={handleCameraStart}
                onStop={handleCameraStop}
                error={camera.error}
                disabled={status !== 'ready'}
              />
            </div>
          </div>
        </section>

        {(imageData || isVideoMode) && (
          <section className="detection-section">
            <h2>Detection</h2>
            <div className="detection-toolbar">
              <ConfidenceSlider value={confidenceThreshold} onChange={setConfidenceThreshold} />
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                />
                Show labels
              </label>
              {isVideoMode && (
                <div className="video-controls">
                  {!isRunning ? (
                    <button
                      className="btn btn-primary"
                      onClick={startCameraInference}
                      disabled={status !== 'ready' || !camera.isActive}
                    >
                      Start Inference
                    </button>
                  ) : (
                    <button className="btn btn-warning" onClick={pauseCameraInference}>
                      Pause
                    </button>
                  )}
                </div>
              )}
              <button className="btn btn-outline" onClick={handleClear}>
                Clear
              </button>
            </div>
            <DetectionCanvas
              imageData={imageData}
              videoRef={videoRef}
              detections={detections}
              showLabels={showLabels}
              isVideoMode={isVideoMode}
            />
          </section>
        )}

        {isVideoMode && camera.isActive && (
          <video
            ref={videoRef}
            className="sr-only"
            playsInline
            muted
            aria-hidden="true"
          />
        )}

        <div className="panels-row">
          <ShelfSummaryPanel summary={summary} />
          <PerformancePanel metrics={metrics} />
        </div>

        <div className="export-section">
          <ExportButton report={report} disabled={!report} />
        </div>
      </main>

      <footer className="app-footer">
        <p>LiteRT.js Shelf Inspector — Privacy-first browser AI. No images leave your device.</p>
      </footer>
    </div>
  );
}
