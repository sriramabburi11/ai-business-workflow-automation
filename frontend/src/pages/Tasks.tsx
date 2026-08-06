import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Card } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { CheckSquare, Filter, CheckCircle2 } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';

import { getTenantStorageData, saveTenantStorageData } from '../utils/storage';

export const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreating, setIsCreating] = useState(false);

  const loadTasks = async () => {
    const savedCustom: any[] = getTenantStorageData('custom_tasks', user);
    try {
      const res = await api.get('/tasks');
      if (res.data && Array.isArray(res.data)) {
        const combined = [...savedCustom, ...res.data];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        setTasks(unique);
      } else {
        setTasks(savedCustom);
      }
    } catch (err) {
      console.warn('Tasks API notice:', err);
      setTasks(savedCustom);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user]);

  const saveToLocalCache = (task: any) => {
    saveTenantStorageData('custom_tasks', user, task);
    const updated = getTenantStorageData('custom_tasks', user);
    setTasks(updated);
  };

  const handleCreateTask = async () => {
    setIsCreating(true);
    const titles = [
      'Extract Invoice OCR Line Items & Verify Tax Details',
      'Execute Vendor Security Compliance & SOC2 Check',
      'Provision Google Workspace & Slack Employee Accounts',
      'Fulfill IT Hardware Equipment Shipment Request',
      'Verify Contract SLAs & Renewal Cancellation Terms'
    ];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];

    const tempTask = {
      id: `task-${Date.now()}`,
      title: randomTitle,
      description: 'Automated workflow action task assigned to engineering & operations team.',
      status: 'PENDING',
      priority: 'HIGH',
      assignee: 'MEMBER',
      createdAt: new Date().toISOString()
    };

    try {
      const res = await api.post('/tasks', {
        title: randomTitle,
        description: 'Automated workflow action task assigned to engineering & operations team.',
        assignee: 'MEMBER',
        priority: 'HIGH'
      });
      const created = res.data || tempTask;
      saveToLocalCache(created);
    } catch (err) {
      saveToLocalCache(tempTask);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (target) {
      const updated = { ...target, status: newStatus };
      saveToLocalCache(updated);
    }

    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
    } catch (err) {
      console.warn('Task status update notice:', err);
    }
  };

  const filteredTasks = tasks.filter(t => statusFilter === 'ALL' || t.status === statusFilter);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-indigo-400" /> Task Automation Board
          </h1>
          <p className="text-xs text-slate-400 mt-1">Track active workflow tasks, assignments, and resolution statuses</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateTask}
            disabled={isCreating}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-bold text-xs shadow flex items-center gap-1.5 transition-all hover:scale-105"
          >
            <Plus className="h-4 w-4" /> {isCreating ? 'Creating Task...' : 'Create Action Task'}
          </button>

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
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading tasks...</div>
      ) : filteredTasks.length > 0 ? (
        <div className="space-y-4">
          {filteredTasks.map((t) => (
            <Card key={t.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="font-bold text-sm text-white">{t.title}</h3>
                  <Badge variant={t.priority === 'URGENT' ? 'urgent' : t.priority === 'HIGH' ? 'high' : 'medium'}>
                    {t.priority} Priority
                  </Badge>
                  <Badge variant={t.status === 'COMPLETED' ? 'completed' : t.status === 'IN_PROGRESS' ? 'pending' : 'low'}>
                    {t.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">{t.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
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
