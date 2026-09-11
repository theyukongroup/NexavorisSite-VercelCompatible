'use client';
import { useActionState, useState } from 'react';
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import {
  requestPasswordResetAction,
  resendConfirmationAction,
  signInAction,
  signUpAction,
  updatePasswordAction,
  type AuthState,
} from '@/lib/auth-actions';
import type { AuthCopy } from '@/lib/auth-copy';
import type { Locale } from '@/lib/i18n';

// Vercel-only forms for the Supabase email + password sign-in. Copy and links
// are resolved on the server and passed in, so no translation tables ship to
// the browser.

const idle: AuthState = { status: 'idle' };
const fill = (text: string, email = '') => text.replace('{email}', email);

function Context({ locale, next }: { locale: Locale; next?: string }) {
  return (
    <>
      <input type="hidden" name="locale" value={locale} />
      {next && <input type="hidden" name="next" value={next} />}
    </>
  );
}

function ErrorMessage({ state }: { state: AuthState }) {
  if (state.status !== 'error' || !state.message) return null;
  return (
    <p className="auth-message error" role="alert">
      {state.message}
    </p>
  );
}

function SubmitButton({ pending, label, working }: { pending: boolean; label: string; working: string }) {
  return (
    <button className="button primary" type="submit" disabled={pending}>
      {pending ? working : label}
      {!pending && <ArrowRight size={16} />}
    </button>
  );
}

function ResendConfirmation({
  copy,
  locale,
  next,
  email,
}: {
  copy: AuthCopy;
  locale: Locale;
  next: string;
  email: string;
}) {
  const [state, action, pending] = useActionState(resendConfirmationAction, idle);
  return (
    <form action={action} className="auth-inline">
      <Context locale={locale} next={next} />
      <input type="hidden" name="email" value={email} />
      <button className="button secondary" type="submit" disabled={pending}>
        {pending ? copy.working : copy.resend}
      </button>
      {state.status === 'sent' && (
        <p className="auth-message" role="status">
          {copy.resent}
        </p>
      )}
      <ErrorMessage state={state} />
    </form>
  );
}

export function LoginPanel({
  copy,
  locale,
  next,
  initialMode,
  forgotHref,
}: {
  copy: AuthCopy;
  locale: Locale;
  next: string;
  initialMode: 'signin' | 'register';
  forgotHref: string;
}) {
  const [mode, setMode] = useState(initialMode);
  const [signInState, signIn, signingIn] = useActionState(signInAction, idle);
  const [signUpState, signUp, signingUp] = useActionState(signUpAction, idle);

  if (mode === 'register' && signUpState.status === 'sent')
    return (
      <section className="auth-card auth-sent" role="status">
        <Mail size={28} />
        <h1>{copy.checkEmailTitle}</h1>
        <p>{fill(copy.checkEmailBody, signUpState.email)}</p>
        <ResendConfirmation copy={copy} locale={locale} next={next} email={signUpState.email ?? ''} />
        <button className="auth-link" type="button" onClick={() => setMode('signin')}>
          {copy.backToSignIn}
        </button>
      </section>
    );

  const isSignIn = mode === 'signin';
  return (
    <section className="auth-card">
      <div className="auth-tabs">
        {(['signin', 'register'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            aria-pressed={mode === tab}
            className={mode === tab ? 'active' : undefined}
            onClick={() => setMode(tab)}
          >
            {tab === 'signin' ? copy.tabSignIn : copy.tabRegister}
          </button>
        ))}
      </div>
      <h1>{isSignIn ? copy.signInTitle : copy.registerTitle}</h1>
      <p>{isSignIn ? copy.signInIntro : copy.registerIntro}</p>
      {isSignIn ? (
        <>
          <form action={signIn} className="auth-form">
            <Context locale={locale} next={next} />
            <label>
              {copy.email}
              <input name="email" type="email" autoComplete="email" required defaultValue={signInState.email} />
            </label>
            <label>
              {copy.password}
              <input name="password" type="password" autoComplete="current-password" required />
            </label>
            <ErrorMessage state={signInState} />
            <SubmitButton pending={signingIn} label={copy.signInButton} working={copy.working} />
            <a className="auth-link" href={forgotHref}>
              {copy.forgotLink}
            </a>
          </form>
          {signInState.resend && signInState.email && (
            <ResendConfirmation copy={copy} locale={locale} next={next} email={signInState.email} />
          )}
        </>
      ) : (
        <form action={signUp} className="auth-form">
          <Context locale={locale} next={next} />
          <label>
            {copy.fullName}
            <input name="full_name" autoComplete="name" maxLength={120} />
          </label>
          <label>
            {copy.email}
            <input name="email" type="email" autoComplete="email" required defaultValue={signUpState.email} />
          </label>
          <label>
            {copy.password}
            <input name="password" type="password" autoComplete="new-password" minLength={10} required />
            <small>{copy.passwordHint}</small>
          </label>
          <label>
            {copy.confirmPassword}
            <input name="confirm_password" type="password" autoComplete="new-password" minLength={10} required />
          </label>
          <ErrorMessage state={signUpState} />
          <SubmitButton pending={signingUp} label={copy.registerButton} working={copy.working} />
        </form>
      )}
    </section>
  );
}

export function ForgotPasswordForm({
  copy,
  locale,
  loginHref,
}: {
  copy: AuthCopy;
  locale: Locale;
  loginHref: string;
}) {
  const [state, action, pending] = useActionState(requestPasswordResetAction, idle);
  if (state.status === 'sent')
    return (
      <section className="auth-card auth-sent" role="status">
        <Mail size={28} />
        <h1>{copy.checkEmailTitle}</h1>
        <p>{fill(copy.resetSent, state.email)}</p>
        <a className="auth-link" href={loginHref}>
          {copy.backToSignIn}
        </a>
      </section>
    );
  return (
    <section className="auth-card">
      <h1>{copy.forgotTitle}</h1>
      <p>{copy.forgotIntro}</p>
      <form action={action} className="auth-form">
        <Context locale={locale} />
        <label>
          {copy.email}
          <input name="email" type="email" autoComplete="email" required defaultValue={state.email} />
        </label>
        <ErrorMessage state={state} />
        <SubmitButton pending={pending} label={copy.sendResetLink} working={copy.working} />
        <a className="auth-link" href={loginHref}>
          {copy.backToSignIn}
        </a>
      </form>
    </section>
  );
}

export function ResetPasswordForm({ copy, locale }: { copy: AuthCopy; locale: Locale }) {
  const [state, action, pending] = useActionState(updatePasswordAction, idle);
  return (
    <section className="auth-card">
      <LockKeyhole size={28} className="auth-icon" />
      <h1>{copy.resetTitle}</h1>
      <p>{copy.resetIntro}</p>
      <form action={action} className="auth-form">
        <Context locale={locale} />
        <label>
          {copy.newPassword}
          <input name="password" type="password" autoComplete="new-password" minLength={10} required />
          <small>{copy.passwordHint}</small>
        </label>
        <label>
          {copy.confirmPassword}
          <input name="confirm_password" type="password" autoComplete="new-password" minLength={10} required />
        </label>
        <ErrorMessage state={state} />
        <SubmitButton pending={pending} label={copy.updatePassword} working={copy.working} />
      </form>
    </section>
  );
}
