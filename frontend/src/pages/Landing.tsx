import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap, ShieldCheck, FileText, Bot, BarChart3, CheckCircle2, GitMerge } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header Bar */}
      <header className="px-8 py-6 border-b border-slate-800/80 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#080c14]/90">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">Nexus<span className="text-indigo-400 font-normal">AI</span></span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative px-6 pt-20 pb-24 max-w-7xl mx-auto text-center overflow-hidden">
          {/* Background Glow Orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none"></div>
          <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold text-indigo-400 mb-8 shadow-inner">
            <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
            <span>Powered by Google Gemini 2.5 Flash</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-tight">
            Automate Enterprise Workflows with <span className="text-gradient">Intelligent AI Engine</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
            Orchestrate approvals, task routing, AI document extractions, and compliance reporting in seconds. Transform complex business operations into zero-latency automated pipelines.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white text-base font-bold shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-3 transition-all hover:scale-105"
            >
              <span>Launch Live Platform Demo</span>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              to="/workflows/new"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-base font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="h-5 w-5 text-indigo-400" />
              <span>Build AI Workflow</span>
            </Link>
          </div>

          {/* Interactive Feature Cards Matrix */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="glass-panel rounded-2xl p-8 border border-slate-800/80 hover:border-indigo-500/40 transition-all">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-6">
                <Bot className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Gemini AI Workflow Generator</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Describe any business process in plain text. Gemini builds multi-step automated workflows with roles, risk checks, and notifications.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-8 border border-slate-800/80 hover:border-purple-500/40 transition-all">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-6">
                <FileText className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Smart Document Extraction</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Upload invoices, contracts, or tax forms. Instantly extract structured line items, detect anomalies, and auto-populate backend systems.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-8 border border-slate-800/80 hover:border-pink-500/40 transition-all">
              <div className="h-12 w-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-white">AI Risk Assessment Engine</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Automated risk scoring on approval requests. Identifies monetary policy breaches, vendor changes, and suspicious transactions.
              </p>
            </div>
          </div>
        </section>

        {/* Feature List Section */}
        <section className="py-16 bg-slate-900/40 border-t border-slate-800/80">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white">Enterprise Automation Capabilities</h2>
              <p className="text-slate-400 mt-2 text-sm">Built for high-scale teams requiring precision, speed, and strict compliance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Role-Based Access Control', desc: 'Granular permissions for Admin, Manager, HR, and Finance.' },
                { title: 'Audit Trail Logs', desc: 'Immutable activity tracking for compliance and legal verification.' },
                { title: 'Workflow Executions', desc: 'Real-time state engine tracking step completions and latency.' },
                { title: 'Analytics Dashboard', desc: 'Visual Recharts metrics detailing hours saved and bottleneck points.' }
              ].map((item, idx) => (
                <div key={idx} className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-400">
        <p>© 2026 NexusAI Automation Platform • Powered by Google Gemini 2.5 Flash • Smart Automation Hackathon</p>
      </footer>
    </div>
  );
};
