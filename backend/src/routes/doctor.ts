import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/database';
import { patients, visits, alerts, riskScores, documents } from '../models/schema';
import { eq, desc, count, and, sql } from 'drizzle-orm';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// All doctor routes require doctor role
router.use(authenticate, authorize('doctor'));

// ==================== PATIENTS ====================

/**
 * GET /api/doctor/patients
 * List all patients for this doctor
 */
router.get('/patients', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctorId = req.user!.userId;

    const patientList = await db
      .select({
        id: patients.id,
        name: patients.name,
        phone: patients.phone,
        dateOfBirth: patients.dateOfBirth,
        bloodGroup: patients.bloodGroup,
        lmpDate: patients.lmpDate,
        edd: patients.edd,
        createdAt: patients.createdAt,
      })
      .from(patients)
      .where(eq(patients.doctorId, doctorId))
      .orderBy(desc(patients.createdAt));

    res.json({ patients: patientList });
  } catch (error) {
    console.error('List patients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/doctor/patients/:id
 * Get single patient with latest visit & risk score
 */
router.get('/patients/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const doctorId = req.user!.userId;

    const [patient] = await db
      .select()
      .from(patients)
      .where(and(eq(patients.id, id), eq(patients.doctorId, doctorId)))
      .limit(1);

    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    // Get latest visit
    const [latestVisit] = await db
      .select()
      .from(visits)
      .where(eq(visits.patientId, id))
      .orderBy(desc(visits.date))
      .limit(1);

    // Get latest risk score
    const [latestRisk] = await db
      .select()
      .from(riskScores)
      .where(eq(riskScores.patientId, id))
      .orderBy(desc(riskScores.createdAt))
      .limit(1);

    // Get unread alerts count
    const [alertCount] = await db
      .select({ count: count() })
      .from(alerts)
      .where(and(eq(alerts.patientId, id), eq(alerts.isRead, false)));

    res.json({
      patient: {
        id: patient.id,
        name: patient.name,
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth,
        bloodGroup: patient.bloodGroup,
        lmpDate: patient.lmpDate,
        edd: patient.edd,
      },
      latestVisit: latestVisit || null,
      latestRisk: latestRisk || null,
      unreadAlerts: alertCount.count,
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/doctor/patients
 * Create a new patient (doctor generates phone + password)
 */
router.post('/patients', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctorId = req.user!.userId;
    const { name, phone, password, dateOfBirth, bloodGroup, lmpDate } = req.body;

    if (!name || !phone || !password) {
      res.status(400).json({ error: 'Name, phone, and password are required' });
      return;
    }

    // Check duplicate phone
    const [existing] = await db.select().from(patients).where(eq(patients.phone, phone)).limit(1);
    if (existing) {
      res.status(409).json({ error: 'A patient with this phone number already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Calculate EDD from LMP (add 280 days)
    let edd: string | null = null;
    if (lmpDate) {
      const lmpDateObj = new Date(lmpDate);
      const eddDate = new Date(lmpDateObj.getTime() + 280 * 24 * 60 * 60 * 1000);
      edd = eddDate.toISOString().split('T')[0];
    }

    const [newPatient] = await db
      .insert(patients)
      .values({
        name,
        phone,
        passwordHash,
        dateOfBirth: dateOfBirth || null,
        bloodGroup: bloodGroup || null,
        lmpDate: lmpDate || null,
        edd,
        doctorId,
      })
      .returning();

    res.status(201).json({
      patient: {
        id: newPatient.id,
        name: newPatient.name,
        phone: newPatient.phone,
        dateOfBirth: newPatient.dateOfBirth,
        bloodGroup: newPatient.bloodGroup,
        lmpDate: newPatient.lmpDate,
        edd: newPatient.edd,
      },
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/doctor/patients/:id
 * Update patient
 */
router.put('/patients/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const doctorId = req.user!.userId;
    const { name, dateOfBirth, bloodGroup, lmpDate } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;
    if (lmpDate !== undefined) {
      updateData.lmpDate = lmpDate;
      // Recalculate EDD
      if (lmpDate) {
        const lmpDateObj = new Date(lmpDate);
        const eddDate = new Date(lmpDateObj.getTime() + 280 * 24 * 60 * 60 * 1000);
        updateData.edd = eddDate.toISOString().split('T')[0];
      }
    }

    const [updated] = await db
      .update(patients)
      .set(updateData)
      .where(and(eq(patients.id, id), eq(patients.doctorId, doctorId)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    res.json({ patient: updated });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/doctor/patients/:id
 * Delete patient (cascades to visits, documents, alerts, risk_scores)
 */
router.delete('/patients/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const doctorId = req.user!.userId;

    const [deleted] = await db
      .delete(patients)
      .where(and(eq(patients.id, id), eq(patients.doctorId, doctorId)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== VISITS ====================

/**
 * GET /api/doctor/visits/:patientId
 * Get visit history for a patient
 */
router.get('/visits/:patientId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId as string;

    const visitList = await db
      .select()
      .from(visits)
      .where(eq(visits.patientId, patientId))
      .orderBy(desc(visits.date));

    res.json({ visits: visitList });
  } catch (error) {
    console.error('List visits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/doctor/visits/:patientId
 * Add a new visit record — auto-triggers risk calculation and alerts
 */
router.post('/visits/:patientId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId as string;
    const doctorId = req.user!.userId;

    const {
      gestationalAge,
      date,
      maternalWeight,
      systolicBp,
      diastolicBp,
      temperature,
      pulse,
      fetalHeartRate,
      fundalHeight,
      amnioticFluidIndex,
      fetalMovement,
      glucose,
      hemoglobin,
      urineAnalysis,
      doctorNotes,
    } = req.body;

    // Calculate visit number
    const [visitCount] = await db
      .select({ count: count() })
      .from(visits)
      .where(eq(visits.patientId, patientId));

    const visitNumber = (visitCount.count as number) + 1;

    const [newVisit] = await db
      .insert(visits)
      .values({
        patientId,
        doctorId,
        visitNumber,
        gestationalAge: gestationalAge || null,
        date: date || new Date().toISOString().split('T')[0],
        maternalWeight: maternalWeight?.toString() || null,
        systolicBp: systolicBp || null,
        diastolicBp: diastolicBp || null,
        temperature: temperature?.toString() || null,
        pulse: pulse || null,
        fetalHeartRate: fetalHeartRate || null,
        fundalHeight: fundalHeight?.toString() || null,
        amnioticFluidIndex: amnioticFluidIndex?.toString() || null,
        fetalMovement: fetalMovement || null,
        glucose: glucose?.toString() || null,
        hemoglobin: hemoglobin?.toString() || null,
        urineAnalysis: urineAnalysis || null,
        doctorNotes: doctorNotes || null,
      })
      .returning();

    // --- Auto-generate alerts ---
    const generatedAlerts: Array<{ type: string; severity: string; message: string }> = [];

    if (systolicBp && systolicBp > 140) {
      generatedAlerts.push({
        type: 'high_bp',
        severity: systolicBp > 160 ? 'critical' : 'warning',
        message: `High systolic blood pressure: ${systolicBp} mmHg`,
      });
    }
    if (diastolicBp && diastolicBp > 90) {
      generatedAlerts.push({
        type: 'high_bp',
        severity: diastolicBp > 110 ? 'critical' : 'warning',
        message: `High diastolic blood pressure: ${diastolicBp} mmHg`,
      });
    }
    if (hemoglobin && hemoglobin < 10) {
      generatedAlerts.push({
        type: 'low_hemoglobin',
        severity: hemoglobin < 7 ? 'critical' : 'warning',
        message: `Low hemoglobin: ${hemoglobin} g/dL`,
      });
    }
    if (fetalHeartRate && (fetalHeartRate < 110 || fetalHeartRate > 160)) {
      generatedAlerts.push({
        type: 'abnormal_fhr',
        severity: fetalHeartRate < 100 || fetalHeartRate > 180 ? 'critical' : 'warning',
        message: `Abnormal fetal heart rate: ${fetalHeartRate} BPM (normal: 110-160)`,
      });
    }
    if (glucose && glucose > 140) {
      generatedAlerts.push({
        type: 'high_glucose',
        severity: glucose > 200 ? 'critical' : 'warning',
        message: `High glucose level: ${glucose} mg/dL`,
      });
    }

    // Insert alerts
    if (generatedAlerts.length > 0) {
      await db.insert(alerts).values(
        generatedAlerts.map((a) => ({
          patientId,
          visitId: newVisit.id,
          type: a.type as any,
          severity: a.severity as any,
          message: a.message,
        }))
      );
    }

    // --- Calculate risk score ---
    let hypertensionRisk = 0;
    let diabetesRisk = 0;
    let pretermRisk = 0;
    let fgrRisk = 0;

    // Hypertension risk
    if (systolicBp) {
      if (systolicBp > 160) hypertensionRisk = 90;
      else if (systolicBp > 140) hypertensionRisk = 70;
      else if (systolicBp > 130) hypertensionRisk = 40;
      else hypertensionRisk = 10;
    }
    if (diastolicBp) {
      const dbpRisk = diastolicBp > 110 ? 90 : diastolicBp > 90 ? 70 : diastolicBp > 80 ? 40 : 10;
      hypertensionRisk = Math.max(hypertensionRisk, dbpRisk);
    }

    // Diabetes risk
    if (glucose) {
      if (glucose > 200) diabetesRisk = 90;
      else if (glucose > 140) diabetesRisk = 70;
      else if (glucose > 120) diabetesRisk = 40;
      else diabetesRisk = 10;
    }

    // Preterm risk (simplified: based on gestational age and BP)
    if (gestationalAge && gestationalAge < 37) {
      pretermRisk = 20;
      if (systolicBp && systolicBp > 140) pretermRisk += 30;
      if (hemoglobin && hemoglobin < 10) pretermRisk += 20;
    }

    // FGR risk (based on fundal height vs expected)
    if (fundalHeight && gestationalAge) {
      const expected = gestationalAge; // rough: fundal height ≈ gestational weeks
      const diff = expected - parseFloat(fundalHeight.toString());
      if (diff > 4) fgrRisk = 80;
      else if (diff > 2) fgrRisk = 50;
      else if (diff > 0) fgrRisk = 20;
      else fgrRisk = 5;
    }

    const overallScore = Math.round((hypertensionRisk + diabetesRisk + pretermRisk + fgrRisk) / 4);
    const overallLevel = overallScore > 60 ? 'red' : overallScore > 30 ? 'yellow' : 'green';

    await db.insert(riskScores).values({
      patientId,
      visitId: newVisit.id,
      hypertensionRisk,
      diabetesRisk,
      pretermRisk,
      fgrRisk,
      overallScore,
      overallLevel: overallLevel as any,
    });

    res.status(201).json({
      visit: newVisit,
      alerts: generatedAlerts,
      riskScore: {
        hypertensionRisk,
        diabetesRisk,
        pretermRisk,
        fgrRisk,
        overallScore,
        overallLevel,
      },
    });
  } catch (error) {
    console.error('Create visit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ALERTS ====================

/**
 * GET /api/doctor/alerts
 * Get all unread alerts for doctor's patients
 */
router.get('/alerts', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctorId = req.user!.userId;

    const alertList = await db
      .select({
        id: alerts.id,
        patientId: alerts.patientId,
        patientName: patients.name,
        type: alerts.type,
        severity: alerts.severity,
        message: alerts.message,
        isRead: alerts.isRead,
        createdAt: alerts.createdAt,
      })
      .from(alerts)
      .innerJoin(patients, eq(alerts.patientId, patients.id))
      .where(and(eq(patients.doctorId, doctorId), eq(alerts.isRead, false)))
      .orderBy(desc(alerts.createdAt));

    res.json({ alerts: alertList });
  } catch (error) {
    console.error('List alerts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/doctor/alerts/:id/read
 * Mark alert as read
 */
router.put('/alerts/:id/read', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await db.update(alerts).set({ isRead: true }).where(eq(alerts.id, id));
    res.json({ message: 'Alert marked as read' });
  } catch (error) {
    console.error('Mark alert read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
