import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import SearchFilter from '@/components/SearchFilter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Deal = Tables<'deals'>;

const stageOptions = [
  { label: 'Prospect', value: 'prospect' },
  { label: 'Qualified', value: 'qualified' },
  { label: 'Proposal', value: 'proposal' },
  { label: 'Negotiation', value: 'negotiation' },
  { label: 'Closed Won', value: 'closed_won' },
  { label: 'Closed Lost', value: 'closed_lost' },
];

const statusOptions = [
  { label: 'Open', value: 'open' },
  { label: 'Won', value: 'won' },
  { label: 'Lost', value: 'lost' },
];

const Deals = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [form, setForm] = useState({ title: '', value: '', stage: 'prospect', status: 'open', expected_close_date: '', notes: '' });

  const fetchDeals = async () => {
    if (!user) return;
    const { data } = await supabase.from('deals').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setDeals(data || []);
  };

  useEffect(() => { fetchDeals(); }, [user]);

  const handleSave = async () => {
    if (!user || !form.title) return;
    const payload = { ...form, value: Number(form.value) || 0, expected_close_date: form.expected_close_date || null };
    if (editing) {
      await supabase.from('deals').update(payload).eq('id', editing.id);
      toast.success('Deal updated');
    } else {
      await supabase.from('deals').insert({ ...payload, user_id: user.id });
      toast.success('Deal added');
    }
    setForm({ title: '', value: '', stage: 'prospect', status: 'open', expected_close_date: '', notes: '' });
    setEditing(null);
    setDialogOpen(false);
    fetchDeals();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('deals').delete().eq('id', id);
    toast.success('Deal deleted');
    fetchDeals();
  };

  const openEdit = (d: Deal) => {
    setEditing(d);
    setForm({ title: d.title, value: String(d.value || 0), stage: d.stage || 'prospect', status: d.status || 'open', expected_close_date: d.expected_close_date || '', notes: d.notes || '' });
    setDialogOpen(true);
  };

  const filtered = deals.filter((d) => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === 'all' || d.stage === stageFilter;
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStage && matchStatus;
  });

  const stageColor = (stage: string) => {
    const map: Record<string, string> = {
      prospect: 'bg-chart-5/20 text-chart-5',
      qualified: 'bg-primary/20 text-primary',
      proposal: 'bg-warning/20 text-warning',
      negotiation: 'bg-accent/20 text-accent',
      closed_won: 'bg-success/20 text-success',
      closed_lost: 'bg-destructive/20 text-destructive',
    };
    return map[stage] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold">Deals</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditing(null); setForm({ title: '', value: '', stage: 'prospect', status: 'open', expected_close_date: '', notes: '' }); } }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus size={16} className="mr-1" /> Add Deal</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/30">
            <DialogHeader>
              <DialogTitle className="font-display">{editing ? 'Edit' : 'Add'} Deal</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-secondary/50" /></div>
              <div><Label>Value (₹)</Label><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="bg-secondary/50" /></div>
              <div>
                <Label>Stage</Label>
                <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                  <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {stageOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Expected Close Date</Label><Input type="date" value={form.expected_close_date} onChange={(e) => setForm({ ...form, expected_close_date: e.target.value })} className="bg-secondary/50" /></div>
              <Button onClick={handleSave} className="w-full">{editing ? 'Update' : 'Add'} Deal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        filters={[
          { label: 'Stage', value: stageFilter, onChange: setStageFilter, options: stageOptions },
          { label: 'Status', value: statusFilter, onChange: setStatusFilter, options: statusOptions },
        ]}
      />

      <div className="grid gap-3">
        {filtered.length === 0 && <p className="text-muted-foreground text-center py-8">No deals found. Add your first deal!</p>}
        {filtered.map((d) => (
          <div key={d.id} className="glass-card p-4 flex items-center justify-between animate-fade-in">
            <div>
              <p className="font-medium">{d.title}</p>
              <p className="text-xs text-muted-foreground">₹{Number(d.value || 0).toLocaleString()} · {d.expected_close_date || 'No date'}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${stageColor(d.stage || 'prospect')}`}>{d.stage}</span>
              <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil size={14} /></Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)}><Trash2 size={14} className="text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Deals;
