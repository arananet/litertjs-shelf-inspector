export function PrivacyNotice() {
  return (
    <div className="privacy-notice" role="note">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 1a2.5 2.5 0 0 0-2.5 2.5V5H4a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-1.5V3.5A2.5 2.5 0 0 0 8 1zm-1 2.5a1 1 0 0 1 2 0V5H7V3.5zM8 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
      </svg>
      <span>
        Images and camera frames are processed locally in your browser. They are not uploaded by
        this application.
      </span>
    </div>
  );
}
