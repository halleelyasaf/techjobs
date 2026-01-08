import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database';

const router = Router();

interface Company {
  id: string;
  name: string;
  description?: string;
  website_url?: string;
  logo_url?: string;
  founded_year?: string;
  headquarters?: string;
  growth_summary?: string;
  similar_companies?: string;
  created_date: string;
  updated_date: string;
}

// GET all companies
router.get('/', (req: Request, res: Response) => {
  try {
    const stmt = db.prepare('SELECT * FROM companies ORDER BY name ASC');
    const companies = stmt.all() as Company[];
    
    // Parse similar_companies JSON string
    const formattedCompanies = companies.map(company => ({
      ...company,
      similar_companies: company.similar_companies ? JSON.parse(company.similar_companies) : []
    }));
    
    res.json(formattedCompanies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// GET company by name
router.get('/by-name/:name', (req: Request, res: Response) => {
  try {
    const name = decodeURIComponent(req.params.name);
    const stmt = db.prepare('SELECT * FROM companies WHERE name = ?');
    const company = stmt.get(name) as Company | undefined;
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json({
      ...company,
      similar_companies: company.similar_companies ? JSON.parse(company.similar_companies) : []
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// GET company by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const stmt = db.prepare('SELECT * FROM companies WHERE id = ?');
    const company = stmt.get(req.params.id) as Company | undefined;
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json({
      ...company,
      similar_companies: company.similar_companies ? JSON.parse(company.similar_companies) : []
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// POST create new company
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      website_url,
      logo_url,
      founded_year,
      headquarters,
      growth_summary,
      similar_companies
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    const similarCompaniesJson = similar_companies ? JSON.stringify(similar_companies) : null;

    const stmt = db.prepare(`
      INSERT INTO companies (id, name, description, website_url, logo_url, founded_year, headquarters, growth_summary, similar_companies, created_date, updated_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      name,
      description || null,
      website_url || null,
      logo_url || null,
      founded_year || null,
      headquarters || null,
      growth_summary || null,
      similarCompaniesJson,
      now,
      now
    );

    const newCompany = db.prepare('SELECT * FROM companies WHERE id = ?').get(id) as Company;
    res.status(201).json({
      ...newCompany,
      similar_companies: newCompany.similar_companies ? JSON.parse(newCompany.similar_companies) : []
    });
  } catch (error: any) {
    console.error('Error creating company:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Company with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// PUT update company
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check if company exists
    const existing = db.prepare('SELECT * FROM companies WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const allowedFields = ['name', 'description', 'website_url', 'logo_url', 'founded_year', 'headquarters', 'growth_summary', 'similar_companies'];
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fieldsToUpdate.push(`${field} = ?`);
        if (field === 'similar_companies') {
          values.push(JSON.stringify(updates[field]));
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

    const stmt = db.prepare(`UPDATE companies SET ${fieldsToUpdate.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    const updatedCompany = db.prepare('SELECT * FROM companies WHERE id = ?').get(id) as Company;
    res.json({
      ...updatedCompany,
      similar_companies: updatedCompany.similar_companies ? JSON.parse(updatedCompany.similar_companies) : []
    });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// PUT upsert company by name
router.put('/by-name/:name', (req: Request, res: Response) => {
  try {
    const name = decodeURIComponent(req.params.name);
    const updates = req.body;
    
    // Check if company exists
    const existing = db.prepare('SELECT * FROM companies WHERE name = ?').get(name) as Company | undefined;
    
    if (!existing) {
      // Create new company
      const id = uuidv4();
      const now = new Date().toISOString();
      const similarCompaniesJson = updates.similar_companies ? JSON.stringify(updates.similar_companies) : null;

      const stmt = db.prepare(`
        INSERT INTO companies (id, name, description, website_url, logo_url, founded_year, headquarters, growth_summary, similar_companies, created_date, updated_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        name,
        updates.description || null,
        updates.website_url || null,
        updates.logo_url || null,
        updates.founded_year || null,
        updates.headquarters || null,
        updates.growth_summary || null,
        similarCompaniesJson,
        now,
        now
      );

      const newCompany = db.prepare('SELECT * FROM companies WHERE id = ?').get(id) as Company;
      return res.status(201).json({
        ...newCompany,
        similar_companies: newCompany.similar_companies ? JSON.parse(newCompany.similar_companies) : []
      });
    }

    // Update existing company
    const allowedFields = ['description', 'website_url', 'logo_url', 'founded_year', 'headquarters', 'growth_summary', 'similar_companies'];
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fieldsToUpdate.push(`${field} = ?`);
        if (field === 'similar_companies') {
          values.push(JSON.stringify(updates[field]));
        } else {
          values.push(updates[field]);
        }
      }
    }

    if (fieldsToUpdate.length > 0) {
      fieldsToUpdate.push('updated_date = ?');
      values.push(new Date().toISOString());
      values.push(existing.id);

      const stmt = db.prepare(`UPDATE companies SET ${fieldsToUpdate.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }

    const updatedCompany = db.prepare('SELECT * FROM companies WHERE id = ?').get(existing.id) as Company;
    res.json({
      ...updatedCompany,
      similar_companies: updatedCompany.similar_companies ? JSON.parse(updatedCompany.similar_companies) : []
    });
  } catch (error) {
    console.error('Error upserting company:', error);
    res.status(500).json({ error: 'Failed to upsert company' });
  }
});

// DELETE company
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const existing = db.prepare('SELECT * FROM companies WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const stmt = db.prepare('DELETE FROM companies WHERE id = ?');
    stmt.run(id);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

export default router;
