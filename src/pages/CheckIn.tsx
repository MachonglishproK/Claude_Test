import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSettings } from '../hooks/useSettings';
import {
  addCheckIn,
  getWizardDraft,
  saveWizardDraft,
  clearWizardDraft,
  getCheckIns,
} from '../lib/storage';
import { getWeekStart, formatWeekRange } from '../lib/date';
import type { CheckIn as CheckInType } from '../types';

const schema = z.object({
  mood: z.number().min(1).max(5),
  sleep: z.number().min(1).max(5),
  mealSummary: z.string().min(1, 'Required'),
  exerciseSummary: z.string().min(1, 'Required'),
  exerciseCount: z.number().min(0).max(50),
  obstacles: z.string(),
  notes: z.string(),
});

type FormData = z.infer<typeof schema>;

const TOTAL_STEPS = 5;

export function CheckIn() {
  const { t, settings } = useSettings();
  const [step, setStep] = useState(1);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [existingCheckIn, setExistingCheckIn] = useState<CheckInType | null>(null);

  const weekStart = getWeekStart();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      mood: 3,
      sleep: 3,
      mealSummary: '',
      exerciseSummary: '',
      exerciseCount: 0,
      obstacles: '',
      notes: '',
    },
  });

  const formValues = watch();

  useEffect(() => {
    checkDraft();
  }, []);

  async function checkDraft() {
    const [draft, checkIns] = await Promise.all([getWizardDraft(), getCheckIns()]);

    const existing = checkIns.find((c) => c.weekStart === weekStart);
    if (existing) {
      setExistingCheckIn(existing);
      reset({
        mood: existing.mood,
        sleep: existing.sleep,
        mealSummary: existing.mealSummary,
        exerciseSummary: existing.exerciseSummary,
        exerciseCount: existing.exerciseCount,
        obstacles: existing.obstacles,
        notes: existing.notes,
      });
    }

    if (draft && !existing) {
      setShowDraftDialog(true);
    }
  }

  function resumeDraft() {
    getWizardDraft().then((draft) => {
      if (draft) {
        setStep(draft.step);
        reset(draft.data as FormData);
      }
      setShowDraftDialog(false);
    });
  }

  function startNew() {
    clearWizardDraft();
    setShowDraftDialog(false);
  }

  async function saveDraft() {
    await saveWizardDraft({
      step,
      data: formValues as unknown as Record<string, unknown>,
      savedAt: new Date().toISOString(),
    });
    setMessage(t.checkin.draftSaved);
    setTimeout(() => setMessage(''), 2000);
  }

  function nextStep() {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      saveDraft();
    }
  }

  function prevStep() {
    if (step > 1) {
      setStep(step - 1);
      saveDraft();
    }
  }

  async function onSubmit(data: FormData) {
    const checkIn: CheckInType = {
      id: existingCheckIn?.id || crypto.randomUUID(),
      weekStart,
      mood: data.mood as 1 | 2 | 3 | 4 | 5,
      sleep: data.sleep as 1 | 2 | 3 | 4 | 5,
      mealSummary: data.mealSummary,
      exerciseSummary: data.exerciseSummary,
      exerciseCount: data.exerciseCount,
      obstacles: data.obstacles,
      notes: data.notes,
      createdAt: existingCheckIn?.createdAt || new Date().toISOString(),
    };

    await addCheckIn(checkIn);
    await clearWizardDraft();
    setMessage(t.checkin.submitted);
    setExistingCheckIn(checkIn);
  }

  const stepTitles = [t.checkin.step1, t.checkin.step2, t.checkin.step3, t.checkin.step4, t.checkin.step5];

  return (
    <div className="checkin">
      <h2>{t.checkin.title}</h2>
      <p className="week-label">{formatWeekRange(weekStart, settings.language)}</p>

      {showDraftDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <p>{t.checkin.resumeDraft}</p>
            <div className="dialog-buttons">
              <button className="btn btn-primary" onClick={resumeDraft}>{t.checkin.resume}</button>
              <button className="btn btn-secondary" onClick={startNew}>{t.checkin.startNew}</button>
            </div>
          </div>
        </div>
      )}

      <div className="wizard-steps">
        {stepTitles.map((title, index) => (
          <div key={index} className={`wizard-step ${index + 1 === step ? 'active' : ''} ${index + 1 < step ? 'completed' : ''}`}>
            <span className="step-number">{index + 1}</span>
            <span className="step-title">{title}</span>
          </div>
        ))}
      </div>

      {message && <div className="message success">{message}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="wizard-form">
        {step === 1 && (
          <div className="form-step">
            <div className="form-group">
              <label>{t.checkin.mood}</label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button key={value} type="button" className={`rating-btn ${formValues.mood === value ? 'selected' : ''}`} onClick={() => setValue('mood', value)}>{value}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>{t.checkin.sleep}</label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button key={value} type="button" className={`rating-btn ${formValues.sleep === value ? 'selected' : ''}`} onClick={() => setValue('sleep', value)}>{value}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-step">
            <div className="form-group">
              <label>{t.checkin.mealSummary}</label>
              <textarea {...register('mealSummary')} rows={4} className={errors.mealSummary ? 'error' : ''} />
              {errors.mealSummary && <span className="error-message">{errors.mealSummary.message}</span>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-step">
            <div className="form-group">
              <label>{t.checkin.exerciseSummary}</label>
              <textarea {...register('exerciseSummary')} rows={4} className={errors.exerciseSummary ? 'error' : ''} />
              {errors.exerciseSummary && <span className="error-message">{errors.exerciseSummary.message}</span>}
            </div>
            <div className="form-group">
              <label>{t.checkin.exerciseCount}</label>
              <input type="number" {...register('exerciseCount', { valueAsNumber: true })} min={0} max={50} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="form-step">
            <div className="form-group">
              <label>{t.checkin.obstacles}</label>
              <textarea {...register('obstacles')} rows={4} />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="form-step">
            <div className="form-group">
              <label>{t.checkin.notes}</label>
              <textarea {...register('notes')} rows={4} />
            </div>
            <div className="review-summary">
              <h4>Summary</h4>
              <p><strong>{t.checkin.mood}:</strong> {formValues.mood}/5</p>
              <p><strong>{t.checkin.sleep}:</strong> {formValues.sleep}/5</p>
              <p><strong>{t.checkin.exerciseCount}:</strong> {formValues.exerciseCount}</p>
            </div>
          </div>
        )}

        <div className="wizard-buttons">
          {step > 1 && <button type="button" className="btn btn-secondary" onClick={prevStep}>{t.checkin.prev}</button>}
          {step < TOTAL_STEPS && <button type="button" className="btn btn-primary" onClick={nextStep}>{t.checkin.next}</button>}
          {step === TOTAL_STEPS && <button type="submit" className="btn btn-primary">{t.checkin.submit}</button>}
        </div>
      </form>
    </div>
  );
}
