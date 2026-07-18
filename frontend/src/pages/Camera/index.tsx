// CropCare — Camera Screen
// See architecture/04_UI_UX_Spec.md §3.5
// File input for gallery; alert for camera in browser mode (Capacitor camera needs native).
// Navigates to /diagnosis/mock-id after submitting.
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, CameraIcon, UploadIcon } from '../../components/icons/index.tsx';

type UploadState = 'idle' | 'preview' | 'submitting';

export default function CameraPage(): React.JSX.Element {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleGalleryClick(): void {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setUploadState('preview');
  }

  function handleCameraClick(): void {
    // In native mode this would use Capacitor Camera plugin.
    // In browser, show a helpful message then fall back to file input.
    const confirmed = window.confirm(
      'Native camera is only available in the Android app.\n\nClick OK to select from gallery instead.'
    );
    if (confirmed) handleGalleryClick();
  }

  function handleSubmit(): void {
    setUploadState('submitting');
    // Simulate upload delay then navigate to diagnosis loading
    setTimeout(() => {
      navigate('/diagnosis-loading');
    }, 800);
  }

  function handleRetake(): void {
    setPreviewUrl(null);
    setUploadState('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh',
      backgroundColor: '#0d1117',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: 'rgba(0,0,0,0.6)',
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      }}>
        <button
          onClick={() => navigate('/home')}
          style={{
            minWidth: '44px', minHeight: '44px', background: 'rgba(255,255,255,0.15)',
            border: 'none', cursor: 'pointer', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label="Go back to home"
        >
          <ChevronLeftIcon size={24} color="#ffffff" />
        </button>
        <span style={{ fontSize: '17px', fontWeight: 600, color: '#ffffff' }}>
          Scan Crop
        </span>
        <div style={{ width: '44px' }} />
      </div>

      {/* Camera viewfinder / preview area */}
      <div style={{
        flex: 1, position: 'relative', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh',
        backgroundColor: '#1a1a2e',
        paddingTop: '70px',
      }}>
        {uploadState === 'idle' && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
            padding: '32px',
          }}>
            {/* Viewfinder frame */}
            <div style={{
              width: 'min(280px, 80vw)', height: 'min(280px, 80vw)',
              border: '2.5px dashed rgba(255,255,255,0.25)', borderRadius: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              {/* Corner brackets */}
              {[
                { top: 0, left: 0, borderTop: '3px solid #1a936f', borderLeft: '3px solid #1a936f', borderRadius: '4px 0 0 0' },
                { top: 0, right: 0, borderTop: '3px solid #1a936f', borderRight: '3px solid #1a936f', borderRadius: '0 4px 0 0' },
                { bottom: 0, left: 0, borderBottom: '3px solid #1a936f', borderLeft: '3px solid #1a936f', borderRadius: '0 0 0 4px' },
                { bottom: 0, right: 0, borderBottom: '3px solid #1a936f', borderRight: '3px solid #1a936f', borderRadius: '0 0 4px 0' },
              ].map((style, i) => (
                <div key={i} style={{ position: 'absolute', width: '24px', height: '24px', ...style }} />
              ))}
              <CameraIcon size={52} color="rgba(255,255,255,0.2)" />
            </div>
            <p style={{
              fontSize: '15px', color: 'rgba(255,255,255,0.65)',
              textAlign: 'center', maxWidth: '240px', lineHeight: 1.5,
            }}>
              Position the affected leaf clearly in frame, in good light
            </p>
          </div>
        )}

        {(uploadState === 'preview' || uploadState === 'submitting') && previewUrl && (
          <div style={{
            width: '100%', height: '100%', minHeight: '60vh',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img
              src={previewUrl}
              alt="Selected crop image"
              style={{
                maxWidth: '100%', maxHeight: '60vh',
                objectFit: 'contain', borderRadius: '12px',
              }}
            />
            {uploadState === 'submitting' && (
              <div style={{
                position: 'absolute', inset: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '12px',
              }}>
                <div style={{ textAlign: 'center', color: '#ffffff' }}>
                  <div style={{
                    width: '48px', height: '48px', border: '3px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#1a936f', borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 12px',
                  }} />
                  <p style={{ fontSize: '15px', margin: 0 }}>Uploading...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom action area */}
      <div style={{
        backgroundColor: '#1a1a2e',
        padding: '20px 20px 36px',
        display: 'flex', flexDirection: 'column', gap: '12px',
      }}>
        {uploadState === 'idle' && (
          <>
            <button
              onClick={handleCameraClick}
              style={{
                height: '56px', width: '100%',
                backgroundColor: '#1a936f', color: '#ffffff',
                border: 'none', borderRadius: '12px',
                fontSize: '17px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              }}
            >
              <CameraIcon size={22} color="#ffffff" />
              Take Photo
            </button>
            <button
              onClick={handleGalleryClick}
              style={{
                height: '56px', width: '100%',
                backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff',
                border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: '12px',
                fontSize: '17px', fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              }}
            >
              <UploadIcon size={22} color="#ffffff" />
              Upload from Gallery
            </button>
          </>
        )}

        {uploadState === 'preview' && (
          <>
            <button
              onClick={handleSubmit}
              style={{
                height: '56px', width: '100%',
                backgroundColor: '#1a936f', color: '#ffffff',
                border: 'none', borderRadius: '12px',
                fontSize: '17px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Analyze This Photo
            </button>
            <button
              onClick={handleRetake}
              style={{
                height: '48px', width: '100%',
                backgroundColor: 'transparent', color: 'rgba(255,255,255,0.7)',
                border: 'none', borderRadius: '8px',
                fontSize: '15px', cursor: 'pointer',
              }}
            >
              Choose Different Photo
            </button>
          </>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      {/* Spin animation */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
