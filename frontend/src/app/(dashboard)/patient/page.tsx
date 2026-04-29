'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Calendar, TrendingUp, FileText, LogOut, Shield, Upload, X, Heart, Thermometer, Droplets, BookOpen, Settings, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { apiFetch, getUser, logout } from '@/lib/api';
import { WeightChart, BPChart, FHRChart, HemoglobinChart, GlucoseChart, FundalHeightChart, FetalMovementChart, RiskDonutChart, AFIChart, TemperatureChart, PulseChart } from '@/components/charts/ChartComponents';
import { getKnowledgeForWeek } from '@/lib/knowledge';
import styles from './patient.module.css';

interface Overview {
  patient: { name: string; phone: string; bloodGroup: string; lmpDate: string; edd: string; dateOfBirth: string };
  pregnancy: {
    gestationalWeeks: number | null; gestationalDays: number | null;
    trimester: number | null; daysUntilDue: number | null;
    babySize: { size: string; emoji: string; weight: string } | null;
  };
  latestVisit: any; latestRisk: any;
}

export default function PatientDashboard() {
  const [user, setUser] = useState<any>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [graphData, setGraphData] = useState<{ visits: any[]; riskScores: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  // Settings / Profile
  const [showSettings, setShowSettings] = useState(false);
  const [profileForm, setProfileForm] = useState({ phone: '', bloodGroup: '', lmpDate: '', dateOfBirth: '', password: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  
  // Expanded Visits
  const [expandedVisit, setExpandedVisit] = useState<number | null>(null);
  
  // Knowledge Bank
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  useEffect(() => { setUser(getUser()); }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [ov, gr, docs] = await Promise.allSettled([
        apiFetch('/patient/overview'),
        apiFetch('/patient/graphs'),
        apiFetch('/patient/documents'),
      ]);
      if (ov.status === 'fulfilled') {
        setOverview(ov.value);
        if (ov.value.pregnancy?.gestationalWeeks && selectedWeek === null) {
          setSelectedWeek(ov.value.pregnancy.gestationalWeeks);
        }
        setProfileForm({
          phone: ov.value.patient.phone || '',
          bloodGroup: ov.value.patient.bloodGroup || '',
          lmpDate: ov.value.patient.lmpDate ? ov.value.patient.lmpDate.split('T')[0] : '',
          dateOfBirth: ov.value.patient.dateOfBirth ? ov.value.patient.dateOfBirth.split('T')[0] : '',
          password: ''
        });
      }
      if (gr.status === 'fulfilled') setGraphData(gr.value);
      if (docs.status === 'fulfilled') setDocuments(docs.value.documents || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const preg = overview?.pregnancy;
  const risk = overview?.latestRisk;
  const riskColor = risk?.overallLevel === 'red' ? 'var(--danger)' : risk?.overallLevel === 'yellow' ? 'var(--warning)' : 'var(--success)';
  const progressPct = preg?.gestationalWeeks ? Math.min((preg.gestationalWeeks / 40) * 100, 100) : 0;
  const visits = graphData?.visits || [];
  
  const displayWeek = selectedWeek || preg?.gestationalWeeks || 4;
  const knowledge = getKnowledgeForWeek(displayWeek);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patientId', user.id);
      formData.append('type', 'other');
      const token = localStorage.getItem('mothernest_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5030/api';
      await fetch(`${API_URL}/documents/upload`, {
        method: 'POST', body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData();
    } catch {} finally { setUploading(false); }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    try {
      await apiFetch('/patient/profile', { method: 'PUT', body: JSON.stringify(profileForm) });
      setShowSettings(false);
      loadData();
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const navItems = [
    { icon: Activity, label: 'Overview', tab: 'overview' },
    { icon: TrendingUp, label: 'Health Graphs', tab: 'graphs' },
    { icon: Shield, label: 'Risk Analysis', tab: 'risk' },
    { icon: Calendar, label: 'Visit History', tab: 'visits' },
    { icon: FileText, label: 'Documents', tab: 'docs' },
    { icon: BookOpen, label: 'Knowledge Bank', tab: 'knowledge' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.bgDecor}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
      </div>

      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <Image src="/logo.png" alt="Logo" width={38} height={38} style={{ borderRadius: 10 }} />
          <span className={styles.logoText}>Mother<span className={styles.accent}>Nest</span></span>
        </div>
        <nav className={styles.nav}>
          {navItems.map(item => (
            <button key={item.tab} className={`${styles.navLink} ${activeTab === item.tab ? styles.navActive : ''}`} onClick={() => setActiveTab(item.tab)}>
              <div className={styles.navIcon}><item.icon size={18} /></div><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.sidebarUser}>
          <div className={styles.userAvatar}>🤰</div>
          <div style={{ flex: 1 }}><div className={styles.userName}>{user?.name || 'Mom'}</div><div className={styles.userRole}>Patient</div></div>
          <button className={styles.actionBtn} onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><Settings size={16} color="var(--gray-500)" /></button>
        </div>
        <button className={styles.logoutBtn} onClick={logout}><LogOut size={16} /> Logout</button>
      </aside>

      <main className={styles.main}>
        <motion.div className={styles.welcomeBanner} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className={styles.welcomeTitle}>Hello {user?.name?.split(' ')[0] || 'Mom'} 💗</h1>
            <p className={styles.welcomeSub}>Your pregnancy journey at a glance</p>
          </div>
          <div className={styles.bannerRight}>
            <div className={styles.dateBadge}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
            <Image src="/hero-mother.png" alt="" width={70} height={70} className={styles.bannerIllus} />
          </div>
        </motion.div>

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={styles.progressCard}>
              <div className={styles.progressHeader}>
                <div>
                  <h3 className={styles.progressTitle}>Pregnancy Progress</h3>
                  <p className={styles.progressSub}>
                    {preg?.gestationalWeeks !== null ? `Week ${preg?.gestationalWeeks} + ${preg?.gestationalDays} days` : 'Set LMP date to track'}
                    {preg?.trimester && ` · ${preg.trimester === 1 ? '1st' : preg.trimester === 2 ? '2nd' : '3rd'} Trimester`}
                  </p>
                </div>
                {preg?.babySize && (
                  <div className={styles.babySizeBox}>
                    <span style={{ fontSize: 36 }}>{preg.babySize.emoji}</span>
                    <div><span className={styles.babySizeName}>{preg.babySize.size}</span><span className={styles.babySizeWeight}>{preg.babySize.weight}</span></div>
                  </div>
                )}
              </div>
              <div className={styles.progressBar}>
                <motion.div className={styles.progressFill} initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 1.5, ease: 'easeOut' }} />
                <div className={styles.progressMarkers}>
                  {[0, 13, 27, 40].map(w => <span key={w} className={styles.progressMarker} style={{ left: `${(w / 40) * 100}%` }}>{w === 0 ? 'LMP' : w === 13 ? 'T2' : w === 27 ? 'T3' : 'Due'}</span>)}
                </div>
              </div>
              {preg?.daysUntilDue != null && (
                <p className={styles.dueText}>{preg.daysUntilDue > 0 ? `${preg.daysUntilDue} days until due date` : preg.daysUntilDue === 0 ? 'Due today! 🎉' : 'Past due date'}</p>
              )}
            </div>

            <div className={styles.statsRow}>
              {[
                { icon: '🤰', label: 'Gestational Age', value: preg?.gestationalWeeks != null ? `Week ${preg.gestationalWeeks}` : '—', gradient: 'var(--gradient-pink)', glow: 'var(--shadow-glow-pink)', deco: '💗' },
                { icon: '📅', label: 'Due Date', value: overview?.patient.edd ? new Date(overview.patient.edd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—', gradient: 'var(--gradient-lavender)', glow: 'var(--shadow-glow-lavender)', deco: '📆' },
                { icon: '🛡️', label: 'Risk Level', value: risk ? risk.overallLevel.toUpperCase() : '—', gradient: 'var(--gradient-mint)', glow: 'var(--shadow-glow-mint)', deco: '✅' },
                { icon: '🩸', label: 'Blood Group', value: overview?.patient.bloodGroup || '—', gradient: 'var(--gradient-peach)', glow: '0 0 30px rgba(255,177,78,0.3)', deco: '🔬' },
              ].map((s, i) => (
                <motion.div key={s.label} className={styles.statCard} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <span className={styles.statDeco}>{s.deco}</span>
                  <div className={styles.statIconBg} style={{ background: s.gradient, boxShadow: s.glow }}><span style={{ fontSize: 22 }}>{s.icon}</span></div>
                  <div className={styles.statValue} style={s.label === 'Risk Level' && risk ? { color: riskColor } : {}}>{s.value}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Latest Vitals */}
            {overview?.latestVisit && (
              <div className={styles.vitalsCard}>
                <h3 className={styles.sectionTitle}>💓 Latest Vitals</h3>
                <div className={styles.vitalsGrid}>
                  {[
                    { icon: '⚖️', label: 'Weight', value: overview.latestVisit.maternalWeight ? `${overview.latestVisit.maternalWeight} kg` : '—', color: '#ff6b9d' },
                    { icon: '🩺', label: 'Blood Pressure', value: overview.latestVisit.systolicBp ? `${overview.latestVisit.systolicBp}/${overview.latestVisit.diastolicBp}` : '—', color: '#9b6bff' },
                    { icon: '💗', label: 'Fetal Heart Rate', value: overview.latestVisit.fetalHeartRate ? `${overview.latestVisit.fetalHeartRate} BPM` : '—', color: '#2dd495' },
                    { icon: '🩸', label: 'Hemoglobin', value: overview.latestVisit.hemoglobin ? `${overview.latestVisit.hemoglobin} g/dL` : '—', color: '#5ab3ff' },
                    { icon: '🧪', label: 'Glucose', value: overview.latestVisit.glucose ? `${overview.latestVisit.glucose} mg/dL` : '—', color: '#ff9d21' },
                    { icon: '🌡️', label: 'Temperature', value: overview.latestVisit.temperature ? `${overview.latestVisit.temperature}°C` : '—', color: '#e8528a' },
                  ].map(v => (
                    <div key={v.label} className={styles.vitalItem}>
                      <span className={styles.vitalIcon} style={{ background: `${v.color}15`, color: v.color }}>{v.icon}</span>
                      <div><div className={styles.vitalValue}>{v.value}</div><div className={styles.vitalLabel}>{v.label}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {visits.length > 0 && (
              <div className={styles.graphRow}>
                <div className={styles.graphCard}><WeightChart visits={visits} /></div>
                <div className={styles.graphCard}><FHRChart visits={visits} /></div>
              </div>
            )}

            {visits.length === 0 && !loading && (
              <div className={styles.emptyCard}>
                <Image src="/baby-art.png" alt="" width={100} height={100} style={{ borderRadius: 16, opacity: 0.6 }} />
                <p>🤰 Your pregnancy data will appear here</p>
                <p className={styles.emptyHint}>Your doctor will record visits, and all graphs will update automatically</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ===== GRAPHS TAB ===== */}
        {activeTab === 'graphs' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className={styles.tabTitle}>📊 Health Trend Graphs</h2>
            {visits.length > 0 ? (
              <div className={styles.graphGrid}>
                <div className={styles.graphCard}><WeightChart visits={visits} /></div>
                <div className={styles.graphCard}><BPChart visits={visits} /></div>
                <div className={styles.graphCard}><FHRChart visits={visits} /></div>
                <div className={styles.graphCard}><FundalHeightChart visits={visits} /></div>
                <div className={styles.graphCard}><TemperatureChart visits={visits} /></div>
                <div className={styles.graphCard}><PulseChart visits={visits} /></div>
                <div className={styles.graphCard}><HemoglobinChart visits={visits} /></div>
                <div className={styles.graphCard}><GlucoseChart visits={visits} /></div>
                <div className={styles.graphCard}><AFIChart visits={visits} /></div>
                <div className={styles.graphCard}><FetalMovementChart visits={visits} /></div>
              </div>
            ) : (
              <div className={styles.emptyCard}><p>No visit data available yet</p></div>
            )}
          </motion.div>
        )}

        {/* ===== RISK TAB ===== */}
        {activeTab === 'risk' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className={styles.tabTitle}>🛡️ Risk Analysis</h2>
            {risk ? (
              <>
                <div className={styles.riskOverviewGrid}>
                  {[
                    { label: 'Hypertension', value: risk.hypertensionRisk, color: '#ff6b9d', icon: '🫀' },
                    { label: 'Diabetes', value: risk.diabetesRisk, color: '#9b6bff', icon: '🧪' },
                    { label: 'Preterm Birth', value: risk.pretermRisk, color: '#ff9d21', icon: '⏰' },
                    { label: 'Growth Restriction', value: risk.fgrRisk, color: '#5ab3ff', icon: '📏' },
                  ].map((r, i) => (
                    <motion.div key={r.label} className={styles.riskGaugeCard} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                      <div className={styles.gaugeCircle}>
                        <svg viewBox="0 0 120 120" className={styles.gaugeSvg}>
                          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="10" />
                          <circle cx="60" cy="60" r="52" fill="none" stroke={r.color} strokeWidth="10"
                            strokeDasharray={`${(r.value / 100) * 327} 327`} strokeLinecap="round"
                            transform="rotate(-90 60 60)" style={{ transition: 'stroke-dasharray 1s ease' }} />
                        </svg>
                        <div className={styles.gaugeValue} style={{ color: r.color }}>
                          <span style={{ fontSize: 28, fontWeight: 800 }}>{r.value || 0}</span>
                          <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>/ 100</span>
                        </div>
                      </div>
                      <span style={{ fontSize: 24 }}>{r.icon}</span>
                      <div className={styles.riskGaugeLabel}>{r.label}</div>
                      <div className={styles.riskLevelBadge} style={{
                        background: `${r.color}15`, color: r.color,
                      }}>{(r.value || 0) >= 60 ? 'HIGH' : (r.value || 0) >= 30 ? 'MODERATE' : 'LOW'}</div>
                    </motion.div>
                  ))}
                </div>
                
                <div className={styles.graphRow} style={{ marginTop: 24 }}>
                  <div className={styles.riskCard}>
                    <h3 className={styles.sectionTitle}>📈 Overall Assessment</h3>
                    <div className={styles.riskInner}>
                      <RiskDonutChart risk={risk} />
                      <div className={styles.riskMeta}>
                        <div className={styles.riskScoreBig} style={{ color: riskColor }}>{risk.overallScore}<span style={{ fontSize: 16, color: 'var(--gray-400)' }}>/100</span></div>
                        <div className={styles.riskLevelBadge} style={{ background: `${riskColor}20`, color: riskColor, display: 'inline-block', marginTop: 8 }}>
                          {risk.overallLevel?.toUpperCase()} RISK
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.riskCard}>
                    <h3 className={styles.sectionTitle}>💡 Doctor's Recommendations</h3>
                    {overview?.latestRisk?.recommendations && overview.latestRisk.recommendations.length > 0 ? (
                      <ul style={{ paddingLeft: 20, color: 'var(--gray-700)', lineHeight: 1.6, fontSize: 14 }}>
                        {overview.latestRisk.recommendations.map((rec: string, i: number) => (
                          <li key={i} style={{ marginBottom: 8 }}>{rec}</li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Continue your regular prenatal routine. Everything looks normal.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.emptyCard}><p>Risk data will appear after your first visit</p></div>
            )}
          </motion.div>
        )}

        {/* ===== VISITS TAB ===== */}
        {activeTab === 'visits' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className={styles.tabTitle}>📅 Visit History</h2>
            {visits.length > 0 ? (
              <div className={styles.visitList}>
                {[...visits].reverse().map((v, i) => {
                  const isExpanded = expandedVisit === i;
                  return (
                    <motion.div key={i} className={styles.visitCard} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <div 
                        className={styles.visitHead} 
                        style={{ cursor: 'pointer', marginBottom: isExpanded ? 16 : 0 }} 
                        onClick={() => setExpandedVisit(isExpanded ? null : i)}
                      >
                        <div>
                          <span className={styles.visitDate}>{new Date(v.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          {v.gestationalAge && <span className={styles.visitWeek} style={{ marginLeft: 12 }}>Week {v.gestationalAge}</span>}
                        </div>
                        <ChevronDown size={20} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} color="var(--gray-400)" />
                      </div>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                            <div className={styles.visitDetailsGrid}>
                              <div className={styles.detailGroup}>
                                <h5>Maternal Vitals</h5>
                                <p>Weight: <b>{v.maternalWeight || '—'} kg</b></p>
                                <p>BP: <b>{v.systolicBp || '—'}/{v.diastolicBp || '—'} mmHg</b></p>
                                <p>Pulse: <b>{v.pulse || '—'} BPM</b></p>
                                <p>Temp: <b>{v.temperature || '—'} °C</b></p>
                              </div>
                              <div className={styles.detailGroup}>
                                <h5>Fetal Vitals</h5>
                                <p>FHR: <b>{v.fetalHeartRate || '—'} BPM</b></p>
                                <p>Fundal Height: <b>{v.fundalHeight || '—'} cm</b></p>
                                <p>AFI: <b>{v.amnioticFluidIndex || '—'} cm</b></p>
                                <p>Movements: <b>{v.fetalMovement || '—'}</b></p>
                              </div>
                              <div className={styles.detailGroup}>
                                <h5>Lab Results</h5>
                                <p>Hemoglobin: <b>{v.hemoglobin || '—'} g/dL</b></p>
                                <p>Glucose: <b>{v.glucose || '—'} mg/dL</b></p>
                                <p>Urine: <b>{v.urineAnalysis || '—'}</b></p>
                              </div>
                            </div>
                            {v.doctorNotes && (
                              <div className={styles.doctorNotesBox}>
                                <strong>Doctor's Notes:</strong> {v.doctorNotes}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyCard}><p>No visits recorded yet</p></div>
            )}
          </motion.div>
        )}

        {/* ===== DOCUMENTS TAB ===== */}
        {activeTab === 'docs' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 className={styles.tabTitle} style={{ marginBottom: 0 }}>📁 My Documents</h2>
              <label className={styles.uploadBtn}>
                <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload'}
                <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleUpload} style={{ display: 'none' }} />
              </label>
            </div>
            {documents.length > 0 ? (
              <div className={styles.docGrid}>
                {documents.map((doc: any) => (
                  <div key={doc.id} className={styles.docCard}>
                    <div className={styles.docIcon}>{doc.mimeType?.includes('pdf') ? '📄' : '🖼️'}</div>
                    <div className={styles.docName}>{doc.fileName}</div>
                    <div className={styles.docDate}>{new Date(doc.createdAt).toLocaleDateString()}</div>
                    <div className={styles.docType}>{doc.type}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyCard}>
                <p>📄 No documents yet</p>
                <p className={styles.emptyHint}>Upload ultrasound reports, blood tests, and prescriptions</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ===== KNOWLEDGE BANK TAB ===== */}
        {activeTab === 'knowledge' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className={styles.tabTitle}>📖 Knowledge Bank</h2>
            
            <div style={{ display: 'flex', gap: 24 }}>
              {/* Sidebar of Weeks */}
              <div className={styles.knowledgeSidebar}>
                <h4 style={{ padding: '0 16px 12px', fontSize: 13, textTransform: 'uppercase', color: 'var(--gray-400)', letterSpacing: 0.5, borderBottom: '1px solid var(--gray-100)' }}>Pregnancy Weeks</h4>
                <div className={styles.weeksList}>
                  {Array.from({ length: 40 }, (_, i) => i + 1).map(wk => (
                    <button 
                      key={wk} 
                      className={`${styles.weekBtn} ${displayWeek === wk ? styles.weekBtnActive : ''} ${preg?.gestationalWeeks === wk ? styles.weekBtnCurrent : ''}`}
                      onClick={() => setSelectedWeek(wk)}
                    >
                      Week {wk} {preg?.gestationalWeeks === wk && <span className={styles.currentBadge}>Current</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content */}
              <div style={{ flex: 1 }}>
                {knowledge ? (
                  <div className={styles.knowledgeCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                      <button className={styles.actionBtn} onClick={() => setSelectedWeek(Math.max(1, displayWeek - 1))} disabled={displayWeek <= 1}><ChevronLeft size={20}/></button>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--pink-500)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Week {displayWeek}</div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, margin: 0 }}>{knowledge.title}</h3>
                      </div>
                      <button className={styles.actionBtn} onClick={() => setSelectedWeek(Math.min(40, displayWeek + 1))} disabled={displayWeek >= 40}><ChevronRight size={20}/></button>
                    </div>
                    
                    <div className={styles.knowledgeGrid}>
                      <div className={styles.knowledgeSection} style={{ background: 'rgba(255,107,157,0.05)', border: '1px solid rgba(255,107,157,0.1)' }}>
                        <h4 style={{ color: 'var(--pink-600)' }}>👶 Baby's Development</h4>
                        <p>{knowledge.baby}</p>
                      </div>
                      <div className={styles.knowledgeSection} style={{ background: 'rgba(155,107,255,0.05)', border: '1px solid rgba(155,107,255,0.1)' }}>
                        <h4 style={{ color: 'var(--lavender-600)' }}>👩 Your Body</h4>
                        <p>{knowledge.mom}</p>
                      </div>
                      <div className={styles.knowledgeSection} style={{ background: 'rgba(45,212,149,0.05)', border: '1px solid rgba(45,212,149,0.1)', gridColumn: '1 / -1' }}>
                        <h4 style={{ color: 'var(--mint-600)' }}>💡 Healthy Tip</h4>
                        <p>{knowledge.tip}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyCard}><p>No information available for this week.</p></div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSettings(false)}>
            <motion.div className={styles.modal} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}><h3>Profile Settings</h3><button className={styles.modalClose} onClick={() => setShowSettings(false)}><X size={20}/></button></div>
              <form onSubmit={handleSaveProfile} className={styles.modalForm}>
                {profileError && <div className={styles.formError}>{profileError}</div>}
                
                <div className={styles.formGroup}><label>Phone Number</label><input type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} required/></div>
                <div className={styles.formGroup}><label>Blood Group</label><input type="text" value={profileForm.bloodGroup} onChange={e => setProfileForm({...profileForm, bloodGroup: e.target.value})}/></div>
                <div className={styles.formGroup}><label>Date of Birth</label><input type="date" value={profileForm.dateOfBirth} onChange={e => setProfileForm({...profileForm, dateOfBirth: e.target.value})}/></div>
                <div className={styles.formGroup}><label>Last Menstrual Period (LMP)</label><input type="date" value={profileForm.lmpDate} onChange={e => setProfileForm({...profileForm, lmpDate: e.target.value})}/></div>
                
                <div className={styles.formGroup} style={{ marginTop: 24 }}><label>New Password (leave blank to keep current)</label><input type="password" placeholder="••••••••" value={profileForm.password} onChange={e => setProfileForm({...profileForm, password: e.target.value})}/></div>
                
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowSettings(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={profileSaving}>{profileSaving ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
