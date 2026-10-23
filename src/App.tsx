import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Image as ImageIcon,
  MapPin,
  Navigation,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Menu,
  Wifi,
  BatteryCharging,
  Signal,
  Crosshair,
  Upload,
  X,
  RefreshCw,
  SlidersHorizontal,
  Plus,
  Search,
  Download,
  Eye,
  Edit3,
  Trash2,
  Smartphone,
  Table as TableIcon,
  LayoutList,
  Map as MapIcon,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import {
  GeoCoordinates,
  ObservationCategory,
  ObservationRecord,
  ObservationStatus,
  ObservationType,
} from './types/observation';
import { INITIAL_OBSERVATIONS, SITE_ZONE_PRESETS } from './data/initialObservations';
import {
  FIELD_PHOTO_PRESETS,
  FieldPhotoPreset,
  formatCoordDMS,
  generateFieldScenePhoto,
  stampImageWithGeotag,
} from './utils/photoGenerator';

type ActiveScreen = 'dashboard' | 'entry';
type DashboardDisplayMode = 'sheet' | 'cards' | 'map';

const STORAGE_KEY = 'fieldlog_android_observations_v2';
const SITE_STORAGE_KEY = 'fieldlog_android_sitename_v2';

const OBSERVATION_TYPES: ObservationType[] = [
  'Unsafe Condition',
  'Unsafe Act',
  'Near Miss',
  'Good Practice',
  'Environmental',
  'Quality Defect',
];

const OBSERVATION_CATEGORIES: ObservationCategory[] = [
  'Hand & Power Tools',
  'Scaffolding & Work at Height',
  'Electrical Safety',
  'Housekeeping & Walkways',
  'PPE Compliance',
  'Chemical & Gas Handling',
  'Excavation & Trenching',
  'Fire & Life Safety',
  'Material Handling & Rigging',
];

const DATE_PRESETS = ['03-27-2019', '10-23-2026', '10-22-2026', '10-21-2026'];

