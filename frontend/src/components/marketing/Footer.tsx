import { Heart } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <Heart size={16} fill="currentColor" />
              </div>
              <span className={styles.logoText}>
                Mother<span className={styles.logoAccent}>Nest</span>
              </span>
            </div>
            <p className={styles.brandDesc}>
              Intelligent pregnancy monitoring system built with love for every
              mother and baby.
            </p>
          </div>

          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>Platform</h4>
            <a href="#features" className={styles.link}>Features</a>
            <a href="#baby-growth" className={styles.link}>Baby Growth</a>
            <a href="#about" className={styles.link}>About</a>
            <a href="/login" className={styles.link}>Login</a>
          </div>

          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>For Doctors</h4>
            <a href="/login" className={styles.link}>Doctor Portal</a>
            <a href="#" className={styles.link}>Patient Management</a>
            <a href="#" className={styles.link}>Antenatal Graphs</a>
            <a href="#" className={styles.link}>Risk Analysis</a>
          </div>

          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>Support</h4>
            <a href="#" className={styles.link}>Help Center</a>
            <a href="#" className={styles.link}>Privacy Policy</a>
            <a href="#" className={styles.link}>Terms of Service</a>
            <a href="#" className={styles.link}>Contact</a>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} MotherNest. Made with{' '}
            <span className={styles.heart}>💗</span> for mothers everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
