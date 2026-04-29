'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Heart, Shield, Activity } from 'lucide-react';
import Image from 'next/image';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero} id="hero">
      {/* Animated background */}
      <div className={styles.bgBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`} />
        <div className={`${styles.blob} ${styles.blob2}`} />
        <div className={`${styles.blob} ${styles.blob3}`} />
        <div className={`${styles.blob} ${styles.blob4}`} />
      </div>

      {/* Floating particles */}
      <div className={styles.particles}>
        {['💗', '🌸', '✨', '💕', '🦋', '🌺'].map((p, i) => (
          <motion.span
            key={i}
            className={styles.particle}
            style={{ left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
          >
            {p}
          </motion.span>
        ))}
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          <motion.div
            className={styles.badge}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Sparkles size={14} />
            <span>AI-Powered Pregnancy Care</span>
          </motion.div>

          <motion.h1
            className={styles.headline}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            Your pregnancy journey,
            <br />
            <span className={styles.headlineGradient}>monitored with love</span>
          </motion.h1>

          <motion.p
            className={styles.subheadline}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            Track maternal &amp; fetal health with beautiful graphs, watch your baby
            grow in 3D, and get intelligent risk assessments — all in one caring
            platform designed for mothers and doctors.
          </motion.p>

          <motion.div
            className={styles.actions}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            <a href="/login" className={`btn btn-gradient btn-lg ${styles.ctaBtn}`}>
              Start Monitoring
              <ArrowRight size={20} />
            </a>
            <a href="#features" className={`btn btn-secondary btn-lg`}>
              Explore Features
            </a>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className={styles.trustRow}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
          >
            <div className={styles.trustItem}>
              <div className={styles.trustIcon} style={{ background: 'var(--gradient-pink)' }}>
                <Heart size={14} fill="white" />
              </div>
              <div><span className={styles.trustNum}>10K+</span><span className={styles.trustLabel}>Doctors</span></div>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon} style={{ background: 'var(--gradient-lavender)' }}>
                <Shield size={14} />
              </div>
              <div><span className={styles.trustNum}>1M+</span><span className={styles.trustLabel}>Mothers</span></div>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon} style={{ background: 'var(--gradient-mint)' }}>
                <Activity size={14} />
              </div>
              <div><span className={styles.trustNum}>99.9%</span><span className={styles.trustLabel}>Accuracy</span></div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className={styles.illustration}
          initial={{ opacity: 0, scale: 0.8, x: 60 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.illustrationWrap}>
            {/* Glowing ring behind */}
            <motion.div
              className={styles.glowRing}
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className={styles.glowRing2}
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            />

            {/* Main illustration */}
            <Image
              src="/hero-mother.png"
              alt="Happy pregnant mother"
              width={480}
              height={480}
              className={styles.heroImage}
              priority
            />

            {/* Floating info cards */}
            <motion.div
              className={`${styles.floatingCard} ${styles.fc1}`}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className={styles.fcIcon}>💗</span>
              <div><span className={styles.fcValue}>142 BPM</span><span className={styles.fcLabel}>Baby Heartbeat</span></div>
            </motion.div>

            <motion.div
              className={`${styles.floatingCard} ${styles.fc2}`}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
            >
              <span className={styles.fcIcon}>🛡️</span>
              <div><span className={styles.fcValue} style={{ color: 'var(--success)' }}>Low Risk</span><span className={styles.fcLabel}>AI Assessment</span></div>
            </motion.div>

            <motion.div
              className={`${styles.floatingCard} ${styles.fc3}`}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            >
              <span className={styles.fcIcon}>📊</span>
              <div><span className={styles.fcValue}>Week 28</span><span className={styles.fcLabel}>Gestational Age</span></div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
