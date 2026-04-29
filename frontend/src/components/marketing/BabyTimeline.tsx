'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './BabyTimeline.module.css';

const stages = [
  {
    week: 4,
    size: 'Poppy Seed',
    emoji: '🫘',
    length: '0.1 cm',
    description: 'Heart begins to form',
    color: 'var(--pink-100)',
    borderColor: 'var(--pink-300)',
    dotSize: 12,
  },
  {
    week: 8,
    size: 'Raspberry',
    emoji: '🫐',
    length: '1.6 cm',
    description: 'Tiny fingers forming, heart beating',
    color: 'var(--lavender-100)',
    borderColor: 'var(--lavender-300)',
    dotSize: 20,
  },
  {
    week: 12,
    size: 'Lime',
    emoji: '🍋',
    length: '5.4 cm',
    description: 'All organs formed, fingernails growing',
    color: 'var(--mint-100)',
    borderColor: 'var(--mint-300)',
    dotSize: 30,
  },
  {
    week: 16,
    size: 'Avocado',
    emoji: '🥑',
    length: '11.6 cm',
    description: 'Can make facial expressions',
    color: 'var(--peach-100)',
    borderColor: 'var(--peach-300)',
    dotSize: 40,
  },
  {
    week: 20,
    size: 'Banana',
    emoji: '🍌',
    length: '25.6 cm',
    description: 'Halfway! Can hear sounds',
    color: 'var(--pink-100)',
    borderColor: 'var(--pink-300)',
    dotSize: 48,
  },
  {
    week: 24,
    size: 'Corn',
    emoji: '🌽',
    length: '30 cm',
    description: 'Lungs developing, responds to sounds',
    color: 'var(--lavender-100)',
    borderColor: 'var(--lavender-300)',
    dotSize: 54,
  },
  {
    week: 28,
    size: 'Eggplant',
    emoji: '🍆',
    length: '37.6 cm',
    description: 'Eyes can open, brain developing rapidly',
    color: 'var(--mint-100)',
    borderColor: 'var(--mint-300)',
    dotSize: 60,
  },
  {
    week: 32,
    size: 'Squash',
    emoji: '🎃',
    length: '42.4 cm',
    description: 'Practicing breathing, gaining weight',
    color: 'var(--peach-100)',
    borderColor: 'var(--peach-300)',
    dotSize: 68,
  },
  {
    week: 36,
    size: 'Honeydew',
    emoji: '🍈',
    length: '47.4 cm',
    description: 'Lungs nearly mature, head may engage',
    color: 'var(--pink-100)',
    borderColor: 'var(--pink-300)',
    dotSize: 76,
  },
  {
    week: 40,
    size: 'Watermelon',
    emoji: '🍉',
    length: '51.2 cm',
    description: 'Ready to meet the world! 🎉',
    color: 'var(--lavender-100)',
    borderColor: 'var(--lavender-300)',
    dotSize: 86,
  },
];

export default function BabyTimeline() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className={styles.section} id="baby-growth">
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.label}>Baby Growth Timeline</span>
          <h2 className={styles.title}>
            Watch your little one{' '}
            <span className="text-gradient-sunset">grow every week</span>
          </h2>
          <p className={styles.subtitle}>
            From a tiny poppy seed to a watermelon — see how your baby develops
            through each milestone of pregnancy.
          </p>
        </motion.div>

        <div className={styles.timelineWrapper} ref={ref}>
          <div className={styles.timeline}>
            {/* Connection line */}
            <div className={styles.timelineLine}>
              <motion.div
                className={styles.timelineLineFill}
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            {stages.map((stage, index) => (
              <motion.div
                key={stage.week}
                className={styles.stage}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1 + 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div
                  className={styles.stageCircle}
                  style={{
                    width: stage.dotSize,
                    height: stage.dotSize,
                    background: stage.color,
                    borderColor: stage.borderColor,
                  }}
                >
                  <span className={styles.stageEmoji}>{stage.emoji}</span>
                </div>
                <div className={styles.stageInfo}>
                  <span className={styles.stageWeek}>Week {stage.week}</span>
                  <span className={styles.stageSize}>{stage.size}</span>
                  <span className={styles.stageLength}>{stage.length}</span>
                </div>
                <div className={styles.stageTooltip}>
                  <div className={styles.tooltipEmoji}>{stage.emoji}</div>
                  <strong>Week {stage.week}</strong>
                  <span className={styles.tooltipSize}>{stage.size} · {stage.length}</span>
                  <p>{stage.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
