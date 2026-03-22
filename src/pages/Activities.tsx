import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import SearchFilter from '@/components/SearchFilter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Phone, Mail, CalendarDays, FileText, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type ActivityRow = Tables<'activities'>;

const typeOptions = [
  { label: 'Call', value: 'call' },
  { label: 'Email', value: 'email' },
  { label: 'Meeting', value: 'meeting' },
  { label: 'Note', value: 'note' },
  { label: 'Task', value: 'task' },
];

const typeIcons: Record<string, any> = {
  call: Phone, email: Mail, meeting: CalendarDays, note: FileText, task: CheckSquare,
};

const Activities = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'task', description: '', due_date: '' });

  const fetchActivities = async () => {
    if (!user) return;
    const { data } = await supabase.from('activities').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setActivities(data || []);
  };

  useEffect(() => { fetchActivities(); }, [user]);

  const handleSave = async () => {
    if (!user || !form.title) return;
    await supabase.from('activities').insert({
      title: form.title,
      type: form.type,
      description: form.description || null,
      due_date: form.due_date || null,
      user_id: user.id,
    });
    toast.success('Activity added');
    setForm({ title: '', type: 'task', description: '', due_date: '' });
    setDialogOpen(false);
    fetchActivities();
  };

  const toggleComplete = async (a: ActivityRow) => {
    await supabase.from('activities').update({ completed: !a.completed }).eq('id', a.id);
    fetchActivities();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('activities').delete().eq('id', id);
    toast.success('Activity deleted');
    fetchActivities();
  };

  const filtered = activities.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || a.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold">Activities</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus size={16} className="mr-1" /> Add Activity</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/30">
            <DialogHeader>
              <DialogTitle className="font-display">Add Activity</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-secondary/50" /></div>
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-secondary/50" /></div>
              <div><Label>Due Date</Label><Input type="datetime-local" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="bg-secondary/50" /></div>
              <Button onClick={handleSave} className="w-full">Add Activity</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        filters={[{ label: 'Type', value: typeFilter, onChange: setTypeFilter, options: typeOptions }]}
      />

      <div className="grid gap-3">
        {filtered.length === 0 && <p className="text-muted-foreground text-center py-8">No activities found.</p>}
        {filtered.map((a) => {
          const Icon = typeIcons[a.type] || FileText;
          return (
            <div key={a.id} className={`glass-card p-4 flex items-center gap-4 animate-fade-in ${a.completed ? 'opacity-60' : ''}`}>
              <Checkbox checked={!!a.completed} onCheckedChange={() => toggleComplete(a)} />
              <div className="p-2 rounded-lg bg-secondary text-primary">
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${a.completed ? 'line-through' : ''}`}>{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.type} {a.due_date ? `· Due: ${new Date(a.due_date).toLocaleDateString()}` : ''}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}><Trash2 size={14} className="text-destructive" /></Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Activities;
