import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  UploadCloud,
  Camera,
  FileImage,
  FileText,
  Sparkles,
  CheckCircle2,
  X,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ASSET_PATHS } from '../data/mockData';
import { LanguageMode } from '../types';

const SAMPLE_FORMS = [
  {
    id: 'sample-rev',
    label: 'Revenue Form 7 (KN + EN)',
    departmentId: 'revenue',
    formType: 'Pahani / RTC Mutation (Form 7)',
    language: 'Automatic' as LanguageMode,
    fileName: 'form7_ravi_kumar_hosakote.jpg',
    imageUrl: ASSET_PATHS.REVENUE_SCAN,
  },
  {
    id: 'sample-agri',
    label: 'Agriculture Parihara F-22',
    departmentId: 'agriculture',
    formType: 'Crop Compensation (Parihara F-22)',
    language: 'Automatic' as LanguageMode,
    fileName: 'parihara_f22_raghavendra_mandya.jpg',
    imageUrl: ASSET_PATHS.AGRI_SCAN,
  },
  {
    id: 'sample-panchayat',
    label: 'Panchayat Verification Form 4',
    departmentId: 'panchayat',
    formType: 'Rural Property & Residence Verification',
    language: 'English' as LanguageMode,
    fileName: 'gp_form4_rajesh_singh.jpg',
    imageUrl: ASSET_PATHS.PANCHAYAT_SCAN,
  },
];

