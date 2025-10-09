// src/components/CameraModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { PrimaryButton, GlassCard } from './componentsUtilityUI.jsx'; // Import UI
import { loadFaceDetectionModel, detectFace } from '../utils/faceDetection'; // Import Logic AI
import { showSwal } from '../utils/constants'; // Import helper
const CameraModal = ({ isOpen, onClose, onCapture, user, title = "Ambil Foto Selfie untuk Absensi" }) => {
    // --- STATE DAN REF (Dipindahkan dari CameraModal di App.jsx) ---
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [captureConfirmed, setCaptureConfirmed] = useState(false);
    const [modelLoading, setModelLoading] = useState(false);
    const [detector, setDetector] = useState(null);
    const [streamReady, setStreamReady] = useState(false);

    // --- EFFECT UNTUK MEMUAT MODEL (Dipindahkan dari CameraModal di App.jsx) ---
    useEffect(() => {
        if (isOpen && !isModelLoaded && !modelLoading) {
            setModelLoading(true);
            loadFaceDetectionModel(setModelLoading)
                .then(d => {
                    setDetector(d);
                    setIsModelLoaded(!!d);
                })
                .catch(e => {
                    console.error("Error loading model in modal:", e);
                    setIsModelLoaded(false);
                });
        }
    }, [isOpen, isModelLoaded, modelLoading]);

    // --- FUNGSI DETEKSI WAJAH (Dipindahkan dari CameraModal di App.jsx) ---
    useEffect(() => {
        if (!isOpen || !isModelLoaded || !detector || !streamReady) {
            return;
        }

        let animationFrameId;

        const drawFace = (face) => {
    if (!webcamRef.current || !webcamRef.current.video) return; // ✅ safety check
    const canvas = canvasRef.current;
    const video = webcamRef.current.video;
    if (!canvas || !video.videoWidth) return; // ✅ pastikan video udah punya dimensi

    const ctx = canvas.getContext('2d');
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    ctx.clearRect(0, 0, videoWidth, videoHeight);

    if (face && face.box) {
        const box = face.box;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
        ctx.lineWidth = 3;
        ctx.strokeRect(box.xMin, box.yMin, box.xMax - box.xMin, box.yMax - box.yMin);
    }
};


       const runDetection = async () => {
    if (
        !detector ||
        !webcamRef.current ||
        !webcamRef.current.video ||
        webcamRef.current.video.readyState !== 4
    ) {
        animationFrameId = requestAnimationFrame(runDetection);
        return;
    }

    const video = webcamRef.current.video;
    const face = await detectFace(detector, video);
    if (!face) {
  console.log("❌ Tidak ada wajah terdeteksi di frame ini");
} else {
  console.log("✅ Wajah terdeteksi:", face.box);
}
    const detected = !!face && face.keypoints?.length > 0;
    setFaceDetected(detected);
    drawFace(face);
     animationFrameId = requestAnimationFrame(runDetection);
    
};

        runDetection();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isOpen, isModelLoaded, detector, streamReady]);

    // --- HANDLER KAMERA (Dipindahkan dari CameraModal di App.jsx) ---
    const handleCaptureConfirm = () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            onCapture(imageSrc);
            // Reset state saat modal ditutup
            setFaceDetected(false);
            setCaptureConfirmed(false);
            setStreamReady(false);
        }
        onClose();
    };
    
    // Handler untuk memastikan stream sudah siap
    const handleVideoReady = () => {
        setStreamReady(true);
    };

    if (!isOpen) return null;
    
    // --- JSX RENDER MODAL (Dipindahkan dari CameraModal di App.jsx) ---
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <GlassCard 
                className="w-full max-w-lg p-6 relative border border-gray-700 bg-gray-800/80" 
                onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal menutup modal
            >
                <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
                
                {/* Tombol Tutup */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
                    <i className="fas fa-times text-xl"></i>
                </button>

                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-700">
                    {/* Webcam & Canvas */}
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        mirrored={true} // <== Biar tampilan mirror
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover"
                          videoConstraints={{
                                     facingMode: "user",
                                      width: { ideal: 640 },
                                     height: { ideal: 480 }
                                       }}
                        onUserMedia={handleVideoReady}
                        onUserMediaError={() => showSwal("Error Kamera", "Gagal mengakses kamera. Pastikan izin kamera telah diberikan.", "error")}
                    />
                    <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full"></canvas>

                    {/* Overlay Info */}
                    <div className="absolute top-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-xs flex justify-between">
                        {isModelLoaded && streamReady ? (
                            <span className={`font-semibold ${faceDetected ? 'text-green-400' : 'text-red-400'}`}>
                                <i className={`fas ${faceDetected ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-1`}></i>
                                {faceDetected ? 'Wajah Terdeteksi' : 'Wajah Belum Terdeteksi'}
                            </span>
                        ) : (
                            <span className="text-yellow-400 font-semibold">
                                <i className="fas fa-spinner fa-spin mr-1"></i> Memuat AI...
                            </span>
                        )}
                        <span className="text-gray-400">{user.name}</span>
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="mt-4 flex justify-end space-x-3">
                    <PrimaryButton onClick={onClose} className="bg-gray-500 hover:bg-gray-600">
                        Batal
                    </PrimaryButton>
                    <PrimaryButton onClick={handleCaptureConfirm} disabled={!faceDetected || !isModelLoaded || !streamReady}>
                        <i className="fas fa-camera mr-2"></i> Konfirmasi Foto
                    </PrimaryButton>
                </div>
            </GlassCard>
        </div>
    );
};

export default CameraModal;