import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Card } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { CheckSquare, Filter, Clock, CheckCircle2, User, AlertCircle } from 'lucide-react';

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      loadTasks();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const filteredTasks = tasks.filter(t => statusFilter === 'ALL' || t.status === statusFilter);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-indigo-400" /> Task Automation Board
          </h1>
          <p className="text-xs text-slate-400 mt-1">Track active workflow tasks, assignments, and resolution statuses</p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Tasks</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading tasks...</div>
      ) : filteredTasks.length > 0 ? (
        <div className="space-y-4">
          {filteredTasks.map((t) => (
            <Card key={t.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-sm text-white">{t.title}</h3>
                  <Badge variant={t.priority === 'HIGH' ? 'urgent' : 'medium'}>{t.priority} Priority</Badge>
                  <Badge variant={t.status === 'COMPLETED' ? 'completed' : t.status === 'IN_PROGRESS' ? 'pending' : 'low'}>
                    {t.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">{t.description}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
                  <span>Assignee: <strong className="text-indigo-400">{t.assignee}</strong></span>
                  {t.workflow && <span>Workflow: <strong className="text-slate-300">{t.workflow.title}</strong></span>}
                </div>
              </div>

              {/* Quick Status Action Controls */}
              <div className="flex items-center gap-2 shrink-0">
                {t.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleUpdateStatus(t.id, 'COMPLETED')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                  </button>
                )}
                {t.status === 'PENDING' && (
                  <button
                    onClick={() => handleUpdateStatus(t.id, 'IN_PROGRESS')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all"
                  >
                    Start Task
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center text-slate-400 text-xs">
          No tasks found matching current filter!
        </Card>
      )}
    </div>
  );
};
