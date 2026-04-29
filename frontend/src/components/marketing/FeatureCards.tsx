'use client';

import { motion } from 'framer-motion';
import styles from './FeatureCards.module.css';

const features = [
  {
    emoji: '🤰',
    title: 'Pregnancy Monitoring',
    description: 'Real-time tracking of maternal weight, blood pressure, glucose, hemoglobin, and more — across every trimester.',
    gradient: 'linear-gradient(135deg, #ff85b1, #ff6b9d)',
    bg: 'rgba(255,107,157,0.08)',
    decorEmoji: '💗',
  },
  {
    emoji: '📊',
    title: 'Antenatal Graphs',
    description: 'Beautiful interactive charts for fetal heart rate, fundal height, growth percentiles, and correlation analysis.',
    gradient: 'linear-gradient(135deg, #c4a8ff, #9b6bff)',
    bg: 'rgba(155,107,255,0.08)',
    decorEmoji: '📈',
  },
  {
    emoji: '👩‍⚕️',
    title: 'Doctor Supervision',
    description: 'Doctors manage patients, record visits, and monitor risk levels with an intelligent dashboard.',
    gradient: 'linear-gradient(135deg, #7bffbf, #2dd495)',
    bg: 'rgba(45,212,149,0.08)',
    decorEmoji: '🩺',
  },
  {
    emoji: '📁',
    title: 'Medical Records',
    description: 'Securely store ultrasound reports, blood tests, prescriptions — accessible anytime, anywhere.',
    gradient: 'linear-gradient(135deg, #ffc57b, #ff9d21)',
    bg: 'rgba(255,177,78,0.08)',
    decorEmoji: '🔒',
  },
  {
    emoji: '🧠',
    title: 'AI Risk Prediction',
    description: 'Intelligent algorithms predict hypertension, gestational diabetes, preterm birth, and growth restriction risks.',
    gradient: 'linear-gradient(135deg, #8ac8ff, #5ab3ff)',
    bg: 'rgba(90,179,255,0.08)',
    decorEmoji: '⚡',
  },
  {
    emoji: '👶',
    title: '3D Baby Visualization',
    description: 'Watch your baby grow week by week with interactive 3D models showing development milestones.',
    gradient: 'linear-gradient(135deg, #ff85b1, #c4a8ff)',
    bg: 'rgba(255,107,157,0.06)',
    decorEmoji: '🌟',
  },
];

export default function FeatureCards() {
  return (
    <section className={styles.section} id="features">
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.label}>✨ Why MotherNest</span>
          <h2 className={styles.title}>
            Everything you need for a{' '}
            <span className="text-gradient">healthy pregnancy</span>
          </h2>
          <p className={styles.subtitle}>
            A comprehensive monitoring platform that brings together doctors,
            mothers, and intelligent technology to ensure the best possible care.
          </p>
        </motion.div>

        <div className={styles.grid}>
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className={styles.card}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              {/* Gradient accent top */}
              <div className={styles.cardAccent} style={{ background: feature.gradient }} />

              {/* Decorative background emoji */}
              <span className={styles.decorEmoji}>{feature.decorEmoji}</span>

              {/* Icon */}
              <div className={styles.iconWrapper} style={{ background: feature.gradient }}>
                <span style={{ fontSize: 28 }}>{feature.emoji}</span>
              </div>

              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDesc}>{feature.description}</p>

              {/* Bottom glow */}
              <div className={styles.cardGlow} style={{ background: `radial-gradient(circle at 50% 100%, ${feature.bg}, transparent 70%)` }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
