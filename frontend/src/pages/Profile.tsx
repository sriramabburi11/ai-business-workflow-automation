import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Card } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { User, Shield, Key, History, Clock } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, organization } = useAuth();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const res = await api.get('/analytics');
        setAuditLogs(res.data.auditLogs || []);
      } catch (err) {
        console.error('Failed to fetch audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAudits();
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono font-semibold">
          <User className="h-3.5 w-3.5" /> USER PROFILE & SECURITY GOVERNANCE
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
          Account Profile & Audit Logs
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          View authenticated credentials, role authorization, and audit logs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Card (1 col) */}
        <Card className="p-6 space-y-4 border-indigo-500/30 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-extrabold text-2xl text-white shadow-lg mx-auto">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-white">{user?.name}</h2>
              <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
              <div className="pt-2">
                <Badge variant="active">{user?.role || 'ADMIN'} ACCESS</Badge>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 text-xs text-slate-400 space-y-2">
            <div className="flex justify-between">
              <span>Organization:</span>
              <strong className="text-white">{organization?.name || 'Smart Automation Enterprise'}</strong>
            </div>
            <div className="flex justify-between">
              <span>MFA Security:</span>
              <strong className="text-emerald-400">Enabled</strong>
            </div>
          </div>
        </Card>

        {/* Audit Logs Stream (2 cols) */}
        <Card className="md:col-span-2 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="h-4 w-4 text-purple-400" /> Platform Security Audit Trail Logs
          </h3>

          {loading ? (
            <div className="p-6 text-center text-slate-400 text-xs">Loading audit logs...</div>
          ) : auditLogs.length > 0 ? (
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-200 flex items-center gap-2">
                      <span className="text-indigo-400 font-mono">[{log.action}]</span>
                      <span>By {log.user?.name || 'System User'}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Details: {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">No audit logs recorded yet.</div>
          )}
        </Card>
      </div>
    </div>
  );
};
