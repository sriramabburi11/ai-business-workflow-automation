import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Card } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { GitMerge, Sparkles, Play, Trash2, Edit3, Plus, Search, Filter } from 'lucide-react';

export const Workflows: React.FC = () => {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrigger, setFilterTrigger] = useState('ALL');

  const loadWorkflows = async () => {
    try {
      const res = await api.get('/workflows');
      setWorkflows(res.data);
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      try {
        await api.delete(`/workflows/${id}`);
        loadWorkflows();
      } catch (err) {
        console.error('Failed to delete workflow:', err);
      }
    }
  };

  const handleExecute = async (id: string) => {
    try {
      await api.post(`/workflows/${id}/execute`);
      alert('Workflow execution triggered successfully!');
      loadWorkflows();
    } catch (err) {
      console.error('Failed to execute workflow:', err);
    }
  };

  const filteredWorkflows = workflows.filter((wf) => {
    const matchesSearch = wf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wf.description && wf.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTrigger = filterTrigger === 'ALL' || wf.trigger === filterTrigger;
    return matchesSearch && matchesTrigger;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <GitMerge className="h-6 w-6 text-indigo-400" /> Automated Workflow Pipelines
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage and trigger end-to-end AI automated business processes</p>
        </div>

        <Link
          to="/workflows/new"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <Sparkles className="h-4 w-4" /> Create New AI Workflow
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workflows by title or keywords..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={filterTrigger}
            onChange={(e) => setFilterTrigger(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Triggers</option>
            <option value="DOCUMENT_UPLOAD">Document Upload</option>
            <option value="MANUAL">Manual Execution</option>
            <option value="SCHEDULE">Scheduled Timer</option>
            <option value="API_WEBHOOK">API Webhook</option>
          </select>
        </div>
      </div>

      {/* Workflows List Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading workflows...</div>
      ) : filteredWorkflows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((wf) => (
            <Card key={wf.id} className="flex flex-col justify-between p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={wf.status === 'ACTIVE' ? 'active' : 'low'}>{wf.status}</Badge>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    Trigger: {wf.trigger}
                  </span>
                </div>

                <h3 className="font-bold text-base text-white hover:text-indigo-400 transition-colors">
                  <Link to={`/workflows/${wf.id}`}>{wf.title}</Link>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {wf.description || 'No description provided.'}
                </p>
              </div>

              {/* Step counter & Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  Steps: <strong className="text-white">{wf.steps?.length || 0}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExecute(wf.id)}
                    className="p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
                    title="Execute Workflow"
                  >
                    <Play className="h-3.5 w-3.5" /> Run
                  </button>

                  <Link
                    to={`/workflows/${wf.id}`}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                    title="Edit Workflow"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Link>

                  <button
                    onClick={() => handleDelete(wf.id)}
                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all"
                    title="Delete Workflow"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center space-y-3">
          <GitMerge className="h-10 w-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No workflows found matching filter</p>
          <Link to="/workflows/new" className="inline-block text-xs text-indigo-400 font-semibold hover:underline">
            Create your first workflow using AI Prompt Engine →
          </Link>
        </Card>
      )}
    </div>
  );
};
