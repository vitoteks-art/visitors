import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, User as UserIcon, Building, Briefcase, Phone, Video, ArrowRight, CheckCircle2, Globe, HelpCircle, QrCode, X } from 'lucide-react';
import { Visitor, VisitorStatus, User } from '../types';
import { saveVisitor, getVisitors, getVisitorByCode } from '../services/storage';
import { getStuffList } from '../services/auth';

interface CheckInFormProps {
  onComplete: () => void;
}

const CheckInForm: React.FC<CheckInFormProps> = ({ onComplete }) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [expressCode, setExpressCode] = useState('');
  const [isExpressing, setIsExpressing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    company: '',
    purpose: 'Meeting',
    hostName: '',
    hostDepartment: 'Engineering',
    idType: 'Driver License',
    idNumber: ''
  });

  const [hosts, setHosts] = useState<User[]>([]);

  useEffect(() => {
    // Load hosts (staff)
    const loadHosts = async () => {
      const list = await getStuffList();
      setHosts(list);
    }
    loadHosts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setPurpose = (p: string) => {
    setFormData({ ...formData, purpose: p });
  };

  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera. Please ensure permissions are granted.");
    }
  };

  useEffect(() => {
    if (isCameraOpen && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraOpen, stream]);

  // Cleanup stream on unmount or when camera closes
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 320, 240);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setPhoto(dataUrl);

        // Stop stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
        setIsCameraOpen(false);
      }
    }
  }, [stream]);

  const handleExpressLookup = async () => {
    if (!expressCode) return;
    setIsSubmitting(true);
    const visitor = await getVisitorByCode(expressCode.toUpperCase());
    if (visitor) {
      setFormData({
        fullName: visitor.fullName,
        email: visitor.email,
        phoneNumber: visitor.phoneNumber || '',
        company: visitor.company,
        purpose: visitor.purpose,
        hostName: visitor.hostName,
        hostDepartment: visitor.hostDepartment,
        idType: visitor.idType,
        idNumber: visitor.idNumber
      });
      setExpressCode('');
      setIsExpressing(false);
    } else {
      alert("Invalid or expired invite code.");
    }
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;

    setIsSubmitting(true);

    const newVisitor: Visitor = {
      id: crypto.randomUUID(),
      ...formData,
      photoUrl: photo || undefined,
      checkInTime: new Date().toISOString(),
      status: VisitorStatus.PENDING,
    };

    // Submit to backend
    try {
      await saveVisitor(newVisitor);
      setIsSubmitting(false);
      onComplete();
    } catch (error) {
      console.error("Check-in failed", error);
      setIsSubmitting(false);
      alert("Something went wrong. Please try again.");
    }
  };

  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[600px]">
        <div className="w-20 h-20 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-8"></div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Checking you in...</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">Please wait while we notify your host.</p>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-5xl mx-auto">
      {/* Kiosk Header */}
      <div className="flex justify-between items-end mb-8 transition-colors">
        <div className="flex items-center gap-3">
          <div className="bg-brand-600 p-2.5 rounded-lg shadow-sm">
            <Building className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-none">Kosmos Energy VMS</h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wider uppercase mt-1">powered Vitotek Systems</p>
          </div>
        </div>
        <div className="text-right flex items-center gap-4">
          <div className="mr-4">
            <p className="text-xl font-bold text-gray-900 dark:text-white leading-none">{currentTime}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{currentDate}</p>
          </div>
          <button className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Globe className="h-5 w-5" />
          </button>
          <button className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="text-center pt-10 pb-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Kosmos Energy</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Please provide your information to check in for your visit.</p>

          <div className="mt-8 flex justify-center gap-4">
            {!isExpressing ? (
              <button
                type="button"
                onClick={() => setIsExpressing(true)}
                className="flex items-center gap-2 px-6 py-3 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-2xl font-bold transition border border-brand-100"
              >
                <QrCode className="h-5 w-5" /> Got an Invite Code?
              </button>
            ) : (
              <div className="flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
                <input
                  autoFocus
                  className="p-3 border-2 border-brand-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none uppercase font-black tracking-widest text-center text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700"
                  placeholder="ENTER CODE"
                  value={expressCode}
                  onChange={e => setExpressCode(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleExpressLookup()}
                />
                <button
                  type="button"
                  onClick={handleExpressLookup}
                  className="bg-brand-600 text-white p-3 rounded-xl hover:bg-brand-700"
                >
                  <ArrowRight className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpressing(false)}
                  className="text-gray-400 p-3 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* Left Column: Personal Info */}
            <div className="space-y-8">
              <div className="flex items-center gap-2 mb-6 text-brand-600 dark:text-brand-400">
                <UserIcon className="h-6 w-6" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h3>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <input
                  required
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                <input
                  required
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Company Name</label>
                <input
                  required
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Company you represent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Visitor ID Type</label>
                  <select
                    name="idType"
                    value={formData.idType}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none shadow-sm text-gray-900 dark:text-white"
                  >
                    <option>Driver License</option>
                    <option>Passport</option>
                    <option>State ID</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">ID Number (Last 4)</label>
                  <input
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="XXXX"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Visit Details */}
            <div className="space-y-8">
              <div className="flex items-center gap-2 mb-6 text-brand-600 dark:text-brand-400">
                <Briefcase className="h-6 w-6" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Visit Details</h3>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Who are you visiting?</label>
                <select
                  required
                  name="hostName"
                  value={formData.hostName}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none shadow-sm text-gray-900 dark:text-white"
                >
                  <option value="" disabled>Select host name</option>
                  {hosts.length > 0 ? hosts.map(h => (
                    <option key={h.id} value={h.name}>{h.name} ({h.department})</option>
                  )) : (
                    <option disabled>Loading hosts...</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Purpose of Visit</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Meeting', 'Delivery', 'Maintenance', 'Interview'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPurpose(p)}
                      className={`p-3 rounded-xl border text-sm font-medium transition ${formData.purpose === p
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-brand-200 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Capture Visitor Photo</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-900/50 h-56 flex flex-col items-center justify-center relative overflow-hidden transition-colors">

                  {photo ? (
                    <img src={photo} className="w-full h-full object-cover" alt="Visitor" />
                  ) : isCameraOpen ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                      <canvas ref={canvasRef} className="hidden" width="320" height="240"></canvas>
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="absolute bottom-4 bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg hover:scale-105 transition"
                      >
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors">
                        <UserIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2 mx-auto transition"
                      >
                        <Video className="h-4 w-4" /> Start Camera
                      </button>
                    </div>
                  )}

                  {photo && (
                    <button
                      type="button"
                      onClick={() => { setPhoto(null); setIsCameraOpen(false); }}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                    >
                      <div className="h-4 w-4 p-0.5">✕</div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700 transition-colors">
            <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/30 rounded-xl p-4 flex items-start gap-3 mb-6 transition-colors">
              <input
                type="checkbox"
                id="policy"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-5 w-5 text-brand-600 rounded focus:ring-brand-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="policy" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                I agree to the <span className="text-brand-700 dark:text-brand-400 font-semibold hover:underline">Visitor Policy</span> and <span className="text-brand-700 dark:text-brand-400 font-semibold hover:underline">Non-Disclosure Agreement</span>.
                My data will be processed according to our Privacy Policy.
              </label>
            </div>

            <button
              type="submit"
              disabled={!agreed || !formData.fullName || !formData.hostName}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-brand-200 dark:shadow-none flex items-center justify-center gap-2 transition transform active:scale-[0.99]"
            >
              Check In Now <ArrowRight className="h-6 w-6" />
            </button>
          </div>
        </form>
      </div>

      <div className="text-center mt-8 text-gray-400 dark:text-gray-600 text-sm">
        © 2026 Kosmos Energy VMS powered Vitotek Systems. All rights reserved.<br />
        Kiosk Station: REC-FRONT-01 • v4.2.1
      </div>
    </div>
  );
};

export default CheckInForm;