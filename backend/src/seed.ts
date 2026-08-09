/**
 * Seed script — populates MotherNest DB with sample data.
 *
 * Safe to run repeatedly: every step checks for what it is about to create and
 * skips it if it already exists, so the deploy can run this on every start
 * without duplicating rows, resetting passwords or clobbering real data.
 *
 * Run: npm run db:seed
 */
import dotenv from 'dotenv';
dotenv.config();

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import bcrypt from 'bcryptjs';
import * as schema from './models/schema';

/** Any Drizzle Postgres database — the app uses the Neon HTTP driver. */
export type SeedDb = PgDatabase<any, any, any>;

type VisitSample = {
  week: number;
  weight: number;
  sbp: number;
  dbp: number;
  fhr: number;
  fh: number;
  glucose: number;
  hb: number;
  temp: number;
  pulse: number;
  afi: number;
  fm: number;
};

type RiskScore = {
  hypertensionRisk: number;
  diabetesRisk: number;
  pretermRisk: number;
  fgrRisk: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const GESTATION_DAYS = 280;

const isoDate = (d: Date) => d.toISOString().split('T')[0];

/** Date `weeks` weeks before today, i.e. the LMP of someone that far along. */
function lmpForGestationalAge(weeks: number): Date {
  const lmp = new Date();
  lmp.setDate(lmp.getDate() - weeks * 7);
  return lmp;
}

function eddFor(lmp: Date): Date {
  return new Date(lmp.getTime() + GESTATION_DAYS * DAY_MS);
}

function visitDate(lmp: Date, week: number): Date {
  const d = new Date(lmp);
  d.setDate(d.getDate() + week * 7);
  return d;
}

function overallLevel(score: number): 'green' | 'yellow' | 'red' {
  return score > 60 ? 'red' : score > 30 ? 'yellow' : 'green';
}

// --- Idempotent upserts (match on the unique phone number) ---

async function ensureAdmin(db: SeedDb, values: typeof schema.admins.$inferInsert) {
  const [existing] = await db
    .select()
    .from(schema.admins)
    .where(eq(schema.admins.phone, values.phone))
    .limit(1);
  if (existing) return { row: existing, created: false };

  const [row] = await db.insert(schema.admins).values(values).returning();
  return { row, created: true };
}

async function ensureDoctor(db: SeedDb, values: typeof schema.doctors.$inferInsert) {
  const [existing] = await db
    .select()
    .from(schema.doctors)
    .where(eq(schema.doctors.phone, values.phone))
    .limit(1);
  if (existing) return { row: existing, created: false };

  const [row] = await db.insert(schema.doctors).values(values).returning();
  return { row, created: true };
}

async function ensurePatient(db: SeedDb, values: typeof schema.patients.$inferInsert) {
  const [existing] = await db
    .select()
    .from(schema.patients)
    .where(eq(schema.patients.phone, values.phone))
    .limit(1);
  if (existing) return { row: existing, created: false };

  const [row] = await db.insert(schema.patients).values(values).returning();
  return { row, created: true };
}

/**
 * Insert a patient's visit history (plus risk scores and any alerts).
 * Skipped entirely when the patient already has visits, so re-running never
 * duplicates a history or overwrites visits entered by a real doctor.
 */
async function ensureVisitHistory(
  db: SeedDb,
  opts: {
    patient: typeof schema.patients.$inferSelect;
    doctorId: string;
    samples: VisitSample[];
    riskFor: (v: VisitSample) => RiskScore;
    alertsFor?: (v: VisitSample) => Array<{ type: string; severity: string; message: string }>;
    notesFor: (v: VisitSample) => string;
    urineFor?: (v: VisitSample) => string;
  }
): Promise<number> {
  const { patient, doctorId, samples, riskFor, alertsFor, notesFor, urineFor } = opts;

  const [existingVisit] = await db
    .select({ id: schema.visits.id })
    .from(schema.visits)
    .where(eq(schema.visits.patientId, patient.id))
    .limit(1);
  if (existingVisit) return 0;

  // Anchor the history to the patient's stored LMP so re-seeding a partially
  // populated database still produces dates consistent with their record.
  const lmp = patient.lmpDate ? new Date(patient.lmpDate) : lmpForGestationalAge(samples[samples.length - 1].week);

  for (let i = 0; i < samples.length; i++) {
    const v = samples[i];

    const [visit] = await db
      .insert(schema.visits)
      .values({
        patientId: patient.id,
        doctorId,
        visitNumber: i + 1,
        gestationalAge: v.week,
        date: isoDate(visitDate(lmp, v.week)),
        maternalWeight: v.weight.toString(),
        systolicBp: v.sbp,
        diastolicBp: v.dbp,
        fetalHeartRate: v.fhr,
        fundalHeight: v.fh.toString(),
        glucose: v.glucose.toString(),
        hemoglobin: v.hb.toString(),
        temperature: v.temp.toString(),
        pulse: v.pulse,
        amnioticFluidIndex: v.afi.toString(),
        fetalMovement: v.fm,
        urineAnalysis: urineFor ? urineFor(v) : 'Normal',
        doctorNotes: notesFor(v),
      })
      .returning();

    const generatedAlerts = alertsFor ? alertsFor(v) : [];
    if (generatedAlerts.length > 0) {
      await db.insert(schema.alerts).values(
        generatedAlerts.map((a) => ({
          patientId: patient.id,
          visitId: visit.id,
          type: a.type as any,
          severity: a.severity as any,
          message: a.message,
        }))
      );
    }

    const risk = riskFor(v);
    const overall = Math.round(
      (risk.hypertensionRisk + risk.diabetesRisk + risk.pretermRisk + risk.fgrRisk) / 4
    );

    await db.insert(schema.riskScores).values({
      patientId: patient.id,
      visitId: visit.id,
      ...risk,
      overallScore: overall,
      overallLevel: overallLevel(overall) as any,
    });
  }

  return samples.length;
}

// --- Sample data ---

const AAROHI_VISITS: VisitSample[] = [
  { week: 8, weight: 55.2, sbp: 110, dbp: 70, fhr: 145, fh: 8, glucose: 85, hb: 12.1, temp: 36.6, pulse: 72, afi: 12, fm: 3 },
  { week: 12, weight: 56.5, sbp: 115, dbp: 72, fhr: 150, fh: 12, glucose: 88, hb: 11.8, temp: 36.5, pulse: 76, afi: 13, fm: 5 },
  { week: 16, weight: 58.1, sbp: 118, dbp: 74, fhr: 148, fh: 16, glucose: 92, hb: 11.5, temp: 36.7, pulse: 78, afi: 14, fm: 8 },
  { week: 20, weight: 60.3, sbp: 120, dbp: 76, fhr: 142, fh: 20, glucose: 95, hb: 11.2, temp: 36.5, pulse: 80, afi: 15, fm: 12 },
  { week: 24, weight: 63.0, sbp: 122, dbp: 78, fhr: 138, fh: 23, glucose: 105, hb: 10.8, temp: 36.8, pulse: 82, afi: 14, fm: 15 },
  { week: 26, weight: 64.5, sbp: 128, dbp: 82, fhr: 140, fh: 25, glucose: 118, hb: 10.5, temp: 36.6, pulse: 84, afi: 13, fm: 18 },
  { week: 28, weight: 66.2, sbp: 130, dbp: 84, fhr: 136, fh: 27, glucose: 125, hb: 10.2, temp: 36.7, pulse: 86, afi: 12, fm: 20 },
];

const MEERA_VISITS: VisitSample[] = [
  { week: 6, weight: 52.0, sbp: 108, dbp: 68, fhr: 155, fh: 6, glucose: 80, hb: 12.5, temp: 36.4, pulse: 70, afi: 10, fm: 0 },
  { week: 10, weight: 53.2, sbp: 112, dbp: 70, fhr: 152, fh: 10, glucose: 82, hb: 12.2, temp: 36.5, pulse: 74, afi: 11, fm: 2 },
  { week: 14, weight: 54.8, sbp: 115, dbp: 72, fhr: 148, fh: 14, glucose: 88, hb: 11.9, temp: 36.6, pulse: 76, afi: 13, fm: 5 },
  { week: 18, weight: 57.0, sbp: 118, dbp: 75, fhr: 144, fh: 17, glucose: 90, hb: 11.5, temp: 36.5, pulse: 78, afi: 14, fm: 8 },
  { week: 20, weight: 58.5, sbp: 120, dbp: 76, fhr: 140, fh: 19, glucose: 92, hb: 11.3, temp: 36.7, pulse: 80, afi: 15, fm: 10 },
];

const SANYA_VISITS: VisitSample[] = [
  { week: 8, weight: 68.0, sbp: 125, dbp: 80, fhr: 148, fh: 8, glucose: 110, hb: 10.5, temp: 36.8, pulse: 88, afi: 12, fm: 3 },
  { week: 12, weight: 70.2, sbp: 130, dbp: 85, fhr: 152, fh: 11, glucose: 125, hb: 10.0, temp: 36.7, pulse: 90, afi: 11, fm: 4 },
  { week: 16, weight: 72.5, sbp: 135, dbp: 88, fhr: 145, fh: 14, glucose: 138, hb: 9.8, temp: 37.0, pulse: 92, afi: 10, fm: 6 },
  { week: 20, weight: 75.0, sbp: 138, dbp: 90, fhr: 140, fh: 18, glucose: 145, hb: 9.5, temp: 36.9, pulse: 94, afi: 9, fm: 8 },
  { week: 24, weight: 78.0, sbp: 142, dbp: 92, fhr: 135, fh: 21, glucose: 155, hb: 9.2, temp: 37.1, pulse: 96, afi: 8, fm: 10 },
  { week: 28, weight: 80.5, sbp: 145, dbp: 95, fhr: 130, fh: 25, glucose: 162, hb: 8.8, temp: 37.0, pulse: 98, afi: 7, fm: 12 },
  { week: 32, weight: 83.0, sbp: 148, dbp: 96, fhr: 128, fh: 28, glucose: 170, hb: 8.5, temp: 37.2, pulse: 100, afi: 6, fm: 14 },
  { week: 34, weight: 85.2, sbp: 150, dbp: 98, fhr: 125, fh: 30, glucose: 180, hb: 8.2, temp: 37.1, pulse: 102, afi: 5, fm: 15 },
];

/**
 * Create the sample admin / doctors / patients and their histories.
 * Returns a summary of what was actually created.
 */
export async function seedDatabase(db: SeedDb) {
  const summary = { admins: 0, doctors: 0, patients: 0, visits: 0 };

  // 1) Admin
  const admin = await ensureAdmin(db, {
    name: 'Dr. Admin',
    phone: '9000000001',
    passwordHash: await bcrypt.hash('admin123', 12),
  });
  if (admin.created) summary.admins++;
  console.log(`${admin.created ? '✅ Created' : '↩️  Exists '} admin:   ${admin.row.name} (${admin.row.phone})`);

  // 2) Doctors
  const docHash = await bcrypt.hash('doctor123', 12);
  const doc1 = await ensureDoctor(db, {
    name: 'Dr. Priya Sharma',
    phone: '9000000002',
    passwordHash: docHash,
    specialization: 'Obstetrics & Gynecology',
    adminId: admin.row.id,
  });
  const doc2 = await ensureDoctor(db, {
    name: 'Dr. Neha Gupta',
    phone: '9000000003',
    passwordHash: docHash,
    specialization: 'Maternal-Fetal Medicine',
    adminId: admin.row.id,
  });
  for (const doc of [doc1, doc2]) {
    if (doc.created) summary.doctors++;
    console.log(`${doc.created ? '✅ Created' : '↩️  Exists '} doctor:  ${doc.row.name} (${doc.row.phone})`);
  }

  // 3) Patients
  const patHash = await bcrypt.hash('patient123', 12);

  const lmp1 = lmpForGestationalAge(28);
  const pat1 = await ensurePatient(db, {
    name: 'Aarohi Verma',
    phone: '9000000010',
    passwordHash: patHash,
    dateOfBirth: '1997-05-15',
    bloodGroup: 'B+',
    lmpDate: isoDate(lmp1),
    edd: isoDate(eddFor(lmp1)),
    doctorId: doc1.row.id,
  });

  const lmp2 = lmpForGestationalAge(20);
  const pat2 = await ensurePatient(db, {
    name: 'Meera Patel',
    phone: '9000000011',
    passwordHash: patHash,
    dateOfBirth: '1995-11-22',
    bloodGroup: 'A+',
    lmpDate: isoDate(lmp2),
    edd: isoDate(eddFor(lmp2)),
    doctorId: doc1.row.id,
  });

  const lmp3 = lmpForGestationalAge(34);
  const pat3 = await ensurePatient(db, {
    name: 'Sanya Reddy',
    phone: '9000000012',
    passwordHash: patHash,
    dateOfBirth: '1999-02-08',
    bloodGroup: 'O+',
    lmpDate: isoDate(lmp3),
    edd: isoDate(eddFor(lmp3)),
    doctorId: doc2.row.id,
  });

  for (const pat of [pat1, pat2, pat3]) {
    if (pat.created) summary.patients++;
    console.log(`${pat.created ? '✅ Created' : '↩️  Exists '} patient: ${pat.row.name} (${pat.row.phone})`);
  }

  // 4) Aarohi — 28 weeks, routine pregnancy
  summary.visits += await ensureVisitHistory(db, {
    patient: pat1.row,
    doctorId: doc1.row.id,
    samples: AAROHI_VISITS,
    notesFor: (v) => `Routine checkup at week ${v.week}. All parameters within normal range.`,
    riskFor: (v) => {
      let pretermRisk = v.week < 37 ? 15 : 5;
      if (v.sbp > 130) pretermRisk += 15;
      return {
        hypertensionRisk: v.sbp > 140 ? 70 : v.sbp > 130 ? 40 : v.sbp > 120 ? 20 : 10,
        diabetesRisk: v.glucose > 140 ? 70 : v.glucose > 120 ? 40 : v.glucose > 100 ? 20 : 10,
        pretermRisk,
        fgrRisk: Math.abs(v.week - v.fh) > 4 ? 60 : Math.abs(v.week - v.fh) > 2 ? 35 : 10,
      };
    },
  });

  // 5) Meera — 20 weeks, routine pregnancy
  summary.visits += await ensureVisitHistory(db, {
    patient: pat2.row,
    doctorId: doc1.row.id,
    samples: MEERA_VISITS,
    notesFor: (v) => `Week ${v.week} checkup.`,
    riskFor: (v) => ({
      hypertensionRisk: v.sbp > 140 ? 70 : v.sbp > 130 ? 40 : 10,
      diabetesRisk: v.glucose > 140 ? 70 : v.glucose > 100 ? 20 : 10,
      pretermRisk: 15,
      fgrRisk: Math.abs(v.week - v.fh) > 2 ? 35 : 10,
    }),
  });

  // 6) Sanya — 34 weeks, high risk (drives the alerts + red risk demo)
  summary.visits += await ensureVisitHistory(db, {
    patient: pat3.row,
    doctorId: doc2.row.id,
    samples: SANYA_VISITS,
    urineFor: (v) => (v.hb < 10 ? 'Trace protein' : 'Normal'),
    notesFor: (v) =>
      `Week ${v.week} — monitored closely. ${v.sbp > 140 ? 'BP elevated.' : ''} ${
        v.glucose > 140 ? 'Glucose high.' : ''
      } ${v.hb < 10 ? 'Low hemoglobin.' : ''}`.trim(),
    alertsFor: (v) => {
      const generated: Array<{ type: string; severity: string; message: string }> = [];
      if (v.sbp > 140)
        generated.push({ type: 'high_bp', severity: v.sbp > 160 ? 'critical' : 'warning', message: `High BP: ${v.sbp}/${v.dbp} mmHg` });
      if (v.hb < 10)
        generated.push({ type: 'low_hemoglobin', severity: v.hb < 7 ? 'critical' : 'warning', message: `Low Hb: ${v.hb} g/dL` });
      if (v.glucose > 140)
        generated.push({ type: 'high_glucose', severity: v.glucose > 200 ? 'critical' : 'warning', message: `High glucose: ${v.glucose} mg/dL` });
      if (v.fhr < 110 || v.fhr > 160)
        generated.push({ type: 'abnormal_fhr', severity: 'warning', message: `Abnormal FHR: ${v.fhr} BPM` });
      return generated;
    },
    riskFor: (v) => {
      let pretermRisk = 20;
      if (v.sbp > 140) pretermRisk += 30;
      if (v.hb < 10) pretermRisk += 20;
      return {
        hypertensionRisk: v.sbp > 160 ? 90 : v.sbp > 140 ? 70 : v.sbp > 130 ? 40 : 10,
        diabetesRisk: v.glucose > 200 ? 90 : v.glucose > 140 ? 70 : v.glucose > 120 ? 40 : 10,
        pretermRisk,
        fgrRisk: Math.abs(v.week - v.fh) > 4 ? 80 : Math.abs(v.week - v.fh) > 2 ? 50 : 10,
      };
    },
  });

  return summary;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  console.log('🌱 Seeding MotherNest database...');

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema }) as unknown as SeedDb;

  const summary = await seedDatabase(db);

  const created =
    summary.admins + summary.doctors + summary.patients + summary.visits > 0;
  console.log(
    created
      ? `\n🎉 Seeding complete — created ${summary.admins} admin(s), ${summary.doctors} doctor(s), ${summary.patients} patient(s), ${summary.visits} visit(s).`
      : '\n👌 Nothing to do — sample data is already present.'
  );
  console.log('========================');
  console.log('Login credentials:');
  console.log('  Admin:   9000000001 / admin123');
  console.log('  Doctor:  9000000002 / doctor123  (Dr. Priya)');
  console.log('  Doctor:  9000000003 / doctor123  (Dr. Neha)');
  console.log('  Patient: 9000000010 / patient123 (Aarohi, 28 wks)');
  console.log('  Patient: 9000000011 / patient123 (Meera, 20 wks)');
  console.log('  Patient: 9000000012 / patient123 (Sanya, 34 wks, high risk)');
  console.log('(Passwords are only set when an account is first created.)');
}

// Only run when invoked directly, so importing this module for tests or from
// the API does not kick off a seed.
if (require.main === module) {
  main().catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}
