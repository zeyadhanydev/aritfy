"use client";

import { Input } from "@/components/ui/input";
export type TemplateAccess = "all" | "free" | "premium";
export type TemplateSource = "all" | "local" | "saved";

interface Props {
  compact?: boolean;
  search: string;
  onSearch: (value: string) => void;
  access: TemplateAccess;
  onAccess: (value: TemplateAccess) => void;
  source: TemplateSource;
  onSource: (value: TemplateSource) => void;
}

export const TemplateFilters = ({search, onSearch, access, onAccess, source, onSource, compact}: Props) => (
  <div className={compact ? "grid gap-2" : "grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]"}>
    <Input aria-label="Search templates" placeholder="Search templates..." maxLength={100} value={search} onChange={event => onSearch(event.target.value)} />
    <select aria-label="Template access" className="h-10 min-w-0 rounded-md border bg-background px-3 text-sm" value={access} onChange={event => onAccess(event.target.value as TemplateAccess)}>
      <option value="all">All access</option><option value="free">Free</option><option value="premium">Pro</option>
    </select>
    <select aria-label="Template source" className="h-10 min-w-0 rounded-md border bg-background px-3 text-sm" value={source} onChange={event => onSource(event.target.value as TemplateSource)}>
      <option value="all">All sources</option><option value="local">First-party vectors</option><option value="saved">Community templates</option>
    </select>
  </div>
);
