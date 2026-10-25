import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, FlaskConical, MailCheck } from 'lucide-react';
import Logo from '@/components/common/Logo';
import { forgotSchema } from '@/utils/schemas';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(forgotSchema), defaultValues: { email: '' } });

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="card p-6 sm:p-8">
          {sent ? (
            <div className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-50 text-accent"><MailCheck size={22} aria-hidden="true" /></span>
              <h1 className="mt-4 text-xl font-bold text-ink">Demo only: no email was sent</h1>
              <p className="mt-2 text-sm text-muted">
                In a production deployment a reset link would be emailed after backend verification. This prototype has no email service and stores no passwords, so there is nothing to reset.
              </p>
              <Link to="/login" className="btn btn-primary mt-6 w-full">Return to sign in</Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-ink">Forgot your password?</h1>
              <p className="mt-1 text-sm text-muted">Enter your email to see how password recovery would work.</p>
              <div className="mt-4 flex gap-3 rounded-lg border border-warning/30 bg-warning-50 p-3.5">
                <FlaskConical size={18} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
                <p className="text-xs leading-relaxed text-ink">This is a simulated screen. No message will be sent and no account exists in this prototype.</p>
              </div>
              <form onSubmit={handleSubmit(() => setSent(true))} noValidate className="mt-5 space-y-4">
                <div>
                  <label htmlFor="fp-email" className="label">Email</label>
                  <input id="fp-email" type="email" aria-invalid={Boolean(errors.email)} className={`input ${errors.email ? 'input-error' : ''}`} {...register('email')} />
                  {errors.email && <p role="alert" className="field-error">{errors.email.message}</p>}
                </div>
                <button type="submit" className="btn btn-primary w-full">Show demo reset flow</button>
              </form>
              <Link to="/login" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"><ArrowLeft size={14} /> Back to sign in</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
