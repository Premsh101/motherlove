'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Stethoscope, Users, LogOut,
  Plus, Search, Edit2, Power, X, Loader2, AlertTriangle, Menu,
} from 'lucide-react';
import Image from 'next/image';
import { apiFetch, getUser, logout } from '@/lib/api';
import styles from './admin.module.css';

interface Doctor {
  id: string; name: string; phone: string;
  specialization: string | null; isActive: boolean; createdAt: string;
}

interface Analytics {
  totalDoctors: number; totalPatients: number; activePregnancies: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', specialization: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setUser(getUser()); loadData(); }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [d, a] = await Promise.allSettled([apiFetch('/admin/doctors'), apiFetch('/admin/analytics')]);
      if (d.status === 'fulfilled') setDoctors(d.value.doctors);
      if (a.status === 'fulfilled') setAnalytics(a.value);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, []);

  const openAddModal = () => { setEditingDoctor(null); setFormData({ name: '', phone: '', password: '', specialization: '' }); setFormError(''); setShowModal(true); };
  const openEditModal = (doc: Doctor) => { setEditingDoctor(doc); setFormData({ name: doc.name, phone: doc.phone, password: '', specialization: doc.specialization || '' }); setFormError(''); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true); setFormError('');
    try {
      if (editingDoctor) {
        await apiFetch(`/admin/doctors/${editingDoctor.id}`, { method: 'PUT', body: JSON.stringify({ name: formData.name, phone: formData.phone, specialization: formData.specialization || null }) });
      } else {
        if (!formData.password) { setFormError('Password required'); setFormLoading(false); return; }
        await apiFetch('/admin/doctors', { method: 'POST', body: JSON.stringify(formData) });
      }
      setShowModal(false); await loadData();
    } catch (e: any) { setFormError(e.message); } finally { setFormLoading(false); }
  };

  const toggleStatus = async (doc: Doctor) => {
    try { await apiFetch(`/admin/doctors/${doc.id}`, { method: 'PUT', body: JSON.stringify({ isActive: !doc.isActive }) }); await loadData(); } catch (e: any) { setError(e.message); }
  };

  const filtered = doctors.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.phone.includes(searchQuery) || (d.specialization || '').toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className={styles.page}>
      {/* Animated BG */}
      <div className={styles.bgDecor}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
        <div className={`${styles.orb} ${styles.orb4}`} />
      </div>

      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <span className={styles.mobileLogo}>Mother<span className={styles.accent}>Nest</span></span>
        <button className={styles.burgerBtn} onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
      </div>

      {/* Sidebar Overlay */}
      <div className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.sidebarOverlayVisible : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Glass Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarMobileOpen : ''}`}>
        <div className={styles.sidebarLogo}>
          <Image src="/logo.png" alt="Logo" width={38} height={38} style={{ borderRadius: 10 }} />
          <span className={styles.logoText}>Mother<span className={styles.accent}>Nest</span></span>
        </div>
        <nav className={styles.nav}>
          <a href="/admin" className={`${styles.navLink} ${styles.navActive}`} onClick={() => setSidebarOpen(false)}>
            <div className={styles.navIcon}><Activity size={18} /></div><span>Dashboard</span>
          </a>
          <a href="/admin" className={styles.navLink} onClick={() => setSidebarOpen(false)}>
            <div className={styles.navIcon}><Stethoscope size={18} /></div><span>Doctors</span>
          </a>
          <a href="/admin" className={styles.navLink} onClick={() => setSidebarOpen(false)}>
            <div className={styles.navIcon}><Users size={18} /></div><span>Patients</span>
          </a>
        </nav>
        <div className={styles.sidebarUser}>
          <div className={styles.userAvatar}>👩‍⚕️</div>
          <div><div className={styles.userName}>{user?.name || 'Admin'}</div><div className={styles.userRole}>Administrator</div></div>
        </div>
        <button className={styles.logoutBtn} onClick={logout}><LogOut size={16} /> Logout</button>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {/* Welcome Banner */}
        <motion.div className={styles.welcomeBanner} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className={styles.welcomeTitle}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'} 👋</h1>
            <p className={styles.welcomeSub}>Here&apos;s what&apos;s happening at MotherNest today</p>
          </div>
          <div className={styles.bannerRight}>
            <div className={styles.dateBadge}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
            <Image src="/doctor-illus.png" alt="" width={80} height={80} className={styles.bannerIllus} />
          </div>
        </motion.div>

        {/* Stats */}
        <div className={styles.statsRow}>
          {[
            { icon: '🩺', label: 'Total Doctors', value: analytics?.totalDoctors ?? '—', gradient: 'var(--gradient-pink)', glow: 'var(--shadow-glow-pink)', deco: '👩‍⚕️' },
            { icon: '🤰', label: 'Total Patients', value: analytics?.totalPatients ?? '—', gradient: 'var(--gradient-lavender)', glow: 'var(--shadow-glow-lavender)', deco: '💜' },
            { icon: '💗', label: 'Active Pregnancies', value: analytics?.activePregnancies ?? '—', gradient: 'var(--gradient-mint)', glow: 'var(--shadow-glow-mint)', deco: '🌸' },
          ].map((s, i) => (
            <motion.div key={s.label} className={styles.statCard} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <span className={styles.statDeco}>{s.deco}</span>
              <div className={styles.statIconBg} style={{ background: s.gradient, boxShadow: s.glow }}>
                <span style={{ fontSize: 24 }}>{s.icon}</span>
              </div>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Doctor Table */}
        <motion.div className={styles.tableCard} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}><Stethoscope size={20} /> Doctor Management</h2>
            <button className={styles.addBtn} onClick={openAddModal}><Plus size={16} /> Add Doctor</button>
          </div>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input type="text" placeholder="Search doctors..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={styles.searchInput} />
          </div>
          {error && <div className={styles.errorBar}><AlertTriangle size={14} /> {error}</div>}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Doctor</th><th>Phone</th><th>Specialization</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className={styles.empty}><Loader2 size={20} className={styles.spin} /> Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className={styles.empty}>🩺 {searchQuery ? 'No matches' : 'No doctors yet — add one!'}</td></tr>
                ) : filtered.map(doc => (
                  <tr key={doc.id} className={!doc.isActive ? styles.dimRow : ''}>
                    <td><div className={styles.nameCell}>
                      <div className={styles.avatarCircle} style={{ background: doc.isActive ? 'var(--gradient-pink)' : 'var(--gray-300)' }}>{doc.name.charAt(0)}</div>
                      <span>{doc.name}</span>
                    </div></td>
                    <td style={{ fontFamily: 'monospace', letterSpacing: 1 }}>{doc.phone}</td>
                    <td>{doc.specialization || <span style={{ color: 'var(--gray-300)' }}>—</span>}</td>
                    <td><span className={`${styles.badge} ${doc.isActive ? styles.badgeActive : styles.badgeInactive}`}>{doc.isActive ? '● Active' : '○ Disabled'}</span></td>
                    <td><div className={styles.actBtns}>
                      <button className={styles.actBtn} onClick={() => openEditModal(doc)} title="Edit"><Edit2 size={14} /></button>
                      <button className={`${styles.actBtn} ${doc.isActive ? styles.actDanger : styles.actSuccess}`} onClick={() => toggleStatus(doc)} title={doc.isActive ? 'Disable' : 'Enable'}><Power size={14} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className={styles.modal} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHead}><h3>{editingDoctor ? '✏️ Edit Doctor' : '➕ Add New Doctor'}</h3><button onClick={() => setShowModal(false)}><X size={20} /></button></div>
              <form onSubmit={handleSubmit} className={styles.modalBody}>
                {formError && <div className={styles.formErr}>{formError}</div>}
                {[
                  { l: 'Full Name *', k: 'name', t: 'text', r: true, p: 'Dr. Jane Smith' },
                  { l: 'Phone *', k: 'phone', t: 'tel', r: true, p: '9876543210' },
                  ...(!editingDoctor ? [{ l: 'Password *', k: 'password', t: 'password', r: true, p: 'Initial password' }] : []),
                  { l: 'Specialization', k: 'specialization', t: 'text', r: false, p: 'Obstetrics & Gynecology' },
                ].map(f => (
                  <div key={f.k} className={styles.field}><label>{f.l}</label>
                    <input type={f.t} value={(formData as any)[f.k]} onChange={e => setFormData({ ...formData, [f.k]: e.target.value })} required={f.r} placeholder={f.p} />
                  </div>
                ))}
                <div className={styles.modalFoot}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className={styles.submitBtn} disabled={formLoading}>
                    {formLoading ? <><Loader2 size={14} className={styles.spin} /> Saving...</> : editingDoctor ? 'Update' : 'Add Doctor'}
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
