import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/database';
import { admins, doctors, patients, visits } from '../models/schema';
import { eq, sql, count } from 'drizzle-orm';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// All admin routes require admin role
router.use(authenticate, authorize('admin'));

/**
 * GET /api/admin/analytics
 * Dashboard analytics
 */
router.get('/analytics', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [doctorCount] = await db.select({ count: count() }).from(doctors);
    const [patientCount] = await db.select({ count: count() }).from(patients);
    // Active pregnancies: patients with EDD in the future
    const [activePregnancies] = await db
      .select({ count: count() })
      .from(patients)
      .where(sql`${patients.edd} >= CURRENT_DATE`);

    res.json({
      totalDoctors: doctorCount.count,
      totalPatients: patientCount.count,
      activePregnancies: activePregnancies.count,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/doctors
 * List all doctors
 */
router.get('/doctors', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allDoctors = await db
      .select({
        id: doctors.id,
        name: doctors.name,
        phone: doctors.phone,
        specialization: doctors.specialization,
        isActive: doctors.isActive,
        createdAt: doctors.createdAt,
      })
      .from(doctors)
      .orderBy(doctors.createdAt);

    res.json({ doctors: allDoctors });
  } catch (error) {
    console.error('List doctors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/doctors
 * Create a new doctor
 */
router.post('/doctors', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, password, specialization } = req.body;

    if (!name || !phone || !password) {
      res.status(400).json({ error: 'Name, phone, and password are required' });
      return;
    }

    // Check if phone already exists
    const [existing] = await db.select().from(doctors).where(eq(doctors.phone, phone)).limit(1);
    if (existing) {
      res.status(409).json({ error: 'A doctor with this phone number already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [newDoctor] = await db
      .insert(doctors)
      .values({
        name,
        phone,
        passwordHash,
        specialization: specialization || null,
        adminId: req.user!.userId,
      })
      .returning();

    res.status(201).json({
      doctor: {
        id: newDoctor.id,
        name: newDoctor.name,
        phone: newDoctor.phone,
        specialization: newDoctor.specialization,
        isActive: newDoctor.isActive,
      },
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/admin/doctors/:id
 * Update a doctor
 */
router.put('/doctors/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, phone, specialization, isActive } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (specialization !== undefined) updateData.specialization = specialization;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updated] = await db
      .update(doctors)
      .set(updateData)
      .where(eq(doctors.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: 'Doctor not found' });
      return;
    }

    res.json({
      doctor: {
        id: updated.id,
        name: updated.name,
        phone: updated.phone,
        specialization: updated.specialization,
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
