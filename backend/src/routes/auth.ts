import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';
import { admins, doctors, patients } from '../models/schema';
import { eq } from 'drizzle-orm';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /api/auth/login
 * Authenticate user with phone + password, auto-detect role
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      res.status(400).json({ error: 'Phone and password are required' });
      return;
    }

    // Try to find user in each role table (admin → doctor → patient)
    let user: { id: string; passwordHash: string; name: string } | null = null;
    let role: 'admin' | 'doctor' | 'patient' = 'patient';

    // Check admins
    const [adminUser] = await db
      .select()
      .from(admins)
      .where(eq(admins.phone, phone))
      .limit(1);

    if (adminUser) {
      user = { id: adminUser.id, passwordHash: adminUser.passwordHash, name: adminUser.name };
      role = 'admin';
    }

    // Check doctors
    if (!user) {
      const [doctorUser] = await db
        .select()
        .from(doctors)
        .where(eq(doctors.phone, phone))
        .limit(1);

      if (doctorUser) {
        if (!doctorUser.isActive) {
          res.status(403).json({ error: 'Your account has been disabled. Contact admin.' });
          return;
        }
        user = { id: doctorUser.id, passwordHash: doctorUser.passwordHash, name: doctorUser.name };
        role = 'doctor';
      }
    }

    // Check patients
    if (!user) {
      const [patientUser] = await db
        .select()
        .from(patients)
        .where(eq(patients.phone, phone))
        .limit(1);

      if (patientUser) {
        user = { id: patientUser.id, passwordHash: patientUser.passwordHash, name: patientUser.name };
        role = 'patient';
      }
    }

    if (!user) {
      res.status(401).json({ error: 'Invalid phone number or password' });
      return;
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid phone number or password' });
      return;
    }

    // Generate JWT
    const expiresIn = 7 * 24 * 60 * 60; // 7 days in seconds
    const token = jwt.sign(
      { userId: user.id, role, phone },
      process.env.JWT_SECRET!,
      { expiresIn }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone,
        role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/me
 * Get current user info from JWT
 */
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, role } = req.user!;

    let userData: any = null;

    if (role === 'admin') {
      const [admin] = await db.select().from(admins).where(eq(admins.id, userId)).limit(1);
      if (admin) userData = { id: admin.id, name: admin.name, phone: admin.phone, role };
    } else if (role === 'doctor') {
      const [doctor] = await db.select().from(doctors).where(eq(doctors.id, userId)).limit(1);
      if (doctor) userData = { id: doctor.id, name: doctor.name, phone: doctor.phone, specialization: doctor.specialization, role };
    } else if (role === 'patient') {
      const [patient] = await db.select().from(patients).where(eq(patients.id, userId)).limit(1);
      if (patient) userData = {
        id: patient.id,
        name: patient.name,
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth,
        bloodGroup: patient.bloodGroup,
        lmpDate: patient.lmpDate,
        edd: patient.edd,
        role,
      };
    }

    if (!userData) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user: userData });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
