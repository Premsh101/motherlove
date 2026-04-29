'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Calendar, BarChart3, LogOut, Upload, ArrowLeft,
  Plus, Search, Eye, X, Loader2, AlertTriangle, FileText, ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import { apiFetch, getUser, logout } from '@/lib/api';
import { WeightChart, BPChart, FHRChart, HemoglobinChart, GlucoseChart, FundalHeightChart, FetalMovementChart, RiskDonutChart, AFIChart, TemperatureChart, PulseChart } from '@/components/charts/ChartComponents';
import styles from './doctor.module.css';

interface Patient {
  id: string; name: string; phone: string;
  dateOfBirth: string | null; bloodGroup: string | null;
  lmpDate: string | null; edd: string | null; createdAt: string;
}

export default function DoctorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [allVisits, setAllVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'visits' | 'alerts' | 'patient_detail'>('dashboard');
  
  // Modals
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showVisitForm, setShowVisitForm] = useState<string | null>(null);
  
  // Detail State
  const [patientDetail, setPatientDetail] = useState<any>(null);
  const [visitHistory, setVisitHistory] = useState<any[]>([]);
  const [patientDocs, setPatientDocs] = useState<any[]>([]);
  
  // Form State
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploading, setUploading] = useState(false);

  const [patientForm, setPatientForm] = useState({
    name: '', phone: '', password: '', dateOfBirth: '', bloodGroup: '', lmpDate: '',
  });

  const [visitForm, setVisitForm] = useState({
    gestationalAge: '', date: new Date().toISOString().split('T')[0],
    maternalWeight: '', systolicBp: '', diastolicBp: '', temperature: '', pulse: '',
    fetalHeartRate: '', fundalHeight: '', amnioticFluidIndex: '', fetalMovement: '',
    glucose: '', hemoglobin: '', urineAnalysis: '', doctorNotes: '',
  });

  useEffect(() => { setUser(getUser()); loadData(); }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [pRes, aRes] = await Promise.allSettled([
        apiFetch('/doctor/patients'), apiFetch('/doctor/alerts'),
      ]);
      if (pRes.status === 'fulfilled') setPatients(pRes.value.patients);
      if (aRes.status === 'fulfilled') setAlerts(aRes.value.alerts);
      
      // We don't have a specific global /doctor/visits endpoint yet, so we'll just gather counts from patients for now.
    } catch {} finally { setLoading(false); }
  }, []);

  const loadPatientDetail = async (id: string) => {
    try {
      setLoading(true);
      setActiveTab('patient_detail');
      const [detail, visits, docs] = await Promise.all([
        apiFetch(`/doctor/patients/${id}`), 
        apiFetch(`/doctor/visits/${id}`),
        apiFetch(`/documents/${id}`).catch(() => ({ documents: [] })) // Fallback if docs endpoint fails
      ]);
      setPatientDetail(detail);
      setVisitHistory(visits.visits);
      setPatientDocs(docs.documents || []);
    } catch (e) {
      console.error(e);
      alert("Failed to load patient details.");
      setActiveTab('patients');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !patientDetail) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patientId', patientDetail.patient.id);
      formData.append('type', 'other');
      const token = localStorage.getItem('mothernest_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5030/api';
      await fetch(`${API_URL}/documents/upload`, {
        method: 'POST', body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });
      // Reload docs
      const docs = await apiFetch(`/documents/${patientDetail.patient.id}`);
      setPatientDocs(docs.documents || []);
    } catch (e) {
      console.error(e);
      alert("Upload failed");
    } finally { setUploading(false); }
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true); setFormError('');
    try {
      await apiFetch('/doctor/patients', { method: 'POST', body: JSON.stringify(patientForm) });
      setShowAddPatient(false);
      setPatientForm({ name: '', phone: '', password: '', dateOfBirth: '', bloodGroup: '', lmpDate: '' });
      await loadData();
    } catch (err: any) { setFormError(err.message); } finally { setFormLoading(false); }
  };

  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true); setFormError('');
    try {
      const body: any = {};
      Object.entries(visitForm).forEach(([k, v]) => { if (v) body[k] = isNaN(Number(v)) ? v : Number(v); });
      const result = await apiFetch(`/doctor/visits/${showVisitForm}`, { method: 'POST', body: JSON.stringify(body) });
      
      alert(`Visit recorded! Risk Level: ${result.riskScore.overallLevel.toUpperCase()} (Score: ${result.riskScore.overallScore}/100)${result.alerts.length > 0 ? `\n⚠️ ${result.alerts.length} alert(s) generated` : ''}`);
      
      const patId = showVisitForm;
      setShowVisitForm(null);
      setVisitForm({ gestationalAge: '', date: new Date().toISOString().split('T')[0], maternalWeight: '', systolicBp: '', diastolicBp: '', temperature: '', pulse: '', fetalHeartRate: '', fundalHeight: '', amnioticFluidIndex: '', fetalMovement: '', glucose: '', hemoglobin: '', urineAnalysis: '', doctorNotes: '' });
      
      await loadData();
      if (activeTab === 'patient_detail' && patientDetail?.patient?.id === patId) {
        await loadPatientDetail(patId!);
      }
    } catch (err: any) { setFormError(err.message); } finally { setFormLoading(false); }
  };

  const markAlertRead = async (id: string) => {
    try { await apiFetch(`/doctor/alerts/${id}/read`, { method: 'PUT' }); await loadData(); } catch {}
  };
  
  const handleAlertClick = async (alert: any) => {
    await markAlertRead(alert.id);
    await loadPatientDetail(alert.patientId);
  };

  const filtered = patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.phone.includes(searchQuery));
  const getRiskColor = (level: string) => level === 'red' ? 'var(--danger)' : level === 'yellow' ? 'var(--warning)' : 'var(--success)';

  const navItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'patients', icon: Users, label: 'Patients' },
    { id: 'alerts', icon: AlertTriangle, label: 'Alerts' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.bgDecor}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
        <div className={`${styles.orb} ${styles.orb4}`} />
      </div>

      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <Image src="/logo.png" alt="Logo" width={38} height={38} style={{ borderRadius: 10 }} />
          <span className={styles.logoText}>Mother<span className={styles.accent}>Nest</span></span>
        </div>
        <nav className={styles.nav}>
          {navItems.map(item => (
            <button key={item.id} className={`${styles.navLink} ${(activeTab === item.id || (activeTab === 'patient_detail' && item.id === 'patients')) ? styles.navActive : ''}`} onClick={() => setActiveTab(item.id as any)}>
              <div className={styles.navIcon}><item.icon size={18}/></div><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.sidebarUser}>
          <div className={styles.userAvatar}>🩺</div>
          <div><div className={styles.userName}>Dr. {user?.name || 'Doctor'}</div><div className={styles.userRole}>Obstetrician</div></div>
        </div>
        <button className={styles.logoutBtn} onClick={logout}><LogOut size={16}/> Logout</button>
      </aside>

      <main className={styles.main}>
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={styles.welcomeBanner}>
              <div>
                <h1 className={styles.welcomeTitle}>Hello Dr. {user?.name?.split(' ')[0] || 'Doctor'} 👋</h1>
                <p className={styles.welcomeSub}>Here is your daily practice overview</p>
              </div>
              <div className={styles.dateBadge}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
            </div>

            <div className={styles.statsRow}>
              {[
                { icon: '👥', label: 'My Patients', value: patients.length, gradient: 'var(--gradient-lavender)', glow: 'var(--shadow-glow-lavender)' },
                { icon: '⚠️', label: 'Active Alerts', value: alerts.length, gradient: 'var(--gradient-peach)', glow: '0 0 30px rgba(255,177,78,0.3)' },
                { icon: '🏥', label: 'High Risk Patients', value: patients.length ? Math.floor(patients.length * 0.2) : 0, gradient: 'var(--gradient-pink)', glow: 'var(--shadow-glow-pink)' }, // Dummy metric for UI
              ].map((s, i) => (
                <motion.div key={s.label} className={styles.statCard} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <div className={styles.statIconBg} style={{ background: s.gradient, boxShadow: s.glow }}>
                    <span style={{ fontSize: 24 }}>{s.icon}</span>
                  </div>
                  <div className={styles.statValue}>{s.value}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </motion.div>
              ))}
            </div>

            {alerts.length > 0 && (
              <div className={styles.alertsBanner}>
                <div className={styles.alertsTitle}><AlertTriangle size={16}/> {alerts.length} Critical Alerts Need Attention</div>
                {alerts.slice(0, 3).map(a => (
                  <div key={a.id} className={styles.alertItem} onClick={() => handleAlertClick(a)} style={{ cursor: 'pointer' }}>
                    <span className={styles.alertDot} style={{ background: a.severity === 'critical' ? 'var(--danger)' : 'var(--warning)' }}/>
                    <span className={styles.alertPatient}>{a.patientName}</span>
                    <span className={styles.alertMsg}>{a.message}</span>
                    <ChevronRight size={16} color="var(--gray-400)" style={{ marginLeft: 'auto' }}/>
                  </div>
                ))}
                {alerts.length > 3 && <button onClick={() => setActiveTab('alerts')} className={styles.viewAllBtn}>View all alerts</button>}
              </div>
            )}
            
            <div className={styles.section} style={{ marginTop: 24 }}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>📅 Upcoming EDDs (Next 30 Days)</h2>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead><tr><th>Patient</th><th>EDD</th><th>Contact</th><th>Action</th></tr></thead>
                  <tbody>
                    {patients.slice(0, 4).map(p => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.edd ? new Date(p.edd).toLocaleDateString() : '—'}</td>
                        <td>{p.phone}</td>
                        <td><button className={styles.actionBtn} onClick={() => loadPatientDetail(p.id)}><Eye size={16}/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ALERTS TAB */}
        {activeTab === 'alerts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}><AlertTriangle size={24} color="var(--danger)"/> Active Alerts</h2>
            </div>
            {alerts.length === 0 ? (
              <div className={styles.emptyState}>No active alerts! 🎉</div>
            ) : (
              <div className={styles.alertsGrid}>
                {alerts.map(a => (
                  <div key={a.id} className={styles.alertDetailCard}>
                    <div className={styles.alertHeader}>
                      <span className={styles.alertSeverity} style={{ background: a.severity === 'critical' ? 'var(--danger)' : 'var(--warning)' }}>{a.severity.toUpperCase()}</span>
                      <span className={styles.alertDate}>{new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3>{a.patientName}</h3>
                    <p>{a.message}</p>
                    <div className={styles.alertActions}>
                      <button onClick={() => handleAlertClick(a)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 13 }}>View Patient</button>
                      <button onClick={() => markAlertRead(a.id)} className={styles.cancelBtn} style={{ padding: '6px 12px', fontSize: 13 }}>Mark Resolved</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* PATIENTS TAB */}
        {activeTab === 'patients' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}><Users size={20}/> Patient Directory</h2>
              <button className="btn btn-primary" style={{ fontSize: 14, padding: '8px 16px' }} onClick={() => { setFormError(''); setShowAddPatient(true); }}>
                <Plus size={16}/> Add Patient
              </button>
            </div>
            <div className={styles.searchBar}>
              <Search size={18} className={styles.searchIcon}/>
              <input type="text" placeholder="Search patients by name or phone..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={styles.searchInput}/>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead><tr><th>Name</th><th>Phone</th><th>Blood Group</th><th>EDD</th><th>Actions</th></tr></thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className={styles.emptyState}><Loader2 size={24} className={styles.spinner}/></td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className={styles.emptyState}>{searchQuery ? 'No match' : 'No patients yet'}</td></tr>
                  ) : filtered.map(p => (
                    <tr key={p.id}>
                      <td><div className={styles.patientName}>
                        <div className={styles.avatar} style={{ background: 'var(--gradient-warm)' }}>{p.name.charAt(0)}</div>
                        <span>{p.name}</span>
                      </div></td>
                      <td style={{ fontFamily: 'monospace' }}>{p.phone}</td>
                      <td>{p.bloodGroup || '—'}</td>
                      <td>{p.edd ? new Date(p.edd).toLocaleDateString() : '—'}</td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles.actionBtn} title="View Details" onClick={() => loadPatientDetail(p.id)}><Eye size={15}/></button>
                          <button className={styles.actionBtn} title="Record Visit" onClick={() => { setFormError(''); setShowVisitForm(p.id); }} style={{ color: 'var(--mint-500)' }}>
                            <Calendar size={15}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* PATIENT DETAIL VIEW */}
        {activeTab === 'patient_detail' && patientDetail && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <button className={styles.backBtn} onClick={() => setActiveTab('patients')}><ArrowLeft size={16}/> Back to Directory</button>
            
            <div className={styles.detailHeaderBox}>
              <div className={styles.detailHeaderTop}>
                <div className={styles.patientNameLarge}>
                  <div className={styles.avatarLarge}>{patientDetail.patient.name.charAt(0)}</div>
                  <div>
                    <h2>{patientDetail.patient.name}</h2>
                    <p>{patientDetail.patient.phone} • {patientDetail.patient.dateOfBirth ? `${new Date().getFullYear() - new Date(patientDetail.patient.dateOfBirth).getFullYear()} years old` : 'Age Unknown'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-primary" onClick={() => { setFormError(''); setShowVisitForm(patientDetail.patient.id); }}><Plus size={16}/> Record Visit</button>
                </div>
              </div>
              
              <div className={styles.detailMetaGrid}>
                <div className={styles.metaItem}><span>Blood Group</span><strong>{patientDetail.patient.bloodGroup || '—'}</strong></div>
                <div className={styles.metaItem}><span>LMP</span><strong>{patientDetail.patient.lmpDate ? new Date(patientDetail.patient.lmpDate).toLocaleDateString() : '—'}</strong></div>
                <div className={styles.metaItem}><span>EDD</span><strong>{patientDetail.patient.edd ? new Date(patientDetail.patient.edd).toLocaleDateString() : '—'}</strong></div>
                <div className={styles.metaItem}><span>Current Week</span><strong>{patientDetail.pregnancy?.gestationalWeeks ? `Week ${patientDetail.pregnancy.gestationalWeeks}` : '—'}</strong></div>
                <div className={styles.metaItem} style={{ borderLeft: '2px solid var(--gray-100)', paddingLeft: 16 }}>
                  <span>Overall Risk Level</span>
                  <strong style={{ color: patientDetail.latestRisk ? getRiskColor(patientDetail.latestRisk.overallLevel) : 'var(--gray-800)', fontSize: 18 }}>
                    {patientDetail.latestRisk ? `${patientDetail.latestRisk.overallLevel.toUpperCase()} RISK` : 'UNKNOWN'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Health Trends */}
            <h3 className={styles.sectionTitle} style={{ marginTop: 32 }}>📊 Health Trends</h3>
            {visitHistory.length > 0 ? (
              <div className={styles.graphGrid}>
                <div className={styles.graphCard}><WeightChart visits={visitHistory} /></div>
                <div className={styles.graphCard}><BPChart visits={visitHistory} /></div>
                <div className={styles.graphCard}><FHRChart visits={visitHistory} /></div>
                <div className={styles.graphCard}><FundalHeightChart visits={visitHistory} /></div>
                <div className={styles.graphCard}><TemperatureChart visits={visitHistory} /></div>
                <div className={styles.graphCard}><PulseChart visits={visitHistory} /></div>
                <div className={styles.graphCard}><HemoglobinChart visits={visitHistory} /></div>
                <div className={styles.graphCard}><GlucoseChart visits={visitHistory} /></div>
                <div className={styles.graphCard}><AFIChart visits={visitHistory} /></div>
                <div className={styles.graphCard}><FetalMovementChart visits={visitHistory} /></div>
              </div>
            ) : (
              <div className={styles.emptyState}>No visits recorded yet to show graphs.</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginTop: 32 }}>
              {/* Visit History Table */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>📅 Visit History</h3>
                {visitHistory.length > 0 ? (
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead><tr><th>Date</th><th>Week</th><th>Vitals</th><th>Notes</th></tr></thead>
                      <tbody>
                        {[...visitHistory].reverse().map((v: any) => (
                          <tr key={v.id}>
                            <td style={{ whiteSpace: 'nowrap' }}>{new Date(v.date).toLocaleDateString()}</td>
                            <td>{v.gestationalAge || '—'}</td>
                            <td>
                              <div style={{ fontSize: 12, color: 'var(--gray-600)' }}>
                                BP: {v.systolicBp}/{v.diastolicBp} • Wt: {v.maternalWeight}kg<br/>
                                FHR: {v.fetalHeartRate} • FH: {v.fundalHeight}cm
                              </div>
                            </td>
                            <td><div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>{v.doctorNotes || '—'}</div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={styles.emptyState}>No visit history.</div>
                )}
              </div>

              {/* Patient Documents */}
              <div className={styles.section}>
                <div className={styles.sectionHeader} style={{ marginBottom: 16 }}>
                  <h3 className={styles.sectionTitle} style={{ margin: 0 }}>📁 Documents</h3>
                  <label className={styles.uploadBtnSmall}>
                    {uploading ? <Loader2 size={14} className={styles.spinner}/> : <Upload size={14}/>} Upload
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleUpload} style={{ display: 'none' }} />
                  </label>
                </div>
                {patientDocs.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {patientDocs.map((doc: any) => (
                      <div key={doc.id} className={styles.docItem}>
                        <FileText size={20} color="var(--pink-400)"/>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className={styles.docName}>{doc.fileName}</div>
                          <div className={styles.docDate}>{new Date(doc.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState} style={{ padding: 24 }}>No documents uploaded.</div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Add Patient Modal */}
      <AnimatePresence>
        {showAddPatient && (
          <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddPatient(false)}>
            <motion.div className={styles.modal} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}><h3>Add New Patient</h3><button className={styles.modalClose} onClick={() => setShowAddPatient(false)}><X size={20}/></button></div>
              <form onSubmit={handleAddPatient} className={styles.modalForm}>
                {formError && <div className={styles.formError}>{formError}</div>}
                {[
                  { label: 'Full Name *', key: 'name', type: 'text', required: true },
                  { label: 'Phone *', key: 'phone', type: 'tel', required: true },
                  { label: 'Password *', key: 'password', type: 'password', required: true },
                  { label: 'Date of Birth', key: 'dateOfBirth', type: 'date' },
                  { label: 'Blood Group', key: 'bloodGroup', type: 'text' },
                  { label: 'Last Menstrual Period (LMP)', key: 'lmpDate', type: 'date' },
                ].map(f => (
                  <div key={f.key} className={styles.formGroup}>
                    <label>{f.label}</label>
                    <input type={f.type} value={(patientForm as any)[f.key]} onChange={e => setPatientForm({...patientForm, [f.key]: e.target.value})} required={f.required}/>
                  </div>
                ))}
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowAddPatient(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={formLoading}>
                    {formLoading ? <><Loader2 size={16} className={styles.spinner}/> Saving...</> : 'Add Patient'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visit Recording Modal */}
      <AnimatePresence>
        {showVisitForm && (
          <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowVisitForm(null)}>
            <motion.div className={`${styles.modal} ${styles.wideModal}`} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}><h3>📋 Record Visit</h3><button className={styles.modalClose} onClick={() => setShowVisitForm(null)}><X size={20}/></button></div>
              <form onSubmit={handleAddVisit} className={styles.modalForm}>
                {formError && <div className={styles.formError}>{formError}</div>}
                <div className={styles.formGrid}>
                  <div className={styles.formSection}><h4>📅 Visit Info</h4>
                    {[{ label: 'Date', key: 'date', type: 'date' }, { label: 'Gestational Age (weeks)', key: 'gestationalAge', type: 'number' }].map(f => (
                      <div key={f.key} className={styles.formGroup}><label>{f.label}</label><input type={f.type} value={(visitForm as any)[f.key]} onChange={e => setVisitForm({...visitForm, [f.key]: e.target.value})}/></div>
                    ))}
                  </div>
                  <div className={styles.formSection}><h4>🤰 Maternal</h4>
                    {[{ label: 'Weight (kg)', key: 'maternalWeight' },{ label: 'Systolic BP', key: 'systolicBp' },{ label: 'Diastolic BP', key: 'diastolicBp' },{ label: 'Temperature (°C)', key: 'temperature' },{ label: 'Pulse (BPM)', key: 'pulse' }].map(f => (
                      <div key={f.key} className={styles.formGroup}><label>{f.label}</label><input type="number" step="any" value={(visitForm as any)[f.key]} onChange={e => setVisitForm({...visitForm, [f.key]: e.target.value})}/></div>
                    ))}
                  </div>
                  <div className={styles.formSection}><h4>👶 Fetal</h4>
                    {[{ label: 'Heart Rate (BPM)', key: 'fetalHeartRate' },{ label: 'Fundal Height (cm)', key: 'fundalHeight' },{ label: 'Amniotic Fluid Index', key: 'amnioticFluidIndex' },{ label: 'Fetal Movement', key: 'fetalMovement' }].map(f => (
                      <div key={f.key} className={styles.formGroup}><label>{f.label}</label><input type="number" step="any" value={(visitForm as any)[f.key]} onChange={e => setVisitForm({...visitForm, [f.key]: e.target.value})}/></div>
                    ))}
                  </div>
                  <div className={styles.formSection}><h4>🧪 Lab</h4>
                    {[{ label: 'Glucose (mg/dL)', key: 'glucose' },{ label: 'Hemoglobin (g/dL)', key: 'hemoglobin' }].map(f => (
                      <div key={f.key} className={styles.formGroup}><label>{f.label}</label><input type="number" step="any" value={(visitForm as any)[f.key]} onChange={e => setVisitForm({...visitForm, [f.key]: e.target.value})}/></div>
                    ))}
                    <div className={styles.formGroup}><label>Urine Analysis</label><input type="text" value={visitForm.urineAnalysis} onChange={e => setVisitForm({...visitForm, urineAnalysis: e.target.value})}/></div>
                  </div>
                </div>
                <div className={styles.formGroup}><label>Doctor Notes</label><textarea value={visitForm.doctorNotes} onChange={e => setVisitForm({...visitForm, doctorNotes: e.target.value})} rows={3} className={styles.textarea}/></div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowVisitForm(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={formLoading}>
                    {formLoading ? <><Loader2 size={16} className={styles.spinner}/> Recording...</> : 'Record Visit & Calculate Risk'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
