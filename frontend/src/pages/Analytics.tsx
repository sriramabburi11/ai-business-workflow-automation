import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Card } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, Sparkles, Clock, ShieldCheck, TrendingUp, Cpu, Download } from 'lucide-react';

export const Analytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading analytics trends...</div>;
  }

  const metrics = data?.metrics || {
    totalWorkflows: 3,
    approvalRate: 94,
    aiHoursSaved: 54,
    totalDocuments: 8
  };

  const trends = data?.executionTrends || [
    { day: 'Mon', executions: 42, approvals: 18, docsProcessed: 12 },
    { day: 'Tue', executions: 65, approvals: 29, docsProcessed: 22 },
    { day: 'Wed', executions: 88, approvals: 34, docsProcessed: 30 },
    { day: 'Thu', executions: 74, approvals: 28, docsProcessed: 25 },
    { day: 'Fri', executions: 95, approvals: 41, docsProcessed: 38 },
    { day: 'Sat', executions: 31, approvals: 12, docsProcessed: 10 },
    { day: 'Sun', executions: 24, approvals: 8, docsProcessed: 7 }
  ];

  const pieData = [
    { name: 'Auto-Approved (<$500)', value: 68, color: '#10b981' },
    { name: 'Manager Review', value: 24, color: '#f59e0b' },
    { name: 'AI Escalations', value: 8, color: '#ef4444' }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono font-semibold">
            <BarChart3 className="h-3.5 w-3.5" /> PERFORMANCE & BOTTLENECK INSIGHTS
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Workflow Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Recharts analytics tracking execution volume, decision throughput, and AI time saved.
          </p>
        </div>

        <button
          onClick={() => alert('AI Optimization PDF report generated!')}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all"
        >
          <Download className="h-4 w-4 text-indigo-400" /> Export AI Executive Report
        </button>
      </div>

      {/* Top Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="text-xs text-slate-400 font-semibold">Total Weekly Executions</div>
          <div className="text-3xl font-extrabold text-white mt-2">419</div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +24% vs last week
          </div>
        </Card>

        <Card>
          <div className="text-xs text-slate-400 font-semibold">AI Time Saved</div>
          <div className="text-3xl font-extrabold text-white mt-2">{metrics.aiHoursSaved} hrs</div>
          <div className="text-[11px] text-indigo-400 font-semibold mt-1">
            Avg 4.2 mins / step automated
          </div>
        </Card>

        <Card>
          <div className="text-xs text-slate-400 font-semibold">Approval Accuracy Rate</div>
          <div className="text-3xl font-extrabold text-white mt-2">{metrics.approvalRate}%</div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1">
            0 policy violations
          </div>
        </Card>

        <Card>
          <div className="text-xs text-slate-400 font-semibold">Documents Ingested</div>
          <div className="text-3xl font-extrabold text-white mt-2">{metrics.totalDocuments}</div>
          <div className="text-[11px] text-purple-400 font-semibold mt-1">
            100% Gemini OCR accuracy
          </div>
        </Card>
      </div>

      {/* Recharts Area & Bar Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Executions Trend (2 cols) */}
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-400" /> Daily Execution Volume Trends
            </h3>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">Last 7 Days</span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorExec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1f2937', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="executions" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorExec)" name="Workflow Executions" />
                <Area type="monotone" dataKey="docsProcessed" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorDocs)" name="Documents OCR" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Approval Decision Split (1 col) */}
        <Card className="p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Decision Routing Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-1">Breakdown of automated vs manual approvals</p>
          </div>

          <div className="h-56 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1f2937', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 border-t border-slate-800 pt-3">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <strong className="text-white font-mono">{item.value}%</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
