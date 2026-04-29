import { Router, Response } from 'express';
import { db } from '../config/database';
import { visits, riskScores, patients } from '../models/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

/**
 * GET /api/graphs/:patientId/maternal
 * Aggregated maternal health data for charting
 */
router.get('/:patientId/maternal', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId as string;

    const visitData = await db
      .select({
        date: visits.date,
        gestationalAge: visits.gestationalAge,
        maternalWeight: visits.maternalWeight,
        systolicBp: visits.systolicBp,
        diastolicBp: visits.diastolicBp,
        temperature: visits.temperature,
        pulse: visits.pulse,
        hemoglobin: visits.hemoglobin,
        glucose: visits.glucose,
        urineAnalysis: visits.urineAnalysis,
      })
      .from(visits)
      .where(eq(visits.patientId, patientId))
      .orderBy(asc(visits.date));

    // Compute reference ranges and annotations
    const weightGain = visitData.map((v, i) => ({
      week: v.gestationalAge,
      date: v.date,
      weight: v.maternalWeight ? Number(v.maternalWeight) : null,
      gainFromFirst: i === 0 || !v.maternalWeight || !visitData[0].maternalWeight
        ? 0
        : Number(v.maternalWeight) - Number(visitData[0].maternalWeight),
    }));

    const bloodPressure = visitData.map(v => ({
      week: v.gestationalAge,
      date: v.date,
      systolic: v.systolicBp,
      diastolic: v.diastolicBp,
      isHigh: (v.systolicBp && v.systolicBp > 140) || (v.diastolicBp && v.diastolicBp > 90),
    }));

    const labValues = visitData.map(v => ({
      week: v.gestationalAge,
      date: v.date,
      hemoglobin: v.hemoglobin ? Number(v.hemoglobin) : null,
      glucose: v.glucose ? Number(v.glucose) : null,
      temperature: v.temperature ? Number(v.temperature) : null,
      pulse: v.pulse,
    }));

    res.json({
      weightGain,
      bloodPressure,
      labValues,
      totalVisits: visitData.length,
    });
  } catch (error) {
    console.error('Maternal graphs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/graphs/:patientId/fetal
 * Aggregated fetal health data for charting
 */
router.get('/:patientId/fetal', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId as string;

    const visitData = await db
      .select({
        date: visits.date,
        gestationalAge: visits.gestationalAge,
        fetalHeartRate: visits.fetalHeartRate,
        fundalHeight: visits.fundalHeight,
        amnioticFluidIndex: visits.amnioticFluidIndex,
        fetalMovement: visits.fetalMovement,
      })
      .from(visits)
      .where(eq(visits.patientId, patientId))
      .orderBy(asc(visits.date));

    const fetalHeartRate = visitData.map(v => ({
      week: v.gestationalAge,
      date: v.date,
      fhr: v.fetalHeartRate,
      isNormal: v.fetalHeartRate ? v.fetalHeartRate >= 110 && v.fetalHeartRate <= 160 : null,
    }));

    const growthCurve = visitData.map(v => ({
      week: v.gestationalAge,
      date: v.date,
      fundalHeight: v.fundalHeight ? Number(v.fundalHeight) : null,
      expected: v.gestationalAge, // fundal height ≈ gestational weeks
      afi: v.amnioticFluidIndex ? Number(v.amnioticFluidIndex) : null,
    }));

    const fetalMovement = visitData.map(v => ({
      week: v.gestationalAge,
      date: v.date,
      count: v.fetalMovement || 0,
    }));

    res.json({
      fetalHeartRate,
      growthCurve,
      fetalMovement,
    });
  } catch (error) {
    console.error('Fetal graphs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/graphs/:patientId/risk-trend
 * Risk score trend over time
 */
router.get('/:patientId/risk-trend', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId as string;

    const riskData = await db
      .select()
      .from(riskScores)
      .where(eq(riskScores.patientId, patientId))
      .orderBy(asc(riskScores.createdAt));

    const riskTrend = riskData.map(r => ({
      date: r.createdAt,
      hypertension: r.hypertensionRisk || 0,
      diabetes: r.diabetesRisk || 0,
      preterm: r.pretermRisk || 0,
      fgr: r.fgrRisk || 0,
      overall: r.overallScore || 0,
      level: r.overallLevel,
    }));

    res.json({ riskTrend });
  } catch (error) {
    console.error('Risk trend error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
