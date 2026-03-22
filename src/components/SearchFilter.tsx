import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface SearchFilterProps {
  search: string;
  onSearchChange: (val: string) => void;
  filters?: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: FilterOption[];
  }[];
}

const SearchFilter = ({ search, onSearchChange, filters }: SearchFilterProps) => (
  <div className="flex flex-wrap gap-3 items-center">
    <div className="relative flex-1 min-w-[200px]">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-9 bg-secondary/50 border-border/50"
      />
    </div>
    {filters?.map((f) => (
      <Select key={f.label} value={f.value} onValueChange={f.onChange}>
        <SelectTrigger className="w-[150px] bg-secondary/50 border-border/50">
          <SelectValue placeholder={f.label} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {f.label}</SelectItem>
          {f.options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    ))}
  </div>
);

export default SearchFilter;
