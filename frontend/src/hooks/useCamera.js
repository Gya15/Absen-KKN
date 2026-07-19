import { useState, useRef, useCallback, useEffect } from 'react';

export default function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const isStarting = useRef(false);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);

  const startCamera = useCallback(async () => {
    if (isStarting.current || streamRef.current) return;
    isStarting.current = true;
    
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user'
        },
        audio: false,
      });

      // If stopCamera was called while we were waiting for permissions:
      if (!isStarting.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Force play immediately and handle promise rejection
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((e) => {
            console.warn('Auto-play blocked, retrying...', e);
            // Sometimes it needs a small timeout on mobile
            setTimeout(() => {
              videoRef.current?.play().catch(() => {});
            }, 500);
          });
        }
      }

      setIsActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Akses kamera ditolak. Harap izinkan akses kamera di pengaturan browser.');
      } else if (err.name === 'NotFoundError') {
        setError('Kamera tidak ditemukan. Pastikan perangkat memiliki kamera.');
      } else {
        setError('Gagal mengakses kamera: ' + err.message);
      }
    } finally {
      isStarting.current = false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    isStarting.current = false; // Cancel any pending starts
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !isActive) return null;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    // Mirror horizontally for selfie camera
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    return canvas;
  }, [isActive]);

  const captureBase64 = useCallback(
    (quality = 0.85) => {
      const canvas = captureFrame();
      if (!canvas) return null;
      return canvas.toDataURL('image/jpeg', quality);
    },
    [captureFrame]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    isActive,
    error,
    startCamera,
    stopCamera,
    captureFrame,
    captureBase64,
  };
}
