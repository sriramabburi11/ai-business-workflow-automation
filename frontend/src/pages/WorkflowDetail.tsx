import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { Card } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { GitMerge, Play, ArrowLeft, Clock, CheckCircle2, FileText, ShieldCheck } from 'lucide-react';

export const WorkflowDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [workflow, setWorkflow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  const loadWorkflow = async () => {
    try {
      const res = await api.get(`/workflows/${id}`);
      setWorkflow(res.data);
    } catch (err) {
      console.error('Failed to fetch workflow detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadWorkflow();
  }, [id]);

  const handleRunPipeline = async () => {
    if (!id) return;
    setExecuting(true);
    try {
      await api.post(`/workflows/${id}/execute`);
      await loadWorkflow();
    } catch (err) {
      console.error('Execution error:', err);
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading workflow details...</div>;
  }

  if (!workflow) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-4">
        <p>Workflow not found</p>
        <Link to="/workflows" className="text-xs text-indigo-400 font-semibold hover:underline">
          Return to workflows list
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <Link to="/workflows" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Workflows List
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{workflow.title}</h1>
            <Badge variant={workflow.status === 'ACTIVE' ? 'active' : 'low'}>{workflow.status}</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">{workflow.description}</p>
        </div>

        <button
          onClick={handleRunPipeline}
          disabled={executing}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
        >
          <Play className="h-4 w-4" /> {executing ? 'Executing Pipeline...' : 'Run Pipeline Now'}
        </button>
      </div>

      {/* Step Sequence Matrix */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <GitMerge className="h-4 w-4 text-indigo-400" /> Configured Workflow Steps ({workflow.steps?.length || 0})
        </h3>

        <div className="space-y-3">
          {workflow.steps?.map((step: any, idx: number) => (
            <div key={step.id || idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-600/20 text-indigo-300 font-mono font-bold text-xs flex items-center justify-center">
                  #{step.order}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{step.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Type: <span className="text-indigo-400">{step.type}</span> | Role: <span className="text-purple-400">{step.assignedRole}</span>
                  </div>
                </div>
              </div>

              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
          ))}
        </div>
      </Card>

      {/* Execution Logs Stream */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-purple-400" /> Execution Runs & Logs
        </h3>

        {workflow.executions && workflow.executions.length > 0 ? (
          <div className="space-y-4">
            {workflow.executions.map((exec: any) => {
              let logs = [];
              try {
                logs = typeof exec.logs === 'string' ? JSON.parse(exec.logs) : exec.logs;
              } catch (e) {
                logs = [];
              }

              return (
                <div key={exec.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-300 font-mono">Execution #{exec.id.slice(0, 8)}</span>
                    <Badge variant="completed">{exec.status}</Badge>
                  </div>
                  <div className="bg-black/50 p-3 rounded-lg font-mono text-[11px] text-slate-300 space-y-1">
                    {Array.isArray(logs) && logs.map((log: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-slate-400 text-[10px]">{log.timestamp?.slice(11, 19)}</span>
                        <span>{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs">
            No execution runs recorded yet. Click "Run Pipeline Now" to execute.
          </div>
        )}
      </Card>
    </div>
  );
};
