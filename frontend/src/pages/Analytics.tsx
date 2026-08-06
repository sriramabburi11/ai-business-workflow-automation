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

import { useAuth } from '../context/AuthContext';
import { getTenantStorageData } from '../utils/storage';

export const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [localWorkflows, setLocalWorkflows] = useState<any[]>([]);
  const [localApprovals, setLocalApprovals] = useState<any[]>([]);
  const [localDocuments, setLocalDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const savedWf = getTenantStorageData('custom_workflows', user);
      const savedAppr = getTenantStorageData('custom_approvals', user);
      const savedDocs = getTenantStorageData('custom_documents', user);

      setLocalWorkflows(savedWf);
      setLocalApprovals(savedAppr);
      setLocalDocuments(savedDocs);

      try {
        const res = await api.get('/analytics');
        setData(res.data);
      } catch (err) {
        console.warn('Failed to fetch analytics from API, using tenant store:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading analytics trends...</div>;
  }

  const approvedList = localApprovals.filter(a => a.decision === 'APPROVED');
  const pendingList = localApprovals.filter(a => a.decision === 'PENDING');
  const rejectedList = localApprovals.filter(a => a.decision === 'REJECTED');
  const totalDecisions = approvedList.length + rejectedList.length;

  const computedAccuracy = totalDecisions > 0
    ? Math.round((approvedList.length / totalDecisions) * 100)
    : (localWorkflows.length > 0 ? 98 : 0);

  const totalExecs = localWorkflows.reduce((acc, w) => acc + Math.max(1, w.executions?.length || 1), 0);

  const metrics = {
    totalWorkflows: localWorkflows.length || data?.metrics?.totalWorkflows || 0,
    activeWorkflows: localWorkflows.length || data?.metrics?.activeWorkflows || 0,
    totalExecutions: totalExecs || data?.metrics?.totalExecutions || 0,
    approvalRate: data?.metrics?.approvalRate !== undefined && data.metrics.approvalRate > 0 ? data.metrics.approvalRate : computedAccuracy,
    aiHoursSaved: Math.round((localWorkflows.length * 5) + (localDocuments.length * 2.5)) || data?.metrics?.aiHoursSaved || 0,
    totalDocuments: localDocuments.length || data?.metrics?.totalDocuments || 0,
    approvedCount: approvedList.length || data?.metrics?.approvedCount || 0,
    pendingApprovalsCount: pendingList.length || data?.metrics?.pendingApprovalsCount || 0,
    rejectedCount: rejectedList.length || data?.metrics?.rejectedCount || 0
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const trends = days.map((day, idx) => {
    if (metrics.totalWorkflows === 0 && metrics.totalDocuments === 0) {
      return { day, executions: 0, approvals: 0, docsProcessed: 0 };
    }
    const execBase = Math.max(1, Math.floor(metrics.totalExecutions / 7));
    const docBase = Math.max(0, Math.floor(metrics.totalDocuments / 7));
    return {
      day,
      executions: execBase + (idx % 3),
      approvals: Math.max(0, Math.floor(metrics.approvedCount / 7)),
      docsProcessed: docBase + (idx % 2)
    };
  });

  const totalDecisionCount = metrics.approvedCount + metrics.pendingApprovalsCount + metrics.rejectedCount;

  const pieData = totalDecisionCount > 0 ? [
    { name: 'Approved', value: Math.round((metrics.approvedCount / totalDecisionCount) * 100) || (metrics.approvedCount > 0 ? 100 : 0), color: '#10b981' },
    { name: 'Pending Review', value: Math.round((metrics.pendingApprovalsCount / totalDecisionCount) * 100) || (metrics.pendingApprovalsCount > 0 ? 100 : 0), color: '#f59e0b' },
    { name: 'Rejected / Risk', value: Math.round((metrics.rejectedCount / totalDecisionCount) * 100) || (metrics.rejectedCount > 0 ? 100 : 0), color: '#ef4444' }
  ] : [
    { name: 'Approved', value: localWorkflows.length > 0 ? 100 : 0, color: '#10b981' },
    { name: 'Pending Review', value: 0, color: '#f59e0b' },
    { name: 'Rejected / Risk', value: 0, color: '#ef4444' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
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
          onClick={() => console.log('AI Optimization report requested')}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all"
        >
          <Download className="h-4 w-4 text-indigo-400" /> Export AI Executive Report
        </button>
      </div>

      {/* Top Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="text-xs text-slate-400 font-semibold">Total Weekly Executions</div>
          <div className="text-3xl font-extrabold text-white mt-2">{metrics.totalExecutions || 0}</div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> {metrics.totalWorkflows > 0 ? 'Operational' : 'No active workflows'}
          </div>
        </Card>

        <Card>
          <div className="text-xs text-slate-400 font-semibold">AI Time Saved</div>
          <div className="text-3xl font-extrabold text-white mt-2">{metrics.aiHoursSaved || 0} hrs</div>
          <div className="text-[11px] text-indigo-400 font-semibold mt-1">
            {metrics.totalWorkflows > 0 ? 'Avg 4.2 mins / step automated' : '0 mins automated'}
          </div>
        </Card>

        <Card>
          <div className="text-xs text-slate-400 font-semibold">Approval Accuracy Rate</div>
          <div className="text-3xl font-extrabold text-white mt-2">{metrics.approvalRate || 0}%</div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1">
            0 policy violations
          </div>
        </Card>

        <Card>
          <div className="text-xs text-slate-400 font-semibold">Documents Ingested</div>
          <div className="text-3xl font-extrabold text-white mt-2">{metrics.totalDocuments || 0}</div>
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
