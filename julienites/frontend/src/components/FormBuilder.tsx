import React, { useMemo, useState } from 'react';
import { X, PlusCircle, Trash2, Eye } from 'lucide-react';

export type FieldType = 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // for select/radio/checkbox
  placeholder?: string;
}

export interface FormDefinition {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  createdAt: string;
  updatedAt?: string;
}

interface FormBuilderProps {
  initialForm?: FormDefinition;
  onCancel: () => void;
  onSave: (form: FormDefinition) => void;
}

const DEFAULT_TYPES: { label: string; value: FieldType }[] = [
  { label: 'Short text', value: 'text' },
  { label: 'Email', value: 'email' },
  { label: 'Number', value: 'number' },
  { label: 'Paragraph', value: 'textarea' },
  { label: 'Date', value: 'date' },
  { label: 'Dropdown', value: 'select' },
  { label: 'Checkboxes', value: 'checkbox' },
  { label: 'Radio', value: 'radio' },
];

const genId = () => Math.random().toString(36).slice(2, 9);

const FormBuilder: React.FC<FormBuilderProps> = ({ initialForm, onCancel, onSave }) => {
  const [title, setTitle] = useState(initialForm?.title || 'Untitled Form');
  const [description, setDescription] = useState(initialForm?.description || '');
  const [fields, setFields] = useState<FormField[]>(initialForm?.fields || []);
  const [preview, setPreview] = useState(false);
  const [newFieldType, setNewFieldType] = useState<FieldType>('text');

  const canSave = useMemo(() => title.trim().length > 0 && fields.length > 0, [title, fields.length]);

  const addField = () => {
    const base: FormField = {
      id: genId(),
      label: 'New Question',
      type: newFieldType,
      required: false,
      placeholder: undefined,
      options: ['Option 1', 'Option 2'].slice(0, ['select', 'checkbox', 'radio'].includes(newFieldType) ? 2 : 0),
    };
    setFields((f) => [...f, base]);
  };

  const updateField = (id: string, patch: Partial<FormField>) => {
    setFields((arr) => arr.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const removeField = (id: string) => {
    setFields((arr) => arr.filter((f) => f.id !== id));
  };

  const save = () => {
    const form: FormDefinition = {
      id: initialForm?.id || genId(),
      title: title.trim(),
      description: description.trim(),
      fields,
      createdAt: initialForm?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(form);
  };

  const FieldEditor: React.FC<{ field: FormField }> = ({ field }) => {
    const showOptions = field.type === 'select' || field.type === 'checkbox' || field.type === 'radio';
    const [labelValue, setLabelValue] = useState<string>(field.label);
    const [placeholderValue, setPlaceholderValue] = useState<string>(field.placeholder || '');

    // keep local state in sync if field changes (switching between items)
    React.useEffect(() => {
      setLabelValue(field.label);
      setPlaceholderValue(field.placeholder || '');
    }, [field.id]);

    return (
      <div className="border border-border rounded-lg p-3 bg-background-tertiary">
        <div className="flex gap-2">
          <textarea
            className="flex-1 bg-background-secondary border border-border rounded-md px-3 py-2 text-sm resize-y min-h-[44px]"
            placeholder="Question label"
            value={labelValue}
            onChange={(e) => setLabelValue(e.target.value)}
            onBlur={() => updateField(field.id, { label: labelValue })}
            rows={2}
          />
          <select
            className="bg-background-secondary border border-border rounded-md px-2 py-2 text-sm"
            value={field.type}
            onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
          >
            {DEFAULT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <input
            className="flex-1 bg-background-secondary border border-border rounded-md px-3 py-2 text-sm"
            placeholder="Placeholder (optional)"
            value={placeholderValue}
            onChange={(e) => setPlaceholderValue(e.target.value)}
            onBlur={() => updateField(field.id, { placeholder: placeholderValue })}
          />
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={field.required} onChange={(e) => updateField(field.id, { required: e.target.checked })} />
            Required
          </label>
          <button className="text-red-400 hover:text-red-300" onClick={() => removeField(field.id)}>
            <Trash2 size={18} />
          </button>
        </div>
        {showOptions && (
          <div className="mt-2">
            <div className="text-xs text-text-tertiary mb-1">Options</div>
            {(field.options || []).map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-1">
                <input
                  className="flex-1 bg-background-secondary border border-border rounded-md px-3 py-1 text-sm"
                  value={opt}
                  onChange={(e) => {
                    const copy = [...(field.options || [])];
                    copy[idx] = e.target.value;
                    updateField(field.id, { options: copy });
                  }}
                />
                <button
                  className="text-red-400 hover:text-red-300"
                  onClick={() => {
                    const copy = [...(field.options || [])];
                    copy.splice(idx, 1);
                    updateField(field.id, { options: copy });
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              className="mt-1 text-xs bg-background-secondary border border-border rounded-md px-2 py-1 hover:bg-background-tertiary"
              onClick={() => updateField(field.id, { options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`] })}
            >
              Add option
            </button>
          </div>
        )}
      </div>
    );
  };

  const Preview: React.FC = () => (
    <div className="space-y-3">
      <h3 className="text-lg font-bold">{title || 'Untitled Form'}</h3>
      {description && <p className="text-text-tertiary text-sm">{description}</p>}
      {fields.map((f) => (
        <div key={f.id} className="border border-border rounded-lg p-3">
          <label className="block text-sm font-medium mb-1">
            {f.label}{f.required && <span className="text-red-400"> *</span>}
          </label>
          {f.type === 'textarea' ? (
            <textarea className="w-full bg-background-secondary border border-border rounded-md px-3 py-2 text-sm" placeholder={f.placeholder} />
          ) : f.type === 'select' ? (
            <select className="w-full bg-background-secondary border border-border rounded-md px-3 py-2 text-sm">
              <option value="">Select...</option>
              {(f.options || []).map((o, i) => <option key={i} value={o}>{o}</option>)}
            </select>
          ) : f.type === 'checkbox' ? (
            <div className="space-y-1">
              {(f.options || []).map((o, i) => (
                <label key={i} className="flex items-center gap-2 text-sm"><input type="checkbox" /> {o}</label>
              ))}
            </div>
          ) : f.type === 'radio' ? (
            <div className="space-y-1">
              {(f.options || []).map((o, i) => (
                <label key={i} className="flex items-center gap-2 text-sm"><input name={f.id} type="radio" /> {o}</label>
              ))}
            </div>
          ) : (
            <input
              className="w-full bg-background-secondary border border-border rounded-md px-3 py-2 text-sm"
              type={f.type}
              placeholder={f.placeholder}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl bg-background-secondary border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Form Builder</h2>
          <button className="text-text-tertiary hover:text-text-primary" onClick={onCancel} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <input
              className="w-full bg-background-primary border border-border rounded-lg px-3 py-2 text-base font-semibold"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Form title"
            />
            <textarea
              className="w-full bg-background-primary border border-border rounded-lg px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Form description (optional)"
              rows={2}
            />

            <div className="space-y-2">
              {fields.length === 0 ? (
                <div className="text-sm text-text-tertiary border border-dashed border-border rounded-lg p-4 text-center">
                  No questions added yet.
                </div>
              ) : (
                fields.map((f) => <FieldEditor key={f.id} field={f} />)
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="border border-border rounded-xl p-3">
              <div className="text-sm font-semibold mb-2">Add field</div>
              <div className="flex gap-2">
                <select
                  className="flex-1 bg-background-primary border border-border rounded-md px-2 py-2 text-sm"
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                >
                  {DEFAULT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <button className="bg-twitter-blue text-white rounded-md px-3 py-2 text-sm font-bold hover:bg-twitter-blueHover flex items-center gap-1" onClick={addField}>
                  <PlusCircle size={16} /> Add
                </button>
              </div>
            </div>

            <div className="border border-border rounded-xl p-3 space-y-2">
              <button className={`w-full rounded-md px-3 py-2 text-sm font-bold flex items-center justify-center gap-2 ${preview ? 'bg-background-tertiary' : 'bg-background-primary border border-border hover:bg-background-tertiary'}`} onClick={() => setPreview(!preview)}>
                <Eye size={16} /> {preview ? 'Hide Preview' : 'Show Preview'}
              </button>
              <button disabled={!canSave} className={`w-full rounded-md px-3 py-2 text-sm font-bold ${canSave ? 'bg-success-color text-white hover:opacity-90' : 'bg-background-tertiary text-text-tertiary cursor-not-allowed'}`} onClick={save}>
                Save form
              </button>
              <button className="w-full rounded-md px-3 py-2 text-sm font-bold bg-background-primary border border-border hover:bg-background-tertiary" onClick={onCancel}>
                Cancel
              </button>
            </div>

            {preview && (
              <div className="border border-border rounded-xl p-3">
                <Preview />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
