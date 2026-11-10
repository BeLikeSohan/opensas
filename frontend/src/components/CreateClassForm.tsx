import { useState, type FormEvent } from 'react';
import { createClass, isApiError } from '../api';
import type { ClassResponse } from '../types';
import { toBanglaNumber } from '../utils/format';

const NAME_MAX_LENGTH = 200;

interface FieldErrors {
  name?: string;
  totalSeats?: string;
}

interface CreateClassFormProps {
  onCreated: (created: ClassResponse) => void;
}

function validate(name: string, totalSeats: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!name.trim()) errors.name = 'শ্রেণির নাম দিন।';
  else if (name.trim().length > NAME_MAX_LENGTH) {
    errors.name = `শ্রেণির নাম সর্বোচ্চ ${toBanglaNumber(NAME_MAX_LENGTH)} অক্ষরের হতে পারে।`;
  }

  const seats = Number(totalSeats);
  if (!totalSeats.trim()) errors.totalSeats = 'মোট আসন সংখ্যা দিন।';
  else if (!Number.isInteger(seats) || seats < 1) errors.totalSeats = 'আসন সংখ্যা ১ বা তার বেশি পূর্ণসংখ্যা হতে হবে।';
  return errors;
}

/** Maps ASP.NET validation keys ("Name", "TotalSeats", "$.totalSeats") to our fields. */
function serverFieldErrors(fieldErrors: Record<string, string[]>): FieldErrors {
  const errors: FieldErrors = {};
  for (const [key, messages] of Object.entries(fieldErrors)) {
    const k = key.toLowerCase();
    if (k.includes('totalseats')) errors.totalSeats = messages.join(' ');
    else if (k.includes('name')) errors.name = messages.join(' ');
  }
  return errors;
}

function CreateClassForm({ onCreated }: CreateClassFormProps) {
  const [name, setName] = useState('');
  const [totalSeats, setTotalSeats] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const clientErrors = validate(name, totalSeats);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSubmitting(true);
    try {
      const created = await createClass({ name: name.trim(), totalSeats: Number(totalSeats) });
      setName('');
      setTotalSeats('');
      setErrors({});
      onCreated(created);
    } catch (err) {
      if (isApiError(err) && err.status === 409 && err.title === 'Class already exists') {
        setErrors({ name: `"${name.trim()}" নামে একটি শ্রেণি আগে থেকেই আছে।` });
      } else if (isApiError(err) && err.status === 400 && Object.keys(err.fieldErrors).length > 0) {
        setErrors(serverFieldErrors(err.fieldErrors));
        setFormError(err.message);
      } else {
        setFormError(isApiError(err) ? err.message : 'অজানা সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="class-card">
      <h2>নতুন শ্রেণি যোগ করুন</h2>
      <form className="create-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="class-name">শ্রেণির নাম</label>
          <input
            id="class-name"
            type="text"
            placeholder="যেমন: ষষ্ঠ শ্রেণি · প্রভাতী"
            maxLength={NAME_MAX_LENGTH}
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={errors.name !== undefined}
            aria-describedby={errors.name ? 'class-name-error' : undefined}
          />
          {errors.name && (
            <span id="class-name-error" className="field-error">
              {errors.name}
            </span>
          )}
        </div>

        <div className="field field--seats">
          <label htmlFor="class-seats">মোট আসন</label>
          <input
            id="class-seats"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            placeholder="যেমন: ৫০"
            value={totalSeats}
            onChange={(e) => setTotalSeats(e.target.value)}
            aria-invalid={errors.totalSeats !== undefined}
            aria-describedby={errors.totalSeats ? 'class-seats-error' : undefined}
          />
          {errors.totalSeats && (
            <span id="class-seats-error" className="field-error">
              {errors.totalSeats}
            </span>
          )}
        </div>

        <button type="submit" className="btn-primary create-form__submit" disabled={submitting} aria-busy={submitting}>
          {submitting ? 'যোগ করা হচ্ছে…' : 'শ্রেণি যোগ করুন'}
        </button>
      </form>

      {formError && (
        <p className="field-error" role="alert">
          {formError}
        </p>
      )}
    </section>
  );
}

export default CreateClassForm;
