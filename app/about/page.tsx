import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowDown, ArrowUpRight, Check } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata('About Nexavoris AI & ERP Systems', 'Nexavoris serves operational small and midsize businesses with Private AI, Odoo ERP, AI ERP integration, automation, and practical implementation support.', '/about');

const principles = [
  { number: '01', title: 'Business before software', eyebrow: 'START WITH THE WORK', image: '/about/business-before-software.webp', alt: 'Business owner and technology consultant mapping an operational workflow', body: 'We begin by understanding how work actually moves through your company: where decisions happen, where information gets lost, and what your team needs to do its best work. Only then do we design the technology.', note: 'Processes, constraints, people, and outcomes come first.' },
  { number: '02', title: 'Integration over novelty', eyebrow: 'MAKE THE WHOLE SYSTEM WORK', image: '/about/integration-over-novelty.webp', alt: 'Operations team coordinating a warehouse and office handoff', body: 'A collection of impressive tools is not an operating system. We connect ERP, private AI, automation, and company knowledge so information moves cleanly from one responsible person to the next.', note: 'Useful technology should reduce handoffs—not create more of them.' },
  { number: '03', title: 'Privacy and control', eyebrow: 'DESIGNED FOR RESPONSIBILITY', image: '/about/privacy-and-control.webp', alt: 'IT specialist and operations leader reviewing secure business computing equipment', body: 'Your business knowledge deserves deliberate protection. We design around appropriate infrastructure, permissions, governance, and human accountability—giving your team capability without giving up control.', note: 'Access, approvals, and ownership remain visible.' },
  { number: '04', title: 'Long-term partnership', eyebrow: 'IMPROVE AFTER GO-LIVE', image: '/about/long-term-partnership.webp', alt: 'Client and consultant reviewing results and planning workflow improvements', body: 'Implementation is the beginning, not the finish line. As your people adopt the system and your business changes, we stay involved—refining workflows, improving performance, and planning the next practical step.', note: 'Built to evolve with your operation.' },
];

export default function AboutPage() {
  return <main className="about-page">
    <section className="about-hero section-shell">
      <div className="about-hero-copy">
        <span className="eyebrow">ABOUT NEXAVORIS</span>
        <h1>Technology should fit the business. Not the other way around.</h1>
        <p>Nexavoris AI &amp; ERP Systems helps established small and medium-sized businesses modernize with Private AI, Odoo ERP, AI ERP integration, and business automation—without losing the knowledge, discipline, and relationships that made them successful.</p>
        <a className="about-scroll" href="#our-approach">See how we work <ArrowDown size={16}/></a>
      </div>
      <aside className="about-hero-statement">
        <span>OUR POINT OF VIEW</span>
        <blockquote>“The best system is not the one with the most technology. It is the one your people can trust, understand, and use to run the business better.”</blockquote>
      </aside>
    </section>

    <section className="about-intro" id="our-approach">
      <div className="section-shell">
        <span className="section-index">WHAT GUIDES THE WORK</span>
        <h2>Four principles. One practical standard.</h2>
        <p>Every recommendation should make the operation clearer, more capable, and easier to improve.</p>
      </div>
    </section>

    <section className="about-principles section-shell">
      {principles.map((principle, index) => <article className={`about-principle ${index % 2 ? 'reverse' : ''}`} key={principle.title}>
        <div className="about-principle-image"><Image src={principle.image} alt={principle.alt} fill sizes="(max-width: 800px) 100vw, 50vw"/></div>
        <div className="about-principle-copy">
          <span className="about-number">{principle.number}</span>
          <small>{principle.eyebrow}</small>
          <h2>{principle.title}</h2>
          <p>{principle.body}</p>
          <div><Check size={16}/><span>{principle.note}</span></div>
        </div>
      </article>)}
    </section>

    <section className="about-method">
      <div className="section-shell">
        <div className="about-method-heading"><span className="section-index">WHAT TO EXPECT</span><h2>A partnership built around clear decisions.</h2></div>
        <div className="about-method-steps">
          <article><div className="about-step-image"><Image src="/about/step-understand.webp" alt="Operations team explaining and mapping a business workflow" fill sizes="(max-width: 640px) 100vw, 33vw"/></div><div className="about-step-copy"><b>01</b><h3>Understand</h3><p>We listen to the people doing the work and map the systems, constraints, and opportunities around them.</p></div></article>
          <article><div className="about-step-image"><Image src="/about/step-design-implement.webp" alt="Technology specialist and operations lead implementing a practical workflow" fill sizes="(max-width: 640px) 100vw, 33vw"/></div><div className="about-step-copy"><b>02</b><h3>Design & implement</h3><p>We build the right combination of AI, ERP, and automation around measurable operational priorities.</p></div></article>
          <article><div className="about-step-image"><Image src="/about/step-adopt-improve.webp" alt="Operational team reviewing results and planning the next improvement" fill sizes="(max-width: 640px) 100vw, 33vw"/></div><div className="about-step-copy"><b>03</b><h3>Adopt & improve</h3><p>We support your team through launch, then continue refining the system as the business learns and grows.</p></div></article>
        </div>
      </div>
    </section>

    <section className="authority-body section-shell">
      <section><span>05</span><div><h2>What Nexavoris does not promise</h2><p>We do not represent AI as error-free, ERP as a shortcut around process decisions, or automation as a substitute for accountable people. We do not promise savings, timing, security, or business outcomes before the current environment and scope are understood.</p></div></section>
      <section><span>06</span><div><h2>Who we serve</h2><p>Nexavoris works with operational small and medium-sized businesses across the United States, with particular attention to wholesale distribution, HVAC and field service, construction, manufacturing, retail, and professional services.</p><p><a href="/how-nexavoris-works">Read the implementation process</a>{' · '}<a href="/trust">Review trust and data practices</a>{' · '}<a href="/case-studies">Understand our evidence standard</a></p></div></section>
    </section>

    <section className="about-cta section-shell">
      <div><span className="section-index">START A CONVERSATION</span><h2>Tell us how your business really works.</h2><p>We’ll help you identify a practical path forward—whether that begins with AI, ERP, automation, or a better website.</p></div>
      <a className="button primary" href="/contact">Schedule a Consultation <ArrowUpRight size={16}/></a>
    </section>
  </main>;
}
