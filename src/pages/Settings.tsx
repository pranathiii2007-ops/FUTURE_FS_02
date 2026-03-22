import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Mail, Calendar, Shield, Save } from 'lucide-react';

const Settings = () => {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name || '');
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('user_id', user.id);
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully!');
    }
    setSaving(false);
  };

  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  }) : 'N/A';

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-display font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your profile and account information</p>
      </div>

      {/* Profile Card */}
      <div className="glass-card p-6 space-y-5 animate-fade-in">
        <div className="flex items-center gap-4 pb-4 border-b border-border/30">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-display font-bold">
            {(fullName || 'P')[0].toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold">{fullName || 'Pranathi'}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User size={14} className="text-muted-foreground" /> Full Name
            </Label>
            <Input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="bg-secondary/50 border-border/50"
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Account Info */}
      <div className="glass-card p-6 animate-fade-in">
        <h3 className="text-sm font-display font-semibold mb-4 text-muted-foreground">Account Information</h3>
        <div className="space-y-3">
          {[
            { icon: Mail, label: 'Email', value: user?.email || 'N/A' },
            { icon: Calendar, label: 'Member Since', value: createdAt },
            { icon: Shield, label: 'Account Status', value: 'Active', valueClass: 'text-success' },
            { icon: User, label: 'User ID', value: user?.id?.slice(0, 8) + '...' || 'N/A' },
          ].map(({ icon: Icon, label, value, valueClass }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon size={14} /> {label}
              </div>
              <span className={`text-sm font-medium ${valueClass || ''}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
