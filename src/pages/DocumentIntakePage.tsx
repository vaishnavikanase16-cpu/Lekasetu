import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  UploadCloud,
  Camera,
  RotateCcw,
  RotateCw,
  Crop,
  SlidersHorizontal,
  ScanLine,
  FileImage,
  FileText,
  X,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { LEKHA_ASSETS } from '../data/mockData';
import { DepartmentId, InputLanguageMode } from '../types';

const INTAKE_SAMPLES = [
  {
    id: 'police',
    label: 'Belagavi Police Complaint (KN + EN)',
    departmentId: 'police' as Exclude<DepartmentId, 'all'>,
    category: 'Internal Citizen Complaint',
    language: 'Both' as InputLanguageMode,
    fileName: 'mallikarjun_patil_camp_ps_belagavi.jpg',
    imageUrl: LEKHA_ASSETS.POLICE_SCAN,
  },
  {
    id: 'revenue',
    label: 'Revenue Form 7 (Hosakote)',
    departmentId: 'revenue' as Exclude<DepartmentId, 'all'>,
    category: 'Pahani / RTC Mutation (Form 7)',
    language: 'Both' as InputLanguageMode,
    fileName: 'form7_ravi_kumar_hosakote.jpg',
    imageUrl: LEKHA_ASSETS.REVENUE_SCAN,
  },
  {
    id: 'panchayat',
    label: 'Gram Panchayat Form 4',
    departmentId: 'gram_panchayat' as Exclude<DepartmentId, 'all'>,
    category: 'E-Swathu Property Verification',
    language: 'English' as InputLanguageMode,
    fileName: 'gp_form4_residence.jpg',
    imageUrl: LEKHA_ASSETS.PANCHAYAT_SCAN,
  },
];

