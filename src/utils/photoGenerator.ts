import { GeoCoordinates } from '../types/observation';

export interface FieldPhotoPreset {
  id: string;
  title: string;
  kind: 'open' | 'closing';
  category: string;
  sceneType:
    | 'broken_hammer'
    | 'new_hammer'
    | 'scaffold_missing_rail'
    | 'scaffold_fixed'
    | 'electrical_panel_open'
    | 'electrical_panel_closed'
    | 'chemical_eyewash_blocked'
    | 'chemical_eyewash_clear';
}

export const FIELD_PHOTO_PRESETS: FieldPhotoPreset[] = [
  {
    id: 'preset-broken-hammer',
    title: 'Broken handle on hammer (Warehouse)',
    kind: 'open',
    category: 'Hand & Power Tools',
    sceneType: 'broken_hammer',
  },
  {
    id: 'preset-new-hammer',
    title: 'Replaced fiberglass hammer & tagged out damaged tool',
    kind: 'closing',
    category: 'Hand & Power Tools',
    sceneType: 'new_hammer',
  },
  {
    id: 'preset-scaffold-open',
    title: 'Missing toe-board & mid-rail at Fab Bay 2',
    kind: 'open',
    category: 'Scaffolding & Work at Height',
    sceneType: 'scaffold_missing_rail',
  },
  {
    id: 'preset-scaffold-closed',
    title: 'Toe-board secured & green Scafftag affixed',
    kind: 'closing',
    category: 'Scaffolding & Work at Height',
    sceneType: 'scaffold_fixed',
  },
  {
    id: 'preset-elec-open',
    title: 'Unsealed cable gland on 415V DB-04 in Substation',
    kind: 'open',
    category: 'Electrical Safety',
    sceneType: 'electrical_panel_open',
  },
  {
    id: 'preset-elec-closed',
    title: 'IP65 brass cable gland fitted & panel locked',
    kind: 'closing',
    category: 'Electrical Safety',
    sceneType: 'electrical_panel_closed',
  },
  {
    id: 'preset-chem-open',
    title: 'Wooden pallet obstructing emergency eyewash shower',
    kind: 'open',
    category: 'Chemical & Gas Handling',
    sceneType: 'chemical_eyewash_blocked',
  },
  {
    id: 'preset-chem-closed',
    title: 'Eyewash access cleared & yellow hazard grid painted',
    kind: 'closing',
    category: 'Chemical & Gas Handling',
    sceneType: 'chemical_eyewash_clear',
  },
];

