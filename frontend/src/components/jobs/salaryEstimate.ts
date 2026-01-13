import type { Job } from './jobsData';
import { getSalaryEstimate as fetchSalaryEstimate, type SalaryEstimateResponse } from '@/api/salaries';

// Cache for API results
const apiSalaryCache = new Map<string, SalaryEstimateResponse | null>();
const apiCacheTimestamps = new Map<string, number>();
const API_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Israeli tech salary ranges in ILS (monthly) based on level and category
// Data approximated from Israeli tech market standards

interface SalaryRange {
  min: number;
  max: number;
}

// Base salary ranges by level (monthly ILS)
const levelSalaryRanges: Record<string, SalaryRange> = {
  'Intern': { min: 5000, max: 10000 },
  'Engineer': { min: 18000, max: 35000 },
  'Manager': { min: 35000, max: 55000 },
  'Executive': { min: 50000, max: 90000 },
};

// Multipliers by job category
const categoryMultipliers: Record<string, number> = {
  'software': 1.15,
  'frontend': 1.1,
  'data-science': 1.2,
  'devops': 1.15,
  'security': 1.2,
  'product': 1.1,
  'design': 0.95,
  'qa': 0.9,
  'hr': 0.85,
  'marketing': 0.9,
  'sales': 0.95,
  'finance': 1.0,
  'legal': 1.0,
  'support': 0.8,
  'admin': 0.75,
  'business': 1.0,
  'hardware': 1.1,
  'procurement-operations': 0.85,
  'project-management': 0.95,
};

// Title-based adjustments
function getTitleMultiplier(title: string): number {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('senior') || titleLower.includes('sr.')) {
    return 1.3;
  }
  if (titleLower.includes('staff') || titleLower.includes('principal')) {
    return 1.5;
  }
  if (titleLower.includes('lead') || titleLower.includes('tech lead')) {
    return 1.4;
  }
  if (titleLower.includes('director')) {
    return 1.6;
  }
  if (titleLower.includes('head of') || titleLower.includes('vp')) {
    return 1.8;
  }
  if (titleLower.includes('junior') || titleLower.includes('jr.')) {
    return 0.75;
  }
  
  return 1.0;
}

// Company size adjustments
const sizeMultipliers: Record<string, number> = {
  'xs': 0.85,  // 1-10 employees - startups pay less base
  's': 0.9,   // 11-50 employees
  'm': 1.0,   // 51-200 employees
  'l': 1.1,   // 201-1000 employees
  'xl': 1.15, // 1001+ employees - large companies pay more
};