export const DocumentIntakePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    departments,
    selectedDepartment,
    selectedOffice,
    activeProfile,
    setPendingIntake,
    notify,
  } = useApp();
  const { t } = useLanguage();

  const paramDept = searchParams.get('dept') as Exclude<DepartmentId, 'all'> | null;
  const initialDept =
    paramDept ||
    (selectedDepartment !== 'all' ? selectedDepartment : 'police');

  const [departmentId, setDepartmentId] = useState<Exclude<DepartmentId, 'all'>>(initialDept);
  const currentDept =
    departments.find((d) => d.id === departmentId) || departments[0];

  const [category, setCategory] = useState(currentDept.categories[0]);
  const [inputLanguage, setInputLanguage] = useState<InputLanguageMode>('Both');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(LEKHA_ASSETS.POLICE_SCAN);
  const [fileName, setFileName] = useState<string>('mallikarjun_patil_camp_ps_belagavi.jpg');
  const [fileType, setFileType] = useState<'image/jpeg' | 'image/png' | 'application/pdf'>(
    'image/jpeg'
  );
  const [isDragging, setIsDragging] = useState(false);

  // Image manipulation controls
  const [rotation, setRotation] = useState(0);
  const [cropped, setCropped] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPreparing, setIsPreparing] = useState(false);

  // Camera
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!currentDept.categories.includes(category)) {
      setCategory(currentDept.categories[0]);
    }
  }, [currentDept, category]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((tr) => tr.stop());
      }
    };
  }, []);

  const acceptFile = (file: File) => {
    if (!/\.(jpe?g|png|pdf)$/i.test(file.name)) {
      notify(t('intake.title'), t('intake.dropHint'), 'warning');
      return;
    }
    const resolvedType: 'image/jpeg' | 'image/png' | 'application/pdf' =
      file.name.toLowerCase().endsWith('.pdf')
        ? 'application/pdf'
        : file.name.toLowerCase().endsWith('.png')
          ? 'image/png'
          : 'image/jpeg';

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setFileName(file.name);
    setFileType(resolvedType);
    setRotation(0);
    setCropped(false);
    setEnhanced(false);
    notify(t('intake.title'), `${file.name}`, 'success');
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
      setCameraError(t('intake.cameraError'));
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const capturePhoto = () => {
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
        const file = new File([blob], `camera_intake_${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        acceptFile(file);
        closeCamera();
      },
      'image/jpeg',
      0.92
    );
  };

  const loadSample = (sample: (typeof INTAKE_SAMPLES)[number]) => {
    setDepartmentId(sample.departmentId);
    setCategory(sample.category);
    setInputLanguage(sample.language);
    setSelectedFile(null);
    setPreviewUrl(sample.imageUrl);
    setFileName(sample.fileName);
    setFileType('image/jpeg');
    setRotation(0);
    setCropped(false);
    setEnhanced(false);
  };

  const handleProcess = async () => {
    setIsPreparing(true);
    for (const step of [25, 60, 100]) {
      setUploadProgress(step);
      await new Promise((r) => setTimeout(r, 180));
    }

    setPendingIntake({
      file: selectedFile,
      previewUrl,
      fileName,
      fileType,
      departmentId,
      category,
      officeName: selectedOffice,
      inputLanguage,
      assignedTo: activeProfile.name,
    });

    setIsPreparing(false);
    navigate('/scanner');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0B2545]">
          {t('intake.title')}
        </h1>
        <p className="text-sm text-slate-600 mt-1">{t('intake.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Upload & Form Config */}
        <div className="lg:col-span-6 space-y-5">
          {/* Drag & Drop Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files[0]) acceptFile(e.dataTransfer.files[0]);
            }}
            className={`bg-white rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
              isDragging
                ? 'border-[#2563EB] bg-blue-50/50'
                : 'border-indigo-200'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) acceptFile(e.target.files[0]);
              }}
            />

            <div className="w-12 h-12 rounded-xl bg-[#EEF1FA] text-[#0B2545] mx-auto flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h2 className="mt-3 text-sm font-bold text-[#0B2545]">
              {t('intake.dropTitle')}
            </h2>
            <p className="mt-1 text-xs text-slate-500">{t('intake.dropHint')}</p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B2545] hover:bg-[#13315C] text-white text-xs font-semibold"
              >
                <FileImage className="w-3.5 h-3.5" />
                <span>{t('intake.browse')}</span>
              </button>
              <button
                type="button"
                onClick={openCamera}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-indigo-200 bg-white hover:bg-[#F3F4FA] text-slate-800 text-xs font-semibold"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{t('intake.camera')}</span>
              </button>
            </div>
          </div>

          {/* Sample Handwritten Scans */}
          <div className="bg-white rounded-2xl p-4 border border-indigo-100 space-y-2.5">
            <div className="text-xs font-semibold text-[#0B2545]">
              {t('intake.sampleLabel')}
            </div>
            <div className="flex flex-wrap gap-2">
              {INTAKE_SAMPLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => loadSample(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    previewUrl === s.imageUrl
                      ? 'bg-[#0B2545] text-white border-[#0B2545]'
                      : 'bg-[#F3F4FA] text-slate-700 border-indigo-100 hover:border-[#2563EB]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Classification & Language */}
          <div className="bg-white rounded-2xl p-5 border border-indigo-100 space-y-4">
            <div>
              <label
                htmlFor="intake-dept"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                {t('intake.deptLabel')}
              </label>
              <select
                id="intake-dept"
                value={departmentId}
                onChange={(e) =>
                  setDepartmentId(e.target.value as Exclude<DepartmentId, 'all'>)
                }
                className="w-full px-3 py-2.5 text-sm rounded-xl bg-[#F3F4FA] border border-indigo-100 text-slate-900"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {t(d.nameKey)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="intake-cat"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                {t('intake.catLabel')}
              </label>
              <select
                id="intake-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl bg-[#F3F4FA] border border-indigo-100 text-slate-900"
              >
                {currentDept.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('intake.langLabel')}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { val: 'Kannada', label: t('intake.langKn') },
                    { val: 'English', label: t('intake.langEn') },
                    { val: 'Both', label: t('intake.langBoth') },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setInputLanguage(opt.val)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                      inputLanguage === opt.val
                        ? 'bg-[#2563EB] border-[#2563EB] text-white'
                        : 'bg-[#F3F4FA] border-indigo-100 text-slate-700 hover:bg-indigo-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {isPreparing && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{t('intake.progressUploading')}</span>
                  <span className="font-mono tabular-nums">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2563EB] transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={isPreparing}
              onClick={handleProcess}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0B2545] hover:bg-[#13315C] disabled:opacity-60 text-white text-sm font-semibold transition-colors"
            >
              <ScanLine className="w-4 h-4" />
              <span>{t('intake.processBtn')}</span>
            </button>
          </div>
        </div>

        {/* Right: Preview + Rotate / Crop / Image Enhancement */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-indigo-100 overflow-hidden shadow-xs">
          <div className="px-4 py-3 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-2 bg-[#F8F9FD]">
            <div className="text-xs font-bold text-[#0B2545] truncate">
              {t('intake.previewTitle')} · <span className="font-mono font-normal">{fileName}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRotation((r) => (r - 90) % 360)}
                title={t('intake.rotateLeft')}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-indigo-100 bg-white text-[11px] font-medium text-slate-700 hover:bg-indigo-50"
              >
                <RotateCcw className="w-3 h-3" /> -90°
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                title={t('intake.rotateRight')}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-indigo-100 bg-white text-[11px] font-medium text-slate-700 hover:bg-indigo-50"
              >
                <RotateCw className="w-3 h-3" /> +90°
              </button>
              <button
                type="button"
                onClick={() => setCropped((c) => !c)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-medium ${
                  cropped
                    ? 'bg-[#2563EB] border-[#2563EB] text-white'
                    : 'bg-white border-indigo-100 text-slate-700 hover:bg-indigo-50'
                }`}
              >
                <Crop className="w-3 h-3" /> {t('intake.crop')}
              </button>
              <button
                type="button"
                onClick={() => setEnhanced((e) => !e)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-medium ${
                  enhanced
                    ? 'bg-[#0B2545] border-[#0B2545] text-white'
                    : 'bg-white border-indigo-100 text-slate-700 hover:bg-indigo-50'
                }`}
              >
                <SlidersHorizontal className="w-3 h-3" /> {t('intake.enhance')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRotation(0);
                  setCropped(false);
                  setEnhanced(false);
                }}
                className="px-2 py-1 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-900"
              >
                {t('intake.resetImage')}
              </button>
            </div>
          </div>

          <div className="p-5 bg-[#EEF1FA] min-h-[520px] flex items-center justify-center overflow-hidden">
            {fileType === 'application/pdf' ? (
              <div className="w-full h-[490px] flex flex-col items-center gap-2">
                <iframe
                  src={previewUrl}
                  title={fileName}
                  className="w-full h-full rounded-xl border border-indigo-200 bg-white"
                />
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                  <FileText className="w-3.5 h-3.5" /> PDF Document
                </span>
              </div>
            ) : (
              <img
                src={previewUrl}
                alt={fileName}
                referrerPolicy="no-referrer"
                style={{
                  transform: `rotate(${rotation}deg) scale(${cropped ? 1.08 : 1})`,
                  filter: enhanced ? 'contrast(1.25) brightness(1.04) grayscale(0.35)' : 'none',
                }}
                className="max-h-[520px] w-auto object-contain rounded-xl shadow-md bg-white transition-all duration-200"
              />
            )}
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-indigo-100 max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#0B2545]">
                {t('intake.camera')}
              </h3>
              <button
                type="button"
                onClick={closeCamera}
                aria-label={t('common.close')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {cameraError ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden bg-black aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeCamera}
                className="px-4 py-2 rounded-xl border border-indigo-100 text-xs font-semibold text-slate-700"
              >
                {t('common.cancel')}
              </button>
              {!cameraError && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B2545] text-white text-xs font-semibold"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{t('intake.capturePhoto')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
