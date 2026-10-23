import { ObservationRecord, SiteZonePreset } from '../types/observation';
import { generateFieldScenePhoto } from '../utils/photoGenerator';

export const SITE_ZONE_PRESETS: SiteZonePreset[] = [
  {
    name: 'Warehouse',
    code: 'WH-01',
    latitude: 22.99684,
    longitude: 72.49912,
    defaultSubcontractor: 'Tata Projects Logistics',
    defaultResp: 'R. K. Sharma',
    mapX: 22,
    mapY: 68,
  },
  {
    name: 'Fab Cleanroom Bay 2',
    code: 'FAB-E2',
    latitude: 22.99815,
    longitude: 72.50145,
    defaultSubcontractor: 'L&T Construction EHS',
    defaultResp: 'Vikram Patel',
    mapX: 54,
    mapY: 36,
  },
  {
    name: '220kV GIS Substation',
    code: 'SUB-04',
    latitude: 22.99542,
    longitude: 72.50318,
    defaultSubcontractor: 'Sterling & Wilson MEP',
    defaultResp: 'Anil Deshmukh',
    mapX: 78,
    mapY: 62,
  },
  {
    name: 'Chemical Dispense Bldg',
    code: 'CHEM-B1',
    latitude: 22.99908,
    longitude: 72.49785,
    defaultSubcontractor: 'Blue Star Cleanroom',
    defaultResp: 'S. Nair',
    mapX: 34,
    mapY: 26,
  },
];

const row1Coords = {
  latitude: 22.99684,
  longitude: 72.49912,
  accuracyMeters: 2.4,
  altitudeMeters: 44,
  zoneCode: 'WH-01',
  capturedAt: '03-27-2019 16:33',
};

const row2Coords = {
  latitude: 22.99815,
  longitude: 72.50145,
  accuracyMeters: 3.1,
  altitudeMeters: 52,
  zoneCode: 'FAB-E2',
  capturedAt: '10-23-2026 09:15',
};

const row3Coords = {
  latitude: 22.99542,
  longitude: 72.50318,
  accuracyMeters: 1.9,
  altitudeMeters: 43,
  zoneCode: 'SUB-04',
  capturedAt: '10-23-2026 11:40',
};

const row4Coords = {
  latitude: 22.99908,
  longitude: 72.49785,
  accuracyMeters: 2.7,
  altitudeMeters: 45,
  zoneCode: 'CHEM-B1',
  capturedAt: '10-22-2026 14:20',
};

export const INITIAL_OBSERVATIONS: ObservationRecord[] = [
  {
    id: 'obs-1',
    slNo: 1,
    dateOfObservation: '03-27-2019',
    timeOfObservation: '16:33',
    typeOfObservation: 'Unsafe Condition',
    openPhoto: generateFieldScenePhoto(
      'broken_hammer',
      'Warehouse',
      row1Coords,
      '03-27-2019 16:33',
      'OPEN PHOTO'
    ),
    openPhotoCaption: 'Broken handle on hammer at Warehouse Bay 3 workbench',
    observationDescription: 'Broken handle on hammer',
    category: 'Hand & Power Tools',
    areaLocation: 'Warehouse',
    coordinates: row1Coords,
    subcontractorName: 'Tata Projects Logistics',
    responsiblePerson: 'R. K. Sharma',
    correctivePreventiveMeasure:
      'Damaged hammer removed from service; issued ANSI fiberglass handle hammer.',
    closingPhoto: generateFieldScenePhoto(
      'new_hammer',
      'Warehouse',
      row1Coords,
      '03-28-2019 10:15',
      'CLOSING PHOTO'
    ),
    complianceDate: '03-28-2019',
    status: 'Closed',
    reportedBy: 'R. H. Singh',
    remarks: 'Verified closed during tool crib inspection.',
  },
  {
    id: 'obs-2',
    slNo: 2,
    dateOfObservation: '10-23-2026',
    timeOfObservation: '09:15',
    typeOfObservation: 'Unsafe Condition',
    openPhoto: generateFieldScenePhoto(
      'scaffold_missing_rail',
      'Fab Cleanroom Bay 2',
      row2Coords,
      '10-23-2026 09:15',
      'OPEN PHOTO'
    ),
    openPhotoCaption: 'Missing mid-rail and toe-board at +6.5m elevation',
    observationDescription:
      'Missing mid-rail and unsecured toe-board on external access scaffold.',
    category: 'Scaffolding & Work at Height',
    areaLocation: 'Fab Cleanroom Bay 2',
    coordinates: row2Coords,
    subcontractorName: 'L&T Construction EHS',
    responsiblePerson: 'Vikram Patel',
    correctivePreventiveMeasure:
      'Install double guardrail couplers and steel toe-boards prior to green Scafftag.',
    closingPhoto: '',
    complianceDate: '10-24-2026',
    status: 'Open',
    reportedBy: 'R. H. Singh',
    remarks: 'Red Do-Not-Use tag placed at ladder access.',
  },
  {
    id: 'obs-3',
    slNo: 3,
    dateOfObservation: '10-23-2026',
    timeOfObservation: '11:40',
    typeOfObservation: 'Unsafe Condition',
    openPhoto: generateFieldScenePhoto(
      'electrical_panel_open',
      '220kV GIS Substation',
      row3Coords,
      '10-23-2026 11:40',
      'OPEN PHOTO'
    ),
    openPhotoCaption: 'Unsealed cable entry on 415V DB-04',
    observationDescription:
      'Unsealed cable entry without brass gland on temporary 415V distribution board DB-04.',
    category: 'Electrical Safety',
    areaLocation: '220kV GIS Substation',
    coordinates: row3Coords,
    subcontractorName: 'Sterling & Wilson MEP',
    responsiblePerson: 'Anil Deshmukh',
    correctivePreventiveMeasure:
      'Apply LOTO, fit heavy-duty brass double-compression cable gland and test earth continuity.',
    closingPhoto: '',
    complianceDate: '10-23-2026',
    status: 'Work in progress',
    reportedBy: 'K. Venkat',
    remarks: 'LOTO applied; electrician fitting gland.',
  },
  {
    id: 'obs-4',
    slNo: 4,
    dateOfObservation: '10-22-2026',
    timeOfObservation: '14:20',
    typeOfObservation: 'Unsafe Act',
    openPhoto: generateFieldScenePhoto(
      'chemical_eyewash_blocked',
      'Chemical Dispense Bldg',
      row4Coords,
      '10-22-2026 14:20',
      'OPEN PHOTO'
    ),
    openPhotoCaption: 'Pallet obstructing emergency eyewash shower',
    observationDescription:
      'Emergency eyewash shower access obstructed by wooden staging pallet.',
    category: 'Chemical & Gas Handling',
    areaLocation: 'Chemical Dispense Bldg',
    coordinates: row4Coords,
    subcontractorName: 'Blue Star Cleanroom',
    responsiblePerson: 'S. Nair',
    correctivePreventiveMeasure:
      'Pallet relocated and yellow keep-clear floor grid painted.',
    closingPhoto: generateFieldScenePhoto(
      'chemical_eyewash_clear',
      'Chemical Dispense Bldg',
      row4Coords,
      '10-22-2026 17:05',
      'CLOSING PHOTO'
    ),
    complianceDate: '10-22-2026',
    status: 'Closed',
    reportedBy: 'R. H. Singh',
    remarks: 'Closed same day; flow pressure verified.',
  },
];
