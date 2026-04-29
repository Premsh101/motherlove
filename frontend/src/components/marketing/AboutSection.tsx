'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from './AboutSection.module.css';

const stats = [
  { emoji: '💗', value: '24/7', label: 'Monitoring', gradient: 'var(--gradient-pink)' },
  { emoji: '👥', value: '3', label: 'User Roles', gradient: 'var(--gradient-lavender)' },
  { emoji: '🛡️', value: '100%', label: 'Secure Data', gradient: 'var(--gradient-mint)' },
  { emoji: '📊', value: '15+', label: 'Health Metrics', gradient: 'var(--gradient-peach)' },
];

export default function AboutSection() {
  return (
    <section className={styles.section} id="about">
      <div className={styles.container}>
        <div className={styles.grid}>
          <motion.div
            className={styles.content}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <span className={styles.label}>About MotherNest</span>
            <h2 className={styles.title}>
              Built with care for{' '}
              <span className="text-gradient">every mother</span>
            </h2>
            <p className={styles.description}>
              MotherNest connects expectant mothers with their doctors through an
              intelligent monitoring platform. Every visit, every measurement,
              every heartbeat is tracked to ensure the healthiest possible
              pregnancy journey.
            </p>
            <p className={styles.description}>
              Our platform uses advanced algorithms to detect potential risks
              early, giving doctors the insights they need and mothers the peace
              of mind they deserve.
            </p>

            <div className={styles.statsGrid}>
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className={styles.statCard}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className={styles.statIconBox} style={{ background: stat.gradient }}>
                    <span style={{ fontSize: 18 }}>{stat.emoji}</span>
                  </div>
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className={styles.visual}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className={styles.visualCard}>
              <div className={styles.mockDashboard}>
                {/* Mock dashboard preview */}
                <div className={styles.mockHeader}>
                  <div className={styles.mockDots}>
                    <span style={{ background: '#ff6b6b' }} />
                    <span style={{ background: '#ffb14e' }} />
                    <span style={{ background: '#2dd495' }} />
                  </div>
                  <span className={styles.mockTitle}>Patient Dashboard</span>
                </div>
                <div className={styles.mockBody}>
                  <div className={styles.mockRow}>
                    <div className={styles.mockCard} style={{ background: 'var(--pink-50)', borderColor: 'var(--pink-200)' }}>
                      <span className={styles.mockCardIcon}>🤰</span>
                      <span className={styles.mockCardLabel}>Week 28</span>
                      <span className={styles.mockCardValue}>3rd Trimester</span>
                    </div>
                    <div className={styles.mockCard} style={{ background: 'var(--mint-50)', borderColor: 'var(--mint-200)' }}>
                      <span className={styles.mockCardIcon}>💚</span>
                      <span className={styles.mockCardLabel}>Risk Level</span>
                      <span className={styles.mockCardValueGreen}>Low Risk</span>
                    </div>
                  </div>
                  <div className={styles.mockChart}>
                    <div className={styles.mockChartTitle}>Fetal Heart Rate</div>
                    <svg viewBox="0 0 300 80" className={styles.mockChartSvg}>
                      <defs>
                        <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="var(--pink-300)" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="var(--pink-300)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 60 Q30 50 60 45 Q90 40 120 35 Q150 32 180 38 Q210 42 240 30 Q270 22 300 25"
                        fill="none"
                        stroke="var(--pink-400)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M0 60 Q30 50 60 45 Q90 40 120 35 Q150 32 180 38 Q210 42 240 30 Q270 22 300 25 L300 80 L0 80Z"
                        fill="url(#chartGrad)"
                      />
                    </svg>
                    <div className={styles.mockChartLabels}>
                      <span>Week 20</span>
                      <span>Week 24</span>
                      <span>Week 28</span>
                    </div>
                  </div>
                  <div className={styles.mockAlerts}>
                    <div className={styles.mockAlert}>
                      <span className={styles.alertDot} style={{ background: 'var(--success)' }} />
                      <span>All vitals normal</span>
                    </div>
                    <div className={styles.mockAlert}>
                      <span className={styles.alertDot} style={{ background: 'var(--info)' }} />
                      <span>Next visit in 5 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