// Company-specific multipliers based on Glassdoor data and market reputation
// Top tier: FAANG and similar - highest paying
// High tier: Well-funded unicorns and established tech giants
// Mid tier: Solid tech companies with competitive pay
// Standard: Average market rate
const companyMultipliers: Record<string, number> = {
  // Top Tier - FAANG & Big Tech (1.4-1.6x)
  'google': 1.55,
  'meta': 1.5,
  'facebook': 1.5,
  'apple': 1.5,
  'amazon': 1.4,
  'microsoft': 1.45,
  'nvidia': 1.55,
  'netflix': 1.5,
  'openai': 1.6,
  'anthropic': 1.55,
  
  // High Tier - Well-funded Israeli & International Tech (1.2-1.4x)
  'wiz': 1.45,
  'monday.com': 1.35,
  'monday': 1.35,
  'snyk': 1.35,
  'datadog': 1.4,
  'cloudflare': 1.35,
  'stripe': 1.45,
  'salesforce': 1.3,
  'adobe': 1.3,
  'intel': 1.25,
  'oracle': 1.2,
  'ibm': 1.15,
  'cisco': 1.2,
  'vmware': 1.2,
  'broadcom': 1.25,
  'qualcomm': 1.3,
  'mobileye': 1.35,
  'tower semiconductor': 1.2,
  'tower': 1.2,
  'mellanox': 1.3,
  'fiverr': 1.25,
  'wix': 1.25,
  'similarweb': 1.2,
  'ironource': 1.25,
  'unity': 1.25,
  'playtika': 1.2,
  'pagaya': 1.3,
  'payoneer': 1.2,
  'check point': 1.25,
  'checkpoint': 1.25,
  'palo alto networks': 1.35,
  'palo alto': 1.35,
  'cyberark': 1.25,
  'varonis': 1.2,
  'sentinelone': 1.3,
  'crowdstrike': 1.35,
  'zscaler': 1.3,
  'orca security': 1.35,
  'orca': 1.35,
  'cato networks': 1.25,
  'cato': 1.25,
  'armis': 1.3,
  'axonius': 1.3,
  'rapyd': 1.25,
  'tipalti': 1.2,
  'jfrog': 1.25,
  'appsflyer': 1.2,
  'gong': 1.35,
  'outbrain': 1.15,
  'taboola': 1.15,
  'walkme': 1.2,
  'lightricks': 1.25,
  'hibob': 1.2,
  'bob': 1.2,
  'papaya global': 1.25,
  'papaya': 1.25,
  'deel': 1.3,
  'rippling': 1.35,
  'riskified': 1.2,
  'forter': 1.2,
  'yotpo': 1.15,
  'kaltura': 1.1,
  'liveperson': 1.1,
  'nice': 1.2,
  'amdocs': 1.15,
  'elbit': 1.15,
  'elbit systems': 1.15,
  'rafael': 1.2,
  'iai': 1.15,
  'israel aerospace': 1.15,
  
  // Mid Tier - Established companies (1.05-1.15x)
  'infinidat': 1.15,
  'cellebrite': 1.15,
  'audiocodes': 1.1,
  'radware': 1.1,
  'allot': 1.05,
  'gilat': 1.05,
  'sapiens': 1.1,
  'magic software': 1.05,
  'matrix': 1.0,
  'ness': 1.0,
  
  // Consulting & Services (0.9-1.0x)
  'accenture': 1.0,
  'deloitte': 0.95,
  'kpmg': 0.95,
  'pwc': 0.95,
  'ernst & young': 0.95,
  'ey': 0.95,
  'mckinsey': 1.15,
  'bcg': 1.1,
  'bain': 1.1,
};

// Function to find company multiplier (case-insensitive, partial match)
function getCompanyMultiplier(companyName: string): number {
  const companyLower = companyName.toLowerCase().trim();
  
  // Direct match
  if (companyMultipliers[companyLower]) {
    return companyMultipliers[companyLower];
  }
  
  // Partial match - check if company name contains known company
  for (const [knownCompany, multiplier] of Object.entries(companyMultipliers)) {
    if (companyLower.includes(knownCompany) || knownCompany.includes(companyLower)) {
      return multiplier;
    }
  }
  
  // No match - return neutral multiplier
  return 1.0;
}

export interface SalaryEstimate {
  minMonthly: number;
  maxMonthly: number;
  minAnnual: number;
  maxAnnual: number;
  currency: string;
  confidence: 'low' | 'medium' | 'high';
}

export function estimateSalary(job: Job): SalaryEstimate {
  // Get base salary range from level
  const baseRange = levelSalaryRanges[job.level] || levelSalaryRanges['Engineer'];
  
  // Apply category multiplier
  const categoryMult = categoryMultipliers[job.job_category] || 1.0;
  
  // Apply title multiplier
  const titleMult = getTitleMultiplier(job.title);
  
  // Apply size multiplier
  const sizeMult = sizeMultipliers[job.size] || 1.0;
  
  // Apply company multiplier
  const companyMult = getCompanyMultiplier(job.company);
  
  // Calculate final range
  const totalMult = categoryMult * titleMult * sizeMult * companyMult;
  
  const minMonthly = Math.round(baseRange.min * totalMult / 1000) * 1000;
  const maxMonthly = Math.round(baseRange.max * totalMult / 1000) * 1000;
  
  // Calculate confidence based on available data
  let confidence: 'low' | 'medium' | 'high' = 'medium';
  if (job.level && job.job_category && job.size) {
    confidence = 'high';
  } else if (!job.level && !job.job_category) {
    confidence = 'low';
  }
  
  // Boost confidence if we have company-specific data
  if (companyMult !== 1.0 && confidence === 'medium') {
    confidence = 'high';
  }
  
  return {
    minMonthly,
    maxMonthly,
    minAnnual: minMonthly * 12,
    maxAnnual: maxMonthly * 12,
    currency: '₪',
    confidence,
  };
}

