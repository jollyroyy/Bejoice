import { useState } from 'react';

// ─── Shared helpers ───────────────────────────────────────────────────────────
const INCOTERMS = ['EXW','FCA','FAS','FOB','CFR','CIF','CPT','CIP','DAP','DPU','DDP'];
const CURRENCIES = ['USD','SAR','EUR','GBP','AED'];

const PORTS_SEA = [
  'Jeddah Islamic Port','King Abdulaziz Port (Dammam)','Yanbu Commercial Port',
  'Jizan Port','Dubai (Jebel Ali)','Abu Dhabi (Khalifa)','Shanghai','Ningbo',
  'Shenzhen (Yantian)','Singapore','Port Klang','Hong Kong','Rotterdam',
  'Hamburg','Antwerp','Felixstowe','New York / New Jersey','Los Angeles',
];
const AIRPORTS = [
  'Jeddah (JED)','Riyadh (RUH)','Dammam (DMM)','Dubai (DXB)','Abu Dhabi (AUH)',
  'Doha (DOH)','Frankfurt (FRA)','London Heathrow (LHR)','Amsterdam (AMS)',
  'Shanghai (PVG)','Beijing (PEK)','Singapore (SIN)','Hong Kong (HKG)',
  'New York JFK','Los Angeles (LAX)','Chicago (ORD)',
];

const sharedInputCls = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '0.5rem',
  padding: '0.7rem 0.9rem',
  color: 'rgba(255,255,255,0.92)',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.9rem',
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.2s',
};
const labelCls = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.68rem',
  fontWeight: 600,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.52)',
  marginBottom: '0.4rem',
  display: 'block',
};

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function Input({ placeholder, type = 'text', value, onChange, min, step }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      min={min}
      step={step}
      style={sharedInputCls}
      onFocus={e => (e.target.style.borderColor = 'rgba(200,168,78,0.45)')}
      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
    />
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        ...sharedInputCls,
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
        paddingRight: '2.2rem',
        cursor: 'pointer',
      }}
      onFocus={e => (e.target.style.borderColor = 'rgba(200,168,78,0.45)')}
      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o} value={o} style={{ background: '#0a0a0f' }}>{o}</option>
      ))}
    </select>
  );
}

function Textarea({ placeholder, value, onChange, rows = 3 }) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      style={{
        ...sharedInputCls,
        resize: 'vertical',
        lineHeight: 1.6,
      }}
      onFocus={e => (e.target.style.borderColor = 'rgba(200,168,78,0.45)')}
      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
    />
  );
}

function CheckToggle({ label, checked, onChange }) {
  return (
    <label style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.65rem',
      cursor: 'pointer',
      fontFamily: "'Inter', sans-serif",
      fontSize: '0.88rem',
      color: 'rgba(255,255,255,0.72)',
      userSelect: 'none',
    }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: '2.2rem',
          height: '1.15rem',
          borderRadius: '2rem',
          background: checked ? 'rgba(200,168,78,0.75)' : 'rgba(255,255,255,0.1)',
          border: `1px solid ${checked ? 'rgba(200,168,78,0.5)' : 'rgba(255,255,255,0.12)'}`,
          position: 'relative',
          transition: 'all 0.2s',
          flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute',
          top: '50%',
          left: checked ? 'calc(100% - 0.9rem)' : '0.1rem',
          transform: 'translateY(-50%)',
          width: '0.8rem',
          height: '0.8rem',
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s',
        }} />
      </div>
      {label}
    </label>
  );
}

function StepIndicator({ steps, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '2.2rem' }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? '1' : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{
              width: '1.8rem',
              height: '1.8rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.68rem',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              background: i < current
                ? 'rgba(200,168,78,0.2)'
                : i === current
                  ? 'rgba(200,168,78,0.85)'
                  : 'rgba(255,255,255,0.05)',
              border: `1px solid ${i <= current ? 'rgba(200,168,78,0.5)' : 'rgba(255,255,255,0.1)'}`,
              color: i < current
                ? 'rgba(200,168,78,0.8)'
                : i === current
                  ? '#0a0a0f'
                  : 'rgba(255,255,255,0.25)',
              transition: 'all 0.3s',
            }}>
              {i < current ? '✓' : i + 1}
            </div>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.62rem',
              fontWeight: i === current ? 600 : 400,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: i === current ? 'rgba(200,168,78,0.95)' : 'rgba(255,255,255,0.38)',
              whiteSpace: 'nowrap',
            }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1,
              height: '1px',
              background: i < current ? 'rgba(200,168,78,0.35)' : 'rgba(255,255,255,0.07)',
              margin: '0 0.5rem',
              marginBottom: '1.4rem',
              transition: 'background 0.3s',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

