export type ObservationStatus = 'Open' | 'Work in progress' | 'Closed';

export type ObservationType =
  | 'Unsafe Condition'
  | 'Unsafe Act'
  | 'Near Miss'
  | 'Good Practice'
  | 'Environmental'
  | 'Quality Defect';

export type ObservationCategory =
  | 'Hand & Power Tools'
  | 'Scaffolding & Work at Height'
  | 'Electrical Safety'
  | 'Housekeeping & Walkways'
  | 'PPE Compliance'
  | 'Chemical & Gas Handling'
  | 'Excavation & Trenching'
  | 'Fire & Life Safety'
  | 'Material Handling & Rigging';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  altitudeMeters?: number;
  zoneCode?: string;
  capturedAt: string;
}

export interface ObservationRecord {
  id: string;
  slNo: number;
  dateOfObservation: string;
  timeOfObservation: string;
  typeOfObservation: ObservationType;
  openPhoto: string;
  openPhotoCaption?: string;
  observationDescription: string;
  category: ObservationCategory;
  areaLocation: string;
  coordinates: GeoCoordinates;
  subcontractorName: string;
  responsiblePerson: string;
  correctivePreventiveMeasure: string;
  closingPhoto: string;
  complianceDate: string;
  status: ObservationStatus;
  reportedBy: string;
  remarks: string;
}

export interface SiteZonePreset {
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  defaultSubcontractor: string;
  defaultResp: string;
  mapX: number;
  mapY: number;
}
