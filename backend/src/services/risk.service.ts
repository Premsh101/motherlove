/**
 * AI Risk Prediction Engine
 * Rule-based scoring algorithm for pregnancy risk assessment
 */

interface VisitData {
  gestationalAge?: number | null;
  systolicBp?: number | null;
  diastolicBp?: number | null;
  fetalHeartRate?: number | null;
  fundalHeight?: string | null;
  glucose?: string | null;
  hemoglobin?: string | null;
  amnioticFluidIndex?: string | null;
  maternalWeight?: string | null;
  pulse?: number | null;
  temperature?: string | null;
}

interface RiskResult {
  hypertensionRisk: number;
  diabetesRisk: number;
  pretermRisk: number;
  fgrRisk: number;
  overallScore: number;
  overallLevel: 'green' | 'yellow' | 'red';
  alerts: Array<{ type: string; severity: 'warning' | 'critical'; message: string }>;
  recommendations: string[];
}

/**
 * Calculate comprehensive risk scores based on visit data
 */
export function calculateRiskScore(visit: VisitData, previousVisits?: VisitData[]): RiskResult {
  const alerts: Array<{ type: string; severity: 'warning' | 'critical'; message: string }> = [];
  const recommendations: string[] = [];

  // ====== HYPERTENSION RISK ======
  let hypertensionRisk = 0;
  const sbp = visit.systolicBp;
  const dbp = visit.diastolicBp;

  if (sbp) {
    if (sbp >= 160) { hypertensionRisk = 90; alerts.push({ type: 'high_bp', severity: 'critical', message: `Severe hypertension: systolic BP ${sbp} mmHg` }); }
    else if (sbp >= 140) { hypertensionRisk = 70; alerts.push({ type: 'high_bp', severity: 'warning', message: `Elevated systolic BP: ${sbp} mmHg` }); }
    else if (sbp >= 130) { hypertensionRisk = 40; recommendations.push('Monitor blood pressure closely — borderline elevated'); }
    else if (sbp >= 120) { hypertensionRisk = 20; }
    else { hypertensionRisk = 5; }
  }

  if (dbp) {
    let dbpRisk = 0;
    if (dbp >= 110) { dbpRisk = 90; alerts.push({ type: 'high_bp', severity: 'critical', message: `Severe diastolic BP: ${dbp} mmHg` }); }
    else if (dbp >= 90) { dbpRisk = 70; alerts.push({ type: 'high_bp', severity: 'warning', message: `Elevated diastolic BP: ${dbp} mmHg` }); }
    else if (dbp >= 80) { dbpRisk = 40; }
    else { dbpRisk = 5; }
    hypertensionRisk = Math.max(hypertensionRisk, dbpRisk);
  }

  // Check BP trend (rising BP is concerning)
  if (previousVisits && previousVisits.length >= 2 && sbp) {
    const prevBP = previousVisits.slice(-2).filter(v => v.systolicBp);
    if (prevBP.length >= 2) {
      const trend = prevBP.map(v => v.systolicBp!);
      if (trend.every(bp => bp < sbp) && sbp > 130) {
        hypertensionRisk = Math.min(100, hypertensionRisk + 15);
        recommendations.push('Blood pressure showing upward trend — consider preeclampsia screening');
      }
    }
  }

  // ====== GESTATIONAL DIABETES RISK ======
  let diabetesRisk = 0;
  const glucose = visit.glucose ? Number(visit.glucose) : null;

  if (glucose) {
    if (glucose >= 200) { diabetesRisk = 95; alerts.push({ type: 'high_glucose', severity: 'critical', message: `Very high glucose: ${glucose} mg/dL` }); }
    else if (glucose >= 180) { diabetesRisk = 80; alerts.push({ type: 'high_glucose', severity: 'warning', message: `High glucose: ${glucose} mg/dL` }); }
    else if (glucose >= 140) { diabetesRisk = 65; alerts.push({ type: 'high_glucose', severity: 'warning', message: `Elevated glucose: ${glucose} mg/dL — GDM screening recommended` }); }
    else if (glucose >= 120) { diabetesRisk = 40; recommendations.push('Glucose slightly elevated — dietary adjustments recommended'); }
    else if (glucose >= 100) { diabetesRisk = 20; }
    else { diabetesRisk = 5; }
  }

  // ====== PRETERM BIRTH RISK ======
  let pretermRisk = 0;
  const ga = visit.gestationalAge;

  if (ga && ga < 37) {
    pretermRisk = 15; // baseline risk for any ongoing pregnancy

    // Multi-factor risk assessment
    if (sbp && sbp > 140) pretermRisk += 25;
    if (dbp && dbp > 90) pretermRisk += 15;
    if (glucose && glucose > 140) pretermRisk += 10;
    
    const hb = visit.hemoglobin ? Number(visit.hemoglobin) : null;
    if (hb && hb < 10) pretermRisk += 15;
    if (hb && hb < 8) pretermRisk += 20;

    const afi = visit.amnioticFluidIndex ? Number(visit.amnioticFluidIndex) : null;
    if (afi && afi < 5) {
      pretermRisk += 25;
      alerts.push({ type: 'low_amniotic_fluid', severity: 'critical', message: `Low amniotic fluid index: ${afi} cm` });
    } else if (afi && afi < 8) {
      pretermRisk += 10;
      alerts.push({ type: 'low_amniotic_fluid', severity: 'warning', message: `Borderline amniotic fluid: ${afi} cm` });
    }

    pretermRisk = Math.min(100, pretermRisk);
  }

  // ====== FETAL GROWTH RESTRICTION RISK ======
  let fgrRisk = 0;
  const fh = visit.fundalHeight ? Number(visit.fundalHeight) : null;

  if (fh && ga) {
    const expected = ga; // fundal height ≈ gestational age in cm
    const diff = expected - fh;

    if (diff > 4) {
      fgrRisk = 80;
      alerts.push({ type: 'slow_growth', severity: 'critical', message: `Fundal height significantly below expected: ${fh}cm vs ${expected}cm expected` });
    } else if (diff > 3) {
      fgrRisk = 60;
      alerts.push({ type: 'slow_growth', severity: 'warning', message: `Fundal height below expected: ${fh}cm vs ${expected}cm expected` });
    } else if (diff > 2) {
      fgrRisk = 40;
      recommendations.push('Fundal height slightly below expected — monitor growth closely');
    } else if (diff > 0) {
      fgrRisk = 15;
    } else {
      fgrRisk = 5;
    }
  }

  // Fetal heart rate abnormality adds to FGR risk
  const fhr = visit.fetalHeartRate;
  if (fhr) {
    if (fhr < 100 || fhr > 180) {
      fgrRisk = Math.min(100, fgrRisk + 20);
      alerts.push({ type: 'abnormal_fhr', severity: 'critical', message: `Significantly abnormal FHR: ${fhr} BPM` });
    } else if (fhr < 110 || fhr > 160) {
      fgrRisk = Math.min(100, fgrRisk + 10);
      alerts.push({ type: 'abnormal_fhr', severity: 'warning', message: `FHR outside normal range: ${fhr} BPM (normal: 110-160)` });
    }
  }

  // ====== HEMOGLOBIN ALERTS ======
  const hb = visit.hemoglobin ? Number(visit.hemoglobin) : null;
  if (hb) {
    if (hb < 7) {
      alerts.push({ type: 'low_hemoglobin', severity: 'critical', message: `Severe anemia: Hb ${hb} g/dL — urgent intervention needed` });
    } else if (hb < 10) {
      alerts.push({ type: 'low_hemoglobin', severity: 'warning', message: `Anemia detected: Hb ${hb} g/dL — iron supplementation recommended` });
    }
  }

  // ====== OVERALL SCORE ======
  const overallScore = Math.round(
    hypertensionRisk * 0.3 +
    diabetesRisk * 0.25 +
    pretermRisk * 0.25 +
    fgrRisk * 0.2
  );

  const overallLevel: 'green' | 'yellow' | 'red' =
    overallScore >= 60 ? 'red' : overallScore >= 30 ? 'yellow' : 'green';

  // General recommendations based on level
  if (overallLevel === 'red') {
    recommendations.push('High-risk pregnancy — schedule more frequent monitoring visits');
    recommendations.push('Consider referral to maternal-fetal medicine specialist');
  } else if (overallLevel === 'yellow') {
    recommendations.push('Moderate risk — maintain regular prenatal visit schedule');
  }

  return {
    hypertensionRisk: Math.min(100, hypertensionRisk),
    diabetesRisk: Math.min(100, diabetesRisk),
    pretermRisk: Math.min(100, pretermRisk),
    fgrRisk: Math.min(100, fgrRisk),
    overallScore: Math.min(100, overallScore),
    overallLevel,
    alerts,
    recommendations,
  };
}
