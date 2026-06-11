import React from 'react';
import { Scale, AlertTriangle, FileSignature, Landmark, Globe } from 'lucide-react';
import Logo from '../components/Logo';

export default function Terms() {
  return (
    <div className="dark min-h-screen bg-black text-zinc-300 selection:bg-primary/30 selection:text-white font-sans">
      <div className="max-w-4xl mx-auto px-6 py-20 sm:py-32">
        
        {/* Header */}
        <div className="mb-16 border-b border-zinc-800 pb-12">
          <div className="flex items-center gap-3 mb-8">
            <Logo size={40} className="text-white" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-100 mb-6">
            Terms & Conditions
          </h1>
          <div className="flex items-center gap-4 text-sm text-zinc-500 font-mono">
            <span>EFFECTIVE DATE: JUNE 11, 2026</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
            <span>VERSION 3.1.0</span>
          </div>
        </div>

        {/* Introduction */}
        <section className="mb-16">
          <p className="text-lg leading-relaxed mb-6">
            These Terms and Conditions ("Terms", "Agreement") govern your access to and use of the SmartLearn AI platform, applications, APIs, and related services (collectively, the "Service"). Please read them carefully.
          </p>
          <p className="text-lg leading-relaxed">
            By accessing or using the Service, you signify that you have read, understood, and agree to be bound by this Agreement. If you are entering into this Agreement on behalf of a corporation, university, or other legal entity, you represent that you have the authority to bind such entity and its affiliates to these Terms.
          </p>
        </section>

        {/* Detailed Sections */}
        <div className="space-y-16">
          <section>
            <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-3">
              <Scale className="text-zinc-500" size={24} />
              1. Acceptable Use Policy
            </h2>
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 mb-6">
              <p className="leading-relaxed mb-4">
                You agree not to engage in any of the following prohibited activities while using the Service:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-zinc-400">
                <li>Uploading classified, illegal, or illicit materials.</li>
                <li>Attempting to reverse engineer, decompile, or bypass the platform's security mechanisms or rate limits.</li>
                <li>Utilizing the platform for automated scraping, mass data extraction, or to train competing artificial intelligence models.</li>
                <li>Impersonating another user, attempting to breach tenant isolation, or violating applicable intellectual property laws.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-3">
              <FileSignature className="text-zinc-500" size={24} />
              2. Intellectual Property Rights
            </h2>
            <p className="leading-relaxed mb-4">
              <strong>Your Content:</strong> You retain full ownership of all documents, text, and media you upload to SmartLearn AI. We claim absolutely no ownership rights over your proprietary files or the specific outputs generated directly from your prompts.
            </p>
            <p className="leading-relaxed">
              <strong>Our IP:</strong> The SmartLearn AI platform—including its source code, RAG pipeline architecture, branding, logos, and UI/UX design—is the exclusive property of SmartLearn AI Inc. and is protected by international copyright and trademark laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-3">
              <Landmark className="text-zinc-500" size={24} />
              3. Service Tiers & Subscription Billing
            </h2>
            <p className="leading-relaxed mb-4">
              Access to advanced premium features, such as the <strong>Founder's Edition</strong>, requires a paid subscription. Billing occurs on a recurring basis as outlined during the checkout process.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-400">
              <li>All payments are non-refundable unless legally mandated in your jurisdiction.</li>
              <li>We reserve the right to modify pricing with 30 days prior notice.</li>
              <li>Accounts that violate the Acceptable Use Policy may be terminated without refund.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-3">
              <AlertTriangle className="text-zinc-500" size={24} />
              4. Limitation of Liability
            </h2>
            <p className="leading-relaxed text-zinc-400 border-l-2 border-primary/50 pl-6 italic">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SMARTLEARN AI INC., ITS AFFILIATES, AGENTS, DIRECTORS, EMPLOYEES, OR SUPPLIERS BE LIABLE FOR ANY DIRECT, INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO THE USE OF, OR INABILITY TO USE, THIS SERVICE.
            </p>
            <p className="leading-relaxed mt-6">
              AI-generated content is provided for informational purposes only. We do not guarantee the factual accuracy, completeness, or reliability of any outputs generated by the models. Users must independently verify critical information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-3">
              <Globe className="text-zinc-500" size={24} />
              5. Governing Law
            </h2>
            <p className="leading-relaxed">
              This Agreement shall be governed by the laws of the State of Delaware, without respect to its conflict of laws principles. Any disputes arising out of this Agreement shall be resolved in the state or federal courts located in New Castle County, Delaware.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-24 pt-12 border-t border-zinc-900 text-center text-sm text-zinc-600">
          <p>© {new Date().getFullYear()} SmartLearn AI Inc. All rights reserved.</p>
          <p className="mt-2">Contact legal at legal@smartlearn-ai.com</p>
        </div>
      </div>
    </div>
  );
}
