import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllJobs } from "@/components/jobs/jobsData";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Building2, ArrowLeft } from "lucide-react";
import CompanyCard from "@/components/companies/CompanyCard";

export default function Companies() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchAllJobs,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Aggregate jobs by company
  const companies = useMemo(() => {
    const companyMap = new Map<string, {
      name: string;
      jobs: typeof jobs;
      categories: Set<string>;
      sizes: Set<string>;
      locations: Set<string>;
      latestUpdate: string;
    }>();

    jobs.forEach(job => {
      const normalizedName = job.company?.trim();
      if (!normalizedName) return;

      if (!companyMap.has(normalizedName)) {
        companyMap.set(normalizedName, {
          name: normalizedName,
          jobs: [],
          categories: new Set(),
          sizes: new Set(),
          locations: new Set(),
          latestUpdate: job.updated
        });
      }

      const company = companyMap.get(normalizedName)!;
      company.jobs.push(job);
      if (job.category) company.categories.add(job.category);
      if (job.size) company.sizes.add(job.size);
      if (job.city) company.locations.add(job.city);
      if (new Date(job.updated) > new Date(company.latestUpdate)) {
        company.latestUpdate = job.updated;
      }
    });

    return Array.from(companyMap.values())
      .map(c => ({
        ...c,
        categories: Array.from(c.categories),
        sizes: Array.from(c.sizes),
        locations: Array.from(c.locations),
        jobCount: c.jobs.length
      }))
      .sort((a, b) => b.jobCount - a.jobCount); // Sort by most jobs first
  }, [jobs]);

  const filteredCompanies = useMemo(() => {
    if (!searchQuery) return companies;
    const lowerQuery = searchQuery.toLowerCase();
    return companies.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) ||
      c.categories.some(cat => cat.toLowerCase().includes(lowerQuery)) ||
      c.locations.some(loc => loc.toLowerCase().includes(lowerQuery))
    );
  }, [companies, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button asChild variant="ghost" size="icon">
              <Link to={createPageUrl("Home")}>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Building2 className="w-6 h-6 text-indigo-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Companies</h1>
            </div>
          </div>
            
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search companies by name, industry, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <p className="text-slate-500 mb-6">
              Found {filteredCompanies.length} companies with active listings
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company, index) => (
                <CompanyCard key={company.name} company={company} index={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
