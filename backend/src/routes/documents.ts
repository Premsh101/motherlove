import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../config/database';
import { documents } from '../models/schema';
import { eq, desc } from 'drizzle-orm';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Configure multer for local file uploads
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  },
});

/**
 * POST /api/documents/upload
 * Upload a document for a patient
 */
router.post('/upload', upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId, type } = req.body;
    const file = req.file;

    if (!file || !patientId || !type) {
      res.status(400).json({ error: 'File, patientId, and type are required' });
      return;
    }

    const fileUrl = `/uploads/${file.filename}`;

    const [doc] = await db.insert(documents).values({
      patientId,
      doctorId: req.user!.role === 'doctor' ? req.user!.userId : null,
      type: type as any,
      fileName: file.originalname,
      fileUrl,
      mimeType: file.mimetype,
    }).returning();

    res.status(201).json({ document: doc });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/documents/:patientId
 * List documents for a patient
 */
router.get('/:patientId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId as string;

    const docs = await db
      .select()
      .from(documents)
      .where(eq(documents.patientId, patientId))
      .orderBy(desc(documents.createdAt));

    res.json({ documents: docs });
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/documents/:id
 * Delete a document
 */
router.delete('/:id/delete', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const [deleted] = await db
      .delete(documents)
      .where(eq(documents.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Try to delete file from disk
    const filePath = path.join(uploadsDir, path.basename(deleted.fileUrl));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Document deleted' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
