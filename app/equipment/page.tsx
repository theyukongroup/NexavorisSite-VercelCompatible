import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowRight, Check, Database, Gauge, HardDrive, Network, ShieldCheck } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata('Business Server Equipment', 'The practical on-premises server platforms Nexavoris recommends for Odoo ERP and private AI workloads.', '/equipment');

const aiLink = 'https://www.gmktec.com/products/amd-ryzen%E2%84%A2-ai-max-395-evo-x2-ai-mini-pc';

const sizing = [
  ['01', 'Workload', 'We map users, modules, integrations, automation, and expected peak activity.'],
  ['02', 'Data', 'We account for database growth, document storage, model size, and backup retention.'],
  ['03', 'Resilience', 'We define recovery targets, storage protection, power protection, and remote management.'],
  ['04', 'Headroom', 'We leave practical capacity for new users, larger models, and future workflows.'],
];

const systems = [
  {
    number: '01', name: 'Nexavoris Basic', label: 'Capable local foundation',
    image: '/equipment/nexavoris-basic.webp', alt: 'Nexavoris Basic MSI Codex R2 tower PC',
    lead: 'A strong entry point for local AI assistance, document workflows, content production, and demanding everyday business use.',
    specs: [['Processor', 'Intel Core Ultra 7 265, 20 cores, up to 5.3 GHz'], ['Graphics', 'NVIDIA GeForce RTX 5060 Ti, 8 GB GDDR7'], ['Memory', '32 GB high-speed DDR5 RAM'], ['Storage', '2 TB PCIe NVMe solid-state drive'], ['Cooling', 'Frozr AI Cooling with optimized airflow and RGB fans'], ['Connectivity', 'Wi-Fi, Bluetooth, Ethernet, HDMI, DisplayPort, and USB'], ['Software', 'Windows 11 Home'], ['Included', 'Keyboard and mouse']],
  },
  {
    number: '02', name: 'Nexavoris Business', label: 'High-performance operations',
    image: '/equipment/nexavoris-business.webp', alt: 'Nexavoris Business HP OMEN MAX 45L tower PC',
    lead: 'Substantial memory and flagship graphics for larger local models, concurrent workloads, visualization, and accelerated business applications.',
    specs: [['Processor', 'AMD Ryzen 9 9900X3D, 12 cores / 24 threads, up to 5.5 GHz'], ['Graphics', 'NVIDIA GeForce RTX 5090, 32 GB GDDR7'], ['Memory', '128 GB DDR5 RAM'], ['Storage', '4 TB PCIe NVMe M.2 solid-state drive'], ['Cooling', 'Second-generation OMEN Cryo Chamber for high-load cooling'], ['Networking', 'Wi-Fi 7, Bluetooth, and RJ-45 Ethernet'], ['Display', '1 HDMI and 3 DisplayPort outputs'], ['USB & audio', '4 USB-A 5 Gbps, 3 USB-C 10 Gbps, 4 USB-A 2.0, and 4 audio ports'], ['Software', 'Windows 11 Pro']],
  },
  {
    number: '03', name: 'Nexavoris Enterprise', label: 'Professional AI workstation',
    image: '/equipment/nexavoris-enterprise.webp', alt: 'Nexavoris Enterprise CLX professional workstation',
    lead: 'A professional workstation for advanced local AI, very large datasets, complex rendering, and mission-critical accelerated workflows.',
    specs: [['Processor', 'AMD Ryzen 9 9950X3D, 16 cores, up to 5.6 GHz'], ['Graphics', 'NVIDIA RTX Pro 6000 Blackwell Edition'], ['Video memory', '96 GB GDDR7 ECC'], ['System memory', '192 GB DDR5 RAM'], ['Storage', '4 TB NVMe M.2 solid-state drive'], ['Cooling', 'Premium 360 mm liquid CPU cooler'], ['Networking', '2.5 Gigabit Ethernet and high-speed Wi-Fi'], ['Chassis', 'Professional black mid-tower'], ['Software', 'Windows 11 Pro'], ['Support', 'Expert technical support']],
  },
];

