// CropCare — Camera Screen (production wiring)
// Calls POST /diagnoses via submitDiagnosis service.
// Navigates to /diagnosis/:id with the real diagnosis_id.
// See architecture/04_UI_UX_Spec.md §3.5
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, CameraIcon, UploadIcon } from '../../components/icons/index.tsx';
import { submitDiagnosis } from '../../services/diagnosisService.ts';
import { ApiError } from '../../services/api.ts';

type UploadState = 'idle' | 'preview' | 'submitting';

export default function CameraPage(): React.JSX.Element {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleGalleryClick(): void {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
    setUploadState('preview');
  }

  function handleCameraClick(): void {
    const confirmed = window.confirm(
      'Native camera is only available in the Android app.\n\nClick OK to select from gallery instead.'
    );
    if (confirmed) handleGalleryClick();
  }

  async function handleSubmit(): Promise<void> {
    if (!selectedFile) return;
    setUploadState('submitting');
    setError(null);
    try {
      let lat: number | undefined;
      let lng: number | undefined;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch { /* location denied — proceed without it */ }
      const result = await submitDiagnosis(selectedFile, lat, lng);
      navigate(`/diagnosis/${result.diagnosis_id}`, { replace: true });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Upload failed. Please try again.';
      setError(msg);
      setUploadState('preview');
    }
  }

  function handleRetake(): void {
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
    setUploadState('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0d1117', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'rgba(0,0,0,0.6)', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <button onClick={() => navigate('/home')} style={{ minWidth: '44px', minHeight: '44px', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Go back to home">
          <ChevronLeftIcon size={24} color="#ffffff" />
        </button>
        <span style={{ fontSize: '17px', fontWeight: 600, color: '#ffffff' }}>Scan Crop</span>
        <div style={{ width: '44px' }} />
      </div>

      {/* Viewfinder area */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', backgroundColor: '#1a1a2e', paddingTop: '70px' }}>
        {uploadState === 'idle' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '32px' }}>
            <div style={{ width: 'min(280px, 80vw)', height: 'min(280px, 80vw)', border: '2.5px dashed rgba(255,255,255,0.25)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {[{ top: 0, left: 0, borderTop: '3px solid #1a936f', borderLeft: '3px solid #1a936f', borderRadius: '4px 0 0 0' }, { top: 0, right: 0, borderTop: '3px solid #1a936f', borderRight: '3px solid #1a936f', borderRadius: '0 4px 0 0' }, { bottom: 0, left: 0, borderBottom: '3px solid #1a936f', borderLeft: '3px solid #1a936f', borderRadius: '0 0 0 4px' }, { bottom: 0, right: 0, borderBottom: '3px solid #1a936f', borderRight: '3px solid #1a936f', borderRadius: '0 0 4px 0' }].map((s, i) => (
                <div key={i} style={{ position: 'absolute', width: '24px', height: '24px', ...s }} />
              ))}
              <CameraIcon size={52} color="rgba(255,255,255,0.2)" />
            </div>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', textAlign: 'center', maxWidth: '240px', lineHeight: 1.5 }}>
              Position the affected leaf clearly in frame, in good light
            </p>
          </div>
        )}
        {(uploadState === 'preview' || uploadState === 'submitting') && previewUrl && (
          <div style={{ width: '100%', height: '100%', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={previewUrl} alt="Selected crop image" style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '12px' }} />
            {uploadState === 'submitting' && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#1a936f', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p style={{ fontSize: '16px', color: '#ffffff', margin: 0, fontWeight: 500 }}>Analyzing your crop...</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>This may take up to 10 seconds</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div style={{ backgroundColor: '#1a1a2e', padding: '20px 20px 36px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {error && (
          <div style={{ backgroundColor: 'rgba(193,18,31,0.15)', border: '1px solid rgba(193,18,31,0.4)', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', color: '#fca5a5', textAlign: 'center' }}>
            {error}
          </div>
        )}
        {uploadState === 'idle' && (
          <>
            <button onClick={handleCameraClick} style={{ height: '56px', width: '100%', backgroundColor: '#1a936f', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '17px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <CameraIcon size={22} color="#ffffff" /> Take Photo
            </button>
            <button onClick={handleGalleryClick} style={{ height: '56px', width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '17px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <UploadIcon size={22} color="#ffffff" /> Upload from Gallery
            </button>
          </>
        )}
        {uploadState === 'preview' && (
          <>
            <button onClick={handleSubmit} style={{ height: '56px', width: '100%', backgroundColor: '#1a936f', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '17px', fontWeight: 600, cursor: 'pointer' }}>
              Analyze This Photo
            </button>
            <button onClick={handleRetake} style={{ height: '48px', width: '100%', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' }}>
              Choose Different Photo
            </button>
          </>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" onChange={handleFileChange} style={{ display: 'none' }} aria-hidden="true" />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
