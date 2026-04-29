'use client';
import { Line, Bar, Doughnut, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler, ArcElement, BarElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement, BarElement);

const baseOpts = (showLegend = false) => ({
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: showLegend, labels: { font: { family: 'Nunito', size: 11 }, usePointStyle: true } },
    title: { display: false },
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 10, family: 'Nunito' } } },
    y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 10, family: 'Nunito' } } },
  },
});

interface Visit {
  date: string; gestationalAge: number | null;
  maternalWeight?: string | null; systolicBp?: number | null; diastolicBp?: number | null;
  fetalHeartRate?: number | null; fundalHeight?: string | null; glucose?: string | null;
  hemoglobin?: string | null; amnioticFluidIndex?: string | null; fetalMovement?: number | null;
  temperature?: string | null; pulse?: number | null;
}

function getSorted(visits: Visit[]) {
  return [...visits].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function labels(visits: Visit[]) {
  return visits.map(v => v.gestationalAge ? `Wk ${v.gestationalAge}` : new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
}

function ChartHeader({ title, info }: { title: string; info: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, justifyContent: 'center' }}>
      <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700, color: '#44403c', margin: 0 }}>{title}</h4>
      <span title={info} style={{ cursor: 'help', color: 'var(--gray-400)', fontSize: 14 }}>ⓘ</span>
    </div>
  );
}

