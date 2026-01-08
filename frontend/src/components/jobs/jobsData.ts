export const JOB_CSV_FILES = [
  'admin', 'business', 'data-science', 'design', 'devops', 'finance',
  'frontend', 'hardware', 'hr', 'legal', 'marketing', 'procurement-operations',
  'product', 'project-management', 'qa', 'sales', 'security', 'software', 'support'
];

export interface Job {
  title: string;
  company: string;
  category: string;
  city: string;
  url: string;
  level: string;
  size: string;
  updated: string;
  job_category: string;
}

export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  return lines.slice(1).map(line => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const obj: Record<string, string> = {};
    headers.forEach((header, i) => {
      obj[header] = values[i] || '';
    });
    return obj;
  });
}

export async function fetchAllJobs(): Promise<Job[]> {
  const allJobs: Job[] = [];
  
  const fetchPromises = JOB_CSV_FILES.map(async (category) => {
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/mluggy/techmap/main/jobs/${category}.csv`
      );
      if (response.ok) {
        const csvText = await response.text();
        const jobs = parseCSV(csvText);
        return jobs.map(job => ({ ...job, job_category: category } as Job));
      }
      return [];
    } catch (error) {
      console.error(`Error fetching ${category} jobs:`, error);
      return [];
    }
  });
  
  const results = await Promise.all(fetchPromises);
  results.forEach(jobs => allJobs.push(...jobs));
  
  // Sort by updated date (newest first)
  allJobs.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
  
  return allJobs;
}
