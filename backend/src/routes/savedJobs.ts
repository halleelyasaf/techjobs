import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database';
import { requireAuth } from './auth';

const router = Router();

interface SavedJob {
  id: string;
  user_id: string;
  job_title: string;
  company: string;
  category?: string;
  city?: string;
  url: string;
  level?: string;
  size?: string;
  job_category?: string;
  applied?: boolean;
  applied_date?: string;
  comments?: string;
  created_date: string;
  updated_date: string;
}

// All saved jobs routes require authentication
router.use(requireAuth);

// GET all saved jobs for the current user
router.get('/', (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const sortBy = req.query.sort as string || '-created_date';
    const orderColumn = sortBy.replace('-', '');
    const orderDirection = sortBy.startsWith('-') ? 'DESC' : 'ASC';
    
    const validColumns = ['created_date', 'updated_date', 'job_title', 'company'];
    const column = validColumns.includes(orderColumn) ? orderColumn : 'created_date';
    
    const stmt = db.prepare(`SELECT * FROM saved_jobs WHERE user_id = ? ORDER BY ${column} ${orderDirection}`);
    const jobs = stmt.all(userId) as SavedJob[];
    
    // Convert applied from 0/1 to boolean
    const formattedJobs = jobs.map(job => ({
      ...job,
      applied: Boolean(job.applied)
    }));
    
    res.json(formattedJobs);
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({ error: 'Failed to fetch saved jobs' });
  }
});

// GET saved job by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const stmt = db.prepare('SELECT * FROM saved_jobs WHERE id = ? AND user_id = ?');
    const job = stmt.get(req.params.id, userId) as SavedJob | undefined;
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({ ...job, applied: Boolean(job.applied) });
  } catch (error) {
    console.error('Error fetching saved job:', error);
    res.status(500).json({ error: 'Failed to fetch saved job' });
  }
});

// GET saved job by URL
router.get('/by-url/:url', (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const url = decodeURIComponent(req.params.url);
    const stmt = db.prepare('SELECT * FROM saved_jobs WHERE url = ? AND user_id = ?');
    const job = stmt.get(url, userId) as SavedJob | undefined;
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({ ...job, applied: Boolean(job.applied) });
  } catch (error) {
    console.error('Error fetching saved job by URL:', error);
    res.status(500).json({ error: 'Failed to fetch saved job' });
  }
});

// POST create new saved job
router.post('/', (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      job_title,
      company,
      category,
      city,
      url,
      level,
      size,
      job_category,
      applied,
      applied_date,
      comments
    } = req.body;

    if (!job_title || !company || !url) {
      return res.status(400).json({ error: 'job_title, company, and url are required' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO saved_jobs (id, user_id, job_title, company, category, city, url, level, size, job_category, applied, applied_date, comments, created_date, updated_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      userId,
      job_title,
      company,
      category || null,
      city || null,
      url,
      level || null,
      size || null,
      job_category || null,
      applied ? 1 : 0,
      applied_date || null,
      comments || null,
      now,
      now
    );

    const newJob = db.prepare('SELECT * FROM saved_jobs WHERE id = ?').get(id) as SavedJob;
    res.status(201).json({ ...newJob, applied: Boolean(newJob.applied) });
  } catch (error: any) {
    console.error('Error creating saved job:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Job with this URL already saved' });
    }
    res.status(500).json({ error: 'Failed to create saved job' });
  }
});

// PUT update saved job
router.put('/:id', (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const updates = req.body;
    
    // Check if job exists and belongs to user
    const existing = db.prepare('SELECT * FROM saved_jobs WHERE id = ? AND user_id = ?').get(id, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const allowedFields = ['job_title', 'company', 'category', 'city', 'url', 'level', 'size', 'job_category', 'applied', 'applied_date', 'comments'];
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fieldsToUpdate.push(`${field} = ?`);
        if (field === 'applied') {
          values.push(updates[field] ? 1 : 0);
        } else {
          values.push(updates[field]);
        }
      }
    }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    fieldsToUpdate.push('updated_date = ?');
    values.push(new Date().toISOString());
    values.push(id);
    values.push(userId);

    const stmt = db.prepare(`UPDATE saved_jobs SET ${fieldsToUpdate.join(', ')} WHERE id = ? AND user_id = ?`);
    stmt.run(...values);

    const updatedJob = db.prepare('SELECT * FROM saved_jobs WHERE id = ?').get(id) as SavedJob;
    res.json({ ...updatedJob, applied: Boolean(updatedJob.applied) });
  } catch (error) {
    console.error('Error updating saved job:', error);
    res.status(500).json({ error: 'Failed to update saved job' });
  }
});

// DELETE saved job
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    
    const existing = db.prepare('SELECT * FROM saved_jobs WHERE id = ? AND user_id = ?').get(id, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const stmt = db.prepare('DELETE FROM saved_jobs WHERE id = ? AND user_id = ?');
    stmt.run(id, userId);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting saved job:', error);
    res.status(500).json({ error: 'Failed to delete saved job' });
  }
});

export default router;
