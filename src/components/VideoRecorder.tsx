'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Camera,
  Video,
  Mic,
  MicOff,
  RotateCcw,
  Square,
  Play,
  Pause,
  Upload,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  SwitchCamera,
  AlertCircle,
  Clock,
  Heart,
  Send,
} from 'lucide-react';
import { EventItem, VideoWish } from '@/types';

interface VideoRecorderProps {
  event: EventItem;
  onSuccess?: (wish: VideoWish) => void;
}

type RecordingState =
  | 'idle'
  | 'permission-needed'
  | 'preview'
  | 'countdown'
  | 'recording'
  | 'review'
  | 'uploading'
  | 'success';

export function VideoRecorder({ event, onSuccess }: VideoRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [countdown, setCountdown] = useState(3);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [guestName, setGuestName] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [isFallbackUpload, setIsFallbackUpload] = useState(false);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const videoReviewRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const maxDuration = event.maxDurationSec || 45;

  // Cleanup streams
  const stopMediaStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  // Initialize Camera
  const startCamera = useCallback(
    async (facing: 'user' | 'environment' = cameraFacing) => {
      try {
        stopMediaStream();
        setErrorMessage(null);
        setState('preview');

        const constraints: MediaStreamConstraints = {
          audio: { echoCancellation: true, noiseSuppression: true },
          video: {
            facingMode: facing,
            width: { ideal: 1080 },
            height: { ideal: 1920 },
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        mediaStreamRef.current = stream;

        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
          videoPreviewRef.current.play().catch(() => {});
        }

        // Setup audio visualizer meter
        try {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            audioContextRef.current = ctx;
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const updateMeter = () => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const avg = sum / dataArray.length;
              setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
              animationFrameRef.current = requestAnimationFrame(updateMeter);
            };
            updateMeter();
          }
        } catch (e) {
          console.warn('Audio metering not supported or blocked:', e);
        }
      } catch (err: unknown) {
        console.error('Camera access error:', err);
        setErrorMessage(
          'Could not access camera/microphone. Please allow camera permissions in your browser or use the file upload option below.'
        );
        setState('permission-needed');
      }
    },
    [cameraFacing, stopMediaStream]
  );

  // Toggle front/back camera
  const toggleCamera = () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  // Start Countdown then recording
  const handleStartCountdown = () => {
    setState('countdown');
    setCountdown(3);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        startActualRecording();
      }
    }, 1000);
  };

  // Start MediaRecorder
  const startActualRecording = () => {
    if (!mediaStreamRef.current) return;

    recordedChunksRef.current = [];
    setElapsedTime(0);
    setState('recording');

    // Determine supported mime type
    let mimeType = 'video/webm;codecs=vp8,opus';
    if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
      mimeType = 'video/webm;codecs=vp9,opus';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      mimeType = 'video/webm';
    }

    try {
      const recorder = new MediaRecorder(mediaStreamRef.current, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
      });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(recordedChunksRef.current, {
          type: recorder.mimeType || 'video/webm',
        });
        setRecordedBlob(finalBlob);
        const url = URL.createObjectURL(finalBlob);
        setRecordedVideoUrl(url);
        stopMediaStream();
        setState('review');
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250); // Slice every 250ms

      // Start elapsed timer
      let seconds = 0;
      timerIntervalRef.current = setInterval(() => {
        seconds += 1;
        setElapsedTime(seconds);
        if (seconds >= maxDuration) {
          stopRecording();
        }
      }, 1000);
    } catch (e) {
      console.error('Failed to start MediaRecorder:', e);
      setErrorMessage('Recording failed to start. Please try uploading a video file.');
      setState('preview');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // Discard and retry
  const handleRetry = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);
    }
    setRecordedBlob(null);
    setElapsedTime(0);
    setIsFallbackUpload(false);
    startCamera();
  };

  // Handle fallback file upload from file picker
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopMediaStream();
    setRecordedBlob(file);
    const url = URL.createObjectURL(file);
    setRecordedVideoUrl(url);
    setIsFallbackUpload(true);
    setState('review');
  };

  // Submit recorded video to server
  const handleSubmitWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordedBlob) return;
    if (!guestName.trim()) {
      setErrorMessage('Please enter your name so the host knows who this wish is from!');
      return;
    }

    try {
      setState('uploading');
      setUploadProgress(20);
      setErrorMessage(null);

      const formData = new FormData();
      const filename = `recording-${Date.now()}.${recordedBlob.type.includes('mp4') ? 'mp4' : 'webm'}`;
      formData.append('video', recordedBlob, filename);

      setUploadProgress(45);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Video upload failed. Please try again.');
      }

      const uploadData = await uploadRes.json();
      setUploadProgress(75);

      // Create Wish entity
      const wishRes = await fetch(`/api/events/${event.id}/wishes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: guestName.trim(),
          message: guestMessage.trim(),
          videoUrl: uploadData.videoUrl,
          duration: elapsedTime || 15,
          fileSize: uploadData.fileSize,
          mimeType: uploadData.mimeType,
        }),
      });

      if (!wishRes.ok) {
        throw new Error('Failed to submit greeting. Please try again.');
      }

      const wishData = await wishRes.json();
      setUploadProgress(100);
      setState('success');

      // Trigger Confetti explosion
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#fbbf24'],
        });
      } catch {}

      if (onSuccess) {
        onSuccess(wishData.wish);
      }
    } catch (err: unknown) {
      console.error('Submission error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Submission failed');
      setState('review');
    }
  };

  // Mount effect: ask for camera automatically if idle
  useEffect(() => {
    if (state === 'idle') {
      startCamera();
    }
    return () => {
      stopMediaStream();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [startCamera, stopMediaStream, state]);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      {/* Studio Header */}
      <div className="w-full text-center mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Video Wish Studio
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
          {event.name}
        </h1>
        <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
          {event.description || 'Record a video message to be displayed on the venue live wall!'}
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="w-full mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Studio Viewport */}
      <div className="w-full relative aspect-[9/16] max-h-[600px] bg-black rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl flex flex-col items-center justify-center">
        {/* State 1: Permission Needed / Failed */}
        {state === 'permission-needed' && (
          <div className="p-6 text-center flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Camera className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-white text-base">Camera Access Required</h3>
              <p className="text-xs text-zinc-400">
                Please allow camera and microphone permissions in your browser to record your wish.
              </p>
            </div>
            <button
              onClick={() => startCamera()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-lg transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Try Camera Again
            </button>

            <div className="pt-4 border-t border-white/10 w-full">
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/10 cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>Or Upload a Pre-recorded Video</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* State 2: Camera Preview & Active Recording */}
        {(state === 'preview' || state === 'countdown' || state === 'recording') && (
          <>
            <video
              ref={videoPreviewRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {/* Audio level indicator in preview/recording */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs">
              <Mic className={`w-3.5 h-3.5 ${audioLevel > 15 ? 'text-emerald-400' : 'text-zinc-400'}`} />
              <div className="w-12 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-75"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
            </div>

            {/* Camera Switch button top-right */}
            <button
              onClick={toggleCamera}
              disabled={state === 'recording' || state === 'countdown'}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 transition-colors disabled:opacity-30"
              title="Switch camera"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>

            {/* Countdown Overlay */}
            {state === 'countdown' && (
              <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in zoom-in-50 duration-200">
                <div className="w-28 h-28 rounded-full bg-amber-500 text-zinc-950 font-black text-6xl flex items-center justify-center shadow-2xl shadow-amber-500/50 animate-ping">
                  {countdown}
                </div>
              </div>
            )}

            {/* Recording Timer Badge */}
            {state === 'recording' && (
              <div className="absolute top-4 inset-x-0 z-20 flex justify-center">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-600/90 text-white font-bold text-xs tracking-wider uppercase backdrop-blur-md shadow-lg recording-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  <span>
                    REC {elapsedTime}s / {maxDuration}s
                  </span>
                </div>
              </div>
            )}

            {/* Bottom Controls Bar */}
            <div className="absolute bottom-6 inset-x-0 z-20 flex flex-col items-center gap-3 px-6">
              {state === 'preview' && (
                <>
                  <button
                    onClick={handleStartCountdown}
                    className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 p-1.5 shadow-2xl shadow-rose-600/50 transition-transform active:scale-90 hover:scale-105"
                  >
                    <div className="w-full h-full rounded-full border-2 border-white/80 flex items-center justify-center bg-rose-500">
                      <div className="w-7 h-7 rounded-full bg-white shadow-sm" />
                    </div>
                  </button>
                  <span className="text-[11px] font-semibold text-white/90 bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
                    Tap to Record (Max {maxDuration}s)
                  </span>

                  {/* Fallback upload link */}
                  <label className="text-[11px] text-zinc-400 hover:text-white underline cursor-pointer pt-1">
                    Or choose a video from phone gallery
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </>
              )}

              {state === 'recording' && (
                <button
                  onClick={stopRecording}
                  className="w-20 h-20 rounded-full bg-rose-600 p-1.5 shadow-2xl shadow-rose-600/50 transition-transform active:scale-95 hover:scale-105"
                >
                  <div className="w-full h-full rounded-full border-2 border-white flex items-center justify-center bg-zinc-950">
                    <Square className="w-7 h-7 text-rose-500 fill-rose-500 rounded-sm" />
                  </div>
                </button>
              )}
            </div>
          </>
        )}

        {/* State 3: Review Video & Submit Form */}
        {(state === 'review' || state === 'uploading') && (
          <div className="w-full h-full flex flex-col relative">
            {/* Playable Video */}
            <video
              ref={videoReviewRef}
              src={recordedVideoUrl || undefined}
              controls
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Re-record button top-left */}
            <button
              onClick={handleRetry}
              disabled={state === 'uploading'}
              className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs font-semibold text-white hover:bg-black/90 transition-colors disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Redo</span>
            </button>

            {/* Bottom Form Drawer */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/95 to-transparent pt-12 pb-5 px-5 z-20">
              <form onSubmit={handleSubmitWish} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Your Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jessica Miller"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    disabled={state === 'uploading'}
                    className="w-full px-3.5 py-2.5 bg-black/80 border border-white/20 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Optional Note / Greeting
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wishing you endless joy & love!"
                    value={guestMessage}
                    onChange={(e) => setGuestMessage(e.target.value)}
                    disabled={state === 'uploading'}
                    className="w-full px-3.5 py-2 bg-black/80 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {state === 'uploading' ? (
                  <div className="space-y-2 pt-1">
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-rose-500 h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-center text-xs text-amber-400 font-semibold animate-pulse">
                      Uploading video... {uploadProgress}%
                    </p>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold text-sm shadow-xl shadow-amber-500/25 transition-transform active:scale-98"
                  >
                    <Send className="w-4 h-4" /> Send Video Wish
                  </button>
                )}
              </form>
            </div>
          </div>
        )}

        {/* State 4: Success / Celebration Screen */}
        {state === 'success' && (
          <div className="p-8 text-center flex flex-col items-center justify-center h-full space-y-5 bg-gradient-to-b from-amber-500/10 via-black to-black">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">
                Wish Submitted!
              </h2>
              <p className="text-xs text-zinc-300 max-w-xs mx-auto leading-relaxed">
                Thank you, <span className="text-amber-400 font-bold">{guestName}</span>! Your heartfelt greeting has been sent to the host and will be displayed on the venue live wall once approved.
              </p>
            </div>

            <div className="pt-4 flex flex-col gap-2.5 w-full max-w-xs">
              <button
                onClick={handleRetry}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Record Another Message
              </button>

              <a
                href={`/e/${event.id}/wall`}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/30 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" /> View Public Live Wall
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
