'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import styles from './CTASection.module.css';

export default function CTASection() {
  return (
    <section className={styles.section}>
      <div className={styles.bgElements}>
        <div className={styles.bgBlob1} />
        <div className={styles.bgBlob2} />
        <div className={styles.bgBlob3} />
      </div>

      <div className={styles.container}>
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.hearts}>
            {['💗', '💕', '🌸', '✨', '🦋', '🌺', '💖'].map((h, i) => (
              <motion.span
                key={i}
                className={styles.floatingHeart}
                style={{ left: `${5 + i * 13}%` }}
                animate={{ y: [0, -40, 0], opacity: [0.2, 0.7, 0.2] }}
                transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
              >
                {h}
              </motion.span>
            ))}
          </div>

          <div className={styles.cardInner}>
            <div className={styles.cardContent}>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Image src="/mother-baby.png" alt="Mother and baby" width={120} height={120} style={{ borderRadius: 20 }} />
              </motion.div>

              <h2 className={styles.title}>
                Ready to start your
                <br />
                <span className={styles.titleGradient}>pregnancy journey?</span>
              </h2>

              <p className={styles.subtitle}>
                Join thousands of mothers and doctors who trust MotherNest for
                intelligent, compassionate pregnancy monitoring.
              </p>

              <div className={styles.actions}>
                <a href="/login" className={`btn btn-gradient btn-lg ${styles.ctaBtn}`}>
                  Start Monitoring Now <ArrowRight size={20} />
                </a>
                <a href="/login" className={`btn btn-secondary btn-lg`}>
                  Doctor Login
                </a>
              </div>

              <div className={styles.trustBadges}>
                <span>🔒 HIPAA Compliant</span>
                <span>💗 Free for patients</span>
                <span>🛡️ End-to-end encrypted</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
