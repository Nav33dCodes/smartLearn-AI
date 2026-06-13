import React from 'react';
import { Shield, Lock, FileText, Server, Eye, Database } from 'lucide-react';
import Logo from '../components/Logo';

export default function Privacy() {
  return (
    <div className="dark min-h-screen bg-[#000000] text-zinc-400 selection:bg-white/20 selection:text-white font-sans tracking-tight">
      <div className="max-w-3xl mx-auto px-6 py-24 sm:py-32">
        
        {/* Header */}
        <div className="mb-16 border-b border-white/[0.04] pb-12">
          <div className="flex items-center gap-3 mb-8">
            <Logo size={32} className="text-white" />
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-white mb-8 leading-none">
            Privacy Policy
          </h1>
          <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium tracking-widest uppercase">
            <span>Effective: June 11, 2026</span>
            <span className="w-1 h-1 rounded-full bg-white/20"></span>
            <span>v2.4.0</span>
          </div>
        </div>

        {/* Introduction */}
        <section className="mb-16">
          <p className="text-lg leading-relaxed mb-6">
            At SmartLearn AI ("Company", "we", "us", or "our"), privacy is not an afterthought—it is the foundational architecture of our platform. We recognize that our users, ranging from independent researchers to enterprise data scientists, entrust us with highly sensitive intellectual property, proprietary documents, and personal information.
          </p>
          <p className="text-lg leading-relaxed">
            This Privacy Policy comprehensively details our data collection, processing, storage, and sharing practices. We operate under a strict "Zero-Knowledge" philosophy regarding the contents of your private documents. By utilizing the SmartLearn AI platform, you consent to the practices described herein.
          </p>
        </section>

        {/* Key Pillars */}
        <section className="mb-24 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#050505] border border-white/[0.04] rounded-3xl p-8 hover:border-white/10 transition-colors shadow-2xl">
             <Shield className="text-white mb-6" size={24} />
             <h3 className="text-xl font-bold text-zinc-100 mb-3 tracking-tight">Zero Training Policy</h3>
             <p className="text-[15px] leading-relaxed text-zinc-500">Your uploaded documents are never used to train our foundational models. Your data remains strictly your own.</p>
          </div>
          <div className="bg-[#050505] border border-white/[0.04] rounded-3xl p-8 hover:border-white/10 transition-colors shadow-2xl">
             <Lock className="text-white mb-6" size={24} />
             <h3 className="text-xl font-bold text-zinc-100 mb-3 tracking-tight">Enterprise Encryption</h3>
             <p className="text-[15px] leading-relaxed text-zinc-500">All data is encrypted in transit via TLS 1.3 and at rest using AES-256 military-grade encryption standards.</p>
          </div>
        </section>

        {/* Detailed Sections */}
        <div className="space-y-16">
          <section>
            <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-3">
              <Database className="text-zinc-500" size={24} />
              1. Information We Collect
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-zinc-200 mb-2">1.1 Account Information</h3>
                <p className="leading-relaxed">When you register for an account, we collect your email address, name, and authentication credentials. If you utilize single sign-on (SSO) via Google or other providers, we receive only the authorized profile parameters.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-200 mb-2">1.2 Uploaded Documents & Telemetry</h3>
                <p className="leading-relaxed">Files you upload (PDFs, DOCX, TXT) are temporarily parsed, vectorized, and stored in our secure, isolated vector databases strictly to facilitate Retrieval-Augmented Generation (RAG) for your active sessions.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-3">
              <Server className="text-zinc-500" size={24} />
              2. Data Storage and Processing
            </h2>
            <p className="leading-relaxed mb-4">
              We employ localized edge computing infrastructure to ensure minimal latency and strict compliance with regional data sovereignty laws (including GDPR and CCPA). 
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-400">
              <li>Vector embeddings are mathematically irreversible representations of your text.</li>
              <li>Chat histories are securely siloed per user ID and cannot bleed across tenants.</li>
              <li>You may request a complete and immediate purge of your digital footprint at any time via the platform settings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100 mb-6 flex items-center gap-4 border-b border-white/[0.04] pb-4">
              <Eye className="text-zinc-600" size={20} />
              3. Third-Party Subprocessors
            </h2>
            <p className="leading-relaxed mb-6 text-[15px] text-zinc-400">
              To deliver our advanced AI capabilities, we interface with highly vetted frontier model APIs (e.g., Anthropic, OpenAI, Groq). Our data processing agreements (DPAs) with these providers legally enforce the following:
            </p>
            <div className="bg-[#050505] border border-white/[0.04] rounded-2xl p-6 shadow-sm">
              <ul className="space-y-4 text-[14px]">
                <li className="flex items-start gap-4">
                  <span className="text-white mt-0.5">→</span>
                  <span className="text-zinc-400"><strong className="text-zinc-200">Zero Data Retention:</strong> APIs do not retain your inputs beyond 30 days for abuse monitoring.</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-white mt-0.5">→</span>
                  <span className="text-zinc-400"><strong className="text-zinc-200">Zero Model Training:</strong> Your prompts and documents are strictly excluded from their training pipelines.</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-3">
              <FileText className="text-zinc-500" size={24} />
              4. Your Rights & Choices
            </h2>
            <p className="leading-relaxed">
              Depending on your jurisdiction, you possess specific rights regarding your personal data: the right to access, rectify, port, or erase your data. SmartLearn AI is committed to fulfilling these rights universally, regardless of your geographic location. To exercise these rights, please contact our Data Protection Officer at <strong>privacy@smartlearn-ai.com</strong>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-32 pt-12 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-zinc-600 font-medium">
          <p>© {new Date().getFullYear()} SmartLearn AI Inc. All rights reserved.</p>
          <p>For urgent inquiries: <span className="text-zinc-400 hover:text-white transition-colors cursor-pointer">legal@smartlearn-ai.com</span></p>
        </div>
      </div>
    </div>
  );
}
