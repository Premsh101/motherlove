'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { login } from '@/lib/api';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(phone, password);
      
      // Redirect based on role
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'doctor') router.push('/doctor');
      else router.push('/patient');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgDecor}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
      </div>

      <div className={styles.splitContainer}>
        {/* Left Side: Graphic */}
        <motion.div 
          className={styles.graphicSide}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.graphicContent}>
            <Image 
              src="/login_cartoon.png" 
              alt="Happy pregnant mother" 
              width={500} 
              height={500} 
              className={styles.cartoonImage}
              priority
            />
            <h2 className={styles.graphicTitle}>Your One-Stop Pregnancy Companion</h2>
            <p className={styles.graphicSub}>Monitor health, track baby's growth, and stay connected with your care team.</p>
          </div>
        </motion.div>

        {/* Right Side: Form */}
        <motion.div 
          className={styles.formSide}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.formContainer}>
            <div className={styles.logoWrap}>
              <Image src="/logo.png" alt="Logo" width={48} height={48} style={{ borderRadius: 12 }} />
            </div>
            <h1 className={styles.title}>Mother<span className={styles.accent}>Nest</span></h1>
            <p className={styles.subtitle}>Welcome back, login to continue</p>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Phone Number</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>📞</span>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Password</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>🔒</span>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span className={styles.inputAction}>👁️</span>
                </div>
              </div>

              <button type="submit" className={styles.loginBtn} disabled={loading}>
                {loading ? 'Logging in...' : 'Login →'}
              </button>
            </form>

            <div className={styles.demoRoles}>
              <p>Login as:</p>
              <div className={styles.roleBadges}>
                <span className={styles.badgeAdmin}>👩‍💼 Admin</span>
                <span className={styles.badgeDoctor}>🩺 Doctor</span>
                <span className={styles.badgePatient}>🤰 Patient</span>
              </div>
              <p className={styles.autoDetect}>Your role is detected automatically from your phone number</p>
            </div>

            <a href="/" className={styles.backLink}>← Back to home</a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