export default function Page() {
  return <main>
    <section className="equipment-hero section-shell">
      <div>
        <span className="section-index">OUR EQUIPMENT</span>
        <h1>Practical hardware for systems that stay under your control.</h1>
      </div>
      <p>We match each workload to business-ready equipment—from dependable Odoo hosting to high-memory local AI. Every final configuration is sized around your operation, data, and availability requirements.</p>
    </section>

    <section className="systems-section section-shell">
      <div className="section-head">
        <span className="section-index">NEXAVORIS SYSTEMS</span>
        <h2>Three levels of private computing power.</h2>
        <p>Choose a practical starting point for your workload. We configure, secure, and validate every system around the applications and data it will support.</p>
      </div>
      <div className="systems-grid">
        {systems.map((system) => <article className="system-card" key={system.name}>
          <div className="system-card-head"><span>{system.number}</span><small>{system.label}</small></div>
          <div className="system-image"><Image src={system.image} alt={system.alt} width={900} height={700} sizes="(max-width: 800px) 100vw, 33vw"/></div>
          <div className="system-copy">
            <h3>{system.name}</h3>
            <p>{system.lead}</p>
            <dl>{system.specs.map(([term, value]) => <div key={term}><dt><Check size={14}/>{term}</dt><dd>{value}</dd></div>)}</dl>
          </div>
        </article>)}
      </div>
      <p className="equipment-note">Configurations are based on the specified reference systems and may change as components are updated or become unavailable. Final hardware is confirmed before procurement.</p>
    </section>

    <section className="equipment-showcase section-shell">
      <article className="equipment-card equipment-card-odoo">
        <div className="equipment-number">01 / ERP INFRASTRUCTURE</div>
        <div className="equipment-product">
          <Image src="/equipment/hpe-proliant-ml30-gen11.png" alt="HPE ProLiant ML30 Gen11 tower server" width={800} height={600} sizes="(max-width: 800px) 100vw, 330px"/>
          <small>HPE ProLiant ML30 Gen11 shown</small>
        </div>
        <div className="equipment-copy">
          <span className="equipment-tag">Representative server class</span>
          <h2>HPE ProLiant-class Odoo server</h2>
          <p className="equipment-lead">A serviceable, enterprise-oriented platform for the database, applications, files, and integrations that keep Odoo available to your team.</p>
          <div className="equipment-features">
            <span><ShieldCheck size={18}/><b>Business reliability</b><small>ECC memory, protected storage, and a chassis designed for sustained use.</small></span>
            <span><HardDrive size={18}/><b>Storage resilience</b><small>RAID-ready storage and a planned backup path for operational data.</small></span>
            <span><Network size={18}/><b>Serviceability</b><small>Remote administration and room to expand as users and records grow.</small></span>
          </div>
        </div>
      </article>

      <article className="equipment-card equipment-card-ai">
        <div className="equipment-number">02 / PRIVATE AI</div>
        <div className="equipment-product">
          <Image src="/equipment/gmktec-evo-x2.png" alt="GMKtec EVO-X2 compact AI workstation" width={1000} height={1000} sizes="(max-width: 800px) 100vw, 330px"/>
          <small>GMKtec EVO-X2 shown</small>
        </div>
        <div className="equipment-copy">
          <span className="equipment-tag">Recommended reference configuration</span>
          <h2>GMKtec EVO-X2 AI workstation</h2>
          <p className="equipment-lead">A compact local-AI system built around the AMD Ryzen AI Max+ 395, giving private assistants and knowledge tools a capable foundation without a full-size GPU server.</p>
          <div className="spec-strip">
            <span><b>16 cores</b><small>32 threads</small></span>
            <span><b>64 GB</b><small>LPDDR5X unified memory</small></span>
            <span><b>2 TB</b><small>PCIe 4.0 SSD</small></span>
            <span><b>50+ TOPS</b><small>XDNA 2 NPU</small></span>
          </div>
          <ul className="equipment-checks">
            <li><Check size={16}/> Radeon 8060S integrated graphics with 40 RDNA 3.5 compute units</li>
            <li><Check size={16}/> 2.5 GbE, Wi-Fi 7, Bluetooth 5.4, and USB4 connectivity</li>
            <li><Check size={16}/> Well suited to private chat, retrieval, document search, and local inference</li>
          </ul>
          <a className="equipment-link" href={aiLink} target="_blank" rel="noreferrer">View the EVO-X2 on GMKtec <ArrowRight size={16}/></a>
        </div>
      </article>
    </section>

    <section className="workload-band">
      <div className="section-shell workload-grid">
        <div>
          <span className="section-index">ONE NETWORK, DISTINCT JOBS</span>
          <h2>Separate platforms protect performance.</h2>
          <p>ERP is a steady, transaction-heavy system of record. AI is a bursty, memory-intensive compute workload. Running them on purpose-built equipment keeps an AI task from competing with the system your team depends on all day.</p>
        </div>
        <div className="workload-map">
          <span><Database size={21}/><b>Odoo & database</b><small>ProLiant-class server</small></span>
          <i>Secure business network</i>
          <span><Gauge size={21}/><b>Private AI</b><small>EVO-X2 workstation</small></span>
        </div>
      </div>
    </section>

    <section className="section-shell sizing-section">
      <div className="section-head">
        <span className="section-index">RIGHT-SIZED, NOT OVER-SPECIFIED</span>
        <h2>How we select the final configuration.</h2>
        <p>The links above are useful starting points. Before procurement, we validate four things so the equipment fits the business rather than a generic specification sheet.</p>
      </div>
      <div className="sizing-grid">{sizing.map(([number, title, body]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
      <p className="equipment-note">Product specifications, pricing, and availability may change. The HPE link represents the class of server used for Odoo deployments; the exact model, storage layout, warranty, and backup design are confirmed during solution planning.</p>
    </section>

    <section className="mini-cta section-shell">
      <div><span className="section-index">PLAN YOUR INFRASTRUCTURE</span><h2>Let’s size the right system for your workload.</h2></div>
      <a className="button primary" href="/contact?service=equipment">Discuss your requirements <ArrowRight size={17}/></a>
    </section>
  </main>;
}
