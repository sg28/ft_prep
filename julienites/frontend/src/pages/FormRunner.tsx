import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formsApi, Form as ApiForm, FormField as ApiField } from '../services/api';

const FormRunner: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<ApiForm | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!formId) return;
      const res = await formsApi.get(formId);
      if (res.data) setForm(res.data);
    };
    load();
  }, [formId]);

  if (!form) {
    return (
      <div className="min-h-screen bg-background-primary text-text-primary flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Form not found</h1>
          <button className="text-twitter-blue hover:underline" onClick={() => navigate('/research')}>Go to Research dashboard</button>
        </div>
      </div>
    );
  }

  const onChange = (field: ApiField, value: any) => {
    const key = (field.id as string) || field.label;
    setValues((v) => ({ ...v, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    // Basic required validation
    for (const f of form.fields) {
      const key = (f.id as string) || f.label;
      if (f.required && (values[key] === undefined || values[key] === '' || (Array.isArray(values[key]) && values[key].length === 0))) {
        alert(`Please fill: ${f.label}`);
        setSubmitting(false);
        return;
      }
    }

    const res = await formsApi.submitResponse(form.id, values);
    if (res.data) {
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background-primary text-text-primary flex items-center justify-center p-6">
        <div className="bg-background-secondary border border-border rounded-2xl p-6 text-center max-w-md w-full">
          <h2 className="text-xl font-bold mb-2">Thanks for your response!</h2>
          <p className="text-text-tertiary text-sm mb-4">Your submission has been recorded.</p>
          <button className="bg-twitter-blue text-white rounded-md px-4 py-2 font-bold hover:bg-twitter-blueHover" onClick={() => navigate('/research')}>Back to Research</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary text-text-primary">
      <div className="max-w-[760px] mx-auto px-4 py-6">
        <div className="bg-background-secondary border border-border rounded-2xl p-5">
          <h1 className="text-2xl font-extrabold mb-1">{form.title}</h1>
          {form.description && <p className="text-text-tertiary mb-4">{form.description}</p>}
          <form onSubmit={onSubmit} className="space-y-4">
            {form.fields.map((f, idx) => {
              const key = (f.id as string) || f.label;
              return (
                <div key={(f.id as string) || `${idx}-${f.label}`} className="border border-border rounded-lg p-3">
                  <label className="block text-sm font-semibold mb-1">{f.label}{f.required && <span className="text-red-400"> *</span>}</label>
                  {f.type === 'textarea' ? (
                    <textarea className="w-full bg-background-primary border border-border rounded-md px-3 py-2 text-sm" value={values[key] || ''} onChange={(e) => onChange(f as ApiField, e.target.value)} />
                  ) : f.type === 'select' ? (
                    <select className="w-full bg-background-primary border border-border rounded-md px-3 py-2 text-sm" value={values[key] || ''} onChange={(e) => onChange(f as ApiField, e.target.value)}>
                      <option value="">Select...</option>
                      {(f.options || []).map((o, i) => <option key={i} value={o}>{o}</option>)}
                    </select>
                  ) : f.type === 'checkbox' ? (
                    <div className="space-y-1">
                      {(f.options || []).map((o, i) => {
                        const current: string[] = values[key] || [];
                        const checked = current.includes(o);
                        return (
                          <label key={i} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={checked} onChange={(e) => {
                              if (e.target.checked) onChange(f as ApiField, [...current, o]);
                              else onChange(f as ApiField, current.filter((x) => x !== o));
                            }} /> {o}
                          </label>
                        );
                      })}
                    </div>
                  ) : f.type === 'radio' ? (
                    <div className="space-y-1">
                      {(f.options || []).map((o, i) => (
                        <label key={i} className="flex items-center gap-2 text-sm">
                          <input type="radio" name={key} checked={values[key] === o} onChange={() => onChange(f as ApiField, o)} /> {o}
                        </label>
            ))}
                    </div>
                  ) : (
                    <input className="w-full bg-background-primary border border-border rounded-md px-3 py-2 text-sm" type={f.type} value={values[key] || ''} onChange={(e) => onChange(f as ApiField, e.target.value)} />
                  )}
                </div>
              );
            })}
            <div className="pt-2 flex justify-end gap-2">
              <button type="button" className="bg-background-primary border border-border rounded-md px-4 py-2 text-sm hover:bg-background-tertiary" onClick={() => navigate('/research')}>Cancel</button>
              <button type="submit" disabled={submitting} className="bg-twitter-blue text-white rounded-md px-4 py-2 text-sm font-bold hover:bg-twitter-blueHover disabled:opacity-60">{submitting ? 'Submitting...' : 'Submit'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormRunner;
