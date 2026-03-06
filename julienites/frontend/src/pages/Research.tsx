import React, { useEffect, useMemo, useState } from 'react';
import { PlusCircle, FileText, BarChart, Copy, Link as LinkIcon, ClipboardList } from 'lucide-react';
import FormBuilder, { FormDefinition } from '../components/FormBuilder';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { formsApi, Form as ApiForm, FormCreateReq, datasetsApi, DatasetAnalysis } from '../services/api';

const loadForms = (): FormDefinition[] => {
  try {
    const raw = localStorage.getItem('researchForms');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveForms = (forms: FormDefinition[]) => {
  localStorage.setItem('researchForms', JSON.stringify(forms));
};

const loadResponsesCount = (formId: string): number => {
  try {
    const raw = localStorage.getItem('researchResponses');
    if (!raw) return 0;
    const obj = JSON.parse(raw);
    const list = Array.isArray(obj[formId]) ? obj[formId] : [];
    return list.length;
  } catch {
    return 0;
  }
};

const Research: React.FC = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState<ApiForm[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [recent, setRecent] = useState<Array<{ formId: string; formTitle: string; submittedAt: string }>>([]);
  const [showDatasetModal, setShowDatasetModal] = useState(false);
  const [analysis, setAnalysis] = useState<DatasetAnalysis | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadData = async () => {
    const res = await formsApi.list();
    if (res.data) setForms(res.data);
    const r = await formsApi.recentResponses(5);
    if (r.data) {
      setRecent(
        r.data.map((it) => ({
          formId: it.form_id,
          formTitle: res.data?.find((f) => f.id === it.form_id)?.title || 'Untitled',
          submittedAt: it.submitted_at,
        }))
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const total = forms.length;
    const responses = forms.reduce((acc, f) => acc + (f.responses_count || 0), 0);
    const drafts = 0; // placeholder if we add draft status later
    return { total, responses, drafts };
  }, [forms]);

  const onSaveForm = async (form: FormDefinition) => {
    const payload: FormCreateReq = {
      title: form.title,
      description: form.description,
      allow_public_submissions: false,
      fields: form.fields.map((f, idx) => ({ label: f.label, type: f.type, required: f.required, options: f.options, order: idx })),
    };
    const res = await formsApi.create(payload);
    if (res.data) {
      setShowBuilder(false);
      loadData();
    }
  };

  const shareUrl = (id: string) => `${window.location.origin}/research/forms/${id}`;

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-background-primary text-text-primary">
      <header className="sticky top-0 z-50 bg-background-primary/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Research</h1>
          <button className="bg-twitter-blue text-white rounded-md px-3 py-2 text-sm font-bold hover:bg-twitter-blueHover flex items-center gap-2" onClick={() => setShowBuilder(true)}>
            <PlusCircle size={16} /> New Form
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-3 pb-safe">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-16 space-y-3">
              <Navigation />
              <div className="bg-background-secondary rounded-2xl p-3 border border-border">
                <h2 className="font-bold text-sm mb-2">Quick Actions</h2>
                <div className="space-y-2">
                  <button className="w-full text-left px-2 py-2 rounded-lg hover:bg-background-tertiary text-sm flex items-center gap-2" onClick={() => setShowBuilder(true)}>
                    <PlusCircle size={16} /> New Form
                  </button>
                  <button className="w-full text-left px-2 py-2 rounded-lg hover:bg-background-tertiary text-sm flex items-center gap-2" onClick={() => setShowDatasetModal(true)}>
                    <ClipboardList size={16} /> Analyze dataset
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="col-span-full lg:col-span-2 space-y-3">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-background-secondary border border-border rounded-xl p-4">
                <div className="text-sm text-text-tertiary">Total Forms</div>
                <div className="text-2xl font-extrabold mt-1 flex items-center gap-2"><FileText size={18} /> {stats.total}</div>
              </div>
              <div className="bg-background-secondary border border-border rounded-xl p-4">
                <div className="text-sm text-text-tertiary">Total Responses</div>
                <div className="text-2xl font-extrabold mt-1 flex items-center gap-2"><BarChart size={18} /> {stats.responses}</div>
              </div>
              <div className="bg-background-secondary border border-border rounded-xl p-4">
                <div className="text-sm text-text-tertiary">Drafts</div>
                <div className="text-2xl font-extrabold mt-1">{stats.drafts}</div>
              </div>
            </div>

            {/* Forms list */}
            <div className="bg-background-secondary border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold">Your Forms</h2>
                <button className="text-sm text-twitter-blue hover:underline" onClick={() => setShowBuilder(true)}>Create new</button>
              </div>

              {forms.length === 0 ? (
                <div className="text-text-tertiary text-sm border border-dashed border-border rounded-lg p-6 text-center">
                  No forms yet. Click "Create new" to start a survey or information form.
                </div>
              ) : (
                <div className="space-y-2">
                  {forms.map((f) => (
                    <div key={f.id} className="flex items-center justify-between border border-border rounded-lg p-3">
                      <div>
                        <div className="font-semibold">{f.title}</div>
                        <div className="text-xs text-text-tertiary">{new Date(f.created_at).toLocaleString()} • {f.responses_count} responses</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="text-xs bg-background-primary border border-border rounded-md px-2 py-1 hover:bg-background-tertiary flex items-center gap-1"
                          onClick={() => navigate(`/research/forms/${f.id}`)}
                        >
                          <LinkIcon size={14} /> Open
                        </button>
                        <button
                          className="text-xs bg-background-primary border border-border rounded-md px-2 py-1 hover:bg-background-tertiary flex items-center gap-1"
                          onClick={() => copyToClipboard(shareUrl(f.id), f.id)}
                        >
                          <Copy size={14} /> {copiedId === f.id ? 'Copied' : 'Copy link'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
                    </div>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-16 space-y-3">
              <div className="bg-background-secondary rounded-2xl p-3 border border-border">
                <h2 className="font-bold text-sm mb-2">Recent Responses</h2>
                {recent.length === 0 ? (
                  <div className="text-xs text-text-tertiary">No recent submissions.</div>
                ) : (
                  <div className="space-y-1">
                    {recent.map((r, idx) => (
                      <div key={idx} className="px-2 py-1.5 rounded-lg hover:bg-background-tertiary cursor-pointer" onClick={() => navigate(`/research/forms/${r.formId}`)}>
                        <div className="font-semibold text-sm truncate">{r.formTitle}</div>
                        <div className="text-xs text-text-tertiary">{new Date(r.submittedAt).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-background-secondary rounded-2xl p-3 border border-border">
                <h2 className="font-bold text-sm mb-2">Dataset Analysis</h2>
                {!analysis ? (
                  <div className="text-xs text-text-tertiary">Upload a CSV to see a quick summary.</div>
                ) : (
                  <div className="space-y-1 text-xs">
                    <div className="text-text-tertiary">{analysis.filename} • rows: {analysis.rows} • cols: {analysis.columns.length}</div>
                    <div>
                      <div className="font-semibold mb-1">Columns</div>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {analysis.summaries.slice(0, 5).map((c) => (
                          <li key={c.name}>
                            <span className="font-medium">{c.name}</span>
                            {c.numeric ? ` • num(${c.numeric.count}) min:${c.numeric.min} max:${c.numeric.max}` : ''}
                            {c.top_values ? ` • top: ${c.top_values.map(t => `${t.value}(${t.count})`).join(', ')}` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {showBuilder && (
        <FormBuilder onCancel={() => setShowBuilder(false)} onSave={onSaveForm} />
      )}

      {showDatasetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md bg-background-secondary border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold">Analyze dataset</h3>
              <button className="text-text-tertiary hover:text-text-primary" onClick={() => setShowDatasetModal(false)}>✕</button>
            </div>
            <p className="text-xs text-text-tertiary mb-3">Upload a CSV (or TSV). Excel will be supported later.</p>
            <input
              type="file"
              accept=".csv,.tsv,text/csv,text/tab-separated-values"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                const res = await datasetsApi.analyze(file);
                setUploading(false);
                if (res.data) {
                  setAnalysis(res.data);
                  setShowDatasetModal(false);
                } else {
                  alert(res.error || 'Failed to analyze file');
                }
              }}
              className="w-full text-sm"
            />
            <div className="mt-3 text-right">
              <button className="bg-background-primary border border-border rounded-md px-3 py-1.5 text-sm hover:bg-background-tertiary" onClick={() => setShowDatasetModal(false)} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Research;
