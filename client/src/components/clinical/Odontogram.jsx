import { useMemo, useState } from 'react';
import Modal from '../common/Modal';

const CONDITION_OPTIONS = [
  { value: 'healthy', label: 'Sehat', color: '#ffffff', border: '#cbd5e1' },
  { value: 'caries', label: 'Karies', color: '#fca5a5', border: '#dc2626' },
  { value: 'filled', label: 'Tambalan', color: '#93c5fd', border: '#2563eb' },
  { value: 'missing', label: 'Hilang', color: '#cbd5e1', border: '#475569' },
  { value: 'root_canal', label: 'Perawatan Saluran Akar', color: '#fcd34d', border: '#b45309' },
  { value: 'crown', label: 'Mahkota', color: '#fdba74', border: '#c2410c' },
  { value: 'extraction_planned', label: 'Rencana Cabut', color: '#fde68a', border: '#a16207' },
  { value: 'fractured', label: 'Patah', color: '#a78bfa', border: '#6d28d9' },
  { value: 'implant', label: 'Implan', color: '#86efac', border: '#16a34a' },
  { value: 'sealant', label: 'Sealant', color: '#67e8f9', border: '#0e7490' },
];

const conditionMap = Object.fromEntries(CONDITION_OPTIONS.map((c) => [c.value, c]));

// FDI notation. Quadrants:
// 1 = upper right (18→11), 2 = upper left (21→28)
// 4 = lower right (48→41), 3 = lower left (31→38)
const UPPER_RIGHT = ['18', '17', '16', '15', '14', '13', '12', '11'];
const UPPER_LEFT = ['21', '22', '23', '24', '25', '26', '27', '28'];
const LOWER_RIGHT = ['48', '47', '46', '45', '44', '43', '42', '41'];
const LOWER_LEFT = ['31', '32', '33', '34', '35', '36', '37', '38'];

const colorForTooth = (tooth) => {
  if (!tooth || !tooth.conditions || tooth.conditions.length === 0) return conditionMap.healthy;
  const primary = tooth.conditions.find((c) => c !== 'healthy') || tooth.conditions[0];
  return conditionMap[primary] || conditionMap.healthy;
};

const Tooth = ({ fdi, tooth, onClick, readOnly }) => {
  const c = colorForTooth(tooth);
  const missing = tooth?.conditions?.includes('missing');
  return (
    <button
      type="button"
      onClick={() => !readOnly && onClick(fdi)}
      disabled={readOnly}
      title={`FDI ${fdi}${tooth?.notes ? `\n${tooth.notes}` : ''}`}
      className={`flex flex-col items-center group ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <svg width="28" height="36" viewBox="0 0 28 36" className={readOnly ? '' : 'group-hover:scale-110 transition-transform'}>
        <path
          d="M6,4 C6,1 22,1 22,4 L24,16 C24,22 18,30 14,32 C10,30 4,22 4,16 Z"
          fill={c.color}
          stroke={c.border}
          strokeWidth="1.5"
          opacity={missing ? 0.3 : 1}
        />
        {missing && (
          <g stroke="#dc2626" strokeWidth="2">
            <line x1="6" y1="6" x2="22" y2="30" />
            <line x1="22" y1="6" x2="6" y2="30" />
          </g>
        )}
      </svg>
      <span className="text-[10px] text-slate-500 mt-0.5">{fdi}</span>
    </button>
  );
};

const Row = ({ teeth, dataByFdi, onClick, readOnly }) => (
  <div className="flex gap-1 justify-center">
    {teeth.map((fdi) => (
      <Tooth key={fdi} fdi={fdi} tooth={dataByFdi[fdi]} onClick={onClick} readOnly={readOnly} />
    ))}
  </div>
);

const Odontogram = ({ value = [], onChange, readOnly = false }) => {
  const [editing, setEditing] = useState(null); // fdi string

  const dataByFdi = useMemo(() => {
    const map = {};
    (value || []).forEach((t) => { map[t.fdi] = t; });
    return map;
  }, [value]);

  const upsert = (fdi, patch) => {
    const existing = dataByFdi[fdi] || { fdi, conditions: [], notes: '' };
    const merged = { ...existing, ...patch, fdi };
    const next = (value || []).filter((t) => t.fdi !== fdi);
    next.push(merged);
    onChange && onChange(next);
  };

  const removeTooth = (fdi) => {
    onChange && onChange((value || []).filter((t) => t.fdi !== fdi));
    setEditing(null);
  };

  const handleOpen = (fdi) => setEditing(fdi);
  const handleClose = () => setEditing(null);

  const current = editing ? (dataByFdi[editing] || { fdi: editing, conditions: [], notes: '' }) : null;

  const toggleCondition = (cond) => {
    if (!current) return;
    const has = current.conditions.includes(cond);
    const next = has ? current.conditions.filter((c) => c !== cond) : [...current.conditions, cond];
    upsert(editing, { conditions: next });
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200">
      <div className="text-center text-xs text-slate-500 mb-1">Atas (Maxilla)</div>
      <div className="flex justify-center gap-4 mb-1">
        <Row teeth={UPPER_RIGHT} dataByFdi={dataByFdi} onClick={handleOpen} readOnly={readOnly} />
        <div className="w-px bg-slate-300" />
        <Row teeth={UPPER_LEFT} dataByFdi={dataByFdi} onClick={handleOpen} readOnly={readOnly} />
      </div>

      <div className="h-px bg-slate-200 my-3" />

      <div className="flex justify-center gap-4 mt-1">
        <Row teeth={LOWER_RIGHT} dataByFdi={dataByFdi} onClick={handleOpen} readOnly={readOnly} />
        <div className="w-px bg-slate-300" />
        <Row teeth={LOWER_LEFT} dataByFdi={dataByFdi} onClick={handleOpen} readOnly={readOnly} />
      </div>
      <div className="text-center text-xs text-slate-500 mt-1">Bawah (Mandibula)</div>

      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100">
        {CONDITION_OPTIONS.filter((o) => o.value !== 'healthy').map((opt) => (
          <span key={opt.value} className="inline-flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-3 h-3 rounded-sm border" style={{ background: opt.color, borderColor: opt.border }} />
            {opt.label}
          </span>
        ))}
      </div>

      <Modal open={!!editing} onClose={handleClose} title={`Gigi ${editing} — kondisi`}>
        {current && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {CONDITION_OPTIONS.map((opt) => {
                const active = current.conditions.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleCondition(opt.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left ${
                      active ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-sm border flex-shrink-0" style={{ background: opt.color, borderColor: opt.border }} />
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Catatan</span>
              <textarea
                rows={2}
                value={current.notes || ''}
                onChange={(e) => upsert(editing, { notes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Misal: rencana scaling minggu depan…"
              />
            </label>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => removeTooth(editing)}
                className="text-sm text-red-600 hover:underline"
              >
                Hapus data gigi ini
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm hover:bg-brand-700"
              >
                Selesai
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Odontogram;
export { CONDITION_OPTIONS };
