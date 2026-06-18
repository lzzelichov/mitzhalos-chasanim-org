'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';

interface Common {
  name: string;
  label: string;
  defaultValue?: string;
  /** Commit to the parent store only on blur — never on every keystroke. */
  onCommit: (name: string, value: string) => void;
}

/**
 * Self-contained text input: keystrokes update LOCAL state only (no parent
 * re-render), and the value is committed to the parent on blur. memo() keeps
 * sibling fields from re-rendering. This eliminates the per-keystroke freeze.
 */
function TextFieldBase({
  name,
  label,
  defaultValue = '',
  onCommit,
  type = 'text',
  placeholder,
  maxLength,
  dir,
  hint,
}: Common & {
  type?: string;
  placeholder?: string;
  maxLength?: number;
  dir?: 'rtl' | 'ltr';
  hint?: string;
}) {
  const [v, setV] = useState(defaultValue);
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <input
        id={name}
        type={type}
        value={v}
        dir={dir}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => onCommit(name, v)}
        className="field"
      />
      {hint && <p className="mt-1 font-sans text-xs text-charcoal/50">{hint}</p>}
    </div>
  );
}
export const TextField = memo(TextFieldBase);

/** Auto-resizing textarea — replaces react-quill for story/bio fields. */
function TextAreaFieldBase({
  name,
  label,
  defaultValue = '',
  onCommit,
  placeholder,
}: Common & { placeholder?: string }) {
  const [v, setV] = useState(defaultValue);
  const ref = useRef<HTMLTextAreaElement>(null);

  const autosize = useCallback(() => {
    const el = ref.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    autosize();
  }, [autosize]);

  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <textarea
        id={name}
        ref={ref}
        value={v}
        placeholder={placeholder}
        onChange={(e) => {
          setV(e.target.value);
          autosize();
        }}
        onBlur={() => onCommit(name, v)}
        className="field min-h-32 resize-y"
      />
    </div>
  );
}
export const TextAreaField = memo(TextAreaFieldBase);
