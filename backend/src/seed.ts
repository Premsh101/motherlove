/**
 * Seed script — populates MotherNest DB with sample data
 * Run: npx tsx src/seed.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import bcrypt from 'bcryptjs';
import * as schema from './models/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log('🌱 Seeding MotherNest database...');

  // 1) Admin
  const adminHash = await bcrypt.hash('admin123', 12);
  const [admin] = await db.insert(schema.admins).values({
    name: 'Dr. Admin',
    phone: '9000000001',
    passwordHash: adminHash,
  }).returning();
  console.log('✅ Admin created:', admin.name, '(phone: 9000000001, pw: admin123)');

  // 2) Doctors
  const docHash = await bcrypt.hash('doctor123', 12);
  const [doc1] = await db.insert(schema.doctors).values({
    name: 'Dr. Priya Sharma',
    phone: '9000000002',
    passwordHash: docHash,
    specialization: 'Obstetrics & Gynecology',
    adminId: admin.id,
  }).returning();
  const [doc2] = await db.insert(schema.doctors).values({
    name: 'Dr. Neha Gupta',
    phone: '9000000003',
    passwordHash: docHash,
    specialization: 'Maternal-Fetal Medicine',
    adminId: admin.id,
  }).returning();
  console.log('✅ Doctors created:', doc1.name, doc2.name);

  // 3) Patients
  const patHash = await bcrypt.hash('patient123', 12);

  // Patient 1 — 28 weeks pregnant
  const lmp1 = new Date();
  lmp1.setDate(lmp1.getDate() - 28 * 7); // 28 weeks ago
  const edd1 = new Date(lmp1.getTime() + 280 * 24 * 60 * 60 * 1000);

  const [pat1] = await db.insert(schema.patients).values({
    name: 'Aarohi Verma',
    phone: '9000000010',
    passwordHash: patHash,
    dateOfBirth: '1997-05-15',
    bloodGroup: 'B+',
    lmpDate: lmp1.toISOString().split('T')[0],
    edd: edd1.toISOString().split('T')[0],
    doctorId: doc1.id,
  }).returning();

  // Patient 2 — 20 weeks pregnant
  const lmp2 = new Date();
  lmp2.setDate(lmp2.getDate() - 20 * 7);
  const edd2 = new Date(lmp2.getTime() + 280 * 24 * 60 * 60 * 1000);

  const [pat2] = await db.insert(schema.patients).values({
    name: 'Meera Patel',
    phone: '9000000011',
    passwordHash: patHash,
    dateOfBirth: '1995-11-22',
    bloodGroup: 'A+',
    lmpDate: lmp2.toISOString().split('T')[0],
    edd: edd2.toISOString().split('T')[0],
    doctorId: doc1.id,
  }).returning();

  // Patient 3 — 34 weeks pregnant
  const lmp3 = new Date();
  lmp3.setDate(lmp3.getDate() - 34 * 7);
  const edd3 = new Date(lmp3.getTime() + 280 * 24 * 60 * 60 * 1000);

  const [pat3] = await db.insert(schema.patients).values({
    name: 'Sanya Reddy',
    phone: '9000000012',
    passwordHash: patHash,
    dateOfBirth: '1999-02-08',
    bloodGroup: 'O+',
    lmpDate: lmp3.toISOString().split('T')[0],
    edd: edd3.toISOString().split('T')[0],
    doctorId: doc2.id,
  }).returning();

  console.log('✅ Patients created:', pat1.name, pat2.name, pat3.name);

  // 4) Visits for Patient 1 (Aarohi — 28 weeks, 7 visits every 4 weeks)
  const pat1Visits = [
    { week: 8, weight: 55.2, sbp: 110, dbp: 70, fhr: 145, fh: 8, glucose: 85, hb: 12.1, temp: 36.6, pulse: 72, afi: 12, fm: 3 },
    { week: 12, weight: 56.5, sbp: 115, dbp: 72, fhr: 150, fh: 12, glucose: 88, hb: 11.8, temp: 36.5, pulse: 76, afi: 13, fm: 5 },
    { week: 16, weight: 58.1, sbp: 118, dbp: 74, fhr: 148, fh: 16, glucose: 92, hb: 11.5, temp: 36.7, pulse: 78, afi: 14, fm: 8 },
    { week: 20, weight: 60.3, sbp: 120, dbp: 76, fhr: 142, fh: 20, glucose: 95, hb: 11.2, temp: 36.5, pulse: 80, afi: 15, fm: 12 },
    { week: 24, weight: 63.0, sbp: 122, dbp: 78, fhr: 138, fh: 23, glucose: 105, hb: 10.8, temp: 36.8, pulse: 82, afi: 14, fm: 15 },
    { week: 26, weight: 64.5, sbp: 128, dbp: 82, fhr: 140, fh: 25, glucose: 118, hb: 10.5, temp: 36.6, pulse: 84, afi: 13, fm: 18 },
    { week: 28, weight: 66.2, sbp: 130, dbp: 84, fhr: 136, fh: 27, glucose: 125, hb: 10.2, temp: 36.7, pulse: 86, afi: 12, fm: 20 },
  ];

  for (let i = 0; i < pat1Visits.length; i++) {
    const v = pat1Visits[i];
    const visitDate = new Date(lmp1);
    visitDate.setDate(visitDate.getDate() + v.week * 7);

    const [visit] = await db.insert(schema.visits).values({
      patientId: pat1.id,
      doctorId: doc1.id,
      visitNumber: i + 1,
      gestationalAge: v.week,
      date: visitDate.toISOString().split('T')[0],
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
      urineAnalysis: 'Normal',
      doctorNotes: `Routine checkup at week ${v.week}. All parameters within normal range.`,
    }).returning();

    // Risk score for each visit
    let hRisk = v.sbp > 140 ? 70 : v.sbp > 130 ? 40 : v.sbp > 120 ? 20 : 10;
    let dRisk = v.glucose > 140 ? 70 : v.glucose > 120 ? 40 : v.glucose > 100 ? 20 : 10;
    let pRisk = v.week < 37 ? 15 : 5;
    if (v.sbp > 130) pRisk += 15;
    let fRisk = Math.abs(v.week - v.fh) > 4 ? 60 : Math.abs(v.week - v.fh) > 2 ? 35 : 10;
    const overall = Math.round((hRisk + dRisk + pRisk + fRisk) / 4);
    const level = overall > 60 ? 'red' : overall > 30 ? 'yellow' : 'green';

    await db.insert(schema.riskScores).values({
      patientId: pat1.id,
      visitId: visit.id,
      hypertensionRisk: hRisk,
      diabetesRisk: dRisk,
      pretermRisk: pRisk,
      fgrRisk: fRisk,
      overallScore: overall,
      overallLevel: level as any,
    });
  }
  console.log('✅ 7 visits + risk scores for Aarohi');

  // 5) Visits for Patient 2 (Meera — 20 weeks, 5 visits)
  const pat2Visits = [
    { week: 6, weight: 52.0, sbp: 108, dbp: 68, fhr: 155, fh: 6, glucose: 80, hb: 12.5, temp: 36.4, pulse: 70, afi: 10, fm: 0 },
    { week: 10, weight: 53.2, sbp: 112, dbp: 70, fhr: 152, fh: 10, glucose: 82, hb: 12.2, temp: 36.5, pulse: 74, afi: 11, fm: 2 },
    { week: 14, weight: 54.8, sbp: 115, dbp: 72, fhr: 148, fh: 14, glucose: 88, hb: 11.9, temp: 36.6, pulse: 76, afi: 13, fm: 5 },
    { week: 18, weight: 57.0, sbp: 118, dbp: 75, fhr: 144, fh: 17, glucose: 90, hb: 11.5, temp: 36.5, pulse: 78, afi: 14, fm: 8 },
    { week: 20, weight: 58.5, sbp: 120, dbp: 76, fhr: 140, fh: 19, glucose: 92, hb: 11.3, temp: 36.7, pulse: 80, afi: 15, fm: 10 },
  ];

  for (let i = 0; i < pat2Visits.length; i++) {
    const v = pat2Visits[i];
    const visitDate = new Date(lmp2);
    visitDate.setDate(visitDate.getDate() + v.week * 7);

    const [visit] = await db.insert(schema.visits).values({
      patientId: pat2.id,
      doctorId: doc1.id,
      visitNumber: i + 1,
      gestationalAge: v.week,
      date: visitDate.toISOString().split('T')[0],
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
      urineAnalysis: 'Normal',
      doctorNotes: `Week ${v.week} checkup.`,
    }).returning();

    let hRisk = v.sbp > 140 ? 70 : v.sbp > 130 ? 40 : 10;
    let dRisk = v.glucose > 140 ? 70 : v.glucose > 100 ? 20 : 10;
    let pRisk = 15;
    let fRisk = Math.abs(v.week - v.fh) > 2 ? 35 : 10;
    const overall = Math.round((hRisk + dRisk + pRisk + fRisk) / 4);

    await db.insert(schema.riskScores).values({
      patientId: pat2.id,
      visitId: visit.id,
      hypertensionRisk: hRisk,
      diabetesRisk: dRisk,
      pretermRisk: pRisk,
      fgrRisk: fRisk,
      overallScore: overall,
      overallLevel: (overall > 60 ? 'red' : overall > 30 ? 'yellow' : 'green') as any,
    });
  }
  console.log('✅ 5 visits + risk scores for Meera');

  // 6) Visits for Patient 3 (Sanya — 34 weeks, high risk patient)
  const pat3Visits = [
    { week: 8, weight: 68.0, sbp: 125, dbp: 80, fhr: 148, fh: 8, glucose: 110, hb: 10.5, temp: 36.8, pulse: 88, afi: 12, fm: 3 },
    { week: 12, weight: 70.2, sbp: 130, dbp: 85, fhr: 152, fh: 11, glucose: 125, hb: 10.0, temp: 36.7, pulse: 90, afi: 11, fm: 4 },
    { week: 16, weight: 72.5, sbp: 135, dbp: 88, fhr: 145, fh: 14, glucose: 138, hb: 9.8, temp: 37.0, pulse: 92, afi: 10, fm: 6 },
    { week: 20, weight: 75.0, sbp: 138, dbp: 90, fhr: 140, fh: 18, glucose: 145, hb: 9.5, temp: 36.9, pulse: 94, afi: 9, fm: 8 },
    { week: 24, weight: 78.0, sbp: 142, dbp: 92, fhr: 135, fh: 21, glucose: 155, hb: 9.2, temp: 37.1, pulse: 96, afi: 8, fm: 10 },
    { week: 28, weight: 80.5, sbp: 145, dbp: 95, fhr: 130, fh: 25, glucose: 162, hb: 8.8, temp: 37.0, pulse: 98, afi: 7, fm: 12 },
    { week: 32, weight: 83.0, sbp: 148, dbp: 96, fhr: 128, fh: 28, glucose: 170, hb: 8.5, temp: 37.2, pulse: 100, afi: 6, fm: 14 },
    { week: 34, weight: 85.2, sbp: 150, dbp: 98, fhr: 125, fh: 30, glucose: 180, hb: 8.2, temp: 37.1, pulse: 102, afi: 5, fm: 15 },
  ];

  for (let i = 0; i < pat3Visits.length; i++) {
    const v = pat3Visits[i];
    const visitDate = new Date(lmp3);
    visitDate.setDate(visitDate.getDate() + v.week * 7);

    const [visit] = await db.insert(schema.visits).values({
      patientId: pat3.id,
      doctorId: doc2.id,
      visitNumber: i + 1,
      gestationalAge: v.week,
      date: visitDate.toISOString().split('T')[0],
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
      urineAnalysis: v.hb < 10 ? 'Trace protein' : 'Normal',
      doctorNotes: `Week ${v.week} — monitored closely. ${v.sbp > 140 ? 'BP elevated.' : ''} ${v.glucose > 140 ? 'Glucose high.' : ''} ${v.hb < 10 ? 'Low hemoglobin.' : ''}`.trim(),
    }).returning();

    // Auto alerts for high-risk
    const generatedAlerts: Array<{ type: string; severity: string; message: string }> = [];
    if (v.sbp > 140) generatedAlerts.push({ type: 'high_bp', severity: v.sbp > 160 ? 'critical' : 'warning', message: `High BP: ${v.sbp}/${v.dbp} mmHg` });
    if (v.hb < 10) generatedAlerts.push({ type: 'low_hemoglobin', severity: v.hb < 7 ? 'critical' : 'warning', message: `Low Hb: ${v.hb} g/dL` });
    if (v.glucose > 140) generatedAlerts.push({ type: 'high_glucose', severity: v.glucose > 200 ? 'critical' : 'warning', message: `High glucose: ${v.glucose} mg/dL` });
    if (v.fhr < 110 || v.fhr > 160) generatedAlerts.push({ type: 'abnormal_fhr', severity: 'warning', message: `Abnormal FHR: ${v.fhr} BPM` });

    if (generatedAlerts.length > 0) {
      await db.insert(schema.alerts).values(
        generatedAlerts.map(a => ({
          patientId: pat3.id,
          visitId: visit.id,
          type: a.type as any,
          severity: a.severity as any,
          message: a.message,
        }))
      );
    }

    let hRisk = v.sbp > 160 ? 90 : v.sbp > 140 ? 70 : v.sbp > 130 ? 40 : 10;
    let dRisk = v.glucose > 200 ? 90 : v.glucose > 140 ? 70 : v.glucose > 120 ? 40 : 10;
    let pRisk = 20;
    if (v.sbp > 140) pRisk += 30;
    if (v.hb < 10) pRisk += 20;
    let fRisk = Math.abs(v.week - v.fh) > 4 ? 80 : Math.abs(v.week - v.fh) > 2 ? 50 : 10;
    const overall = Math.round((hRisk + dRisk + pRisk + fRisk) / 4);

    await db.insert(schema.riskScores).values({
      patientId: pat3.id,
      visitId: visit.id,
      hypertensionRisk: hRisk,
      diabetesRisk: dRisk,
      pretermRisk: pRisk,
      fgrRisk: fRisk,
      overallScore: overall,
      overallLevel: (overall > 60 ? 'red' : overall > 30 ? 'yellow' : 'green') as any,
    });
  }
  console.log('✅ 8 visits + alerts + risk scores for Sanya (high risk)');

  console.log('\n🎉 Seeding complete!');
  console.log('========================');
  console.log('Login credentials:');
  console.log('  Admin:   9000000001 / admin123');
  console.log('  Doctor:  9000000002 / doctor123  (Dr. Priya)');
  console.log('  Doctor:  9000000003 / doctor123  (Dr. Neha)');
  console.log('  Patient: 9000000010 / patient123 (Aarohi, 28 wks)');
  console.log('  Patient: 9000000011 / patient123 (Meera, 20 wks)');
  console.log('  Patient: 9000000012 / patient123 (Sanya, 34 wks, high risk)');
}

seed().catch(console.error);