export const UploadStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    departments,
    user,
    defaultLanguage,
    startProcessingJob,
    backendMode,
    notify,
  } = useApp();

  const initialDept = searchParams.get('dept') || departments[0].id;
  const matchedDept = departments.find((d) => d.id === initialDept) || departments[0];
  const initialForm = searchParams.get('form') || matchedDept.formCategories[0];

  const [departmentId, setDepartmentId] = useState(matchedDept.id);
  const [formType, setFormType] = useState(initialForm);
  const [languageMode, setLanguageMode] = useState<LanguageMode>(defaultLanguage);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(ASSET_PATHS.REVENUE_SCAN);
  const [fileName, setFileName] = useState<string>('form7_ravi_kumar_hosakote.jpg');
  const [fileType, setFileType] = useState<'image/jpeg' | 'image/png' | 'application/pdf'>(
    'image/jpeg'
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Camera capture state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentDepartment =
    departments.find((d) => d.id === departmentId) || departments[0];

  useEffect(() => {
    if (!currentDepartment.formCategories.includes(formType)) {
      setFormType(currentDepartment.formCategories[0]);
    }
  }, [currentDepartment, formType]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleFileSelection = (file: File) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type) && !/\.(jpe?g|png|pdf)$/i.test(file.name)) {
      notify(
        'Unsupported File Type',
        'Please upload a JPG, JPEG, PNG, or PDF scanned document.',
        'warning'
      );
      return;
    }

    const resolvedType: 'image/jpeg' | 'image/png' | 'application/pdf' =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
        ? 'application/pdf'
        : file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')
          ? 'image/png'
          : 'image/jpeg';

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setFileName(file.name);
    setFileType(resolvedType);
    notify('Document Loaded', `${file.name} is ready for AI OCR processing.`, 'success');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const openCamera = async () => {
    setCameraError(null);
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError(
        'Camera hardware unavailable or permission denied. You can still upload a scanned image or load a sample form.'
      );
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const captureFromCamera = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const capturedFile = new File([blob], `camera_scan_${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        handleFileSelection(capturedFile);
        closeCamera();
      },
      'image/jpeg',
      0.92
    );
  };

  const loadSample = (sample: (typeof SAMPLE_FORMS)[number]) => {
    setDepartmentId(sample.departmentId);
    setFormType(sample.formType);
    setLanguageMode(sample.language);
    setSelectedFile(null);
    setPreviewUrl(sample.imageUrl);
    setFileName(sample.fileName);
    setFileType('image/jpeg');
    notify('Sample Scan Loaded', `Loaded ${sample.label} for testing.`, 'info');
  };

  const handleProcessDocument = async () => {
    if (!previewUrl) {
      notify('No Document Selected', 'Upload a file or select a sample scan first.', 'warning');
      return;
    }

    setIsSubmitting(true);
    startProcessingJob({
      file: selectedFile,
      previewUrl,
      fileName,
      fileType,
      departmentId,
      formType,
      languageMode,
      officerName: user?.name || 'District Officer',
    });

    await new Promise((r) => setTimeout(r, 250));
    setIsSubmitting(false);
    navigate('/processing');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Document Upload Studio
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Upload scanned JPG, PNG, or PDF government forms or capture directly via camera for
            offline Kannada & English OCR.
          </p>
        </div>

        <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Mode:{' '}
          <span className="font-semibold text-slate-900 dark:text-white">
            {backendMode === 'demo' ? 'Demo OCR Simulation' : 'Live Python FastAPI'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload & Form Configuration */}
        <div className="lg:col-span-6 space-y-5">
          {/* Drag and Drop Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`bg-white dark:bg-slate-900 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? 'border-[#1E3A8A] bg-blue-50/40 dark:bg-blue-950/20'
                : 'border-slate-300 dark:border-slate-700'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelection(e.target.files[0]);
                }
              }}
            />

            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-[#0F294A] dark:text-blue-400">
              <UploadCloud className="w-6 h-6" />
            </div>

            <h2 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
              Drag & drop scanned form here
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Supports JPG, JPEG, PNG, and PDF up to 25 MB
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-semibold transition-colors"
              >
                <FileImage className="w-3.5 h-3.5" />
                <span>Browse Files</span>
              </button>
              <button
                type="button"
                onClick={openCamera}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Camera Capture</span>
              </button>
            </div>
          </div>

          {/* Quick Sample Scans */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2.5">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Test with Realistic Handwritten Sample Scans
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_FORMS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => loadSample(sample)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    previewUrl === sample.imageUrl
                      ? 'border-[#1E3A8A] bg-blue-50 dark:bg-blue-950/40 text-[#1E3A8A] dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metadata Configuration */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Document Classification & OCR Language
            </h2>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="upload-dept"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Government Department
                </label>
                <select
                  id="upload-dept"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.nameKn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="upload-form-type"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Form Type / Template
                </label>
                <select
                  id="upload-form-type"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                >
                  {currentDepartment.formCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Handwriting Language Selection
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['Kannada', 'English', 'Automatic'] as LanguageMode[]).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLanguageMode(lang)}
                      className={`py-2 px-3 rounded-md text-xs font-semibold border transition-colors ${
                        languageMode === lang
                          ? 'bg-[#0F294A] border-[#0F294A] text-white'
                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {lang === 'Kannada'
                        ? 'Kannada (ಕನ್ನಡ)'
                        : lang === 'Automatic'
                          ? 'Auto (KN + EN)'
                          : 'English'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleProcessDocument}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-[#15803D] hover:bg-[#166534] disabled:opacity-60 text-white text-sm font-semibold transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isSubmitting ? 'Initializing OCR Pipeline...' : 'Process Document'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Document Preview */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs font-mono text-slate-800 dark:text-slate-200 truncate">
                {fileName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => loadSample(SAMPLE_FORMS[0])}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          <div className="p-4 bg-slate-100 dark:bg-slate-950 min-h-[520px] flex items-center justify-center">
            {fileType === 'application/pdf' ? (
              <div className="w-full h-[500px] flex flex-col items-center justify-center gap-3">
                <iframe
                  src={previewUrl}
                  title={fileName}
                  className="w-full h-full rounded border border-slate-200 dark:border-slate-800 bg-white"
                />
                <div className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <FileText className="w-4 h-4" /> PDF ready for multi-page rasterization
                </div>
              </div>
            ) : (
              <img
                src={previewUrl}
                alt={`Preview of ${fileName}`}
                referrerPolicy="no-referrer"
                className="max-h-[580px] w-auto object-contain rounded border border-slate-200 dark:border-slate-800 shadow-sm bg-white"
              />
            )}
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Capture Handwritten Document
              </h3>
              <button
                type="button"
                onClick={closeCamera}
                aria-label="Close camera"
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {cameraError ? (
              <div className="p-4 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            ) : (
              <div className="rounded-md overflow-hidden bg-black aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeCamera}
                className="px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              {!cameraError && (
                <button
                  type="button"
                  onClick={captureFromCamera}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-semibold"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Capture Photo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
