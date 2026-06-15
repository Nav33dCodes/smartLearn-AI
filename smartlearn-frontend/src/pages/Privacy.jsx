import React from 'react';
import { Shield, Lock, FileText, Server, Eye, Database, Activity, Globe } from 'lucide-react';
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
            <span>Effective: June 15, 2026</span>
            <span className="w-1 h-1 rounded-full bg-white/20"></span>
            <span>v3.0.0</span>
          </div>
        </div>

        {/* Introduction */}
        <section className="mb-16">
          <p className="text-lg leading-relaxed mb-6">
            At SmartLearn AI ("Company", "we", "us", or "our"), privacy is not an afterthought—it is the foundational architecture of our platform. We recognize that our users, ranging from independent researchers to enterprise data scientists, entrust us with highly sensitive intellectual property, proprietary documents, and personal information.
          </p>
          <p className="text-lg leading-relaxed mb-6">
            This Privacy Policy comprehensively details our data collection, processing, storage, and sharing practices in compliance with global data protection regulations, including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
          </p>
          <p className="text-lg leading-relaxed">
            By utilizing the SmartLearn AI platform, you consent to the practices described herein.
          </p>
        </section>

        {/* Key Pillars */}
        <section className="mb-24 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#050505] border border-white/[0.04] rounded-3xl p-8 hover:border-white/10 transition-colors shadow-2xl">
             <Shield className="text-white mb-6" size={24} />
             <h3 className="text-xl font-bold text-zinc-100 mb-3 tracking-tight">Zero Training Policy</h3>
             <p className="text-[15px] leading-relaxed text-zinc-500">Your uploaded documents, chat histories, and interactions are never used to train our foundational models or third-party APIs. Your data remains strictly your own.</p>
          </div>
          <div className="bg-[#050505] border border-white/[0.04] rounded-3xl p-8 hover:border-white/10 transition-colors shadow-2xl">
             <Lock className="text-white mb-6" size={24} />
             <h3 className="text-xl font-bold text-zinc-100 mb-3 tracking-tight">Zero-Retention Mode</h3>
             <p className="text-[15px] leading-relaxed text-zinc-500">When Private Mode is engaged, our backend completely bypasses all database logging logic. Data is processed in volatile memory (RAM) and destroyed instantly.</p>
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
                <h3 className="text-lg font-semibold text-zinc-200 mb-2">1.1 Account & Identity Information</h3>
                <p className="leading-relaxed">When you register, we collect your email address, name, and securely hashed authentication credentials. If utilizing Single Sign-On (SSO) via OAuth providers, we process only the strictly necessary profile parameters authorized by the identity provider.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-200 mb-2">1.2 Proprietary Documents & Vector Data</h3>
                <p className="leading-relaxed">Files you upload (PDFs, DOCX, TXT, code files) are parsed and converted into irreversible mathematical embeddings. These vectors are stored in our secure, isolated vector databases strictly to facilitate Retrieval-Augmented Generation (RAG) for your active tenant session.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-200 mb-2">1.3 Automated Telemetry & Cookies</h3>
                <p className="leading-relaxed">We employ essential cookies to maintain your authenticated session. We do not use tracking cookies, pixel tags, or third-party advertising scripts. Standard server logs (IP address, user agent, timestamps) are retained for 14 days solely for security auditing and abuse prevention.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-3">
              <Server className="text-zinc-500" size={24} />
              2. Data Storage, Security & Sovereignty
            </h2>
            <p className="leading-relaxed mb-4">
              We employ enterprise-grade cloud infrastructure to ensure maximum security, redundancy, and strict compliance with regional data sovereignty laws.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-400">
              <li><strong>Encryption at Rest:</strong> All databases, object storage, and backups are encrypted using AES-256 block-level encryption.</li>
              <li><strong>Encryption in Transit:</strong> All communications between your browser and our APIs are secured via TLS 1.3 cryptographic protocols.</li>
              <li><strong>Tenant Isolation:</strong> Chat histories and vector stores are mathematically and logically siloed per user ID, guaranteeing zero cross-tenant data bleed.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100 mb-6 flex items-center gap-4 border-b border-white/[0.04] pb-4">
              <Eye className="text-zinc-600" size={20} />
              3. Third-Party API Subprocessors
            </h2>
            <p className="leading-relaxed mb-6 text-[15px] text-zinc-400">
              To deliver our frontier AI capabilities, we interface with highly vetted LLM providers (e.g., Anthropic, Groq, OpenAI via OpenRouter). Our enterprise Data Processing Agreements (DPAs) with these providers legally enforce the strictest privacy standards:
            </p>
            <div className="bg-[#050505] border border-white/[0.04] rounded-2xl p-6 shadow-sm">
              <ul className="space-y-4 text-[14px]">
                <li className="flex items-start gap-4">
                  <span className="text-white mt-0.5">→</span>
                  <span className="text-zinc-400"><strong className="text-zinc-200">Data Ephemerality:</strong> APIs are contractually bound to not retain your inputs or outputs beyond maximum 30 days for abuse monitoring purposes only.</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-white mt-0.5">→</span>
                  <span className="text-zinc-400"><strong className="text-zinc-200">Strict Non-Training Clauses:</strong> Your prompts, files, and intellectual property are strictly and legally excluded from their AI training pipelines.</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-3">
              <Globe className="text-zinc-500" size={24} />
              4. Global Privacy Rights (GDPR & CCPA)
            </h2>
            <p className="leading-relaxed mb-4">
              Depending on your jurisdiction, you possess explicit rights regarding your personal data. SmartLearn AI is committed to fulfilling these rights universally:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-400">
              <li><strong>Right to Access & Portability:</strong> You may request a complete export of your data payload in a machine-readable JSON format.</li>
              <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> You may trigger a cascading delete via your account settings, which instantly purges your relational data, vector indices, and authentication records from our active servers.</li>
              <li><strong>Right to Restrict Processing:</strong> You may opt out of any non-essential telemetry or communications.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-3">
              <Activity className="text-zinc-500" size={24} />
              5. Breach Notification Policy
            </h2>
            <p className="leading-relaxed">
              In the highly unlikely event of a cryptographic breach or unauthorized data exposure, we strictly adhere to a 72-hour notification protocol. Affected users will receive detailed disclosures regarding the nature of the breach, the specific data vectors compromised, and our immediate remediation architecture.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-3">
              <FileText className="text-zinc-500" size={24} />
              6. Contact Our Privacy Officer
            </h2>
            <p className="leading-relaxed">
              For legal inquiries, data deletion requests, or questions regarding our privacy architecture, please contact our Data Protection Officer directly at:
              <br /><br />
              <strong className="text-white select-all">naveedahmed.social@gmail.com</strong>
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-32 pt-12 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-zinc-600 font-medium">
          <p>© {new Date().getFullYear()} SmartLearn AI Inc. All rights reserved.</p>
          <p>For urgent inquiries: <span className="text-zinc-400 hover:text-white transition-colors cursor-pointer select-all">naveedahmed.social@gmail.com</span></p>
        </div>
      </div>
    </div>
  );
}
