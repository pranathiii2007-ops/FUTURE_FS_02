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

type Contact = Tables<'contacts'>;

const Contacts = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', status: 'active', notes: '' });

  const fetchContacts = async () => {
    if (!user) return;
    const { data } = await supabase.from('contacts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setContacts(data || []);
  };

  useEffect(() => { fetchContacts(); }, [user]);

  const handleSave = async () => {
    if (!user || !form.name) return;
    if (editing) {
      await supabase.from('contacts').update(form).eq('id', editing.id);
      toast.success('Contact updated');
    } else {
      await supabase.from('contacts').insert({ ...form, user_id: user.id });
      toast.success('Contact added');
    }
    setForm({ name: '', email: '', phone: '', company: '', status: 'active', notes: '' });
    setEditing(null);
    setDialogOpen(false);
    fetchContacts();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('contacts').delete().eq('id', id);
    toast.success('Contact deleted');
    fetchContacts();
  };

  const openEdit = (c: Contact) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email || '', phone: c.phone || '', company: c.company || '', status: c.status || 'active', notes: c.notes || '' });
    setDialogOpen(true);
  };

  const filtered = contacts.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.company || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold">Contacts</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditing(null); setForm({ name: '', email: '', phone: '', company: '', status: 'active', notes: '' }); } }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus size={16} className="mr-1" /> Add Contact</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/30">
            <DialogHeader>
              <DialogTitle className="font-display">{editing ? 'Edit' : 'Add'} Contact</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-secondary/50" /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-secondary/50" /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-secondary/50" /></div>
              <div><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="bg-secondary/50" /></div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full">{editing ? 'Update' : 'Add'} Contact</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        filters={[{
          label: 'Status',
          value: statusFilter,
          onChange: setStatusFilter,
          options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }, { label: 'Lead', value: 'lead' }],
        }]}
      />

      <div className="grid gap-3">
        {filtered.length === 0 && <p className="text-muted-foreground text-center py-8">No contacts found. Add your first contact!</p>}
        {filtered.map((c) => (
          <div key={c.id} className="glass-card p-4 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                {c.name[0].toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.email} {c.company && `· ${c.company}`}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                c.status === 'active' ? 'bg-success/20 text-success' :
                c.status === 'lead' ? 'bg-warning/20 text-warning' :
                'bg-muted text-muted-foreground'
              }`}>{c.status}</span>
              <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil size={14} /></Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 size={14} className="text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Contacts;
