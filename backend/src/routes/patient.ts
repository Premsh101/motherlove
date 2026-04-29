import { Router, Response } from 'express';
import { db } from '../config/database';
import { patients, visits, riskScores, alerts, documents } from '../models/schema';
import { eq, desc } from 'drizzle-orm';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = Router();

// All patient routes require patient role
router.use(authenticate, authorize('patient'));

/**
 * GET /api/patient/overview
 * Pregnancy overview for the logged-in patient
 */
router.get('/overview', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.user!.userId;

    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.id, patientId))
      .limit(1);

    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    // Calculate gestational age from LMP
    let gestationalWeeks: number | null = null;
    let gestationalDays: number | null = null;
    let trimester: number | null = null;
    let daysUntilDue: number | null = null;

    if (patient.lmpDate) {
      const lmp = new Date(patient.lmpDate);
      const today = new Date();
      const diffMs = today.getTime() - lmp.getTime();
      const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      gestationalWeeks = Math.floor(totalDays / 7);
      gestationalDays = totalDays % 7;
      trimester = gestationalWeeks < 13 ? 1 : gestationalWeeks < 27 ? 2 : 3;
    }

    if (patient.edd) {
      const edd = new Date(patient.edd);
      const today = new Date();
      daysUntilDue = Math.ceil((edd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Latest visit
    const [latestVisit] = await db
      .select()
      .from(visits)
      .where(eq(visits.patientId, patientId))
      .orderBy(desc(visits.date))
      .limit(1);

    // Latest risk score
    const [latestRisk] = await db
      .select()
      .from(riskScores)
      .where(eq(riskScores.patientId, patientId))
      .orderBy(desc(riskScores.createdAt))
      .limit(1);

    // Baby size info based on gestational weeks
    const babySizes: Record<number, { size: string; emoji: string; weight: string }> = {
      4: { size: 'Poppy Seed', emoji: '🫘', weight: '< 1g' },
      8: { size: 'Raspberry', emoji: '🫐', weight: '1g' },
      12: { size: 'Lime', emoji: '🍋', weight: '14g' },
      16: { size: 'Avocado', emoji: '🥑', weight: '100g' },
      20: { size: 'Banana', emoji: '🍌', weight: '300g' },
      24: { size: 'Corn', emoji: '🌽', weight: '600g' },
      28: { size: 'Eggplant', emoji: '🍆', weight: '1kg' },
      32: { size: 'Squash', emoji: '🎃', weight: '1.7kg' },
      36: { size: 'Honeydew', emoji: '🍈', weight: '2.6kg' },
      40: { size: 'Watermelon', emoji: '🍉', weight: '3.4kg' },
    };

    let babySize = null;
    if (gestationalWeeks !== null) {
      const closestWeek = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40]
        .reduce((prev, curr) =>
          Math.abs(curr - gestationalWeeks!) < Math.abs(prev - gestationalWeeks!) ? curr : prev
        );
      babySize = babySizes[closestWeek] || null;
    }

    res.json({
      patient: {
        name: patient.name,
        bloodGroup: patient.bloodGroup,
        lmpDate: patient.lmpDate,
        edd: patient.edd,
      },
      pregnancy: {
        gestationalWeeks,
        gestationalDays,
        trimester,
        daysUntilDue,
        babySize,
      },
      latestVisit: latestVisit || null,
      latestRisk: latestRisk || null,
    });
  } catch (error) {
    console.error('Patient overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/patient/visits
 * Visit history for the logged-in patient
 */
router.get('/visits', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.user!.userId;

    const visitList = await db
      .select()
      .from(visits)
      .where(eq(visits.patientId, patientId))
      .orderBy(desc(visits.date));

    res.json({ visits: visitList });
  } catch (error) {
    console.error('Patient visits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/patient/graphs
 * Graph data for the logged-in patient
 */
router.get('/graphs', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.user!.userId;

    const visitData = await db
      .select({
        date: visits.date,
        gestationalAge: visits.gestationalAge,
        maternalWeight: visits.maternalWeight,
        systolicBp: visits.systolicBp,
        diastolicBp: visits.diastolicBp,
        fetalHeartRate: visits.fetalHeartRate,
        fundalHeight: visits.fundalHeight,
        glucose: visits.glucose,
        hemoglobin: visits.hemoglobin,
        amnioticFluidIndex: visits.amnioticFluidIndex,
        fetalMovement: visits.fetalMovement,
        temperature: visits.temperature,
        pulse: visits.pulse,
      })
      .from(visits)
      .where(eq(visits.patientId, patientId))
      .orderBy(visits.date);

    const riskData = await db
      .select()
      .from(riskScores)
      .where(eq(riskScores.patientId, patientId))
      .orderBy(riskScores.createdAt);

    res.json({ visits: visitData, riskScores: riskData });
  } catch (error) {
    console.error('Patient graphs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/patient/documents
 * Documents for the logged-in patient
 */
router.get('/documents', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.user!.userId;

    const docs = await db
      .select()
      .from(documents)
      .where(eq(documents.patientId, patientId))
      .orderBy(desc(documents.createdAt));

    res.json({ documents: docs });
  } catch (error) {
    console.error('Patient documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/patient/profile
 * Update patient profile information
 */
router.put('/profile', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { phone, bloodGroup, lmpDate, dateOfBirth, password } = req.body;

    const updateData: any = {};
    if (phone) updateData.phone = phone;
    if (bloodGroup) updateData.bloodGroup = bloodGroup;
    if (lmpDate) updateData.lmpDate = lmpDate;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'No data provided to update' });
      return;
    }

    const [updated] = await db
      .update(patients)
      .set(updateData)
      .where(eq(patients.id, userId))
      .returning();

    res.json({ message: 'Profile updated successfully', patient: { name: updated.name, phone: updated.phone } });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