export function WeightChart({ visits }: { visits: Visit[] }) {
  const sv = getSorted(visits);
  return <div style={{ height: 260, display: 'flex', flexDirection: 'column' }}>
    <ChartHeader title="Maternal Weight (kg)" info="Healthy weight gain is crucial. Average total gain is 11-16 kg depending on pre-pregnancy BMI." />
    <div style={{ flex: 1 }}><Line data={{
      labels: labels(sv),
      datasets: [{ label: 'Weight (kg)', data: sv.map(v => v.maternalWeight ? Number(v.maternalWeight) : null),
        borderColor: '#ff6b9d', backgroundColor: 'rgba(255,107,157,0.08)', fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#ff6b9d', borderWidth: 2.5 }],
    }} options={baseOpts()} /></div>
  </div>;
}

export function BPChart({ visits }: { visits: Visit[] }) {
  const sv = getSorted(visits);
  return <div style={{ height: 260, display: 'flex', flexDirection: 'column' }}>
    <ChartHeader title="Blood Pressure (mmHg)" info="Normal BP is below 120/80. Readings above 140/90 may indicate hypertension or preeclampsia." />
    <div style={{ flex: 1 }}><Line data={{
      labels: labels(sv),
      datasets: [
        { label: 'Systolic', data: sv.map(v => v.systolicBp), borderColor: '#e8528a', backgroundColor: 'rgba(232,82,138,0.08)', fill: true, tension: 0.4, pointRadius: 4, borderWidth: 2.5 },
        { label: 'Diastolic', data: sv.map(v => v.diastolicBp), borderColor: '#9b6bff', backgroundColor: 'rgba(155,107,255,0.08)', fill: true, tension: 0.4, pointRadius: 4, borderWidth: 2.5 },
      ],
    }} options={baseOpts(true)} /></div>
  </div>;
}

export function FHRChart({ visits }: { visits: Visit[] }) {
  const sv = getSorted(visits);
  return <div style={{ height: 260, display: 'flex', flexDirection: 'column' }}>
    <ChartHeader title="Fetal Heart Rate (BPM)" info="Normal fetal heart rate ranges from 110 to 160 beats per minute." />
    <div style={{ flex: 1 }}><Line data={{
      labels: labels(sv),
      datasets: [{ label: 'FHR (BPM)', data: sv.map(v => v.fetalHeartRate),
        borderColor: '#2dd495', backgroundColor: 'rgba(45,212,149,0.08)', fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#2dd495', borderWidth: 2.5 }],
    }} options={{ ...baseOpts(), scales: { ...baseOpts().scales, y: { ...baseOpts().scales.y, min: 90, max: 180 } } }} /></div>
  </div>;
}

export function HemoglobinChart({ visits }: { visits: Visit[] }) {
  const sv = getSorted(visits);
  return <div style={{ height: 260, display: 'flex', flexDirection: 'column' }}>
    <ChartHeader title="Hemoglobin (g/dL)" info="Normal range during pregnancy is >11 g/dL. Lower values indicate anemia, requiring iron supplements." />
    <div style={{ flex: 1 }}><Line data={{
      labels: labels(sv),
      datasets: [{ label: 'Hb (g/dL)', data: sv.map(v => v.hemoglobin ? Number(v.hemoglobin) : null),
        borderColor: '#5ab3ff', backgroundColor: 'rgba(90,179,255,0.08)', fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#5ab3ff', borderWidth: 2.5 }],
    }} options={baseOpts()} /></div>
  </div>;
}

export function GlucoseChart({ visits }: { visits: Visit[] }) {
  const sv = getSorted(visits);
  return <div style={{ height: 260, display: 'flex', flexDirection: 'column' }}>
    <ChartHeader title="Blood Glucose (mg/dL)" info="Fasting glucose should be < 95 mg/dL. Elevated levels may indicate Gestational Diabetes." />
    <div style={{ flex: 1 }}><Line data={{
      labels: labels(sv),
      datasets: [{ label: 'Glucose (mg/dL)', data: sv.map(v => v.glucose ? Number(v.glucose) : null),
        borderColor: '#ff9d21', backgroundColor: 'rgba(255,157,33,0.08)', fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#ff9d21', borderWidth: 2.5 }],
    }} options={baseOpts()} /></div>
  </div>;
}

export function FundalHeightChart({ visits }: { visits: Visit[] }) {
  const sv = getSorted(visits);
  const latestWk = sv.length > 0 ? Math.max(...sv.map(v => v.gestationalAge || 0)) : 0;
  
  return <div style={{ height: 260, display: 'flex', flexDirection: 'column' }}>
    <ChartHeader title="Fundal Height vs Expected" info="Fundal height (in cm) roughly equals your gestational week. Deviations >3cm require monitoring." />
    <div style={{ display: 'flex', flex: 1, gap: 16 }}>
      <div style={{ flex: 1 }}><Line data={{
        labels: labels(sv),
        datasets: [
          { label: 'Actual (cm)', data: sv.map(v => v.fundalHeight ? Number(v.fundalHeight) : null),
            borderColor: '#e8528a', backgroundColor: 'rgba(232,82,138,0.06)', fill: true, tension: 0.4, pointRadius: 5, borderWidth: 2.5 },
          { label: 'Expected (cm)', data: sv.map(v => v.gestationalAge),
            borderColor: '#a8a29e', borderDash: [6, 4], backgroundColor: 'transparent', fill: false, tension: 0.4, pointRadius: 0, borderWidth: 1.5 },
        ],
      }} options={baseOpts(true)} /></div>
      
      {/* Visual Image Comparison */}
      <div style={{ width: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--gray-50)', borderRadius: 16, padding: '12px 8px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ color: 'var(--gray-500)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Reference Diagram</div>
        
        {/* Dynamic Belly Graphic - Concentric Uterus Outline */}
        <div style={{ position: 'relative', width: 120, height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           {/* Torso Background */}
           <div style={{ position: 'absolute', inset: 0, background: '#fdf2f8', borderRadius: '40% 40% 60% 60%', border: '2px solid #fbcfe8', opacity: 0.4 }}></div>
           
           {/* Concentric Weeks */}
           {[40, 36, 32, 26, 20, 16, 12].map(wk => {
             const wPct = Math.min(wk / 40, 1);
             const isClosest = wk <= latestWk && (wk + 6 > latestWk);
             const isPast = wk <= latestWk;
             
             return (
               <div key={wk} style={{
                 position: 'absolute',
                 bottom: 25, // Just above pubic bone text
                 width: 30 + (wPct * 70), // scales from 30px to 100px width
                 height: 20 + (wPct * 110), // scales height upwards
                 border: `2px solid ${isClosest ? 'var(--pink-500)' : isPast ? 'var(--pink-400)' : 'var(--pink-200)'}`,
                 borderBottom: 'none',
                 borderRadius: '50% 50% 0 0',
                 display: 'flex',
                 justifyContent: 'center',
                 background: isClosest ? 'rgba(255,107,157,0.15)' : 'transparent',
                 zIndex: 50 - wk // smaller weeks render in front if needed, though bottom alignment handles it mostly
               }}>
                 <div style={{ 
                   position: 'absolute', top: -7, fontSize: 9, 
                   color: isClosest ? 'white' : (isPast ? 'var(--pink-600)' : 'var(--pink-400)'), 
                   fontWeight: 800, background: isClosest ? 'var(--pink-500)' : 'white', 
                   padding: '1px 4px', borderRadius: 6,
                   border: `1px solid ${isClosest ? 'var(--pink-500)' : 'var(--pink-200)'}`,
                   boxShadow: isClosest ? '0 2px 4px rgba(255,107,157,0.3)' : 'none'
                 }}>
                   {wk}
                 </div>
               </div>
             )
           })}
           
           {/* Pubic Bone Label */}
           <div style={{ position: 'absolute', bottom: 4, fontSize: 9, color: 'var(--gray-600)', fontWeight: 800, textTransform: 'uppercase' }}>Pubic Bone</div>
        </div>
      </div>
    </div>
  </div>;
}

export function FetalMovementChart({ visits }: { visits: Visit[] }) {
  const sv = getSorted(visits);
  return <div style={{ height: 260, display: 'flex', flexDirection: 'column' }}>
    <ChartHeader title="Fetal Movement Count" info="You should feel at least 10 movements in 2 hours during the third trimester." />
    <div style={{ flex: 1 }}><Bar data={{
      labels: labels(sv),
      datasets: [{ label: 'Movements', data: sv.map(v => v.fetalMovement || 0),
        backgroundColor: sv.map((_, i) => {
          const colors = ['rgba(255,107,157,0.7)', 'rgba(155,107,255,0.7)', 'rgba(45,212,149,0.7)', 'rgba(255,157,33,0.7)', 'rgba(90,179,255,0.7)'];
          return colors[i % colors.length];
        }),
        borderRadius: 8, borderSkipped: false }],
    }} options={baseOpts()} /></div>
  </div>;
}

export function RiskDonutChart({ risk }: { risk: any }) {
  if (!risk) return null;
  return <div style={{ width: 200, height: 200 }}><Doughnut data={{
    labels: ['Hypertension', 'Diabetes', 'Preterm', 'FGR'],
    datasets: [{ data: [risk.hypertensionRisk || 0, risk.diabetesRisk || 0, risk.pretermRisk || 0, risk.fgrRisk || 0],
      backgroundColor: ['#ff6b9d', '#9b6bff', '#ff9d21', '#5ab3ff'], borderWidth: 0, hoverOffset: 8 }],
  }} options={{
    responsive: true, maintainAspectRatio: false, cutout: '65%',
    plugins: { legend: { position: 'bottom' as const, labels: { font: { family: 'Nunito', size: 11 }, usePointStyle: true, padding: 12 } }, title: { display: false } },
  }} /></div>;
}

export function AFIChart({ visits }: { visits: Visit[] }) {
  const sv = getSorted(visits);
  return <div style={{ height: 260, display: 'flex', flexDirection: 'column' }}>
    <ChartHeader title="Amniotic Fluid Index (cm)" info="Normal AFI is between 8 and 18 cm. <5 cm is oligohydramnios, >24 cm is polyhydramnios." />
    <div style={{ flex: 1 }}><Line data={{
      labels: labels(sv),
      datasets: [{ label: 'AFI (cm)', data: sv.map(v => v.amnioticFluidIndex ? Number(v.amnioticFluidIndex) : null),
        borderColor: '#7c4ddb', backgroundColor: 'rgba(124,77,219,0.08)', fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#7c4ddb', borderWidth: 2.5 }],
    }} options={baseOpts()} /></div>
  </div>;
}

export function TemperatureChart({ visits }: { visits: Visit[] }) {
  const sv = getSorted(visits);
  return <div style={{ height: 260, display: 'flex', flexDirection: 'column' }}>
    <ChartHeader title="Maternal Temperature (°C)" info="Normal body temperature is around 37°C. High fever needs immediate attention." />
    <div style={{ flex: 1 }}><Line data={{
      labels: labels(sv),
      datasets: [{ label: 'Temperature (°C)', data: sv.map(v => v.temperature ? Number(v.temperature) : null),
        borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.08)', fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#f59e0b', borderWidth: 2.5 }],
    }} options={{ ...baseOpts(), scales: { ...baseOpts().scales, y: { ...baseOpts().scales.y, min: 35, max: 40 } } }} /></div>
  </div>;
}

export function PulseChart({ visits }: { visits: Visit[] }) {
  const sv = getSorted(visits);
  return <div style={{ height: 260, display: 'flex', flexDirection: 'column' }}>
    <ChartHeader title="Maternal Pulse (BPM)" info="Normal resting heart rate during pregnancy usually increases to 70-90 BPM." />
    <div style={{ flex: 1 }}><Line data={{
      labels: labels(sv),
      datasets: [{ label: 'Pulse (BPM)', data: sv.map(v => v.pulse ? Number(v.pulse) : null),
        borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#ef4444', borderWidth: 2.5 }],
    }} options={baseOpts()} /></div>
  </div>;
}

