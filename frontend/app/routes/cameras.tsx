import { useEffect, useRef, useState } from 'react';
import { MdVideocam, MdVideocamOff, MdPerson, MdCheckCircle, MdCancel } from 'react-icons/md';

interface DetectionResult {
  match: boolean;
  person_id?: number;
  person_name?: string;
  confidence?: number;
  message: string;
  faces_detected?: number;
  closest_match?: {
    person_id: number;
    person_name: string;
    confidence: number;
  };
  persons?: Array<{
    person_id: number | null;
    person_name: string;
    confidence: number;
    closest_match?: {
      person_id: number;
      person_name: string;
      confidence: number;
    };
  }>;
  motion?: {
    detected: boolean;
    motion: boolean;
    intensity: number;
    moving_objects?: number;
    message?: string;
  };
}

export default function Cameras() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastResult, setLastResult] = useState<DetectionResult | null>(null);
  const [detecting, setDetecting] = useState(false);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      console.log('Requesting camera access...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      console.log('Camera access granted', mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          videoRef.current?.play().then(() => {
            console.log('Video playing');
            setIsStreaming(true);
          }).catch(err => {
            console.error('Error playing video:', err);
            setError('Failed to play video stream');
          });
        };
        
        setStream(mediaStream);
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions in your browser.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera and try again.');
      } else {
        setError(`Failed to access camera: ${err.message}`);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setStream(null);
      setIsStreaming(false);
      stopDetection();
    }
  };

  const captureFrame = async (): Promise<Blob | null> => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
    });
  };

  const detectFace = async () => {
    if (detecting) return;

    setDetecting(true);
    
    try {
      const frameBlob = await captureFrame();

      if (!frameBlob) {
        console.log('Failed to capture frame');
        setDetecting(false);
        return;
      }

      console.log('Sending frame for detection...');
      const formData = new FormData();
      formData.append('file', frameBlob, 'frame.jpg');

      const response = await fetch('http://localhost:8000/api/v1/faces/verify', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Detection result:', data);
      setLastResult(data);
    } catch (error) {
      console.error('Detection error:', error);
    } finally {
      setDetecting(false);
    }
  };

  const startDetection = () => {
    setIsDetecting(true);
    setLastResult(null);
    // Detect every 2 seconds
    detectionIntervalRef.current = setInterval(() => {
      detectFace();
    }, 2000);
  };

  const stopDetection = () => {
    setIsDetecting(false);
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      stopDetection();
    };
  }, [stream]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-5xl font-bold text-gray-800">Live Camera</h1>
          <p className="text-gray-600 mt-2">Real-time face detection</p>
        </div>
        <div className="flex gap-3">
          {isStreaming && (
            <button
              onClick={isDetecting ? stopDetection : startDetection}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition shadow-lg ${
                isDetecting
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <MdPerson className="text-xl" />
              {isDetecting ? 'Stop Detection' : 'Start Detection'}
            </button>
          )}
          <button
            onClick={isStreaming ? stopCamera : startCamera}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition shadow-lg ${
              isStreaming
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {isStreaming ? (
              <>
                <MdVideocamOff className="text-xl" />
                Stop Camera
              </>
            ) : (
              <>
                <MdVideocam className="text-xl" />
                Start Camera
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
          <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isStreaming ? 'block' : 'hidden'}`}
            />
            <canvas ref={canvasRef} className="hidden" />
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MdVideocamOff className="text-6xl mx-auto mb-4" />
                  <p className="text-lg">Camera is off</p>
                  <p className="text-sm mt-2">Click "Start Camera" to begin</p>
                </div>
              </div>
            )}
            {isDetecting && (
              <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm">Detecting...</span>
              </div>
            )}
          </div>

          {isStreaming && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          )}
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Detection Result</h2>
          
          {!lastResult ? (
            <div className="text-center py-12 text-gray-500">
              <p>Start detection to see results</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Multiple faces detected */}
              {lastResult.persons && lastResult.persons.length > 1 ? (
                <>
                  <div className="bg-blue-100 p-4 rounded-xl">
                    <h3 className="font-semibold text-lg text-blue-800 mb-2">
                      {lastResult.faces_detected} Faces Detected
                    </h3>
                  </div>
                  
                  {lastResult.persons.map((person, idx) => (
                    <div key={idx} className={`p-4 rounded-xl ${
                      person.person_id ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        {person.person_id ? (
                          <MdCheckCircle className="text-2xl text-emerald-600" />
                        ) : (
                          <MdCancel className="text-2xl text-red-600" />
                        )}
                        <h4 className={`font-semibold ${
                          person.person_id ? 'text-emerald-800' : 'text-red-800'
                        }`}>
                          Face {idx + 1}: {person.person_name}
                        </h4>
                      </div>
                      
                      {person.person_id && (
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-700">
                            <span className="font-medium">ID:</span> {person.person_id}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium">Confidence:</span> {person.confidence}%
                          </p>
                        </div>
                      )}
                      
                      {!person.person_id && person.closest_match && (
                        <div className="bg-yellow-50 p-2 rounded mt-2 text-sm">
                          <p className="text-yellow-800 font-medium">Closest: {person.closest_match.person_name} ({person.closest_match.confidence}%)</p>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                /* Single face */
                <>
                  <div className={`flex items-center gap-3 p-4 rounded-xl ${
                    lastResult.match ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    {lastResult.match ? (
                      <MdCheckCircle className="text-3xl text-emerald-600" />
                    ) : (
                      <MdCancel className="text-3xl text-red-600" />
                    )}
                    <div>
                      <h3 className={`font-semibold text-lg ${
                        lastResult.match ? 'text-emerald-800' : 'text-red-800'
                      }`}>
                        {lastResult.match ? 'Match Found' : 'Unknown Person'}
                      </h3>
                      <p className={`text-sm ${
                        lastResult.match ? 'text-emerald-700' : 'text-red-700'
                      }`}>
                        {lastResult.message}
                      </p>
                    </div>
                  </div>
                  
                  {lastResult.match && (
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-600">Person Name</p>
                        <p className="text-lg font-semibold text-gray-800">{lastResult.person_name}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-600">Person ID</p>
                        <p className="text-lg font-semibold text-gray-800">{lastResult.person_id}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-600">Confidence</p>
                        <p className="text-lg font-semibold text-gray-800">{lastResult.confidence}%</p>
                      </div>
                    </div>
                  )}
                  
                  {!lastResult.match && lastResult.closest_match && (
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                      <p className="text-sm text-yellow-800 font-medium mb-2">Closest Match</p>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-700">
                          <span className="font-medium">User:</span> {lastResult.closest_match.person_name}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">ID:</span> {lastResult.closest_match.person_id}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Similarity:</span> {lastResult.closest_match.confidence}%
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {/* Motion Detection */}
              {lastResult.motion && lastResult.motion.detected && (
                <div className={`p-3 rounded-lg mt-4 ${
                  lastResult.motion.motion ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'
                }`}>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Motion Detection</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>
                      <span className="font-medium">Status:</span>{' '}
                      {lastResult.motion.motion ? (
                        <span className="text-orange-600 font-semibold">Movement Detected 🤚</span>
                      ) : (
                        <span className="text-gray-600">No Movement</span>
                      )}
                    </p>
                    <p>
                      <span className="font-medium">Intensity:</span> {lastResult.motion.intensity}%
                    </p>
                    {lastResult.motion.moving_objects !== undefined && lastResult.motion.moving_objects > 0 && (
                      <p>
                        <span className="font-medium">Moving Objects:</span> {lastResult.motion.moving_objects}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