export function formatSalaryRange(estimate: SalaryEstimate): string {
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${Math.round(num / 1000)}K`;
    }
    return num.toLocaleString();
  };
  
  return `${estimate.currency}${formatNumber(estimate.minMonthly)} - ${estimate.currency}${formatNumber(estimate.maxMonthly)}/mo`;
}

export function formatAnnualSalary(estimate: SalaryEstimate): string {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${Math.round(num / 1000)}K`;
    }
    return num.toLocaleString();
  };
  
  return `${estimate.currency}${formatNumber(estimate.minAnnual)} - ${estimate.currency}${formatNumber(estimate.maxAnnual)}/yr`;
}

export function generateGlassdoorUrl(job: Job): string {
  // Create search URL for Glassdoor Israel
  const searchQuery = encodeURIComponent(`${job.title} ${job.company}`);
  return `https://www.glassdoor.com/Search/results.htm?keyword=${searchQuery}&locT=N&locId=120`;
}

export function hasCompanyData(companyName: string): boolean {
  return getCompanyMultiplier(companyName) !== 1.0;
}

export function getCompanyTier(companyName: string): 'top' | 'high' | 'mid' | 'standard' | 'below' {
  const mult = getCompanyMultiplier(companyName);
  if (mult >= 1.4) return 'top';
  if (mult >= 1.2) return 'high';
  if (mult >= 1.05) return 'mid';
  if (mult >= 0.95) return 'standard';
  return 'below';
}

// Fetch salary from API (with caching)
export async function fetchApiSalary(job: Job): Promise<SalaryEstimate | null> {
  const cacheKey = `${job.company.toLowerCase()}-${job.title.toLowerCase()}`;
  
  // Check cache
  const cachedTime = apiCacheTimestamps.get(cacheKey);
  if (cachedTime && Date.now() - cachedTime < API_CACHE_TTL) {
    const cached = apiSalaryCache.get(cacheKey);
    if (cached && cached.min > 0) {
      return {
        minMonthly: cached.min,
        maxMonthly: cached.max,
        minAnnual: cached.min * 12,
        maxAnnual: cached.max * 12,
        currency: '₪',
        confidence: cached.confidence as 'low' | 'medium' | 'high',
      };
    }
  }

  try {
    const result = await fetchSalaryEstimate(
      job.company,
      job.title,
      job.level,
      job.job_category,
      job.size
    );

    // Cache the result
    apiSalaryCache.set(cacheKey, result);
    apiCacheTimestamps.set(cacheKey, Date.now());

    if (result && result.min > 0) {
      return {
        minMonthly: result.min,
        maxMonthly: result.max,
        minAnnual: result.min * 12,
        maxAnnual: result.max * 12,
        currency: '₪',
        confidence: result.confidence as 'low' | 'medium' | 'high',
      };
    }
  } catch (error) {
    console.error('Failed to fetch API salary:', error);
  }

  return null;
}

// Check if we have API data for a job (synchronous check from cache)
export function hasApiSalaryData(job: Job): boolean {
  const cacheKey = `${job.company.toLowerCase()}-${job.title.toLowerCase()}`;
  const cached = apiSalaryCache.get(cacheKey);
  return cached !== undefined && cached !== null && cached.min > 0 && cached.source === 'database';
}
