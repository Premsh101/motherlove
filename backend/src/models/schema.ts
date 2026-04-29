import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  date,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- Enums ---
export const roleEnum = pgEnum('user_role', ['admin', 'doctor', 'patient']);
export const alertSeverityEnum = pgEnum('alert_severity', ['warning', 'critical']);
export const alertTypeEnum = pgEnum('alert_type', [
  'high_bp',
  'low_hemoglobin',
  'abnormal_fhr',
  'slow_growth',
  'high_glucose',
  'low_amniotic_fluid',
]);
export const riskLevelEnum = pgEnum('risk_level', ['green', 'yellow', 'red']);
export const docTypeEnum = pgEnum('doc_type', [
  'ultrasound',
  'blood_test',
  'prescription',
  'medical_image',
  'other',
]);

// --- Admins ---
export const admins = pgTable('admins', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- Doctors ---
export const doctors = pgTable('doctors', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  specialization: varchar('specialization', { length: 255 }),
  isActive: boolean('is_active').default(true).notNull(),
  adminId: uuid('admin_id').references(() => admins.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- Patients ---
export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  dateOfBirth: date('date_of_birth'),
  bloodGroup: varchar('blood_group', { length: 10 }),
  lmpDate: date('lmp_date'), // Last menstrual period
  edd: date('edd'), // Estimated due date
  doctorId: uuid('doctor_id')
    .references(() => doctors.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- Visits ---
export const visits = pgTable('visits', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  doctorId: uuid('doctor_id')
    .references(() => doctors.id)
    .notNull(),
  visitNumber: integer('visit_number').notNull(),
  gestationalAge: integer('gestational_age'), // in weeks
  date: date('date').notNull(),
  // Maternal parameters
  maternalWeight: decimal('maternal_weight', { precision: 5, scale: 2 }),
  systolicBp: integer('systolic_bp'),
  diastolicBp: integer('diastolic_bp'),
  temperature: decimal('temperature', { precision: 4, scale: 1 }),
  pulse: integer('pulse'),
  // Fetal parameters
  fetalHeartRate: integer('fetal_heart_rate'),
  fundalHeight: decimal('fundal_height', { precision: 4, scale: 1 }),
  amnioticFluidIndex: decimal('amniotic_fluid_index', { precision: 4, scale: 1 }),
  fetalMovement: integer('fetal_movement'), // count per visit
  // Lab values
  glucose: decimal('glucose', { precision: 5, scale: 2 }),
  hemoglobin: decimal('hemoglobin', { precision: 4, scale: 1 }),
  urineAnalysis: text('urine_analysis'),
  // Notes
  doctorNotes: text('doctor_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- Documents ---
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  doctorId: uuid('doctor_id').references(() => doctors.id),
  type: docTypeEnum('type').notNull(),
  fileName: varchar('file_name', { length: 500 }).notNull(),
  fileUrl: text('file_url').notNull(),
  mimeType: varchar('mime_type', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- Alerts ---
export const alerts = pgTable('alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  visitId: uuid('visit_id').references(() => visits.id),
  type: alertTypeEnum('type').notNull(),
  severity: alertSeverityEnum('severity').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- Risk Scores ---
export const riskScores = pgTable('risk_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  visitId: uuid('visit_id').references(() => visits.id),
  hypertensionRisk: integer('hypertension_risk'), // 0-100
  diabetesRisk: integer('diabetes_risk'), // 0-100
  pretermRisk: integer('preterm_risk'), // 0-100
  fgrRisk: integer('fgr_risk'), // 0-100 (fetal growth restriction)
  overallScore: integer('overall_score'), // 0-100
  overallLevel: riskLevelEnum('overall_level'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- Relations ---
export const adminsRelations = relations(admins, ({ many }) => ({
  doctors: many(doctors),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  admin: one(admins, { fields: [doctors.adminId], references: [admins.id] }),
  patients: many(patients),
  visits: many(visits),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  doctor: one(doctors, { fields: [patients.doctorId], references: [doctors.id] }),
  visits: many(visits),
  documents: many(documents),
  alerts: many(alerts),
  riskScores: many(riskScores),
}));

export const visitsRelations = relations(visits, ({ one, many }) => ({
  patient: one(patients, { fields: [visits.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [visits.doctorId], references: [doctors.id] }),
  alerts: many(alerts),
  riskScores: many(riskScores),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  patient: one(patients, { fields: [documents.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [documents.doctorId], references: [doctors.id] }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  patient: one(patients, { fields: [alerts.patientId], references: [patients.id] }),
  visit: one(visits, { fields: [alerts.visitId], references: [visits.id] }),
}));

export const riskScoresRelations = relations(riskScores, ({ one }) => ({
  patient: one(patients, { fields: [riskScores.patientId], references: [patients.id] }),
  visit: one(visits, { fields: [riskScores.visitId], references: [visits.id] }),
}));