function NavButtons({ step, totalSteps, onBack, onNext, onSubmit, loading }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <button
        onClick={onBack}
        disabled={step === 0}
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.7rem',
          fontWeight: 400,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: step === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.4)',
          background: 'none',
          border: `1px solid ${step === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '2rem',
          padding: '0.6rem 1.4rem',
          cursor: step === 0 ? 'default' : 'pointer',
          transition: 'all 0.2s',
        }}
      >
        ← Back
      </button>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>
        {step + 1} / {totalSteps}
      </span>
      {step < totalSteps - 1 ? (
        <button onClick={onNext} className="qq-next-btn">
          Continue →
        </button>
      ) : (
        <button onClick={onSubmit} className="qq-submit-btn" disabled={loading}>
          {loading ? 'Sending…' : 'Request Quote →'}
        </button>
      )}
    </div>
  );
}

// ─── SEA FREIGHT FORM ────────────────────────────────────────────────────────
function SeaForm({ onSuccess }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [d, setD] = useState({
    service: 'FCL', origin: '', destination: '', readyDate: '',
    containers: [{ type: '20ft Dry Standard', qty: '1' }],
    packages: '', cbm: '', weight: '', commodity: '', hazardous: false, reefer: false, reeferTemp: '',
    customs: false, insurance: false, pickup: false, delivery: false, incoterms: 'FOB',
    name: '', company: '', email: '', phone: '', notes: '',
  });

  const up = (k, v) => setD(p => ({ ...p, [k]: v }));
  const addContainer = () => setD(p => ({ ...p, containers: [...p.containers, { type: '20ft Dry Standard', qty: '1' }] }));
  const updContainer = (i, k, v) => setD(p => ({ ...p, containers: p.containers.map((c, idx) => idx === i ? { ...c, [k]: v } : c) }));
  const removeContainer = (i) => setD(p => ({ ...p, containers: p.containers.filter((_, idx) => idx !== i) }));

  const CONTAINER_TYPES = ['20ft Dry Standard','40ft Dry Standard','40ft High Cube','20ft Reefer','40ft Reefer','20ft Open Top','40ft Open Top','20ft Flat Rack','40ft Flat Rack'];

  const steps = ['Route', 'Cargo', 'Services', 'Contact'];

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onSuccess('sea'); }, 1400);
  };

  return (
    <div>
      <StepIndicator steps={steps} current={step} />

      {step === 0 && (
        <div className="qq-step">
          <div className="qq-grid-2">
            <Field label="Service Type">
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['FCL','LCL'].map(s => (
                  <button key={s} onClick={() => up('service', s)}
                    className={`qq-type-btn${d.service === s ? ' active' : ''}`}>
                    {s === 'FCL' ? '🧊 FCL' : '📦 LCL'}<br />
                    <span>{s === 'FCL' ? 'Full Container' : 'Less Container'}</span>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Cargo Ready Date">
              <Input type="date" value={d.readyDate} onChange={e => up('readyDate', e.target.value)} />
            </Field>
          </div>
          <div className="qq-grid-2" style={{ marginTop: '1rem' }}>
            <Field label="Port of Loading (Origin)">
              <Select value={d.origin} onChange={e => up('origin', e.target.value)} options={PORTS_SEA} placeholder="Select or type port…" />
            </Field>
            <Field label="Port of Discharge (Destination)">
              <Select value={d.destination} onChange={e => up('destination', e.target.value)} options={PORTS_SEA} placeholder="Select or type port…" />
            </Field>
          </div>
        </div>
      )}

      {step === 1 && d.service === 'FCL' && (
        <div className="qq-step">
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelCls}>Container Details</label>
            {d.containers.map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 0.4fr 1.6rem', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <Select value={c.type} onChange={e => updContainer(i, 'type', e.target.value)} options={CONTAINER_TYPES} />
                <Input type="number" min="1" placeholder="Qty" value={c.qty} onChange={e => updContainer(i, 'qty', e.target.value)} />
                <button onClick={() => removeContainer(i)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: '1rem', cursor: 'pointer', paddingBottom: '2px' }} disabled={d.containers.length === 1}>×</button>
              </div>
            ))}
            <button onClick={addContainer} className="qq-add-btn">+ Add Container</button>
          </div>
          <div className="qq-grid-3">
            <Field label="Commodity">
              <Input placeholder="e.g. Electronics" value={d.commodity} onChange={e => up('commodity', e.target.value)} />
            </Field>
            <Field label="Total Weight (tons)">
              <Input type="number" min="0" step="0.1" placeholder="0.00" value={d.weight} onChange={e => up('weight', e.target.value)} />
            </Field>
            <Field label="Est. Value (USD)">
              <Input type="number" min="0" placeholder="0" value={d.value} onChange={e => up('value', e.target.value)} />
            </Field>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <CheckToggle label="Hazardous / DG Cargo" checked={d.hazardous} onChange={v => up('hazardous', v)} />
            <CheckToggle label="Temperature-Controlled (Reefer)" checked={d.reefer} onChange={v => up('reefer', v)} />
          </div>
          {d.reefer && (
            <div style={{ marginTop: '0.75rem', maxWidth: '12rem' }}>
              <Field label="Required Temp (°C)">
                <Input placeholder="-18" value={d.reeferTemp} onChange={e => up('reeferTemp', e.target.value)} />
              </Field>
            </div>
          )}
        </div>
      )}

      {step === 1 && d.service === 'LCL' && (
        <div className="qq-step">
          <div className="qq-grid-3">
            <Field label="No. of Packages">
              <Input type="number" min="1" placeholder="0" value={d.packages} onChange={e => up('packages', e.target.value)} />
            </Field>
            <Field label="Total Volume (CBM)">
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={d.cbm} onChange={e => up('cbm', e.target.value)} />
            </Field>
            <Field label="Gross Weight (kg)">
              <Input type="number" min="0" placeholder="0" value={d.weight} onChange={e => up('weight', e.target.value)} />
            </Field>
          </div>
          <div className="qq-grid-2" style={{ marginTop: '1rem' }}>
            <Field label="Commodity">
              <Input placeholder="e.g. Furniture" value={d.commodity} onChange={e => up('commodity', e.target.value)} />
            </Field>
            <Field label="Est. Value (USD)">
              <Input type="number" min="0" placeholder="0" value={d.value} onChange={e => up('value', e.target.value)} />
            </Field>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <CheckToggle label="Hazardous / DG Cargo" checked={d.hazardous} onChange={v => up('hazardous', v)} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="qq-step">
          <div className="qq-services-grid">
            {[
              ['customs',  '🏛️', 'Customs Clearance', 'Import & export clearance at origin/destination'],
              ['insurance','🛡️', 'Cargo Insurance',   'All-risk marine cargo coverage'],
              ['pickup',   '🚛', 'Origin Pickup',      'Door collection from shipper\'s premises'],
              ['delivery', '📍', 'Destination Delivery','Last-mile delivery to consignee'],
            ].map(([k, icon, title, desc]) => (
              <div key={k} onClick={() => up(k, !d[k])} className={`qq-service-card${d[k] ? ' active' : ''}`}>
                <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{icon}</div>
                <div className="qq-service-title">{title}</div>
                <div className="qq-service-desc">{desc}</div>
                <div className={`qq-service-check${d[k] ? ' active' : ''}`}>{d[k] ? '✓' : '+'}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem', maxWidth: '16rem' }}>
            <Field label="Incoterms">
              <Select value={d.incoterms} onChange={e => up('incoterms', e.target.value)} options={INCOTERMS} />
            </Field>
          </div>
        </div>
      )}

      {step === 3 && (
        <ContactStep d={d} up={up} />
      )}

      <NavButtons step={step} totalSteps={4} onBack={() => setStep(s => s - 1)} onNext={() => setStep(s => s + 1)} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}

// ─── AIR FREIGHT FORM ─────────────────────────────────────────────────────────
function AirForm({ onSuccess }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [d, setD] = useState({
    origin: '', destination: '', readyDate: '',
    cargoType: 'General',
    pieces: '', weight: '', length: '', width: '', height: '',
    commodity: '', hazardous: false, lithiumBattery: false, perishable: false,
    service: 'Standard',
    customs: false, insurance: false, pickup: false, delivery: false,
    name: '', company: '', email: '', phone: '', notes: '',
  });
  const up = (k, v) => setD(p => ({ ...p, [k]: v }));

  const volWeight = () => {
    const l = parseFloat(d.length) || 0;
    const w = parseFloat(d.width) || 0;
    const h = parseFloat(d.height) || 0;
    const qty = parseInt(d.pieces) || 1;
    return ((l * w * h) / 5000 * qty).toFixed(2);
  };
  const chargeable = () => {
    const vw = parseFloat(volWeight());
    const aw = (parseFloat(d.weight) || 0) * (parseInt(d.pieces) || 1);
    return Math.max(vw, aw).toFixed(2);
  };

  const CARGO_TYPES = ['General','Perishable','Dangerous Goods','Valuable / High-Security','Oversized / Out-of-Gauge','Live Animals','Human Remains'];
  const SERVICES = [
    { id: 'Express',  label: 'Express',  sub: '1–2 business days' },
    { id: 'Priority', label: 'Priority', sub: '2–3 business days' },
    { id: 'Standard', label: 'Standard', sub: '3–5 business days' },
    { id: 'Economy',  label: 'Economy',  sub: '5–7 business days' },
  ];
  const steps = ['Route', 'Cargo', 'Services', 'Contact'];

  return (
    <div>
      <StepIndicator steps={steps} current={step} />

      {step === 0 && (
        <div className="qq-step">
          <div className="qq-grid-2">
            <Field label="Origin Airport">
              <Select value={d.origin} onChange={e => up('origin', e.target.value)} options={AIRPORTS} placeholder="Select airport…" />
            </Field>
            <Field label="Destination Airport">
              <Select value={d.destination} onChange={e => up('destination', e.target.value)} options={AIRPORTS} placeholder="Select airport…" />
            </Field>
          </div>
          <div className="qq-grid-2" style={{ marginTop: '1rem' }}>
            <Field label="Cargo Ready Date">
              <Input type="date" value={d.readyDate} onChange={e => up('readyDate', e.target.value)} />
            </Field>
            <Field label="Cargo Type">
              <Select value={d.cargoType} onChange={e => up('cargoType', e.target.value)} options={CARGO_TYPES} />
            </Field>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="qq-step">
          <div className="qq-grid-3">
            <Field label="No. of Pieces">
              <Input type="number" min="1" placeholder="0" value={d.pieces} onChange={e => up('pieces', e.target.value)} />
            </Field>
            <Field label="Weight / Piece (kg)">
              <Input type="number" min="0" step="0.1" placeholder="0.00" value={d.weight} onChange={e => up('weight', e.target.value)} />
            </Field>
            <Field label="Commodity">
              <Input placeholder="e.g. Auto Parts" value={d.commodity} onChange={e => up('commodity', e.target.value)} />
            </Field>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label style={{ ...labelCls, marginBottom: '0.65rem' }}>Dimensions per Piece (cm)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              {[['Length','length'],['Width','width'],['Height','height']].map(([lbl, key]) => (
                <div key={key}>
                  <label style={{ ...labelCls, fontSize: '0.55rem', opacity: 0.6 }}>{lbl}</label>
                  <Input type="number" min="0" placeholder="0" value={d[key]} onChange={e => up(key, e.target.value)} />
                </div>
              ))}
            </div>
          </div>
          {(d.weight || d.length) && (
            <div className="qq-calc-preview">
              <div className="qq-calc-row">
                <span>Actual Weight</span>
                <span>{((parseFloat(d.weight)||0)*(parseInt(d.pieces)||1)).toFixed(2)} kg</span>
              </div>
              <div className="qq-calc-row">
                <span>Volumetric Weight</span>
                <span>{volWeight()} kg</span>
              </div>
              <div className="qq-calc-row highlight">
                <span>Chargeable Weight</span>
                <span>{chargeable()} kg</span>
              </div>
            </div>
          )}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <CheckToggle label="Dangerous Goods (IATA)" checked={d.hazardous} onChange={v => up('hazardous', v)} />
            <CheckToggle label="Contains Lithium Batteries" checked={d.lithiumBattery} onChange={v => up('lithiumBattery', v)} />
            <CheckToggle label="Perishable / Temperature-Sensitive" checked={d.perishable} onChange={v => up('perishable', v)} />
          </div>
          <div style={{ marginTop: '1.25rem' }}>
            <label style={labelCls}>Service Level</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.5rem' }}>
              {SERVICES.map(s => (
                <div key={s.id} onClick={() => up('service', s.id)} className={`qq-service-card compact${d.service === s.id ? ' active' : ''}`}>
                  <div className="qq-service-title">{s.label}</div>
                  <div className="qq-service-desc">{s.sub}</div>
                  <div className={`qq-service-check${d.service === s.id ? ' active' : ''}`}>{d.service === s.id ? '✓' : ''}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="qq-step">
          <div className="qq-services-grid">
            {[
              ['customs',  '🏛️', 'Customs Clearance', 'Air cargo import/export documentation & clearance'],
              ['insurance','🛡️', 'Air Cargo Insurance','All-risk air cargo insurance coverage'],
              ['pickup',   '🚛', 'Airport Pickup',     'Collect from your premises to the airport'],
              ['delivery', '📍', 'Airport Delivery',   'Door delivery from destination airport'],
            ].map(([k, icon, title, desc]) => (
              <div key={k} onClick={() => up(k, !d[k])} className={`qq-service-card${d[k] ? ' active' : ''}`}>
                <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{icon}</div>
                <div className="qq-service-title">{title}</div>
                <div className="qq-service-desc">{desc}</div>
                <div className={`qq-service-check${d[k] ? ' active' : ''}`}>{d[k] ? '✓' : '+'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && <ContactStep d={d} up={up} />}

      <NavButtons step={step} totalSteps={4} onBack={() => setStep(s => s - 1)} onNext={() => setStep(s => s + 1)} onSubmit={() => { setLoading(true); setTimeout(() => { setLoading(false); onSuccess('air'); }, 1400); }} loading={loading} />
    </div>
  );
}

// ─── LAND / ROAD FREIGHT FORM ─────────────────────────────────────────────────
function LandForm({ onSuccess }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [d, setD] = useState({
    service: 'FTL', truckType: 'Curtainsider', origin: '', destination: '', readyDate: '',
    weight: '', cbm: '', pallets: '', commodity: '', hazardous: false, reefer: false, reeferTemp: '',
    customs: false, insurance: false,
    name: '', company: '', email: '', phone: '', notes: '',
  });
  const up = (k, v) => setD(p => ({ ...p, [k]: v }));

  const TRUCK_TYPES = ['Curtainsider (13.6m)','Box Truck','Flatbed / Lowbed','Reefer Trailer','Tanker','Tipper','Mega Trailer'];
  const CITIES_SA = [
    'Riyadh','Jeddah','Dammam','Mecca','Medina','Khobar','Tabuk','Abha','Jubail','Yanbu',
    'Dubai (UAE)','Abu Dhabi (UAE)','Kuwait City','Amman (Jordan)','Aqaba (Jordan)','Bahrain',
  ];
  const steps = ['Route', 'Cargo', 'Contact'];

  return (
    <div>
      <StepIndicator steps={steps} current={step} />

      {step === 0 && (
        <div className="qq-step">
          <div className="qq-grid-2">
            <Field label="Service Type">
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['FTL','LTL'].map(s => (
                  <button key={s} onClick={() => up('service', s)} className={`qq-type-btn${d.service === s ? ' active' : ''}`}>
                    {s === 'FTL' ? '🚛 FTL' : '📦 LTL'}<br />
                    <span>{s === 'FTL' ? 'Full Truck' : 'Part Truck'}</span>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Cargo Ready Date">
              <Input type="date" value={d.readyDate} onChange={e => up('readyDate', e.target.value)} />
            </Field>
          </div>
          <div className="qq-grid-2" style={{ marginTop: '1rem' }}>
            <Field label="Origin City">
              <Select value={d.origin} onChange={e => up('origin', e.target.value)} options={CITIES_SA} placeholder="Select city…" />
            </Field>
            <Field label="Destination City">
              <Select value={d.destination} onChange={e => up('destination', e.target.value)} options={CITIES_SA} placeholder="Select city…" />
            </Field>
          </div>
          {d.service === 'FTL' && (
            <div style={{ marginTop: '1rem' }}>
              <Field label="Truck / Equipment Type">
                <Select value={d.truckType} onChange={e => up('truckType', e.target.value)} options={TRUCK_TYPES} />
              </Field>
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="qq-step">
          <div className="qq-grid-3">
            <Field label="Gross Weight (tons)">
              <Input type="number" min="0" step="0.1" placeholder="0.00" value={d.weight} onChange={e => up('weight', e.target.value)} />
            </Field>
            <Field label="Volume (CBM)">
              <Input type="number" min="0" step="0.1" placeholder="0.00" value={d.cbm} onChange={e => up('cbm', e.target.value)} />
            </Field>
            <Field label="No. of Pallets">
              <Input type="number" min="0" placeholder="0" value={d.pallets} onChange={e => up('pallets', e.target.value)} />
            </Field>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Field label="Commodity Description">
              <Input placeholder="e.g. Construction Materials" value={d.commodity} onChange={e => up('commodity', e.target.value)} />
            </Field>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <CheckToggle label="Hazardous / ADR Cargo" checked={d.hazardous} onChange={v => up('hazardous', v)} />
            <CheckToggle label="Refrigerated (Reefer)" checked={d.reefer} onChange={v => up('reefer', v)} />
            <CheckToggle label="Cargo Insurance" checked={d.insurance} onChange={v => up('insurance', v)} />
          </div>
          {d.reefer && (
            <div style={{ marginTop: '0.75rem', maxWidth: '12rem' }}>
              <Field label="Required Temp (°C)">
                <Input placeholder="-18" value={d.reeferTemp} onChange={e => up('reeferTemp', e.target.value)} />
              </Field>
            </div>
          )}
        </div>
      )}

      {step === 2 && <ContactStep d={d} up={up} />}

      <NavButtons step={step} totalSteps={3} onBack={() => setStep(s => s - 1)} onNext={() => setStep(s => s + 1)} onSubmit={() => { setLoading(true); setTimeout(() => { setLoading(false); onSuccess('land'); }, 1400); }} loading={loading} />
    </div>
  );
}

// ─── CUSTOMS CLEARANCE FORM ───────────────────────────────────────────────────
function CustomsForm({ onSuccess }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [d, setD] = useState({
    direction: 'Import', port: '', freightMode: 'Sea',
    commodity: '', hsCode: '', shipmentValue: '', currency: 'USD',
    documents: '', packages: '',
    dutyPayment: false, inspection: false, storageRelease: false, survey: false,
    name: '', company: '', email: '', phone: '', notes: '',
  });
  const up = (k, v) => setD(p => ({ ...p, [k]: v }));

  const PORTS_ALL = [
    'Jeddah Islamic Port','King Abdulaziz Port (Dammam)','Yanbu Port','Jizan Port',
    'Jeddah Airport (JED)','Riyadh Airport (RUH)','Dammam Airport (DMM)',
    'Riyadh Dry Port','Jeddah Dry Port',
  ];
  const steps = ['Shipment', 'Cargo', 'Services', 'Contact'];

  return (
    <div>
      <StepIndicator steps={steps} current={step} />

      {step === 0 && (
        <div className="qq-step">
          <div className="qq-grid-2">
            <Field label="Direction">
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['Import','Export'].map(s => (
                  <button key={s} onClick={() => up('direction', s)} className={`qq-type-btn${d.direction === s ? ' active' : ''}`}>
                    {s === 'Import' ? '📥 Import' : '📤 Export'}<br />
                    <span>{s === 'Import' ? 'Inbound to KSA' : 'Outbound from KSA'}</span>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Freight Mode">
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {['Sea','Air','Land'].map(m => (
                  <button key={m} onClick={() => up('freightMode', m)} className={`qq-type-btn compact${d.freightMode === m ? ' active' : ''}`}>
                    {m === 'Sea' ? '🚢' : m === 'Air' ? '✈️' : '🚛'} {m}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Field label="Port / Airport / Border Crossing">
              <Select value={d.port} onChange={e => up('port', e.target.value)} options={PORTS_ALL} placeholder="Select entry/exit point…" />
            </Field>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="qq-step">
          <div className="qq-grid-2">
            <Field label="Commodity Description">
              <Input placeholder="e.g. Industrial Machinery" value={d.commodity} onChange={e => up('commodity', e.target.value)} />
            </Field>
            <Field label="HS Code (optional)">
              <Input placeholder="e.g. 8479.89" value={d.hsCode} onChange={e => up('hsCode', e.target.value)} />
            </Field>
          </div>
          <div className="qq-grid-3" style={{ marginTop: '1rem' }}>
            <Field label="Shipment Value">
              <Input type="number" min="0" placeholder="0" value={d.shipmentValue} onChange={e => up('shipmentValue', e.target.value)} />
            </Field>
            <Field label="Currency">
              <Select value={d.currency} onChange={e => up('currency', e.target.value)} options={CURRENCIES} />
            </Field>
            <Field label="No. of Documents / BLs">
              <Input type="number" min="1" placeholder="1" value={d.documents} onChange={e => up('documents', e.target.value)} />
            </Field>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Field label="No. of Packages / Units">
              <Input type="number" min="0" placeholder="0" value={d.packages} onChange={e => up('packages', e.target.value)} />
            </Field>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="qq-step">
          <div className="qq-services-grid">
            {[
              ['dutyPayment', '💳', 'Duty & Tax Payment',    'Customs duty + VAT disbursement on your behalf'],
              ['inspection',  '🔍', 'Physical Inspection',   'Coordination of customs & SASO inspection'],
              ['storageRelease','🏭','Port Storage & Release','Port follow-up, demurrage avoidance, container release'],
              ['survey',      '📋', 'Pre-Shipment Survey',   'SASO/SFDA compliance pre-loading survey'],
            ].map(([k, icon, title, desc]) => (
              <div key={k} onClick={() => up(k, !d[k])} className={`qq-service-card${d[k] ? ' active' : ''}`}>
                <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{icon}</div>
                <div className="qq-service-title">{title}</div>
                <div className="qq-service-desc">{desc}</div>
                <div className={`qq-service-check${d[k] ? ' active' : ''}`}>{d[k] ? '✓' : '+'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && <ContactStep d={d} up={up} />}

      <NavButtons step={step} totalSteps={4} onBack={() => setStep(s => s - 1)} onNext={() => setStep(s => s + 1)} onSubmit={() => { setLoading(true); setTimeout(() => { setLoading(false); onSuccess('customs'); }, 1400); }} loading={loading} />
    </div>
  );
}

// ─── PROJECT CARGO FORM ───────────────────────────────────────────────────────
function ProjectForm({ onSuccess }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [d, setD] = useState({
    projectType: 'Heavy Lift', origin: '', destination: '', readyDate: '',
    weight: '', length: '', width: '', height: '', pieces: '',
    commodity: '', craneRequired: false, escort: false, permits: false,
    name: '', company: '', email: '', phone: '', notes: '',
  });
  const up = (k, v) => setD(p => ({ ...p, [k]: v }));

  const PROJECT_TYPES = ['Heavy Lift','Out-of-Gauge (OOG)','Breakbulk','Project Machinery','Wind Energy Components','Oil & Gas Equipment','Mining Equipment'];
  const steps = ['Details', 'Dimensions', 'Contact'];

  return (
    <div>
      <StepIndicator steps={steps} current={step} />

      {step === 0 && (
        <div className="qq-step">
          <div className="qq-grid-2">
            <Field label="Project / Cargo Type">
              <Select value={d.projectType} onChange={e => up('projectType', e.target.value)} options={PROJECT_TYPES} />
            </Field>
            <Field label="Cargo Ready Date">
              <Input type="date" value={d.readyDate} onChange={e => up('readyDate', e.target.value)} />
            </Field>
          </div>
          <div className="qq-grid-2" style={{ marginTop: '1rem' }}>
            <Field label="Origin (Port / City)">
              <Input placeholder="e.g. Shanghai, China" value={d.origin} onChange={e => up('origin', e.target.value)} />
            </Field>
            <Field label="Destination (Port / City)">
              <Input placeholder="e.g. Jubail Industrial City" value={d.destination} onChange={e => up('destination', e.target.value)} />
            </Field>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Field label="Commodity / Project Description">
              <Textarea placeholder="Describe the cargo, project name, and any special requirements…" value={d.commodity} onChange={e => up('commodity', e.target.value)} />
            </Field>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="qq-step">
          <div className="qq-grid-2">
            <Field label="No. of Pieces">
              <Input type="number" min="1" placeholder="1" value={d.pieces} onChange={e => up('pieces', e.target.value)} />
            </Field>
            <Field label="Total Weight (MT)">
              <Input type="number" min="0" step="0.1" placeholder="0.00" value={d.weight} onChange={e => up('weight', e.target.value)} />
            </Field>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label style={{ ...labelCls, marginBottom: '0.65rem' }}>Dimensions — Longest Single Piece (metres)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              {[['Length (m)','length'],['Width (m)','width'],['Height (m)','height']].map(([lbl, key]) => (
                <div key={key}>
                  <label style={{ ...labelCls, fontSize: '0.55rem', opacity: 0.6 }}>{lbl}</label>
                  <Input type="number" min="0" step="0.01" placeholder="0.00" value={d[key]} onChange={e => up(key, e.target.value)} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: '1.2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <CheckToggle label="Crane / Heavy Lift Equipment Required" checked={d.craneRequired} onChange={v => up('craneRequired', v)} />
            <CheckToggle label="Police Escort Required" checked={d.escort} onChange={v => up('escort', v)} />
            <CheckToggle label="Special Permits & Route Survey" checked={d.permits} onChange={v => up('permits', v)} />
          </div>
        </div>
      )}

      {step === 2 && <ContactStep d={d} up={up} />}

      <NavButtons step={step} totalSteps={3} onBack={() => setStep(s => s - 1)} onNext={() => setStep(s => s + 1)} onSubmit={() => { setLoading(true); setTimeout(() => { setLoading(false); onSuccess('project'); }, 1400); }} loading={loading} />
    </div>
  );
}

// ─── SHARED CONTACT STEP ─────────────────────────────────────────────────────
function ContactStep({ d, up }) {
  return (
    <div className="qq-step">
      <div className="qq-grid-2">
        <Field label="Full Name *">
          <Input placeholder="Your name" value={d.name} onChange={e => up('name', e.target.value)} />
        </Field>
        <Field label="Company Name">
          <Input placeholder="Your company" value={d.company} onChange={e => up('company', e.target.value)} />
        </Field>
      </div>
      <div className="qq-grid-2" style={{ marginTop: '1rem' }}>
        <Field label="Email Address *">
          <Input type="email" placeholder="you@company.com" value={d.email} onChange={e => up('email', e.target.value)} />
        </Field>
        <Field label="Phone / WhatsApp *">
          <Input type="tel" placeholder="+966 5X XXX XXXX" value={d.phone} onChange={e => up('phone', e.target.value)} />
        </Field>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <Field label="Additional Notes">
          <Textarea placeholder="Special instructions, preferred carriers, delivery timeline…" value={d.notes} onChange={e => up('notes', e.target.value)} />
        </Field>
      </div>
      <p style={{ marginTop: '1rem', fontFamily: "'Inter', sans-serif", fontSize: '0.76rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.7 }}>
        Your details are used solely to prepare your quote. We respond within 4 business hours.
      </p>
    </div>
  );
}

// ─── SUCCESS STATE ────────────────────────────────────────────────────────────
const SUCCESS_LABELS = {
  sea: 'Sea Freight',
  air: 'Air Freight',
  land: 'Land Freight',
  customs: 'Customs Clearance',
  project: 'Project Cargo',
};
function SuccessState({ type, onReset }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', textAlign: 'center', gap: '1.25rem' }}>
      <div style={{
        width: '4rem', height: '4rem', borderRadius: '50%',
        background: 'rgba(200,168,78,0.1)',
        border: '1px solid rgba(200,168,78,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.6rem',
      }}>✓</div>
      <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', letterSpacing: '0.06em', color: '#fff' }}>
        Quote Requested
      </h3>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, maxWidth: '22rem' }}>
        Your <strong style={{ color: 'rgba(200,168,78,0.85)' }}>{SUCCESS_LABELS[type]}</strong> quote request has been received.
        Our team will respond within <strong style={{ color: 'rgba(200,168,78,0.85)' }}>4 business hours</strong>.
      </p>
      <button onClick={onReset} className="qq-submit-btn" style={{ marginTop: '0.5rem' }}>
        Submit Another Quote
      </button>
    </div>
  );
}

// ─── MAIN QUICK QUOTE SECTION ─────────────────────────────────────────────────
const TABS = [
  { id: 'sea',     icon: '🚢', label: 'Sea Freight',       sub: 'FCL · LCL' },
  { id: 'air',     icon: '✈️', label: 'Air Freight',        sub: 'Express · Standard' },
  { id: 'land',    icon: '🚛', label: 'Land Freight',       sub: 'FTL · LTL' },
  { id: 'customs', icon: '🏛️', label: 'Customs Clearance', sub: 'Import · Export' },
  { id: 'project', icon: '⚙️', label: 'Project Cargo',     sub: 'OOG · Heavy Lift' },
];

export default function QuickQuoteSection({ sectionRef, lang = 'en' }) {
  const ar = lang === 'ar';
  const [activeTab, setActiveTab] = useState('sea');
  const [successType, setSuccessType] = useState(null);

  const handleSuccess = (type) => setSuccessType(type);
  const handleReset = () => setSuccessType(null);

  return (
    <div ref={sectionRef} id="quick-quote-section" className="qq-section">
      {/* Divider line */}
      <div className="tools-bg-line" />

      <div className="qq-inner">
        {/* Header */}
        <div className="tools-header">
          <div className="chapter-label" style={{ justifyContent: 'center' }}>
            {ar ? 'تسعير فوري' : 'Instant Pricing'}
          </div>
          <h2 className="tools-title">
            {ar ? 'عرض سعر سريع' : 'Quick Quote'}
          </h2>
          <p className="tools-subtitle">
            {ar
              ? 'شحن بحري، جوي، بري، تخليص جمركي أو مشاريع — احصل على عرض سعر مخصص في دقائق. بدون مكالمات. بدون انتظار.'
              : 'Sea, air, land, customs or project cargo — get a tailored quote in minutes. No calls. No waiting. Just results.'}
          </p>
        </div>

        {/* Tab selector */}
        <div className="qq-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setSuccessType(null); }}
              className={`qq-tab${activeTab === t.id ? ' active' : ''}`}
            >
              <span className="qq-tab-icon">{t.icon}</span>
              <span className="qq-tab-label">{t.label}</span>
              <span className="qq-tab-sub">{t.sub}</span>
            </button>
          ))}
        </div>

        {/* Form panel */}
        <div className="qq-panel">
          {successType ? (
            <SuccessState type={successType} onReset={handleReset} />
          ) : (
            <>
              {activeTab === 'sea'     && <SeaForm     onSuccess={handleSuccess} />}
              {activeTab === 'air'     && <AirForm     onSuccess={handleSuccess} />}
              {activeTab === 'land'    && <LandForm    onSuccess={handleSuccess} />}
              {activeTab === 'customs' && <CustomsForm onSuccess={handleSuccess} />}
              {activeTab === 'project' && <ProjectForm onSuccess={handleSuccess} />}
            </>
          )}
        </div>

        <p className="tools-footnote" style={{ marginTop: '1.5rem' }}>
          All quote requests are handled by Bejoice specialists. Response guaranteed within 4 business hours (Sun–Thu, KSA time).
        </p>
      </div>
    </div>
  );
}
