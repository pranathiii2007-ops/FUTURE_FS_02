import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Users, Handshake, DollarSign, Activity, TrendingUp, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, FunnelChart, Funnel, LabelList,
} from 'recharts';
import type { Tables } from '@/integrations/supabase/types';

const COLORS = ['hsl(170,80%,50%)', 'hsl(260,60%,60%)', 'hsl(45,90%,60%)', 'hsl(340,70%,55%)', 'hsl(200,70%,55%)'];

const STAGE_ORDER = ['prospect', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
const STAGE_LABELS: Record<string, string> = {
  prospect: 'Prospect', qualified: 'Qualified', proposal: 'Proposal',
  negotiation: 'Negotiation', closed_won: 'Won', closed_lost: 'Lost',
};

type ActivityRow = Tables<'activities'>;
type DealRow = Tables<'deals'>;
type ContactRow = Tables<'contacts'>;

const Dashboard = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [activities, setActivities] = useState<ActivityRow[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('contacts').select('*').eq('user_id', user.id),
      supabase.from('deals').select('*').eq('user_id', user.id),
      supabase.from('activities').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]).then(([c, d, a]) => {
      setContacts(c.data || []);
      setDeals(d.data || []);
      setActivities(a.data || []);
    });
  }, [user]);

  const totalValue = deals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const wonValue = deals.filter(d => d.status === 'won').reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const openDeals = deals.filter(d => d.status === 'open').length;
  const completedActivities = activities.filter(a => a.completed).length;
  const pendingActivities = activities.filter(a => !a.completed).length;

  // Stage data for bar chart
  const stageData = STAGE_ORDER.map(stage => ({
    name: STAGE_LABELS[stage],
    count: deals.filter(d => d.stage === stage).length,
    value: deals.filter(d => d.stage === stage).reduce((s, d) => s + (Number(d.value) || 0), 0),
  }));

  // Status pie
  const statusData = [
    { name: 'Open', value: deals.filter(d => d.status === 'open').length },
    { name: 'Won', value: deals.filter(d => d.status === 'won').length },
    { name: 'Lost', value: deals.filter(d => d.status === 'lost').length },
  ].filter(d => d.value > 0);

  // Contact status
  const contactStatusData = [
    { name: 'Active', value: contacts.filter(c => c.status === 'active').length, fill: 'hsl(170,80%,50%)' },
    { name: 'Lead', value: contacts.filter(c => c.status === 'lead').length, fill: 'hsl(45,90%,60%)' },
    { name: 'Inactive', value: contacts.filter(c => c.status === 'inactive').length, fill: 'hsl(220,10%,55%)' },
  ].filter(d => d.value > 0);

  // Deal values for area chart
  const dealValueData = deals
    .filter(d => d.status !== 'lost')
    .sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime())
    .map(d => ({ name: d.title.substring(0, 12), value: Number(d.value) || 0 }));

  // Activity type breakdown
  const activityTypes = ['call', 'email', 'meeting', 'note', 'task'];
  const activityTypeData = activityTypes.map(type => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    completed: activities.filter(a => a.type === type && a.completed).length,
    pending: activities.filter(a => a.type === type && !a.completed).length,
  })).filter(d => d.completed > 0 || d.pending > 0);

  const recentActivities = activities.slice(0, 5);

  const statCards = [
    { icon: Users, label: 'Total Contacts', value: contacts.length, sub: `${contacts.filter(c => c.status === 'lead').length} leads`, color: 'text-primary' },
    { icon: Handshake, label: 'Active Deals', value: openDeals, sub: `${deals.length} total`, color: 'text-accent' },
    { icon: DollarSign, label: 'Pipeline Value', value: `₹${totalValue.toLocaleString()}`, sub: `₹${wonValue.toLocaleString()} won`, color: 'text-warning' },
    { icon: Activity, label: 'Activities', value: activities.length, sub: `${pendingActivities} pending`, color: 'text-chart-5' },
  ];

  const winRate = deals.filter(d => d.status === 'won' || d.status === 'lost').length > 0
    ? Math.round((deals.filter(d => d.status === 'won').length / deals.filter(d => d.status === 'won' || d.status === 'lost').length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Welcome back, Pranathi! Here's your CRM overview.</p>
        </div>
        <div className="glass-card px-4 py-2 flex items-center gap-2">
          <TrendingUp size={16} className="text-success" />
          <span className="text-sm font-medium">{winRate}% Win Rate</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="glass-card p-5 animate-fade-in hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg bg-secondary ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-display font-bold">{value}</p>
                <p className="text-[10px] text-muted-foreground">{sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-sm font-display font-semibold mb-4 text-muted-foreground">Deal Pipeline by Stage</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,22%)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(220,10%,55%)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(220,10%,55%)', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: 'hsl(220,20%,14%)', border: '1px solid hsl(220,15%,22%)', borderRadius: 8, color: 'hsl(220,20%,92%)' }}
                formatter={(value: number, name: string) => [name === 'value' ? `₹${value.toLocaleString()}` : value, name === 'value' ? 'Value' : 'Count']}
              />
              <Bar dataKey="count" fill="hsl(170,80%,50%)" radius={[6, 6, 0, 0]} name="Count" />
              <Bar dataKey="value" fill="hsl(260,60%,60%)" radius={[6, 6, 0, 0]} name="Value" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-display font-semibold mb-4 text-muted-foreground">Deal Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={45} label>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(220,20%,14%)', border: '1px solid hsl(220,15%,22%)', borderRadius: 8, color: 'hsl(220,20%,92%)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {statusData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-muted-foreground">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-sm font-display font-semibold mb-4 text-muted-foreground">Deal Value Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dealValueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,22%)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(220,10%,55%)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'hsl(220,10%,55%)', fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: 'hsl(220,20%,14%)', border: '1px solid hsl(220,15%,22%)', borderRadius: 8, color: 'hsl(220,20%,92%)' }} formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Value']} />
              <Area type="monotone" dataKey="value" stroke="hsl(170,80%,50%)" fill="hsl(170,80%,50%,0.15)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-display font-semibold mb-4 text-muted-foreground">Activity Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={activityTypeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,22%)" />
              <XAxis type="number" tick={{ fill: 'hsl(220,10%,55%)', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(220,10%,55%)', fontSize: 11 }} width={70} />
              <Tooltip contentStyle={{ background: 'hsl(220,20%,14%)', border: '1px solid hsl(220,15%,22%)', borderRadius: 8, color: 'hsl(220,20%,92%)' }} />
              <Bar dataKey="completed" stackId="a" fill="hsl(150,60%,45%)" radius={[0, 0, 0, 0]} name="Completed" />
              <Bar dataKey="pending" stackId="a" fill="hsl(45,90%,55%)" radius={[0, 6, 6, 0]} name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Recent Activity + Top Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Feed */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-display font-semibold mb-4 text-muted-foreground">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                <div className={`p-1.5 rounded-md ${a.completed ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                  {a.completed ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  <p className="text-[10px] text-muted-foreground">{a.type} · {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No date'}</p>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${a.completed ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                  {a.completed ? 'Done' : 'Pending'}
                </span>
              </div>
            ))}
            {recentActivities.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No activities yet</p>}
          </div>
        </div>

        {/* Top Deals */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-display font-semibold mb-4 text-muted-foreground">Top Deals by Value</h3>
          <div className="space-y-3">
            {deals
              .sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0))
              .slice(0, 5)
              .map((d) => {
                const stageColors: Record<string, string> = {
                  prospect: 'bg-chart-5/20 text-chart-5',
                  qualified: 'bg-primary/20 text-primary',
                  proposal: 'bg-warning/20 text-warning',
                  negotiation: 'bg-accent/20 text-accent',
                  closed_won: 'bg-success/20 text-success',
                  closed_lost: 'bg-destructive/20 text-destructive',
                };
                return (
                  <div key={d.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{d.title}</p>
                      <p className="text-[10px] text-muted-foreground">₹{Number(d.value || 0).toLocaleString()}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${stageColors[d.stage || 'prospect']}`}>
                      {STAGE_LABELS[d.stage || 'prospect']}
                    </span>
                  </div>
                );
              })}
            {deals.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No deals yet</p>}
          </div>
        </div>
      </div>

      {/* Contact Overview */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-display font-semibold mb-4 text-muted-foreground">Contact Status Overview</h3>
        <div className="flex items-center gap-6">
          {contactStatusData.map((d) => (
            <div key={d.name} className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{d.name}</span>
                <span className="text-xs font-semibold">{d.value}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${contacts.length > 0 ? (d.value / contacts.length) * 100 : 0}%`, background: d.fill }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
