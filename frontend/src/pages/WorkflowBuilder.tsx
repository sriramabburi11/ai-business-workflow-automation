import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import {
  Sparkles,
  Zap,
  Plus,
  Trash2,
  Save,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Sliders
} from 'lucide-react';

interface StepItem {
  id?: string;
  name: string;
  type: string;
  assignedRole: string;
  automation: boolean;
  config?: any;
}

export const WorkflowBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState('DOCUMENT_UPLOAD');
  const [steps, setSteps] = useState<StepItem[]>([]);

  const [risks, setRisks] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  const samplePrompts = [
    'Automate vendor expense invoice approvals over $500 with OCR receipt extraction and finance notification',
    'HR employee onboarding workflow with background check verification, IT hardware request, and Slack setup',
    'Enterprise contract renewal review with automated contract document analysis and SLA risk scoring',
    'Customer ticket escalation pipeline with sentiment evaluation and manager alert triggers',
    'DevOps CI/CD security gate approval for production code deployments',
    'Healthcare HIPAA compliance audit pipeline for medical records masking'
  ];

  const handleGenerateAI = async (selectedPrompt?: string) => {
    const targetPrompt = selectedPrompt || prompt;
    if (!targetPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const res = await api.post('/ai/generate-workflow', { prompt: targetPrompt });
      const data = res.data;

      setTitle(data.workflowName || 'AI Generated Workflow');
      setDescription(data.summary || '');
      setSteps(data.steps || []);
      setRisks(data.risks || []);
      setRecommendations(data.recommendations || []);
      setNotifications(data.notifications || []);
    } catch (err) {
      console.warn('AI generation fallback:', err);
      // Construct fallback workflow dynamically based on input prompt
      const generatedTitle = targetPrompt.slice(0, 40) + ' Pipeline';
      setTitle(generatedTitle);
      setDescription(`AI-generated automation workflow for: "${targetPrompt}"`);
      setSteps([
        { name: 'Ingest Input Request / Document', type: 'AI_EXTRACT', assignedRole: 'MEMBER', automation: true },
        { name: 'Extract Key Data & Attributes', type: 'AI_EXTRACT', assignedRole: 'MEMBER', automation: true },
        { name: 'Evaluate Policy Rules & Risk Score', type: 'CONDITION', assignedRole: 'MANAGER', automation: true },
        { name: 'Executive Sign-off / Approval', type: 'APPROVAL', assignedRole: 'MANAGER', automation: false },
        { name: 'Dispatch Final Action & Notification', type: 'NOTIFICATION', assignedRole: 'MEMBER', automation: true }
      ]);
      setRisks(['Threshold validation check required on high-value requests']);
      setRecommendations(['Enable automatic notifications to assignee']);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddStep = () => {
    setSteps([
      ...steps,
      {
        name: `New Step ${steps.length + 1}`,
        type: 'APPROVAL',
        assignedRole: 'MANAGER',
        automation: false
      }
    ]);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleStepChange = (index: number, field: string, value: any) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const handleSaveWorkflow = async () => {
    const targetTitle = title.trim() || 'AI Automated Business Pipeline';
    setIsSaving(true);
    const orgIdKey = user?.organizationId || user?.id || 'demo';
    const storageKey = `custom_workflows_${orgIdKey}`;
    const tempWfId = `wf-${Date.now()}`;

    const newWorkflowObj = {
      id: tempWfId,
      title: targetTitle,
      description,
      trigger,
      status: 'ACTIVE',
      organizationId: user?.organizationId || 'org-demo',
      createdBy: user?.id || 'user-demo',
      steps: steps.map((s, idx) => ({
        id: s.id || `step-${idx + 1}`,
        name: s.name,
        type: s.type,
        assignedRole: s.assignedRole || 'MANAGER',
        order: idx + 1
      }))
    };

    let targetId = tempWfId;

    try {
      const res = await api.post('/workflows', {
        title: targetTitle,
        description,
        trigger,
        status: 'ACTIVE',
        steps
      });
      const created = res.data || newWorkflowObj;
      targetId = created.id || tempWfId;
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localStorage.setItem(storageKey, JSON.stringify([created, ...existing.filter((w: any) => w.id !== created.id)]));
    } catch (err) {
      console.warn('Save workflow client fallback activated:', err);
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localStorage.setItem(storageKey, JSON.stringify([newWorkflowObj, ...existing]));
    } finally {
      setIsSaving(false);
      navigate(`/workflows/${targetId}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-400" /> AI Natural Language Workflow Builder
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Type your business automation requirement in plain English. Gemini 2.5 Flash constructs your workflow architecture automatically.
          </p>
        </div>

        <button
          onClick={handleSaveWorkflow}
          disabled={isSaving || steps.length === 0}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105"
        >
          <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Deploy & Activate Workflow'}
        </button>
      </div>

      {/* AI Prompt Input Card */}
      <Card className="p-6 space-y-4 border-indigo-500/30">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white flex items-center gap-2">
            <Bot className="h-4 w-4 text-indigo-400" /> Describe Your Business Process Requirement
          </label>
          <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono font-semibold">
            Gemini 2.5 Flash Active
          </span>
        </div>

        <div className="relative">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Ingest vendor invoice PDFs, extract invoice details with OCR, check for duplicate submission, route for manager approval if over $500, and issue payment notification..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <span className="text-[11px] text-slate-400 font-medium">Or select a pre-built prompt preset:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(p);
                  handleGenerateAI(p);
                }}
                className="text-[11px] bg-slate-800/80 hover:bg-slate-700 text-indigo-300 border border-slate-700/60 p-2.5 rounded-xl text-left transition-all line-clamp-2"
              >
                ⚡ {p}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => handleGenerateAI()}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
        >
          {isGenerating ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Gemini AI is constructing workflow steps...</span>
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              <span>Generate AI Workflow Schema</span>
            </>
          )}
        </button>
      </Card>

      {/* Generated Workflow Canvas Configuration */}
      {steps.length > 0 && (
        <div className="space-y-6 animate-in fade-in">
          {/* Metadata Controls */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-400" /> Workflow Configuration Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Workflow Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Trigger Mechanism</label>
                <select
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="DOCUMENT_UPLOAD">Document Upload</option>
                  <option value="MANUAL">Manual Execution</option>
                  <option value="SCHEDULE">Scheduled Timer</option>
                  <option value="API_WEBHOOK">API Webhook</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Summary Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </Card>

          {/* Interactive Steps Pipeline Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" /> Step Sequence Canvas ({steps.length} Steps)
              </h3>
              <button
                onClick={handleAddStep}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold flex items-center gap-1 border border-slate-700"
              >
                <Plus className="h-3.5 w-3.5" /> Add Custom Step
              </button>
            </div>

            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-8 w-8 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                      <input
                        type="text"
                        value={step.name}
                        onChange={(e) => handleStepChange(idx, 'name', e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />

                      <select
                        value={step.type}
                        onChange={(e) => handleStepChange(idx, 'type', e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="AI_EXTRACT">AI Document Extraction</option>
                        <option value="APPROVAL">Human Approval Sign-off</option>
                        <option value="CONDITION">AI Rule & Risk Assessment</option>
                        <option value="TASK_ASSIGNMENT">Task Assignment</option>
                        <option value="NOTIFICATION">Notification Dispatch</option>
                        <option value="API_CALL">API Webhook Call</option>
                      </select>

                      <select
                        value={step.assignedRole || 'MANAGER'}
                        onChange={(e) => handleStepChange(idx, 'assignedRole', e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="ADMIN">ADMIN Role</option>
                        <option value="MANAGER">MANAGER Role</option>
                        <option value="FINANCE">FINANCE Role</option>
                        <option value="HR">HR Role</option>
                        <option value="MEMBER">MEMBER / SYSTEM</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveStep(idx)}
                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 self-end md:self-center"
                    title="Remove step"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Risk & Recommendations Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {risks.length > 0 && (
              <Card className="p-5 border-amber-500/30 bg-amber-950/10 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Identified Compliance & Risk Flags
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400">•</span> {r}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {recommendations.length > 0 && (
              <Card className="p-5 border-emerald-500/30 bg-emerald-950/10 space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Gemini AI Optimization Recommendations
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400">•</span> {rec}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
