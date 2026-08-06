import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Card } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { Settings as SettingsIcon, Building, Users, UserPlus, Key, Shield, CheckCircle2 } from 'lucide-react';

export const Settings: React.FC = () => {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [apiKey, setApiKey] = useState('AIzaSyD-sample-gemini-key-2026');
  const [savedKeyMsg, setSavedKeyMsg] = useState(false);

  const loadTeam = async () => {
    try {
      const res = await api.get('/organizations/team');
      setTeam(res.data);
    } catch (err) {
      console.error('Failed to load team members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/organizations/invite', {
        name: inviteName,
        email: inviteEmail,
        role: inviteRole
      });
      setIsInviteModalOpen(false);
      setInviteName('');
      setInviteEmail('');
      loadTeam();
    } catch (err) {
      console.error('Failed to invite member:', err);
    }
  };

  const handleSaveApiKey = () => {
    setSavedKeyMsg(true);
    setTimeout(() => setSavedKeyMsg(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono font-semibold">
          <SettingsIcon className="h-3.5 w-3.5" /> WORKSPACE CONFIGURATION & GOVERNANCE
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
          Organization Settings & RBAC
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage team member roles (Admin, Manager, Finance, HR), API keys, and enterprise governance.
        </p>
      </div>

      {/* Gemini API Key Configuration Card */}
      <Card className="p-6 space-y-4 border-purple-500/30">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="h-4 w-4 text-purple-400" /> Google Gemini AI API Configuration
        </h3>
        <p className="text-xs text-slate-400">
          Provide your custom Google Gemini API Key to enable dedicated server-side workflow generation & document extraction.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full sm:w-96 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
          />
          <button
            onClick={handleSaveApiKey}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow transition-all"
          >
            Update Key
          </button>

          {savedKeyMsg && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Saved!
            </span>
          )}
        </div>
      </Card>

      {/* RBAC Team Members Management Table */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-400" /> Team Members & Role Permissions ({team.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Control who can approve, edit, or execute workflows.</p>
          </div>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow flex items-center gap-1.5 transition-all"
          >
            <UserPlus className="h-3.5 w-3.5" /> Invite Member
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center text-slate-400 text-xs">Loading team roster...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-[10px] uppercase font-mono text-slate-400 bg-slate-900/60">
                <tr>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {team.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{m.name}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{m.email}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        m.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        m.role === 'MANAGER' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {m.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="active">Active</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Team Member & Assign Role"
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Alex Rivera"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="alex@company.com"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Role Permission Level</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="MEMBER">MEMBER - Standard access</option>
              <option value="MANAGER">MANAGER - Approvals & workflow creation</option>
              <option value="FINANCE">FINANCE - Financial disbursements</option>
              <option value="ADMIN">ADMIN - Full organization control</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow"
            >
              Send Invite
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