export function App() {
  // Navigation between Screen 1 (Image 1 Dashboard) and Screen 2 (Image 2 Detail Entry)
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('dashboard');
  // Device orientation toggle so user can view Portrait Android (412px) or Landscape Android (880px)
  const [isLandscape, setIsLandscape] = useState<boolean>(false);

  // Site Name (Image 1 Header)
  const [siteName, setSiteName] = useState<string>(() => {
    try {
      return localStorage.getItem(SITE_STORAGE_KEY) || 'Tata Micron Semi conductors';
    } catch {
      return 'Tata Micron Semi conductors';
    }
  });
  const [isEditingSiteName, setIsEditingSiteName] = useState<boolean>(false);

  // Observations dataset
  const [observations, setObservations] = useState<ObservationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_OBSERVATIONS;
  });

  // Dashboard filters & display mode
  const [dashboardMode, setDashboardMode] = useState<DashboardDisplayMode>('sheet');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ObservationStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);

  // Currently edited observation in Screen 2 (null = New Entry)
  const [editingObservation, setEditingObservation] =
    useState<ObservationRecord | null>(null);

  // Screen 2 (Image 2 Detail Entry) Form State
  const [location, setLocation] = useState<string>('Warehouse');
  const [dateOfObservation, setDateOfObservation] = useState<string>('03-27-2019');
  const [timeOfObservation, setTimeOfObservation] = useState<string>('16:33');
  const [description, setDescription] = useState<string>('Broken handle on hammer');

  const [coordinates, setCoordinates] = useState<GeoCoordinates>({
    latitude: 22.99684,
    longitude: 72.49912,
    accuracyMeters: 2.4,
    altitudeMeters: 44,
    zoneCode: 'WH-01',
    capturedAt: '03-27-2019 16:33',
  });
  const [gpsStatus, setGpsStatus] = useState<'locked' | 'acquiring'>('locked');
  const [showMapPinPicker, setShowMapPinPicker] = useState<boolean>(false);
  const [showDateDropdown, setShowDateDropdown] = useState<boolean>(false);

  // Extended 15-Column Ledger fields inside Screen 2
  const [showExtendedFields, setShowExtendedFields] = useState<boolean>(false);
  const [typeOfObservation, setTypeOfObservation] =
    useState<ObservationType>('Unsafe Condition');
  const [category, setCategory] =
    useState<ObservationCategory>('Hand & Power Tools');
  const [subcontractorName, setSubcontractorName] = useState<string>(
    'Tata Projects Logistics'
  );
  const [responsiblePerson, setResponsiblePerson] = useState<string>('R. K. Sharma');
  const [correctiveMeasure, setCorrectiveMeasure] = useState<string>(
    'Damaged tool quarantined immediately; issue ANSI-certified fiberglass replacement hammer.'
  );
  const [complianceDate, setComplianceDate] = useState<string>('10-24-2026');
  const [status, setStatus] = useState<ObservationStatus>('Open');
  const [reportedBy, setReportedBy] = useState<string>('R. H. Singh');
  const [remarks, setRemarks] = useState<string>(
    'Logged via Android Observation App with GPS Geotag.'
  );

  const [openPhoto, setOpenPhoto] = useState<string>(() =>
    generateFieldScenePhoto(
      'broken_hammer',
      'Warehouse',
      {
        latitude: 22.99684,
        longitude: 72.49912,
        accuracyMeters: 2.4,
        altitudeMeters: 44,
        zoneCode: 'WH-01',
        capturedAt: '03-27-2019 16:33',
      },
      '03-27-2019 16:33',
      'OPEN PHOTO'
    )
  );
  const [closingPhoto, setClosingPhoto] = useState<string>('');

  // Modals inside Android Viewport
  const [activePhotoTarget, setActivePhotoTarget] = useState<'open' | 'closing'>('open');
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false);
  const [showGalleryModal, setShowGalleryModal] = useState<boolean>(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState<boolean>(false);
  const [cameraStreamActive, setCameraStreamActive] = useState<boolean>(false);
  const [simulatedSceneIdx, setSimulatedSceneIdx] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Lightbox for inspecting photos on Dashboard Screen
  const [lightboxData, setLightboxData] = useState<{
    photoUrl: string;
    title: string;
    kind: 'Open Photo' | 'Closing Photo';
    record: ObservationRecord;
  } | null>(null);

  // Direct Closing Photo file upload from Dashboard row
  const [closingUploadRow, setClosingUploadRow] = useState<ObservationRecord | null>(
    null
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const rowClosingInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(observations));
    } catch {
      // Ignore
    }
  }, [observations]);

  useEffect(() => {
    try {
      localStorage.setItem(SITE_STORAGE_KEY, siteName);
    } catch {
      // Ignore
    }
  }, [siteName]);

  // Clean up camera stream when camera modal closes
  useEffect(() => {
    if (!showCameraModal && videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setCameraStreamActive(false);
    }
  }, [showCameraModal]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Populate Screen 2 form when opening New Entry or Editing an existing row
  const openEntryScreen = (recordToEdit: ObservationRecord | null = null) => {
    if (recordToEdit) {
      setEditingObservation(recordToEdit);
      setLocation(recordToEdit.areaLocation);
      setDateOfObservation(recordToEdit.dateOfObservation);
      setTimeOfObservation(recordToEdit.timeOfObservation);
      setDescription(recordToEdit.observationDescription);
      setCoordinates(recordToEdit.coordinates);
      setTypeOfObservation(recordToEdit.typeOfObservation);
      setCategory(recordToEdit.category);
      setSubcontractorName(recordToEdit.subcontractorName);
      setResponsiblePerson(recordToEdit.responsiblePerson);
      setCorrectiveMeasure(recordToEdit.correctivePreventiveMeasure);
      setComplianceDate(recordToEdit.complianceDate);
      setStatus(recordToEdit.status);
      setReportedBy(recordToEdit.reportedBy);
      setRemarks(recordToEdit.remarks);
      setOpenPhoto(recordToEdit.openPhoto);
      setClosingPhoto(recordToEdit.closingPhoto);
    } else {
      setEditingObservation(null);
      setLocation('Warehouse');
      setDateOfObservation('03-27-2019');
      setTimeOfObservation('16:33');
      setDescription('Broken handle on hammer');
      const defaultCoords: GeoCoordinates = {
        latitude: 22.99684,
        longitude: 72.49912,
        accuracyMeters: 2.4,
        altitudeMeters: 44,
        zoneCode: 'WH-01',
        capturedAt: '03-27-2019 16:33',
      };
      setCoordinates(defaultCoords);
      setTypeOfObservation('Unsafe Condition');
      setCategory('Hand & Power Tools');
      setSubcontractorName('Tata Projects Logistics');
      setResponsiblePerson('R. K. Sharma');
      setCorrectiveMeasure(
        'Damaged tool quarantined immediately; issue ANSI-certified fiberglass replacement hammer.'
      );
      setComplianceDate('10-24-2026');
      setStatus('Open');
      setReportedBy('R. H. Singh');
      setRemarks('Logged via Android Observation App with GPS Geotag.');
      setOpenPhoto(
        generateFieldScenePhoto(
          'broken_hammer',
          'Warehouse',
          defaultCoords,
          '03-27-2019 16:33',
          'OPEN PHOTO'
        )
      );
      setClosingPhoto('');
    }
    setActiveScreen('entry');
  };

  // Live GPS acquisition
  const handleAcquireLiveGPS = () => {
    setGpsStatus('acquiring');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCoords: GeoCoordinates = {
            latitude: Number(pos.coords.latitude.toFixed(5)),
            longitude: Number(pos.coords.longitude.toFixed(5)),
            accuracyMeters: Number((pos.coords.accuracy || 2.2).toFixed(1)),
            altitudeMeters: pos.coords.altitude ? Math.round(pos.coords.altitude) : 45,
            zoneCode: 'GPS-LIVE',
            capturedAt: `${dateOfObservation} ${timeOfObservation}`,
          };
          setCoordinates(newCoords);
          setGpsStatus('locked');
          triggerToast('Live GPS coordinates locked!');
        },
        () => {
          const jitterLat = (Math.random() - 0.5) * 0.0018;
          const jitterLng = (Math.random() - 0.5) * 0.0018;
          const newCoords: GeoCoordinates = {
            latitude: Number((22.9972 + jitterLat).toFixed(5)),
            longitude: Number((72.5004 + jitterLng).toFixed(5)),
            accuracyMeters: Number((1.6 + Math.random() * 1.5).toFixed(1)),
            altitudeMeters: 45,
            zoneCode: 'FAB-GPS',
            capturedAt: `${dateOfObservation} ${timeOfObservation}`,
          };
          setCoordinates(newCoords);
          setGpsStatus('locked');
          triggerToast(
            `GPS Geotag locked: ${formatCoordDMS(newCoords.latitude, newCoords.longitude)}`
          );
        },
        { enableHighAccuracy: true, timeout: 2200 }
      );
    } else {
      setGpsStatus('locked');
    }
  };

  const handleSelectZonePreset = (presetName: string) => {
    setLocation(presetName);
    const found = SITE_ZONE_PRESETS.find((z) => z.name === presetName);
    if (found) {
      setCoordinates({
        latitude: found.latitude,
        longitude: found.longitude,
        accuracyMeters: 2.1,
        altitudeMeters: 45,
        zoneCode: found.code,
        capturedAt: `${dateOfObservation} ${timeOfObservation}`,
      });
      setSubcontractorName(found.defaultSubcontractor);
      setResponsiblePerson(found.defaultResp);
      triggerToast(`Geotag set to ${found.name} (${found.code})`);
    }
  };

  // Open Camera inside Android App
  const openCameraFor = async (target: 'open' | 'closing') => {
    setActivePhotoTarget(target);
    setShowCameraModal(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraStreamActive(true);
        }
      }
    } catch {
      setCameraStreamActive(false);
    }
  };

  const handleCaptureCameraPhoto = async () => {
    const badgeLabel = activePhotoTarget === 'open' ? 'OPEN PHOTO' : 'CLOSING PHOTO';
    const stampDate = `${dateOfObservation} ${timeOfObservation}`;

    if (cameraStreamActive && videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 420;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 640, 420);
        const rawDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const stamped = await stampImageWithGeotag(
          rawDataUrl,
          location || 'Warehouse',
          coordinates,
          stampDate,
          badgeLabel
        );
        if (activePhotoTarget === 'open') {
          setOpenPhoto(stamped);
        } else {
          setClosingPhoto(stamped);
          setStatus('Closed');
        }
      }
    } else {
      const preset = FIELD_PHOTO_PRESETS[simulatedSceneIdx % FIELD_PHOTO_PRESETS.length];
      const generated = generateFieldScenePhoto(
        preset.sceneType,
        location || 'Warehouse',
        coordinates,
        stampDate,
        badgeLabel
      );
      if (activePhotoTarget === 'open') {
        setOpenPhoto(generated);
      } else {
        setClosingPhoto(generated);
        setStatus('Closed');
      }
    }

    setShowCameraModal(false);
    triggerToast('Geotagged photo captured!');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const rawDataUrl = reader.result as string;
      const badgeLabel = activePhotoTarget === 'open' ? 'OPEN PHOTO' : 'CLOSING PHOTO';
      const stamped = await stampImageWithGeotag(
        rawDataUrl,
        location || 'Warehouse',
        coordinates,
        `${dateOfObservation} ${timeOfObservation}`,
        badgeLabel
      );
      if (activePhotoTarget === 'open') {
        setOpenPhoto(stamped);
      } else {
        setClosingPhoto(stamped);
        setStatus('Closed');
      }
      setShowGalleryModal(false);
      triggerToast('Photo uploaded & geotagged!');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSelectGalleryPreset = (preset: FieldPhotoPreset) => {
    const badgeLabel = activePhotoTarget === 'open' ? 'OPEN PHOTO' : 'CLOSING PHOTO';
    const photoUri = generateFieldScenePhoto(
      preset.sceneType,
      location || 'Warehouse',
      coordinates,
      `${dateOfObservation} ${timeOfObservation}`,
      badgeLabel
    );
    if (activePhotoTarget === 'open') {
      setOpenPhoto(photoUri);
    } else {
      setClosingPhoto(photoUri);
      setStatus('Closed');
    }
    setShowGalleryModal(false);
    triggerToast(`Attached: ${preset.title}`);
  };

  // Submit from Screen 2 (Image 2 Detail Entry Screen) -> saves and navigates back to Screen 1 (Image 1 Dashboard)
  const handleSubmitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !description.trim()) {
      triggerToast('Please enter Location and Observation Description.');
      return;
    }

    const payload: Omit<ObservationRecord, 'id' | 'slNo'> = {
      dateOfObservation: dateOfObservation.trim() || '03-27-2019',
      timeOfObservation: timeOfObservation.trim() || '16:33',
      typeOfObservation,
      openPhoto,
      openPhotoCaption: `${description.trim()} (${location.trim()})`,
      observationDescription: description.trim(),
      category,
      areaLocation: location.trim(),
      coordinates: {
        ...coordinates,
        capturedAt: `${dateOfObservation} ${timeOfObservation}`,
      },
      subcontractorName: subcontractorName.trim() || 'Tata Projects Logistics',
      responsiblePerson: responsiblePerson.trim() || 'R. K. Sharma',
      correctivePreventiveMeasure:
        correctiveMeasure.trim() ||
        'Immediate containment initiated; supervisor assigned for rectification.',
      closingPhoto,
      complianceDate: complianceDate.trim() || dateOfObservation,
      status,
      reportedBy: reportedBy.trim() || 'R. H. Singh',
      remarks: remarks.trim() || 'Logged via Android Observation App',
    };

    if (editingObservation) {
      setObservations((prev) =>
        prev.map((item, idx) =>
          item.id === editingObservation.id
            ? { ...payload, id: editingObservation.id, slNo: idx + 1 }
            : item
        )
      );
      setEditingObservation(null);
      triggerToast(`Updated Sl. No. ${editingObservation.slNo} in Report!`);
    } else {
      const newRecord: ObservationRecord = {
        ...payload,
        id: `obs-${Date.now()}`,
        slNo: observations.length + 1,
      };
      setObservations((prev) => [newRecord, ...prev].map((r, i) => ({ ...r, slNo: i + 1 })));
      triggerToast('Observation logged & added to Daily Report!');
    }

    // Return to Dashboard Screen so user sees the updated report
    setActiveScreen('dashboard');
  };

  const handleUpdateStatus = (id: string, newStatus: ObservationStatus) => {
    setObservations((prev) =>
      prev.map((obs) => (obs.id === id ? { ...obs, status: newStatus } : obs))
    );
    triggerToast(`Status updated to ${newStatus}`);
  };

  const handleQuickRectifyRow = (row: ObservationRecord) => {
    const today = '10-23-2026';
    const scene =
      row.category === 'Hand & Power Tools'
        ? 'new_hammer'
        : row.category === 'Scaffolding & Work at Height'
        ? 'scaffold_fixed'
        : row.category === 'Electrical Safety'
        ? 'electrical_panel_closed'
        : 'chemical_eyewash_clear';

    const closingImg = generateFieldScenePhoto(
      scene,
      row.areaLocation,
      row.coordinates,
      `${today} 16:45`,
      'CLOSING PHOTO'
    );
    setObservations((prev) =>
      prev.map((obs) =>
        obs.id === row.id
          ? {
              ...obs,
              closingPhoto: closingImg,
              complianceDate: today,
              status: 'Closed',
              remarks: 'Closing photo verified via mobile inspection.',
            }
          : obs
      )
    );
    triggerToast(`Sl. No. ${row.slNo} rectified & marked Closed!`);
  };

  const handleRowClosingFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !closingUploadRow) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const rawUrl = reader.result as string;
      const today = '10-23-2026';
      const stamped = await stampImageWithGeotag(
        rawUrl,
        closingUploadRow.areaLocation,
        closingUploadRow.coordinates,
        `${today} 17:00`,
        'CLOSING PHOTO'
      );
      setObservations((prev) =>
        prev.map((obs) =>
          obs.id === closingUploadRow.id
            ? {
                ...obs,
                closingPhoto: stamped,
                complianceDate: today,
                status: 'Closed',
              }
            : obs
        )
      );
      setClosingUploadRow(null);
      triggerToast('Closing photo uploaded & status set to Closed!');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeleteObservation = (id: string) => {
    setObservations((prev) =>
      prev
        .filter((o) => o.id !== id)
        .map((o, idx) => ({ ...o, slNo: idx + 1 }))
    );
    triggerToast('Observation removed.');
  };

  const handleExportCSV = () => {
    const totalCount = observations.length;
    const openCount = observations.filter((o) => o.status === 'Open').length;
    const wipCount = observations.filter((o) => o.status === 'Work in progress').length;
    const closedCount = observations.filter((o) => o.status === 'Closed').length;

    const headers = [
      'Sl. No.',
      'Date of Observation',
      'Type of Observation',
      'Open Photo Geotag',
      'Observation Description',
      'Category',
      'Area / Location',
      'GPS Coordinates',
      'Subcontractor Name',
      'Resp.',
      'Corrective and Preventive measure',
      'Closing Photo',
      'Compliance date',
      'Status',
      'Observation Reported by',
      'Remarks',
    ];

    const rows = observations.map((o, idx) => [
      idx + 1,
      `${o.dateOfObservation} ${o.timeOfObservation}`,
      o.typeOfObservation,
      'Geotagged Photo Attached',
      `"${o.observationDescription.replace(/"/g, '""')}"`,
      o.category,
      `"${o.areaLocation.replace(/"/g, '""')}"`,
      `"${formatCoordDMS(o.coordinates.latitude, o.coordinates.longitude)}"`,
      `"${o.subcontractorName.replace(/"/g, '""')}"`,
      `"${o.responsiblePerson.replace(/"/g, '""')}"`,
      `"${o.correctivePreventiveMeasure.replace(/"/g, '""')}"`,
      o.closingPhoto ? 'Verified' : 'Pending',
      o.complianceDate,
      o.status,
      `"${o.reportedBy.replace(/"/g, '""')}"`,
      `"${o.remarks.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      `Name of the Site: ${siteName}\n` +
      `Total Observations,${totalCount},Open,${openCount},Work in progress,${wipCount},Closed,${closedCount}\n` +
      headers.join(',') +
      '\n' +
      rows.map((r) => r.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Daily_Observation_Report_${siteName.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Exported 15-column CSV report!');
  };

  // Summary counts for Image 1 top bar
  const totalCount = observations.length;
  const openCount = observations.filter((o) => o.status === 'Open').length;
  const wipCount = observations.filter((o) => o.status === 'Work in progress').length;
  const closedCount = observations.filter((o) => o.status === 'Closed').length;

  const filteredObservations = observations.filter((obs) => {
    if (statusFilter !== 'ALL' && obs.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        obs.observationDescription.toLowerCase().includes(q) ||
        obs.areaLocation.toLowerCase().includes(q) ||
        obs.subcontractorName.toLowerCase().includes(q) ||
        obs.responsiblePerson.toLowerCase().includes(q) ||
        obs.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-start sm:justify-center sm:py-4 sm:px-3 select-none">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <input
        ref={rowClosingInputRef}
        type="file"
        accept="image/*"
        onChange={handleRowClosingFileChange}
        className="hidden"
      />

      {/* =====================================================================
          ANDROID DEVICE SHELL (Full-bleed on mobile screens, sleek Android bezel on larger viewports)
          ===================================================================== */}
      <div
        className={`w-full transition-all duration-200 ${
          isLandscape ? 'sm:max-w-[920px]' : 'sm:max-w-[420px]'
        } bg-[#181a1b] sm:p-2.5 sm:rounded-[32px] sm:shadow-2xl sm:border sm:border-neutral-700/80 flex flex-col h-screen sm:h-[860px] sm:max-h-[94vh]`}
      >
        {/* Top Phone Speaker & Orientation Toggle Bar (Visible on larger viewports) */}
        <div className="hidden sm:flex items-center justify-between px-4 pb-2 pt-0.5 text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-[10px] text-neutral-300">
              ANDROID FIELD APP
            </span>
          </div>
          <div className="w-16 h-1 bg-neutral-700 rounded-full" />
          <button
            type="button"
            onClick={() => setIsLandscape((prev) => !prev)}
            className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            title="Rotate phone between Portrait and Landscape to inspect full 15-column report"
          >
            <RefreshCw className="w-3 h-3" />
            {isLandscape ? 'Portrait' : 'Landscape'}
          </button>
        </div>

        {/* ===================================================================
            ANDROID SCREEN VIEWPORT
            =================================================================== */}
        <div className="flex-1 bg-white sm:rounded-[22px] overflow-hidden flex flex-col relative border border-black">
          {/* 1. ANDROID SYSTEM STATUS BAR (Matches Image 2: black bar, check icon, Wi-Fi, signal, 26%, 4:33 PM) */}
          <div className="bg-black text-white px-3.5 py-1 flex items-center justify-between text-[11px] font-mono shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 border border-white/80 rounded-[2px] text-[8px] leading-none inline-flex items-center justify-center">
                ✓
              </span>
              <Navigation className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400" />
              <span className="text-[10px] text-neutral-300">GPS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3 text-white" />
              <Signal className="w-3 h-3 text-white" />
              <span className="tabular-nums">26%</span>
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              <span className="tabular-nums font-semibold">4:33 PM</span>
            </div>
          </div>

          {/* 2. ANDROID APP ACTION BAR (Matches Image 2: #484b4a background, hamburger/back, "Observation App" + green [+] "SAFETY REPORTS") */}
          <div className="bg-[#484b4a] text-white px-3 py-2 flex items-center justify-between shrink-0 shadow-xs border-b border-black/30">
            <div className="flex items-center gap-1">
              {activeScreen === 'entry' ? (
                <button
                  type="button"
                  onClick={() => setActiveScreen('dashboard')}
                  className="w-10 h-10 -ml-1 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
                  title="Back to Daily Observation Report Dashboard"
                  aria-label="Back to Dashboard"
                >
                  <ArrowLeft className="w-5 h-5 text-white stroke-[2.4]" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setShowMenuDrawer((prev) => !prev)}
                className="w-10 h-10 -ml-1 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
                title="Open App Menu"
                aria-label="Open App Menu"
              >
                <Menu className="w-6 h-6 text-neutral-100 stroke-[2.2]" />
              </button>
            </div>

            {/* Center Brand Lockup matching Image 2 */}
            <div
              onClick={() => setActiveScreen('dashboard')}
              className="flex flex-col items-center justify-center text-center cursor-pointer"
            >
              <h1 className="text-[18px] font-bold tracking-tight text-white leading-tight">
                Observation App
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-4 h-4 rounded-[3px] bg-[#00a651] inline-flex items-center justify-center text-white font-bold text-xs leading-none">
                  +
                </span>
                <span className="text-[11px] font-extrabold tracking-[0.11em] text-neutral-100 uppercase">
                  SAFETY REPORTS
                </span>
              </div>
            </div>

            {/* Right Action Slot: Quick Screen Switch or New Entry */}
            <div className="flex items-center">
              {activeScreen === 'dashboard' ? (
                <button
                  type="button"
                  onClick={() => openEntryScreen(null)}
                  className="h-8 px-2.5 rounded bg-[#109848] hover:bg-[#0d823d] text-white font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                  title="Log New Observation"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>LOG</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveScreen('dashboard')}
                  className="h-8 px-2 rounded bg-white/15 hover:bg-white/25 text-white font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Report</span>
                </button>
              )}
            </div>
          </div>

          {/* Slide-Down Android Hamburger Drawer */}
          {showMenuDrawer && (
            <div className="absolute top-[74px] left-0 right-0 z-40 bg-neutral-900 text-white border-b border-neutral-700 p-3.5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  FieldLog Android Navigation
                </span>
                <button
                  type="button"
                  onClick={() => setShowMenuDrawer(false)}
                  className="p-1 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveScreen('dashboard');
                    setShowMenuDrawer(false);
                  }}
                  className={`p-2.5 rounded-lg border text-left font-semibold flex items-center gap-2 ${
                    activeScreen === 'dashboard'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-200'
                  }`}
                >
                  <TableIcon className="w-4 h-4 shrink-0" />
                  <div>
                    <div>1. Dashboard</div>
                    <div className="text-[10px] font-normal text-neutral-400">
                      Daily Report (Ref #1)
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    openEntryScreen(null);
                    setShowMenuDrawer(false);
                  }}
                  className={`p-2.5 rounded-lg border text-left font-semibold flex items-center gap-2 ${
                    activeScreen === 'entry'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-200'
                  }`}
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <div>
                    <div>2. Detail Entry</div>
                    <div className="text-[10px] font-normal text-neutral-400">
                      Log Observation (Ref #2)
                    </div>
                  </div>
                </button>
              </div>

              <div className="pt-1 border-t border-neutral-800 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setObservations(INITIAL_OBSERVATIONS);
                    setSiteName('Tata Micron Semi conductors');
                    setShowMenuDrawer(false);
                    triggerToast('Restored default field observations.');
                  }}
                  className="text-neutral-300 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Default Data
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleExportCSV();
                    setShowMenuDrawer(false);
                  }}
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV Report
                </button>
              </div>
            </div>
          )}

          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="bg-neutral-900 text-white px-3.5 py-2 text-xs flex items-center gap-2 border-b border-emerald-500/40 shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate font-medium">{toastMessage}</span>
            </div>
          )}

          {/* =================================================================
              SCREEN 1: DASHBOARD LAYOUT (REFERENCING IMAGE 1)
              ================================================================= */}
          {activeScreen === 'dashboard' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50 relative">
              {/* IMAGE 1 HEADER 1: "Name of the Site: Tata Micron Semi conductors" */}
              <div className="bg-[#dce6f1] border-b border-black px-3 py-1.5 flex items-center justify-between shrink-0">
                {isEditingSiteName ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <span className="text-[11px] font-bold text-black shrink-0">
                      Name of the Site:
                    </span>
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      onBlur={() => setIsEditingSiteName(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setIsEditingSiteName(false)}
                      autoFocus
                      className="flex-1 px-1.5 py-0.5 text-xs font-bold bg-white border border-black focus:outline-none"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingSiteName(true)}
                    className="w-full text-center text-[12px] font-bold text-black truncate flex items-center justify-center gap-1 cursor-pointer"
                    title="Tap to edit Site Name"
                  >
                    <span>Name of the Site: {siteName}</span>
                    <Edit3 className="w-3 h-3 text-slate-600 shrink-0" />
                  </button>
                )}
              </div>

              {/* IMAGE 1 HEADER 2: Summary Status Strip (Total Observations | Open | Work in progress | Closed) */}
              <div className="grid grid-cols-8 border-b border-black text-[11px] font-bold text-black shrink-0">
                {/* Total Observations (Rose #f9d6d5) */}
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`col-span-3 bg-[#f9d6d5] border-r border-b border-black py-1.5 px-1 text-center truncate cursor-pointer ${
                    statusFilter === 'ALL' ? 'ring-2 ring-inset ring-black' : ''
                  }`}
                >
                  Total Observations
                </button>
                <div className="col-span-1 bg-white border-r border-b border-black py-1.5 px-1 text-center font-mono tabular-nums">
                  {totalCount}
                </div>

                {/* Open (Vivid Red #ff0000) */}
                <button
                  type="button"
                  onClick={() =>
                    setStatusFilter((prev) => (prev === 'Open' ? 'ALL' : 'Open'))
                  }
                  className={`col-span-3 bg-[#ff0000] text-black border-r border-b border-black py-1.5 px-1 text-center cursor-pointer ${
                    statusFilter === 'Open' ? 'ring-2 ring-inset ring-black' : ''
                  }`}
                >
                  Open
                </button>
                <div className="col-span-1 bg-white border-b border-black py-1.5 px-1 text-center font-mono tabular-nums text-red-700">
                  {openCount}
                </div>

                {/* Work in progress (Vivid Yellow #ffff00) */}
                <button
                  type="button"
                  onClick={() =>
                    setStatusFilter((prev) =>
                      prev === 'Work in progress' ? 'ALL' : 'Work in progress'
                    )
                  }
                  className={`col-span-3 bg-[#ffff00] text-black border-r border-black py-1.5 px-1 text-center truncate cursor-pointer ${
                    statusFilter === 'Work in progress'
                      ? 'ring-2 ring-inset ring-black'
                      : ''
                  }`}
                >
                  Work in progress
                </button>
                <div className="col-span-1 bg-white border-r border-black py-1.5 px-1 text-center font-mono tabular-nums text-amber-700">
                  {wipCount}
                </div>

                {/* Closed (Vivid Green #00b050) */}
                <button
                  type="button"
                  onClick={() =>
                    setStatusFilter((prev) => (prev === 'Closed' ? 'ALL' : 'Closed'))
                  }
                  className={`col-span-3 bg-[#00b050] text-black border-r border-black py-1.5 px-1 text-center cursor-pointer ${
                    statusFilter === 'Closed' ? 'ring-2 ring-inset ring-black' : ''
                  }`}
                >
                  Closed
                </button>
                <div className="col-span-1 bg-white py-1.5 px-1 text-center font-mono tabular-nums text-emerald-800">
                  {closedCount}
                </div>
              </div>

              {/* Compact Mobile Dashboard Toolbar (Switch between 15-Col Report Sheet, Mobile Cards, GPS Map, Search, Export) */}
              <div className="bg-slate-100 border-b border-slate-300 px-2.5 py-1.5 flex items-center justify-between gap-1.5 shrink-0">
                <div className="flex items-center bg-white border border-slate-300 rounded p-0.5">
                  <button
                    type="button"
                    onClick={() => setDashboardMode('sheet')}
                    className={`px-2 py-1 text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer ${
                      dashboardMode === 'sheet'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700'
                    }`}
                  >
                    <TableIcon className="w-3 h-3" />
                    <span>Report Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDashboardMode('cards')}
                    className={`px-2 py-1 text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer ${
                      dashboardMode === 'cards'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700'
                    }`}
                  >
                    <LayoutList className="w-3 h-3" />
                    <span>Cards</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDashboardMode('map')}
                    className={`px-2 py-1 text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer ${
                      dashboardMode === 'map'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700'
                    }`}
                  >
                    <MapIcon className="w-3 h-3" />
                    <span>GPS Map</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {statusFilter !== 'ALL' && (
                    <button
                      type="button"
                      onClick={() => setStatusFilter('ALL')}
                      className="px-1.5 py-1 bg-slate-800 text-white text-[10px] font-semibold rounded flex items-center gap-0.5"
                    >
                      <span>{statusFilter}</span>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowSearchBar((prev) => !prev)}
                    className={`p-1.5 rounded border ${
                      showSearchBar || searchQuery
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                    title="Search Observations"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="p-1.5 rounded bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                    title="Download CSV Report"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Collapsible Search Bar */}
              {showSearchBar && (
                <div className="bg-white border-b border-slate-300 px-3 py-1.5 flex items-center gap-2 shrink-0">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search description, location, subcontractor..."
                    autoFocus
                    className="flex-1 text-xs bg-transparent focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* SCROLLABLE DASHBOARD BODY */}
              <div className="flex-1 overflow-auto pb-20">
                {/* MODE 1: EXACT 15-COLUMN DAILY OBSERVATION REPORT SHEET (IMAGE 1) */}
                {dashboardMode === 'sheet' && (
                  <div className="w-full overflow-x-auto bg-white">
                    <div className="bg-amber-50/90 border-b border-amber-200 px-2.5 py-1 flex items-center justify-between text-[10px] text-amber-900">
                      <span>
                        Swipe table horizontally to see all 15 columns · Tap any row to edit
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsLandscape((prev) => !prev)}
                        className="hidden sm:inline-flex font-bold underline text-emerald-800 ml-2 shrink-0 cursor-pointer"
                      >
                        {isLandscape ? 'Portrait View' : 'Expand Landscape'}
                      </button>
                    </div>

                    <table className="w-full border-collapse text-[11px] text-black">
                      <thead>
                        <tr className="bg-white border-b border-black font-bold text-center align-middle">
                          <th className="border-r border-black px-1.5 py-2 w-10">
                            Sl. No.
                          </th>
                          <th className="border-r border-black px-2 py-2 min-w-[82px]">
                            Date of
                            <br />
                            Observation
                          </th>
                          <th className="border-r border-black px-2 py-2 min-w-[92px]">
                            Type of
                            <br />
                            Observation
                          </th>
                          <th className="border-r border-black px-2 py-2 min-w-[110px]">
                            Open Photo
                          </th>
                          <th className="border-r border-black px-2.5 py-2 min-w-[140px]">
                            Observation
                            <br />
                            Description
                          </th>
                          <th className="border-r border-black px-2 py-2 min-w-[95px]">
                            Category
                          </th>
                          <th className="border-r border-black px-2 py-2 min-w-[105px]">
                            Area /
                            <br />
                            Location
                          </th>
                          <th className="border-r border-black px-2 py-2 min-w-[100px]">
                            Subcontractor
                            <br />
                            Name
                          </th>
                          <th className="border-r border-black px-2 py-2 min-w-[80px]">
                            Resp.
                          </th>
                          <th className="border-r border-black px-2.5 py-2 min-w-[155px]">
                            Corrective and Preventive
                            <br />
                            measure
                          </th>
                          <th className="border-r border-black px-2 py-2 min-w-[110px]">
                            Closing Photo
                          </th>
                          <th className="border-r border-black px-2 py-2 min-w-[82px]">
                            Compliance
                            <br />
                            date
                          </th>
                          <th className="border-r border-black px-2 py-2 min-w-[90px]">
                            Status
                          </th>
                          <th className="border-r border-black px-2 py-2 min-w-[95px]">
                            Observation
                            <br />
                            Reported by
                          </th>
                          <th className="px-2 py-2 min-w-[110px]">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredObservations.map((row, idx) => {
                          const statusBg =
                            row.status === 'Closed'
                              ? 'bg-[#00b050] text-black'
                              : row.status === 'Work in progress'
                              ? 'bg-[#ffff00] text-black'
                              : 'bg-[#ff0000] text-white';

                          return (
                            <tr
                              key={row.id}
                              className="border-b border-black hover:bg-slate-50 align-middle"
                            >
                              {/* 1. Sl. No. */}
                              <td className="border-r border-black px-1.5 py-2 text-center font-mono font-bold">
                                {idx + 1}
                              </td>

                              {/* 2. Date of Observation */}
                              <td className="border-r border-black px-2 py-2 text-center font-mono">
                                <div>{row.dateOfObservation}</div>
                                <div className="text-[9px] text-slate-500">
                                  {row.timeOfObservation}
                                </div>
                              </td>

                              {/* 3. Type of Observation */}
                              <td className="border-r border-black px-2 py-2 text-center">
                                {row.typeOfObservation}
                              </td>

                              {/* 4. Open Photo */}
                              <td className="border-r border-black p-1.5 text-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setLightboxData({
                                      photoUrl: row.openPhoto,
                                      title: row.observationDescription,
                                      kind: 'Open Photo',
                                      record: row,
                                    })
                                  }
                                  className="block w-24 h-16 mx-auto border border-slate-400 overflow-hidden bg-slate-900 cursor-pointer"
                                >
                                  <img
                                    src={row.openPhoto}
                                    alt={row.observationDescription}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                                <div className="text-[9px] font-mono text-emerald-800 mt-0.5">
                                  {row.coordinates.latitude.toFixed(4)}°N
                                </div>
                              </td>

                              {/* 5. Observation Description */}
                              <td className="border-r border-black px-2 py-2 font-semibold">
                                <div>{row.observationDescription}</div>
                                <button
                                  type="button"
                                  onClick={() => openEntryScreen(row)}
                                  className="mt-1 text-[10px] text-emerald-700 underline font-bold flex items-center gap-0.5 cursor-pointer"
                                >
                                  <Edit3 className="w-2.5 h-2.5" /> Edit in Entry Screen
                                </button>
                              </td>

                              {/* 6. Category */}
                              <td className="border-r border-black px-2 py-2 text-center">
                                {row.category}
                              </td>

                              {/* 7. Area / Location */}
                              <td className="border-r border-black px-2 py-2 text-center">
                                <div className="font-bold">{row.areaLocation}</div>
                                <div className="text-[9px] font-mono text-slate-600">
                                  {row.coordinates.latitude.toFixed(4)}°N,{' '}
                                  {row.coordinates.longitude.toFixed(4)}°E
                                </div>
                              </td>

                              {/* 8. Subcontractor Name */}
                              <td className="border-r border-black px-2 py-2 text-center">
                                {row.subcontractorName}
                              </td>

                              {/* 9. Resp. */}
                              <td className="border-r border-black px-2 py-2 text-center font-medium">
                                {row.responsiblePerson}
                              </td>

                              {/* 10. Corrective and Preventive measure */}
                              <td className="border-r border-black px-2 py-2 text-left leading-tight">
                                {row.correctivePreventiveMeasure}
                              </td>

                              {/* 11. Closing Photo */}
                              <td className="border-r border-black p-1.5 text-center">
                                {row.closingPhoto ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setLightboxData({
                                        photoUrl: row.closingPhoto,
                                        title: `Closed: ${row.observationDescription}`,
                                        kind: 'Closing Photo',
                                        record: row,
                                      })
                                    }
                                    className="block w-24 h-16 mx-auto border border-emerald-600 overflow-hidden bg-slate-900 cursor-pointer"
                                  >
                                    <img
                                      src={row.closingPhoto}
                                      alt="Closing"
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover"
                                    />
                                  </button>
                                ) : (
                                  <div className="flex flex-col gap-1 items-center">
                                    <button
                                      type="button"
                                      onClick={() => handleQuickRectifyRow(row)}
                                      className="px-1.5 py-1 bg-emerald-700 text-white text-[9px] font-bold rounded flex items-center gap-0.5 cursor-pointer"
                                    >
                                      <Camera className="w-2.5 h-2.5" /> Snap Closing
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setClosingUploadRow(row);
                                        rowClosingInputRef.current?.click();
                                      }}
                                      className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 text-slate-700 text-[9px] rounded"
                                    >
                                      Upload
                                    </button>
                                  </div>
                                )}
                              </td>

                              {/* 12. Compliance date */}
                              <td className="border-r border-black px-2 py-2 text-center font-mono">
                                {row.complianceDate}
                              </td>

                              {/* 13. Status (Exact solid green/yellow/red fill from Image 1) */}
                              <td
                                className={`border-r border-black p-0 text-center font-bold ${statusBg}`}
                              >
                                <div className="min-h-[72px] flex items-center justify-center px-1">
                                  <select
                                    value={row.status}
                                    onChange={(e) =>
                                      handleUpdateStatus(
                                        row.id,
                                        e.target.value as ObservationStatus
                                      )
                                    }
                                    aria-label="Observation Status"
                                    className="bg-transparent font-bold text-center text-[11px] focus:outline-none cursor-pointer"
                                  >
                                    <option value="Open" className="bg-white text-black">
                                      Open
                                    </option>
                                    <option
                                      value="Work in progress"
                                      className="bg-white text-black"
                                    >
                                      Work in progress
                                    </option>
                                    <option value="Closed" className="bg-white text-black">
                                      Closed
                                    </option>
                                  </select>
                                </div>
                              </td>

                              {/* 14. Observation Reported by */}
                              <td className="border-r border-black px-2 py-2 text-center">
                                {row.reportedBy}
                              </td>

                              {/* 15. Remarks */}
                              <td className="px-2 py-2 text-left text-slate-700 leading-tight">
                                {row.remarks}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* MODE 2: MOBILE FIELD CARDS VIEW */}
                {dashboardMode === 'cards' && (
                  <div className="p-2.5 space-y-2.5">
                    {filteredObservations.map((row, idx) => {
                      const statusBadge =
                        row.status === 'Closed'
                          ? 'bg-[#00b050] text-black'
                          : row.status === 'Work in progress'
                          ? 'bg-[#ffff00] text-black'
                          : 'bg-[#ff0000] text-white';

                      return (
                        <div
                          key={row.id}
                          className="bg-white border border-slate-300 rounded-lg overflow-hidden shadow-2xs"
                        >
                          <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">
                              Sl. No. {idx + 1} · {row.areaLocation}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded ${statusBadge}`}
                            >
                              {row.status}
                            </span>
                          </div>

                          <div className="p-3 flex gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setLightboxData({
                                  photoUrl: row.openPhoto,
                                  title: row.observationDescription,
                                  kind: 'Open Photo',
                                  record: row,
                                })
                              }
                              className="w-24 h-20 rounded border border-slate-300 overflow-hidden shrink-0 bg-slate-900"
                            >
                              <img
                                src={row.openPhoto}
                                alt={row.observationDescription}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            </button>

                            <div className="flex-1 min-w-0 space-y-1 text-xs">
                              <div className="font-bold text-slate-900 leading-snug">
                                {row.observationDescription}
                              </div>
                              <div className="text-[11px] text-slate-600">
                                {row.typeOfObservation} · {row.category}
                              </div>
                              <div className="text-[10px] font-mono text-emerald-700 flex items-center gap-1">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span>
                                  {formatCoordDMS(
                                    row.coordinates.latitude,
                                    row.coordinates.longitude
                                  )}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Subcontractor: {row.subcontractorName} · Resp:{' '}
                                {row.responsiblePerson}
                              </div>
                            </div>
                          </div>

                          <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                            <span className="font-mono text-[10px] text-slate-500">
                              Date: {row.dateOfObservation}
                            </span>
                            <div className="flex items-center gap-2">
                              {!row.closingPhoto && (
                                <button
                                  type="button"
                                  onClick={() => handleQuickRectifyRow(row)}
                                  className="px-2 py-1 bg-emerald-700 text-white text-[10px] font-bold rounded"
                                >
                                  + Closing Photo
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => openEntryScreen(row)}
                                className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded"
                              >
                                Edit Detail
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteObservation(row.id)}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* MODE 3: INTERACTIVE GPS SITE MAP VIEW */}
                {dashboardMode === 'map' && (
                  <div className="p-3 space-y-2.5">
                    <div className="bg-slate-900 text-white p-3 rounded-lg border border-slate-700">
                      <div className="text-xs font-bold flex items-center gap-1.5 text-emerald-400">
                        <Crosshair className="w-4 h-4" />
                        Geotagged Observations Map — {siteName}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Tap any GPS pin to view its geotagged photo or edit in the Detail Entry Screen.
                      </p>

                      <div className="relative h-72 w-full bg-[#0b1324] border border-slate-700 rounded mt-2.5 overflow-hidden">
                        <div
                          className="absolute inset-0 opacity-20"
                          style={{
                            backgroundImage:
                              'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
                            backgroundSize: '28px 28px',
                          }}
                        />

                        {SITE_ZONE_PRESETS.map((z) => (
                          <div
                            key={z.code}
                            style={{ left: `${z.mapX}%`, top: `${z.mapY}%` }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 px-1.5 py-1 bg-sky-950/70 border border-sky-400/40 rounded text-[9px] font-mono text-sky-200 pointer-events-none"
                          >
                            {z.code}: {z.name}
                          </div>
                        ))}

                        {filteredObservations.map((obs, idx) => {
                          const normX = Math.min(
                            90,
                            Math.max(
                              10,
                              ((obs.coordinates.longitude - 72.4965) / 0.008) * 100
                            )
                          );
                          const normY = Math.min(
                            86,
                            Math.max(
                              14,
                              ((23.0005 - obs.coordinates.latitude) / 0.006) * 100
                            )
                          );
                          const pinColor =
                            obs.status === 'Closed'
                              ? 'bg-[#00b050] text-black'
                              : obs.status === 'Work in progress'
                              ? 'bg-[#ffff00] text-black'
                              : 'bg-[#ff0000] text-white';

                          return (
                            <button
                              key={obs.id}
                              type="button"
                              onClick={() => openEntryScreen(obs)}
                              style={{ left: `${normX}%`, top: `${normY}%` }}
                              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center cursor-pointer"
                            >
                              <span
                                className={`px-1.5 py-0.5 rounded border border-white text-[10px] font-mono font-bold shadow ${pinColor}`}
                              >
                                #{idx + 1} {obs.areaLocation}
                              </span>
                              <span className="w-2 h-2 rounded-full bg-white border border-black mt-0.5" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ANDROID FLOATING ACTION BUTTON (FAB) TO OPEN SCREEN 2 (DETAIL ENTRY SCREEN) */}
              <button
                type="button"
                onClick={() => openEntryScreen(null)}
                className="absolute bottom-4 right-4 z-20 h-12 px-4 rounded-full bg-[#109848] hover:bg-[#0d823d] active:scale-95 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 cursor-pointer border border-white/20"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span>New Observation</span>
              </button>
            </div>
          )}

          {/* =================================================================
              SCREEN 2: DETAIL ENTRY SCREEN (EXACT IMAGE 2 LAYOUT)
              ================================================================= */}
          {activeScreen === 'entry' && (
            <div className="flex-1 overflow-y-auto bg-white text-slate-900">
              {editingObservation && (
                <div className="bg-amber-50 border-b border-amber-300 px-4 py-1.5 flex items-center justify-between text-xs text-amber-950">
                  <span className="font-bold">
                    Editing Observation #{editingObservation.slNo}
                  </span>
                  <button
                    type="button"
                    onClick={() => openEntryScreen(null)}
                    className="underline font-semibold text-amber-900"
                  >
                    Switch to New
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmitEntry} className="px-6 py-4 space-y-4">
                {/* 1. Location: (Exact Image 2 label & rectangular input + GPS Geotagging) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="entry-location"
                      className="block text-[15px] font-bold text-slate-900"
                    >
                      Location:
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowMapPinPicker((prev) => !prev)}
                      className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      {showMapPinPicker ? 'Hide GPS Zones' : 'GPS Zones'}
                    </button>
                  </div>

                  <input
                    id="entry-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Warehouse"
                    className="w-full h-10 px-2.5 py-1.5 text-[15px] text-slate-900 bg-white border border-slate-500 focus:border-slate-900 focus:outline-none rounded-none"
                  />

                  {/* Live Geotagging Coordinates Bar */}
                  <div className="mt-1.5 bg-slate-100 border border-slate-300 px-2.5 py-1.5 flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Crosshair
                        className={`w-3.5 h-3.5 shrink-0 ${
                          gpsStatus === 'acquiring'
                            ? 'text-amber-600 animate-spin'
                            : 'text-emerald-700'
                        }`}
                      />
                      <span className="font-mono text-slate-800 truncate tabular-nums">
                        {formatCoordDMS(coordinates.latitude, coordinates.longitude)}
                      </span>
                      <span className="text-slate-500 font-mono shrink-0">
                        ±{coordinates.accuracyMeters}m
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAcquireLiveGPS}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-[10px] rounded shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      GPS Lock
                    </button>
                  </div>

                  {showMapPinPicker && (
                    <div className="mt-2 p-2.5 bg-slate-50 border border-slate-300 space-y-2 text-xs">
                      <div className="font-semibold text-slate-700">
                        Tap a Site Zone to Auto-Geotag:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {SITE_ZONE_PRESETS.map((z) => (
                          <button
                            key={z.code}
                            type="button"
                            onClick={() => handleSelectZonePreset(z.name)}
                            className={`px-2 py-1 text-[11px] border cursor-pointer ${
                              location === z.name
                                ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                                : 'bg-white text-slate-700 border-slate-300'
                            }`}
                          >
                            {z.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Date/Time: (Exact Image 2 input + dark metallic gradient dropdown arrow button ▼) */}
                <div className="relative">
                  <label
                    htmlFor="entry-datetime"
                    className="block text-[15px] font-bold text-slate-900 mb-1"
                  >
                    Date/Time:
                  </label>
                  <div className="flex items-stretch h-10 border border-slate-500 bg-white">
                    <input
                      id="entry-datetime"
                      type="text"
                      value={dateOfObservation}
                      onChange={(e) => setDateOfObservation(e.target.value)}
                      placeholder="03-27-2019"
                      className="flex-1 px-2.5 py-1.5 text-[15px] font-mono text-slate-900 bg-white focus:outline-none min-w-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDateDropdown((prev) => !prev)}
                      className="w-16 bg-gradient-to-b from-[#8b8e8f] via-[#5e6162] to-[#3b3d3e] text-white border-l border-slate-600 flex items-center justify-center active:opacity-90 cursor-pointer"
                      aria-label="Select Date Preset"
                    >
                      <span className="text-sm leading-none">▼</span>
                    </button>
                  </div>

                  {showDateDropdown && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-600 shadow-lg py-1 text-xs">
                      {DATE_PRESETS.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            setDateOfObservation(d);
                            setShowDateDropdown(false);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-100 font-mono flex items-center justify-between"
                        >
                          <span>{d}</span>
                          {d === '03-27-2019' && (
                            <span className="text-[10px] text-emerald-700 font-sans">
                              Ref #2 Date
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Photo: Camera [icon] | Gallery [icon] (Exact Image 2 buttons) */}
                <div>
                  <div className="flex items-center gap-2.5 pt-1">
                    <span className="text-[15px] font-bold text-slate-900 shrink-0">
                      Photo:
                    </span>

                    <button
                      type="button"
                      onClick={() => openCameraFor('open')}
                      className="flex-1 h-11 px-3 rounded-[10px] border border-slate-600 bg-white hover:bg-slate-50 active:bg-slate-100 flex items-center justify-between text-[14px] font-bold text-slate-900 shadow-2xs cursor-pointer"
                    >
                      <span>Camera</span>
                      <Camera className="w-5 h-5 text-slate-700 stroke-[1.8]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActivePhotoTarget('open');
                        setShowGalleryModal(true);
                      }}
                      className="flex-1 h-11 px-3 rounded-[10px] border border-slate-600 bg-white hover:bg-slate-50 active:bg-slate-100 flex items-center justify-between text-[14px] font-bold text-slate-900 shadow-2xs cursor-pointer"
                    >
                      <span>Gallery</span>
                      <ImageIcon className="w-5 h-5 text-slate-700 stroke-[1.8]" />
                    </button>
                  </div>

                  {/* Attached Geotagged Photo Preview */}
                  {openPhoto && (
                    <div className="mt-2.5 flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-300 rounded">
                      <img
                        src={openPhoto}
                        alt="Attached Open Observation"
                        referrerPolicy="no-referrer"
                        className="w-16 h-11 object-cover rounded border border-slate-400 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold text-slate-800 truncate">
                          Geotagged Photo Attached
                        </div>
                        <div className="text-[10px] font-mono text-emerald-700 truncate">
                          {formatCoordDMS(coordinates.latitude, coordinates.longitude)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openCameraFor('open')}
                        className="px-2 py-1 text-[10px] font-semibold text-slate-700 bg-white border border-slate-300 rounded"
                      >
                        Retake
                      </button>
                    </div>
                  )}
                </div>

                {/* 4. Describe what you observed (Exact Image 2 label & textarea) */}
                <div>
                  <label
                    htmlFor="entry-description"
                    className="block text-[15px] font-bold text-slate-900 mb-1"
                  >
                    Describe what you observed
                  </label>
                  <textarea
                    id="entry-description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Broken handle on hammer"
                    className="w-full p-2.5 text-[15px] text-slate-900 bg-white border border-slate-500 focus:border-slate-900 focus:outline-none rounded-none resize-none leading-snug"
                  />
                </div>

                {/* Collapsible 15-Column Daily Observation Report Details */}
                <div className="border-t border-slate-200 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowExtendedFields((prev) => !prev)}
                    className="w-full py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded flex items-center justify-between text-xs font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
                      Report Details ({status} · {category})
                    </span>
                    {showExtendedFields ? (
                      <ChevronUp className="w-4 h-4 text-slate-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-600" />
                    )}
                  </button>

                  {showExtendedFields && (
                    <div className="mt-2 space-y-2.5 bg-slate-50 p-3 border border-slate-300 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-0.5">
                            Type of Observation
                          </label>
                          <select
                            value={typeOfObservation}
                            onChange={(e) =>
                              setTypeOfObservation(e.target.value as ObservationType)
                            }
                            className="w-full h-8 px-1.5 bg-white border border-slate-400 text-xs"
                          >
                            {OBSERVATION_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-0.5">
                            Category
                          </label>
                          <select
                            value={category}
                            onChange={(e) =>
                              setCategory(e.target.value as ObservationCategory)
                            }
                            className="w-full h-8 px-1.5 bg-white border border-slate-400 text-xs"
                          >
                            {OBSERVATION_CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-0.5">
                            Subcontractor Name
                          </label>
                          <input
                            type="text"
                            value={subcontractorName}
                            onChange={(e) => setSubcontractorName(e.target.value)}
                            className="w-full h-8 px-2 bg-white border border-slate-400 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-0.5">
                            Resp. Person
                          </label>
                          <input
                            type="text"
                            value={responsiblePerson}
                            onChange={(e) => setResponsiblePerson(e.target.value)}
                            className="w-full h-8 px-2 bg-white border border-slate-400 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-0.5">
                          Corrective and Preventive measure
                        </label>
                        <textarea
                          rows={2}
                          value={correctiveMeasure}
                          onChange={(e) => setCorrectiveMeasure(e.target.value)}
                          className="w-full p-1.5 bg-white border border-slate-400 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-0.5">
                            Status
                          </label>
                          <select
                            value={status}
                            onChange={(e) =>
                              setStatus(e.target.value as ObservationStatus)
                            }
                            className="w-full h-8 px-1.5 bg-white border border-slate-400 text-xs font-bold"
                          >
                            <option value="Open">Open</option>
                            <option value="Work in progress">Work in progress</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-0.5">
                            Compliance Date
                          </label>
                          <input
                            type="text"
                            value={complianceDate}
                            onChange={(e) => setComplianceDate(e.target.value)}
                            className="w-full h-8 px-2 bg-white border border-slate-400 text-xs font-mono"
                          />
                        </div>
                      </div>

                      {/* Closing Photo inside Entry Form */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-semibold text-slate-700">
                          Closing Photo:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openCameraFor('closing')}
                            className="px-2 py-1 bg-white border border-slate-400 rounded text-[11px] font-medium flex items-center gap-1"
                          >
                            <Camera className="w-3 h-3" /> Camera
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActivePhotoTarget('closing');
                              setShowGalleryModal(true);
                            }}
                            className="px-2 py-1 bg-white border border-slate-400 rounded text-[11px] font-medium flex items-center gap-1"
                          >
                            <ImageIcon className="w-3 h-3" /> Gallery
                          </button>
                        </div>
                      </div>
                      {closingPhoto && (
                        <div className="flex items-center gap-2 bg-emerald-50 p-1.5 border border-emerald-300 rounded">
                          <img
                            src={closingPhoto}
                            alt="Closing"
                            referrerPolicy="no-referrer"
                            className="w-12 h-9 object-cover rounded border border-emerald-500"
                          />
                          <span className="text-[11px] text-emerald-900 font-semibold flex-1">
                            Closing Photo Attached
                          </span>
                          <button
                            type="button"
                            onClick={() => setClosingPhoto('')}
                            className="text-[11px] text-rose-600 underline"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 5. SUBMIT & CANCEL BUTTONS (Exact Image 2 styling & colors) */}
                <div className="pt-2 pb-4 px-4 space-y-3">
                  <button
                    type="submit"
                    className="w-full h-11 rounded-[10px] bg-[#109848] hover:bg-[#0d823d] active:scale-[0.99] text-white font-bold text-[15px] tracking-wide uppercase shadow-sm transition-all cursor-pointer"
                  >
                    SUBMIT
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveScreen('dashboard')}
                    className="w-full h-11 rounded-[10px] bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-900 font-bold text-[15px] tracking-wide uppercase border border-slate-700 transition-all cursor-pointer"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =================================================================
              CAMERA MODAL INSIDE ANDROID VIEWPORT
              ================================================================= */}
          {showCameraModal && (
            <div className="absolute inset-0 z-50 bg-neutral-950 text-white flex flex-col justify-between p-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  Android Geotag Camera ({activePhotoTarget})
                </span>
                <button
                  type="button"
                  onClick={() => setShowCameraModal(false)}
                  className="p-1 text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative my-2 flex-1 bg-neutral-900 rounded-lg overflow-hidden border border-neutral-700 flex items-center justify-center">
                {cameraStreamActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={generateFieldScenePhoto(
                      FIELD_PHOTO_PRESETS[
                        simulatedSceneIdx % FIELD_PHOTO_PRESETS.length
                      ].sceneType,
                      location || 'Warehouse',
                      coordinates,
                      `${dateOfObservation} ${timeOfObservation}`,
                      activePhotoTarget === 'open' ? 'OPEN PHOTO' : 'CLOSING PHOTO'
                    )}
                    alt="Camera Viewfinder"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                )}

                {!cameraStreamActive && (
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between bg-black/75 px-2.5 py-1.5 rounded text-[11px]">
                    <span className="truncate font-mono text-emerald-300">
                      {FIELD_PHOTO_PRESETS[simulatedSceneIdx % FIELD_PHOTO_PRESETS.length].title}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSimulatedSceneIdx((i) => i + 1)}
                      className="ml-2 px-2 py-0.5 bg-emerald-600 text-white rounded font-semibold shrink-0"
                    >
                      Next Scene
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[10px] font-mono text-neutral-400">
                  <div>LAT: {coordinates.latitude.toFixed(5)}° N</div>
                  <div>LON: {coordinates.longitude.toFixed(5)}° E</div>
                </div>

                <button
                  type="button"
                  onClick={handleCaptureCameraPhoto}
                  className="w-14 h-14 rounded-full bg-white p-1 border-4 border-emerald-500 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                >
                  <div className="w-full h-full rounded-full bg-emerald-600" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowCameraModal(false)}
                  className="text-xs text-neutral-300 px-2 py-1"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* =================================================================
              GALLERY MODAL INSIDE ANDROID VIEWPORT
              ================================================================= */}
          {showGalleryModal && (
            <div className="absolute inset-0 z-50 bg-neutral-900/95 text-white flex flex-col p-4">
              <div className="flex items-center justify-between border-b border-neutral-700 pb-2.5">
                <span className="text-sm font-bold flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  Photo Gallery ({activePhotoTarget === 'open' ? 'Open Photo' : 'Closing Photo'})
                </span>
                <button
                  type="button"
                  onClick={() => setShowGalleryModal(false)}
                  className="p-1 text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="my-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo from Device (Stamps GPS Coordinates)
                </button>
              </div>

              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Or Select Field Observation Photo:
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {FIELD_PHOTO_PRESETS.map((preset) => {
                  const previewUri = generateFieldScenePhoto(
                    preset.sceneType,
                    location || 'Warehouse',
                    coordinates,
                    `${dateOfObservation} ${timeOfObservation}`,
                    activePhotoTarget === 'open' ? 'OPEN PHOTO' : 'CLOSING PHOTO'
                  );
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectGalleryPreset(preset)}
                      className="w-full text-left p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 flex items-center gap-2.5 cursor-pointer"
                    >
                      <img
                        src={previewUri}
                        alt={preset.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-12 object-cover rounded border border-neutral-600 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white leading-snug">
                          {preset.title}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                          {preset.category}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* =================================================================
              PHOTO LIGHTBOX MODAL INSIDE ANDROID VIEWPORT
              ================================================================= */}
          {lightboxData && (
            <div
              className="absolute inset-0 z-50 bg-black/90 text-white flex flex-col justify-between p-4"
              onClick={() => setLightboxData(null)}
            >
              <div
                className="flex items-center justify-between border-b border-neutral-800 pb-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <div className="text-[10px] font-mono text-emerald-400 uppercase">
                    {lightboxData.kind} · Sl. No. {lightboxData.record.slNo}
                  </div>
                  <div className="text-xs font-bold">{lightboxData.title}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxData(null)}
                  className="p-1 text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div
                className="my-2 flex-1 flex items-center justify-center overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={lightboxData.photoUrl}
                  alt={lightboxData.title}
                  referrerPolicy="no-referrer"
                  className="max-h-full w-auto object-contain rounded border border-neutral-700"
                />
              </div>

              <div
                className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 text-xs space-y-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Location:</span>
                  <span className="font-bold">{lightboxData.record.areaLocation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">GPS Geotag:</span>
                  <span className="font-mono text-emerald-400">
                    {formatCoordDMS(
                      lightboxData.record.coordinates.latitude,
                      lightboxData.record.coordinates.longitude
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const rec = lightboxData.record;
                      setLightboxData(null);
                      openEntryScreen(rec);
                    }}
                    className="flex-1 py-2 bg-[#109848] text-white font-bold rounded text-center cursor-pointer"
                  >
                    Edit in Entry Screen
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxData(null)}
                    className="px-4 py-2 bg-neutral-800 text-neutral-200 font-semibold rounded cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. ANDROID BOTTOM TAB SWITCHER (Screen 1 Dashboard vs Screen 2 Detail Entry) */}
          <div className="bg-neutral-100 border-t border-neutral-300 grid grid-cols-2 h-11 shrink-0">
            <button
              type="button"
              onClick={() => setActiveScreen('dashboard')}
              className={`flex items-center justify-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                activeScreen === 'dashboard'
                  ? 'bg-white text-[#109848] border-t-2 border-[#109848]'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>1. Report Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => openEntryScreen(editingObservation)}
              className={`flex items-center justify-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                activeScreen === 'entry'
                  ? 'bg-white text-[#109848] border-t-2 border-[#109848]'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>2. Detail Entry Screen</span>
            </button>
          </div>

          {/* 4. ANDROID SYSTEM HARDWARE NAVIGATION BAR (Back ◀, Home ●, Recents ■) */}
          <div className="bg-black text-white/80 h-8 flex items-center justify-around px-12 shrink-0">
            <button
              type="button"
              onClick={() => setActiveScreen('dashboard')}
              className="p-1 hover:text-white active:scale-90 transition-transform cursor-pointer"
              title="Android Back"
              aria-label="Android Back"
            >
              <span className="text-xs leading-none">◀</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveScreen('dashboard')}
              className="p-1 hover:text-white active:scale-90 transition-transform cursor-pointer"
              title="Android Home"
              aria-label="Android Home"
            >
              <span className="text-xs leading-none">●</span>
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveScreen((prev) =>
                  prev === 'dashboard' ? 'entry' : 'dashboard'
                )
              }
              className="p-1 hover:text-white active:scale-90 transition-transform cursor-pointer"
              title="Switch Recent Screen"
              aria-label="Switch Screen"
            >
              <span className="text-[10px] leading-none">■</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
