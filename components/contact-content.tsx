'use client';

// Local divergence: the origin's app/contact/page.tsx takes a `messages` prop so the
// localized-content route can re-render it. Next.js 16 requires a route page's props
// to match PageProps, so the body lives here and app/contact/page.tsx is a thin wrapper.

import { cloneElement, isValidElement, useState, type ReactNode } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { translate } from '@/lib/i18n';

function localize(value: unknown, messages: Record<string, string>): unknown {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed
      ? value.replace(trimmed, translate(messages, trimmed))
      : value;
  }
  if (Array.isArray(value))
    return value.map((item) => localize(item, messages));
  if (isValidElement(value))
    return cloneElement(
      value,
      localize(value.props, messages) as Record<string, unknown>,
    );
  if (
    value &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        localize(item, messages),
      ]),
    );
  }
  return value;
}

export default function ContactContent({
  messages = {},
}: {
  messages?: Record<string, string>;
}) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const content = sent ? (
    <main>
      <section className="inner-hero section-shell success">
        <CheckCircle2 size={48} />
        <span className="section-index">REQUEST RECEIVED</span>
        <h1>Thank you. Let’s talk about your operation.</h1>
        <p>
          Your consultation request has been recorded. A Nexavoris specialist
          will follow up to discuss your goals and next steps.
        </p>
      </section>
    </main>
  ) : (
    <main>
      <section className="contact-hero section-shell">
        <div>
          <span className="section-index">CONTACT NEXAVORIS</span>
          <h1>Start with your business—not a software pitch.</h1>
          <p>
            Tell us where work slows down, where information gets lost, or what
            you want your business systems to do better. We’ll explore whether
            AI, ERP, automation, or a combination is the right path.
          </p>
          <div className="contact-note">
            <b>What happens next</b>
            <span>01 · We review your current environment</span>
            <span>02 · We identify the highest-value opportunities</span>
            <span>03 · We recommend a practical next step</span>
          </div>
        </div>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setError('');
            const body = Object.fromEntries(
              new FormData(event.currentTarget).entries(),
            );
            const response = await fetch('/api/consultations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });
            if (response.ok) setSent(true);
            else
              setError(
                'We could not record your request. Please review the form and try again.',
              );
          }}
        >
          <div className="form-grid">
            <label>
              Name *<input name="name" required autoComplete="name" />
            </label>
            <label>
              Company *
              <input name="company" required autoComplete="organization" />
            </label>
            <label>
              Email *
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label>
              Phone
              <input name="phone" type="tel" autoComplete="tel" />
            </label>
            <label>
              Industry
              <select name="industry" defaultValue="">
                <option value="" disabled>
                  Select industry
                </option>
                <option>Wholesale / Distribution</option>
                <option>HVAC / Field Service</option>
                <option>Construction</option>
                <option>Restaurant</option>
                <option>Retail</option>
                <option>Manufacturing</option>
                <option>Professional Services</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              Number of Employees
              <select name="employees" defaultValue="">
                <option value="" disabled>
                  Select range
                </option>
                <option>1–10</option>
                <option>11–50</option>
                <option>51–200</option>
                <option>201–500</option>
                <option>500+</option>
              </select>
            </label>
          </div>
          <label>
            Current ERP / Business Software
            <input
              name="software"
              placeholder="e.g. QuickBooks, Odoo, spreadsheets"
            />
          </label>
          <label>
            Interested In *
            <select required name="interest" defaultValue="">
              <option value="" disabled>
                Select an area
              </option>
              <option>Private AI</option>
              <option>ERP</option>
              <option>AI + ERP</option>
              <option>Automation</option>
              <option>Not Sure</option>
            </select>
          </label>
          <label>
            Project Description *
            <textarea
              name="description"
              required
              rows={5}
              placeholder="Tell us about your goals, current systems, and where your team is losing time."
            />
          </label>
          {error && <p role="alert">{error}</p>}
          <button className="button primary" type="submit">
            Request Consultation <ArrowRight size={17} />
          </button>
          <small>
            By submitting this form, you agree to be contacted about your
            request.
          </small>
        </form>
      </section>
    </main>
  );
  return localize(content, messages) as ReactNode;
}