export function formatCoordDMS(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(5)}° ${latDir}, ${Math.abs(lng).toFixed(5)}° ${lngDir}`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

export function generateFieldScenePhoto(
  sceneType: FieldPhotoPreset['sceneType'],
  locationName: string,
  coords: GeoCoordinates,
  dateStr: string,
  badgeLabel: 'OPEN PHOTO' | 'CLOSING PHOTO' = 'OPEN PHOTO'
): string {
  const coordText = formatCoordDMS(coords.latitude, coords.longitude);
  const badgeColor = badgeLabel === 'OPEN PHOTO' ? '#dc2626' : '#16a34a';

  let illustrationMarkup = '';

  switch (sceneType) {
    case 'broken_hammer':
      illustrationMarkup = `
        <rect x="0" y="0" width="640" height="420" fill="#334155"/>
        <rect x="0" y="210" width="640" height="210" fill="#475569"/>
        <line x1="0" y1="210" x2="640" y2="210" stroke="#1e293b" stroke-width="4"/>
        <g transform="rotate(-14 250 245)">
          <path d="M130 235 L295 235 L285 244 L302 250 L288 258 L130 258 Z" fill="#d97706" stroke="#78350f" stroke-width="3"/>
        </g>
        <g transform="rotate(18 380 235)">
          <path d="M312 235 L300 242 L316 248 L303 257 L430 257 L430 235 Z" fill="#d97706" stroke="#78350f" stroke-width="3"/>
          <rect x="415" y="190" width="38" height="95" rx="6" fill="#94a3b8" stroke="#1e293b" stroke-width="4"/>
          <path d="M415 195 Q385 185 375 205 L415 215 Z" fill="#64748b" stroke="#1e293b" stroke-width="3"/>
        </g>
        <circle cx="305" cy="242" r="46" fill="none" stroke="#ef4444" stroke-width="4" stroke-dasharray="8 5"/>
        <rect x="215" y="150" width="185" height="28" rx="4" fill="#ef4444"/>
        <text x="307" y="169" fill="#ffffff" font-family="monospace" font-size="13" font-weight="bold" text-anchor="middle">BROKEN HAMMER HANDLE</text>
      `;
      break;

    case 'new_hammer':
      illustrationMarkup = `
        <rect x="0" y="0" width="640" height="420" fill="#1e293b"/>
        <rect x="40" y="40" width="560" height="260" rx="8" fill="#334155" stroke="#475569" stroke-width="2"/>
        <g transform="rotate(-8 310 185)">
          <rect x="140" y="172" width="290" height="26" rx="6" fill="#eab308" stroke="#854d0e" stroke-width="3"/>
          <rect x="140" y="172" width="95" height="26" rx="6" fill="#0f172a"/>
          <rect x="415" y="132" width="42" height="104" rx="6" fill="#cbd5e1" stroke="#0f172a" stroke-width="4"/>
        </g>
        <rect x="215" y="235" width="210" height="34" rx="5" fill="#16a34a" stroke="#ffffff" stroke-width="2"/>
        <text x="320" y="257" fill="#ffffff" font-family="monospace" font-size="13" font-weight="bold" text-anchor="middle">INSPECTED OK · ANSI Z87</text>
      `;
      break;

    case 'scaffold_missing_rail':
      illustrationMarkup = `
        <rect x="0" y="0" width="640" height="420" fill="#1e293b"/>
        <rect x="80" y="30" width="480" height="310" fill="#334155" stroke="#475569" stroke-width="3"/>
        <line x1="150" y1="40" x2="150" y2="330" stroke="#f59e0b" stroke-width="8"/>
        <line x1="490" y1="40" x2="490" y2="330" stroke="#f59e0b" stroke-width="8"/>
        <rect x="135" y="215" width="370" height="14" fill="#b45309" stroke="#78350f" stroke-width="2"/>
        <line x1="150" y1="130" x2="490" y2="130" stroke="#f59e0b" stroke-width="6"/>
        <rect x="165" y="160" width="310" height="52" fill="#ef4444" fill-opacity="0.22" stroke="#ef4444" stroke-width="3" stroke-dasharray="8 6"/>
        <text x="320" y="192" fill="#fca5a5" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">MISSING MID-RAIL &amp; TOE-BOARD</text>
      `;
      break;

    case 'scaffold_fixed':
      illustrationMarkup = `
        <rect x="0" y="0" width="640" height="420" fill="#0f172a"/>
        <rect x="80" y="30" width="480" height="310" fill="#334155" stroke="#475569" stroke-width="3"/>
        <line x1="150" y1="40" x2="150" y2="330" stroke="#f59e0b" stroke-width="8"/>
        <line x1="490" y1="40" x2="490" y2="330" stroke="#f59e0b" stroke-width="8"/>
        <line x1="150" y1="130" x2="490" y2="130" stroke="#f59e0b" stroke-width="6"/>
        <line x1="150" y1="172" x2="490" y2="172" stroke="#f59e0b" stroke-width="6"/>
        <rect x="145" y="200" width="350" height="24" fill="#fbbf24" stroke="#78350f" stroke-width="2"/>
        <rect x="165" y="75" width="150" height="38" rx="4" fill="#16a34a" stroke="#ffffff" stroke-width="2"/>
        <text x="240" y="99" fill="#ffffff" font-family="monospace" font-size="13" font-weight="bold" text-anchor="middle">SCAFFTAG: SAFE</text>
      `;
      break;

    case 'electrical_panel_open':
      illustrationMarkup = `
        <rect x="0" y="0" width="640" height="420" fill="#1e293b"/>
        <rect x="180" y="45" width="240" height="250" rx="6" fill="#64748b" stroke="#0f172a" stroke-width="4"/>
        <rect x="198" y="62" width="204" height="216" fill="#0f172a"/>
        <path d="M265 278 Q255 325 220 345" stroke="#ef4444" stroke-width="6" fill="none"/>
        <path d="M295 278 Q305 325 325 345" stroke="#3b82f6" stroke-width="6" fill="none"/>
        <circle cx="295" cy="292" r="36" fill="none" stroke="#ef4444" stroke-width="4" stroke-dasharray="6 4"/>
        <rect x="435" y="140" width="175" height="65" rx="6" fill="#dc2626"/>
        <text x="522" y="168" fill="#ffffff" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">UNSEALED GLAND</text>
        <text x="522" y="188" fill="#fee2e2" font-family="monospace" font-size="11" text-anchor="middle">415V TEMP DB-04</text>
      `;
      break;

    case 'electrical_panel_closed':
      illustrationMarkup = `
        <rect x="0" y="0" width="640" height="420" fill="#1e293b"/>
        <rect x="190" y="40" width="260" height="245" rx="6" fill="#94a3b8" stroke="#0f172a" stroke-width="4"/>
        <rect x="295" y="285" width="50" height="24" rx="3" fill="#ca8a04" stroke="#0f172a" stroke-width="3"/>
        <rect x="215" y="205" width="210" height="32" rx="4" fill="#16a34a"/>
        <text x="320" y="226" fill="#ffffff" font-family="monospace" font-size="13" font-weight="bold" text-anchor="middle">LOCKED &amp; IP65 GLANDED</text>
      `;
      break;

    case 'chemical_eyewash_blocked':
      illustrationMarkup = `
        <rect x="0" y="0" width="640" height="420" fill="#1e293b"/>
        <line x1="320" y1="45" x2="320" y2="290" stroke="#22c55e" stroke-width="10"/>
        <ellipse cx="320" cy="165" rx="42" ry="18" fill="#eab308" stroke="#15803d" stroke-width="4"/>
        <rect x="210" y="185" width="220" height="115" rx="4" fill="#b45309" stroke="#451a03" stroke-width="3"/>
        <rect x="220" y="70" width="200" height="30" rx="4" fill="#dc2626"/>
        <text x="320" y="90" fill="#ffffff" font-family="monospace" font-size="13" font-weight="bold" text-anchor="middle">EYEWASH ACCESS BLOCKED</text>
      `;
      break;

    default:
      illustrationMarkup = `
        <rect x="0" y="0" width="640" height="420" fill="#0f172a"/>
        <line x1="320" y1="45" x2="320" y2="295" stroke="#22c55e" stroke-width="10"/>
        <ellipse cx="320" cy="165" rx="45" ry="18" fill="#eab308" stroke="#15803d" stroke-width="4"/>
        <polygon points="180,295 460,295 510,335 130,335" fill="#16a34a" fill-opacity="0.25" stroke="#eab308" stroke-width="4" stroke-dasharray="10 6"/>
        <rect x="210" y="75" width="220" height="32" rx="4" fill="#16a34a"/>
        <text x="320" y="96" fill="#ffffff" font-family="monospace" font-size="13" font-weight="bold" text-anchor="middle">ACCESS CLEAR · TESTED OK</text>
      `;
      break;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420" width="640" height="420">
    ${illustrationMarkup}
    <rect x="475" y="14" width="150" height="28" rx="4" fill="${badgeColor}"/>
    <text x="550" y="33" fill="#ffffff" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">${badgeLabel}</text>
    <rect x="0" y="332" width="640" height="88" fill="#090d16" fill-opacity="0.88"/>
    <line x1="0" y1="332" x2="640" y2="332" stroke="#22c55e" stroke-width="2"/>
    <text x="18" y="356" fill="#4ade80" font-family="monospace" font-size="13" font-weight="bold">GPS GEOTAG · ${escapeXml(locationName.toUpperCase())}</text>
    <text x="18" y="378" fill="#f8fafc" font-family="monospace" font-size="13">LAT/LON: ${escapeXml(coordText)} (±${coords.accuracyMeters.toFixed(1)}m)</text>
    <text x="18" y="399" fill="#94a3b8" font-family="monospace" font-size="12">DATE: ${escapeXml(dateStr)} · SITE: TATA MICRON SEMICONDUCTORS</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export async function stampImageWithGeotag(
  sourceDataUrl: string,
  locationName: string,
  coords: GeoCoordinates,
  dateStr: string,
  badgeLabel: 'OPEN PHOTO' | 'CLOSING PHOTO' = 'OPEN PHOTO'
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const targetWidth = 640;
      const scale = targetWidth / (img.width || 640);
      const targetHeight = Math.max(360, Math.min(540, Math.round((img.height || 420) * scale)));
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(sourceDataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      ctx.fillStyle = badgeLabel === 'OPEN PHOTO' ? '#dc2626' : '#16a34a';
      ctx.fillRect(targetWidth - 155, 14, 140, 28);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(badgeLabel, targetWidth - 85, 32);

      const stripHeight = 82;
      const stripY = targetHeight - stripHeight;
      ctx.fillStyle = 'rgba(9, 13, 22, 0.86)';
      ctx.fillRect(0, stripY, targetWidth, stripHeight);

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, stripY);
      ctx.lineTo(targetWidth, stripY);
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`GPS GEOTAG · ${locationName.toUpperCase()}`, 16, stripY + 24);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '12px monospace';
      ctx.fillText(
        `LAT/LON: ${formatCoordDMS(coords.latitude, coords.longitude)} (±${coords.accuracyMeters.toFixed(1)}m)`,
        16,
        stripY + 46
      );

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px monospace';
      ctx.fillText(`TIMESTAMP: ${dateStr} · SITE: TATA MICRON SEMICONDUCTORS`, 16, stripY + 67);

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => resolve(sourceDataUrl);
    img.src = sourceDataUrl;
  });
}
