import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Card } from '../components/UI/Card';
import { FileSpreadsheet, Sparkles, ArrowRight, Zap, CheckCircle2, ShieldCheck, FileText, UserPlus, HelpCircle } from 'lucide-react';

export const Templates: React.FC = () => {
  const navigate = useNavigate();

  const templatesList = [
    {
      title: 'AI Expense Reimbursement & OCR Verification',
      category: 'Finance & Accounting',
      description: 'Ingests employee vendor receipts, extracts line items via OCR, verifies policy compliance, and routes items > $500 for Manager sign-off.',
      stepsCount: 5,
      icon: FileText,
      trigger: 'DOCUMENT_UPLOAD',
      color: 'indigo'
    },
    {
      title: 'Employee Onboarding & Workspace Access',
      category: 'Human Resources',
      description: 'Collects passport/ID documents, provisions Google Workspace & Slack credentials, and dispatches welcome kits.',
      stepsCount: 4,
      icon: UserPlus,
      trigger: 'MANUAL',
      color: 'purple'
    },
    {
      title: 'Enterprise Contract Renewal AI Risk Audit',
      category: 'Legal & Procurement',
      description: 'Evaluates expiring enterprise vendor contracts, runs Gemini AI clause analysis, and flags auto-renewal liabilities.',
      stepsCount: 3,
      icon: ShieldCheck,
      trigger: 'SCHEDULE',
      color: 'pink'
    },
    {
      title: 'Customer Support Escalation & Ticket Routing',
      category: 'Customer Operations',
      description: 'Classifies urgent customer support tickets, scores sentiment with Gemini AI, and escalates SLA breaches to Support Manager.',
      stepsCount: 4,
      icon: HelpCircle,
      trigger: 'API_WEBHOOK',
      color: 'cyan'
    }
  ];

  const handleUseTemplate = async (template: typeof templatesList[0]) => {
    try {
      await api.post('/workflows', {
        title: template.title,
        description: template.description,
        trigger: template.trigger,
        status: 'ACTIVE',
        steps: [
          { name: 'Initial Data Ingestion', type: 'AI_EXTRACT', assignedRole: 'MEMBER' },
          { name: 'AI Policy & Risk Assessment', type: 'CONDITION', assignedRole: 'SYSTEM' },
          { name: 'Executive Approval Sign-off', type: 'APPROVAL', assignedRole: 'MANAGER' },
          { name: 'Completion & Notification', type: 'NOTIFICATION', assignedRole: 'SYSTEM' }
        ]
      });
      navigate('/workflows');
    } catch (err) {
      console.error('Failed to clone template:', err);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono font-semibold">
          <FileSpreadsheet className="h-3.5 w-3.5" /> PRE-BUILT AUTOMATION CATALOG
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
          Enterprise Workflow Templates
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Instantly deploy industry-tested AI workflows with 1-click cloning.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templatesList.map((tpl, idx) => (
          <Card key={idx} className="p-6 flex flex-col justify-between space-y-4 border-slate-800 hover:border-indigo-500/40">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                  {tpl.category}
                </span>
                <span className="text-[11px] font-mono text-slate-400">Trigger: {tpl.trigger}</span>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <tpl.icon className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{tpl.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tpl.description}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Steps: <strong className="text-white">{tpl.stepsCount} Automated Steps</strong>
              </span>

              <button
                onClick={() => handleUseTemplate(tpl)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow flex items-center gap-1.5 transition-all hover:scale-105"
              >
                <span>Use Template</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
