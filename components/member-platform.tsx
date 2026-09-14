'use client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  BarChart3,
  Calculator,
  Check,
  Compass,
  FileSearch,
  LockKeyhole,
  LogOut,
  Save,
  UserRound,
} from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { memberCopy } from '@/lib/member-copy';
import {
  industryChoices,
  industryConfig,
  industryKey,
  localized,
  type IndustryKey,
} from '@/lib/industry-personalization';
import {
  assessmentQuestions,
  buildOpportunities,
  calculateROI,
  scoreAssessment,
  type AssessmentAnswers,
  type ROIInputs,
  type Scores,
} from '@/lib/member-tools';
import { RestaurantAssessment } from '@/components/restaurant-assessment';
import { scoreRestaurantAssessment } from '@/lib/restaurant-assessment';

const questionTranslations: Record<Locale, string[]> = {
  en: assessmentQuestions.map((q) => q.label),
  'zh-cn': [
    '行业',
    '员工人数',
    '运营地点数量',
    '当前业务系统的连接程度如何？',
    '关键流程对电子表格的依赖程度如何？',
    '客户、产品和供应商记录的一致性如何？',
    '员工查找批准流程有多容易？',
    '员工培训的文档化和可重复程度如何？',
    '管理者获得当前报表的速度如何？',
    '信息在不同系统间重复录入的频率如何？',
    '客户跟进的一致性如何？',
    '采购与补货的结构化程度如何？',
    '团队负责任使用 AI 的准备程度如何？',
    '控制企业 AI 数据访问有多重要？',
    '可检索企业文档能带来多大价值？',
    '连接实时运营数据能带来多大价值？',
  ],
  'zh-tw': [
    '行業',
    '員工人數',
    '營運地點數量',
    '目前業務系統的連接程度如何？',
    '關鍵流程對試算表的依賴程度如何？',
    '客戶、產品和供應商記錄的一致性如何？',
    '員工查找核准流程有多容易？',
    '員工培訓的文件化和可重複程度如何？',
    '管理者取得目前報表的速度如何？',
    '資訊在不同系統間重複輸入的頻率如何？',
    '客戶跟進的一致性如何？',
    '採購與補貨的結構化程度如何？',
    '團隊負責任使用 AI 的準備程度如何？',
    '控制企業 AI 資料存取有多重要？',
    '可檢索企業文件能帶來多大價值？',
    '連接即時營運資料能帶來多大價值？',
  ],
  es: [
    'Industria',
    'Número de empleados',
    'Número de ubicaciones',
    '¿Qué tan conectados están sus sistemas actuales?',
    '¿Cuánto dependen los procesos críticos de hojas de cálculo?',
    '¿Qué tan consistentes son los registros de clientes, productos y proveedores?',
    '¿Qué tan fácil es encontrar procedimientos aprobados?',
    '¿Qué tan documentada y repetible es la capacitación?',
    '¿Qué tan rápido obtienen informes actuales los gerentes?',
    '¿Con qué frecuencia se repite información entre sistemas?',
    '¿Qué tan consistente es el seguimiento de clientes?',
    '¿Qué tan estructuradas están compras y reposición?',
    '¿Qué tan preparado está el equipo para usar IA responsablemente?',
    '¿Qué tan importante es controlar el acceso a datos de IA?',
    '¿Qué valor tendría buscar documentos empresariales?',
    '¿Qué valor tendría conectar datos operativos actuales?',
  ],
};
const emit = (event: string, context: Record<string, string | number> = {}) => {
  void fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, context }),
  }).catch(() => undefined);
};
const langSuffix = (locale: Locale) =>
  locale === 'en' ? '' : `?lang=${locale}`;

export function ScoreCards({
  scores,
  locale,
}: {
  scores: Scores;
  locale: Locale;
}) {
  const t = memberCopy[locale];
  return (
    <div className="score-grid">
      {(
        [
          ['overall', scores.overall],
          ['ai', scores.ai],
          ['erp', scores.erp],
          ['automation', scores.automation],
          ['data', scores.data],
        ] as const
      ).map(([key, value]) => (
        <article className={key === 'overall' ? 'overall' : ''} key={key}>
          <span>{t[key]}</span>
          <strong>
            {value}
            <small>/100</small>
          </strong>
          <div>
            <i style={{ width: `${value}%` }} />
          </div>
        </article>
      ))}
    </div>
  );
}

export function AssessmentTool({
  locale,
  member = false,
  onSaved,
  initialIndustry,
}: {
  locale: Locale;
  member?: boolean;
  onSaved?: (answers: AssessmentAnswers, scores: Scores) => void;
  initialIndustry?: string;
}) {
  const t = memberCopy[locale];
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<AssessmentAnswers>(initialIndustry ? { industry: initialIndustry } : {});
  const [scores, setScores] = useState<Scores | null>(null);
  useEffect(() => {
    if (!member) {
      const raw = localStorage.getItem('nexavoris-assessment-draft');
      if (raw)
        try {
          queueMicrotask(() => setAnswers(JSON.parse(raw)));
        } catch {}
    }
  }, [member]);
  const set = (id: string, value: string | number) => {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    if (!member)
      localStorage.setItem('nexavoris-assessment-draft', JSON.stringify(next));
  };
  const finish = () => {
    const result = scoreAssessment(answers);
    setScores(result);
    emit('assessment_completed', {
      industry: String(answers.industry ?? ''),
      scoreRange: `${Math.floor(result.overall / 10) * 10}-${Math.floor(result.overall / 10) * 10 + 10}`,
    });
    onSaved?.(answers, result);
  };
  if ((step > 0 || initialIndustry === 'Restaurant') && answers.industry === 'Restaurant')
    return <RestaurantAssessment locale={locale} member={member} onSaved={onSaved} initialAnswers={answers} />;
  if (scores)
    return (
      <section className="tool-result">
        <span className="member-kicker">{t.ready}</span>
        <h2>{t.assessment}</h2>
        <p>{t.estimated}</p>
        <ScoreCards scores={scores} locale={locale} />
        {!member && (
          <div className="unlock-card">
            <LockKeyhole />
            <div>
              <h3>{t.unlock}</h3>
              <p>{t.nocard}</p>
            </div>
            <a
              className="button primary"
              href={`/signin-with-chatgpt?return_to=${encodeURIComponent('/account?import=assessment' + (locale === 'en' ? '' : `&lang=${locale}`))}`}
              target="_top"
              onClick={() => emit('signup_started', { source: 'assessment' })}
            >
              {t.create}
              <ArrowRight size={16} />
            </a>
          </div>
        )}
      </section>
    );
  if (step < 0)
    return (
      <section className="tool-intro">
        <FileSearch size={36} />
        <h1>{t.assessment}</h1>
        <p>{t.assessmentIntro}</p>
        <button
          className="button primary"
          onClick={() => {
            setStep(0);
            emit('assessment_started', {
              source: member ? 'account' : 'public',
            });
          }}
        >
          {t.start}
          <ArrowRight size={16} />
        </button>
        <small>{t.nocard}</small>
      </section>
    );
  const q = assessmentQuestions[step],
    label = questionTranslations[locale][step];
  const answered = answers[q.id] !== undefined;
  return (
    <section className="question-card">
      <div className="question-progress">
        <span>
          {step + 1} / {assessmentQuestions.length}
        </span>
        <i
          style={{
            width: `${((step + 1) / assessmentQuestions.length) * 100}%`,
          }}
        />
      </div>
      <h2>{label}</h2>
      {q.kind === 'select' ? (
        <select
          value={String(answers[q.id] ?? '')}
          onChange={(e) => set(q.id, e.target.value)}
        >
          <option value="">{t.select}</option>
          {q.options?.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : (
        <div className="scale-options">
          {[t.low, t.medium, t.good, t.high].map((x, i) => (
            <button
              className={answers[q.id] === i ? 'selected' : ''}
              key={x}
              onClick={() => set(q.id, i)}
            >
              {i}
              <span>{x}</span>
            </button>
          ))}
        </div>
      )}
      <div className="question-actions">
        <button disabled={step === 0} onClick={() => setStep(step - 1)}>
          {t.back}
        </button>
        {step < assessmentQuestions.length - 1 ? (
          <button
            className="button primary"
            disabled={!answered}
            onClick={() => setStep(step + 1)}
          >
            {t.next}
          </button>
        ) : (
          <button
            className="button primary"
            disabled={!answered}
            onClick={finish}
          >
            {t.finish}
          </button>
        )}
      </div>
    </section>
  );
}

type MemberData = {
  user: { email: string; name?: string };
  profile: Record<string, string>;
  assessment: { responses: AssessmentAnswers; scores: Scores } | null;
  opportunity: {
    selections: string[];
    results: ReturnType<typeof buildOpportunities>;
  } | null;
  roi: { inputs: ROIInputs; results: ReturnType<typeof calculateROI> } | null;
  roadmap: { industry: string; disclaimer: string; phases: Array<{ title: string; items: string[] }> } | null;
};
export function MemberDashboard({
  locale,
  email,
  name,
}: {
  locale: Locale;
  email: string;
  name?: string;
}) {
  const t = memberCopy[locale];
  const [data, setData] = useState<MemberData | null>(null);
  const [tab, setTab] = useState('dashboard');
  const [message, setMessage] = useState('');
  const load = async (): Promise<void> => {
    const loaded = (await (await fetch('/api/member')).json()) as MemberData;
    const draft = localStorage.getItem('nexavoris-assessment-draft');
    if (draft && !loaded.assessment) {
      try {
        const responses = JSON.parse(draft);
        const scores = responses.industry === 'Restaurant'
          ? scoreRestaurantAssessment(responses)
          : scoreAssessment(responses);
        await fetch('/api/member', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'assessment', responses, scores }),
        });
        localStorage.removeItem('nexavoris-assessment-draft');
        emit('signup_completed', { source: 'assessment' });
        await load();
        return;
      } catch {
        /* Ignore malformed device-local drafts. */
      }
    }
    setData(loaded);
  };
  useEffect(() => {
    void load();
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const save = async (payload: Record<string, unknown>) => {
    setMessage('');
    const r = await fetch('/api/member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (r.ok) {
      setMessage(t.savedOk);
      await load();
    } else setMessage('Error');
  };
  const completed = [
    true,
    !!data?.assessment,
    !!data?.opportunity,
    !!data?.roi,
    !!data?.roadmap,
  ];
  const progress = Math.round(
    (completed.filter(Boolean).length / completed.length) * 100,
  );
  if (!data) return <div className="member-loading">Loading…</div>;
  const tools = [
    ['assessment', t.assessment, BarChart3],
    ['opportunity', t.opportunity, Compass],
    ['roi', t.roi, Calculator],
    ['roadmap', t.roadmap, FileSearch],
  ] as const;
  const industry = String(
    data.profile.industry ?? data.assessment?.responses.industry ?? '',
  );
  const key = industryKey(industry);
  const config = industryConfig[key];
  const firstName = data.profile.firstName || name?.split(' ')[0] || email.split('@')[0];
  const ui = {
    personalize: locale === 'es' ? 'Personalice su experiencia Nexavoris' : locale === 'zh-cn' ? '个性化您的 Nexavoris 体验' : locale === 'zh-tw' ? '個人化您的 Nexavoris 體驗' : 'Personalize Your Nexavoris Experience',
    ask: locale === 'es' ? '¿Qué industria describe mejor su empresa?' : locale === 'zh-cn' ? '哪个行业最符合您的业务？' : locale === 'zh-tw' ? '哪個行業最符合您的業務？' : 'What industry best describes your business?',
    recommended: locale === 'es' ? 'Herramientas recomendadas para su industria' : locale === 'zh-cn' ? '为您的行业推荐的工具' : locale === 'zh-tw' ? '為您的行業推薦的工具' : 'Recommended Tools for My Industry',
    top: locale === 'es' ? 'Principales oportunidades' : locale === 'zh-cn' ? '主要机会' : locale === 'zh-tw' ? '主要機會' : 'Top Opportunities',
    resources: locale === 'es' ? 'Recursos recomendados' : locale === 'zh-cn' ? '推荐资源' : locale === 'zh-tw' ? '推薦資源' : 'Recommended Resources',
  };
  return (
    <main className="member-shell">
      <aside className="member-sidebar">
        <h2>Nexavoris</h2>
        <span>{name || email}</span>
        <nav>
          {(
            [
              ['dashboard', t.dashboard, UserRound],
              ['profile', t.profile, UserRound],
              ...tools,
            ] as Array<[string, string, typeof UserRound]>
          ).map(([id, label, Icon]) => (
            <button
              className={tab === id ? 'active' : ''}
              key={id}
              onClick={() => setTab(id)}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <a
          href={`/signout-with-chatgpt?return_to=${encodeURIComponent('/' + langSuffix(locale))}`}
          target="_top"
        >
          {t.signout}
        </a>
      </aside>
      <section className="member-main">
        <div className="member-account-bar">
          <span>{name || email}</span>
          <a
            className="member-signout"
            href={`/signout-with-chatgpt?return_to=${encodeURIComponent('/' + langSuffix(locale))}`}
            target="_top"
          >
            <LogOut size={16} aria-hidden="true" />
            {t.signout}
          </a>
        </div>
        {message && <div className="save-toast">{message}</div>}
        {tab === 'dashboard' && (
          <>
            {!industry && (
              <section className="industry-picker">
                <span className="member-kicker">{ui.personalize}</span>
                <h1>{ui.ask}</h1>
                <div>
                  {industryChoices.map((choice) => (
                    <button key={choice} onClick={() => {
                      const selectedIndustry = localized(industryConfig[choice].label, locale);
                      void save({ type: 'profile', profile: { ...data.profile, industry: selectedIndustry } });
                      emit('industry_selected', { industry: choice });
                    }}>{localized(industryConfig[choice].label, locale)}</button>
                  ))}
                </div>
              </section>
            )}
            <section className="member-industry-hero">
              <div>
                <span className="member-kicker">{localized(config.label, locale)}</span>
                <h1>{t.welcome}, {firstName}</h1>
                {data.profile.company && <strong>{data.profile.company}</strong>}
                <p>{localized(config.hero, locale)}</p>
              </div>
              <Image src={config.image} alt={localized(config.imageAlt, locale)} width={720} height={440} priority />
            </section>
            {data.assessment ? (
              <ScoreCards scores={data.assessment.scores} locale={locale} />
            ) : (
              <div className="empty-card">
                <h2>{t.assessment}</h2>
                <p>{t.assessmentIntro}</p>
                <button
                  className="button primary"
                  onClick={() => setTab('assessment')}
                >
                  {t.start}
                </button>
              </div>
            )}
            <section className="member-progress">
              <div>
                <h2>{t.progress}</h2>
                <strong>{progress}%</strong>
              </div>
              <div>
                <i style={{ width: `${progress}%` }} />
              </div>
              {[t.create, t.assessment, t.opportunity, t.roi, t.roadmap].map(
                (x, i) => (
                  <span key={x}>
                    {completed[i] ? <Check size={16} /> : <i />}
                    {x}
                  </span>
                ),
              )}
            </section>
            <section>
              <h2>{ui.recommended}</h2>
              <div className="member-tool-grid">
                {config.tools.map((label, index) => {
                  const [id, , Icon] = tools[index % tools.length];
                  return <button key={localized(label, locale)} onClick={() => { setTab(id); emit('industry_tool_clicked', { industry: key, tool: index }); }}>
                    <Icon />
                    <strong>{localized(label, locale)}</strong>
                    <ArrowRight />
                  </button>;
                })}
              </div>
            </section>
            <section className="member-top-opportunities">
              <h2>{ui.top}</h2>
              {config.opportunities.slice(0, 3).map((item) => <button key={item.id} onClick={() => setTab('opportunity')}><strong>{localized(item.label, locale)}</strong><span>{localized(item.solution, locale)}</span></button>)}
            </section>
            <section className="member-recommendations">
              <h2>{ui.resources}</h2>
              {config.resources.map((resource) => (
                <a key={resource.href} href={`${resource.href}${langSuffix(locale)}`} onClick={() => emit('industry_resource_clicked', { industry: key })}>
                  {localized(resource.label, locale)}
                  <ArrowRight size={16} />
                </a>
              ))}
            </section>
            <a
              className="button primary"
              href={`/contact?service=member-review&score=${data.assessment?.scores.overall ?? ''}&industry=${encodeURIComponent(industry)}`}
              onClick={() =>
                emit('consultation_clicked', { source: 'account' })
              }
            >
              {t.consult}
              <ArrowRight size={16} />
            </a>
          </>
        )}
        {tab === 'profile' && (
          <ProfileTool
            locale={locale}
            initial={data.profile}
            onSave={(profile) => save({ type: 'profile', profile })}
          />
        )}
        {tab === 'assessment' && (
          <AssessmentTool
            locale={locale}
            member
            onSaved={(responses, scores) =>
              void save({ type: 'assessment', responses, scores })
            }
          />
        )}{' '}
        {tab === 'opportunity' && (
          <OpportunityTool
            locale={locale}
            industry={key}
            initial={data.opportunity?.selections ?? []}
            onSave={(selections, results) =>
              save({ type: 'opportunity', selections, results })
            }
          />
        )}{' '}
        {tab === 'roi' && (
          <ROITool
            locale={locale}
            onSave={(inputs, results) => save({ type: 'roi', inputs, results })}
          />
        )}{' '}
        {tab === 'roadmap' && (
          <RoadmapTool
            locale={locale}
            data={data}
            industry={key}
            onSave={(roadmap) => save({ type: 'roadmap', roadmap })}
          />
        )}
      </section>
    </main>
  );
}

function ProfileTool({
  locale,
  initial,
  onSave,
}: {
  locale: Locale;
  initial: Record<string, string>;
  onSave: (profile: Record<string, string>) => void;
}) {
  const t = memberCopy[locale];
  const [profile, setProfile] = useState(initial);
  const field = (key: string, label: string, type = 'text') => (
    <label>
      {label}
      <input
        type={type}
        value={profile[key] ?? ''}
        onChange={(event) =>
          setProfile({ ...profile, [key]: event.target.value })
        }
      />
    </label>
  );
  return (
    <section>
      <span className="member-kicker">{t.dashboard}</span>
      <h1>{t.profile}</h1>
      <p>
        Optional details make recommendations more relevant. Do not enter
        confidential system credentials or sensitive personal information.
      </p>
      <div className="profile-grid">
        {field('firstName', 'First name')}
        {field('lastName', 'Last name')}
        {field('company', t.company)}
        {field('role', t.role)}
        <label>
          {locale === 'es' ? 'Industria principal' : locale === 'zh-cn' ? '主要行业' : locale === 'zh-tw' ? '主要行業' : 'Primary industry'}
          <select value={profile.industry ?? ''} onChange={(event) => setProfile({ ...profile, industry: event.target.value })}>
            <option value="">{t.select}</option>
            {industryChoices.map((choice) => <option key={choice} value={localized(industryConfig[choice].label, locale)}>{localized(industryConfig[choice].label, locale)}</option>)}
          </select>
        </label>
        {field('employees', 'Number of employees')}
        {field('locations', 'Number of locations')}
        {field('erp', 'Current ERP')}
        {field('phone', t.phone, 'tel')}
        {field('challenge', t.challenge)}
      </div>
      <button className="button primary" onClick={() => {
        if (profile.industry && profile.industry !== initial.industry)
          emit('industry_changed', { industry: industryKey(profile.industry) });
        onSave(profile);
      }}>
        {t.update}
      </button>
    </section>
  );
}

function OpportunityTool({
  locale,
  industry,
  initial,
  onSave,
}: {
  locale: Locale;
  industry: IndustryKey;
  initial: string[];
  onSave: (s: string[], r: ReturnType<typeof buildOpportunities>) => void;
}) {
  const t = memberCopy[locale];
  const options = industryConfig[industry].opportunities;
  const [selected, setSelected] = useState(initial);
  const results = useMemo(() => options.filter((item) => selected.includes(item.id)).map((item, index) => ({ id: item.id, rank: index + 1, problem: localized(item.label, locale), solution: localized(item.solution, locale), priority: 'High', implementation: localized(item.solution, locale) })), [selected, options, locale]);
  return (
    <section>
      <span className="member-kicker">{t.tools}</span>
      <h1>{t.opportunity}</h1>
      <p>
        Select the operational problems that apply. Results are deterministic
        and based only on your selections.
      </p>
      <div className="opportunity-list">
        {options.map((item) => (
          <label key={item.id}>
            <input
              type="checkbox"
              checked={selected.includes(item.id)}
              onChange={() =>
                setSelected(
                  selected.includes(item.id)
                    ? selected.filter((x) => x !== item.id)
                    : [...selected, item.id],
                )
              }
            />
            <span>{localized(item.label, locale)}</span>
          </label>
        ))}
      </div>
      {results.length > 0 && (
        <div className="opportunity-results">
          <h2>Opportunities Found: {results.length}</h2>
          {results.map((x) => (
            <article key={x.id}>
              <b>{x.priority}</b>
              <h3>{x.solution}</h3>
              <p>{x.problem}</p>
              <small>{x.implementation}</small>
            </article>
          ))}
          <button
            className="button primary"
            onClick={() => {
              onSave(selected, results as ReturnType<typeof buildOpportunities>);
              emit('opportunity_finder_completed', { tool: 'opportunity' });
            }}
          >
            <Save size={16} />
            {t.save}
          </button>
        </div>
      )}
    </section>
  );
}

function ROITool({
  locale,
  onSave,
}: {
  locale: Locale;
  onSave: (i: ROIInputs, r: ReturnType<typeof calculateROI>) => void;
}) {
  const t = memberCopy[locale];
  const categories = [
    'Finding information',
    'Preparing reports',
    'Re-entering information',
    'Training employees',
    'Checking inventory',
    'Customer follow-up',
    'Manual purchasing',
    'Administrative processes',
  ];
  const [inputs, setInputs] = useState<ROIInputs>({
    employees: 10,
    hourlyCost: 30,
    hours: Object.fromEntries(categories.map((x) => [x, 0])),
  });
  const result = calculateROI(inputs);
  return (
    <section>
      <span className="member-kicker">{t.tools}</span>
      <h1>{t.roi}</h1>
      <div className="roi-basics">
        <label>
          Employees
          <input
            type="number"
            min="1"
            value={inputs.employees}
            onChange={(e) =>
              setInputs({ ...inputs, employees: Number(e.target.value) })
            }
          />
        </label>
        <label>
          Average hourly labor cost
          <input
            type="number"
            min="0"
            value={inputs.hourlyCost}
            onChange={(e) =>
              setInputs({ ...inputs, hourlyCost: Number(e.target.value) })
            }
          />
        </label>
      </div>
      <h2>Estimated weekly team hours</h2>
      <div className="roi-hours">
        {categories.map((c) => (
          <label key={c}>
            {c}
            <input
              type="number"
              min="0"
              step=".5"
              value={inputs.hours[c]}
              onChange={(e) =>
                setInputs({
                  ...inputs,
                  hours: { ...inputs.hours, [c]: Number(e.target.value) },
                })
              }
            />
          </label>
        ))}
      </div>
      <div className="roi-result">
        <strong>{result.weeklyHours} hours/week</strong>
        <span>
          ${result.annualLaborCost.toLocaleString()} estimated annual repetitive
          labor cost
        </span>
        <div>
          {result.scenarios.map((x) => (
            <article key={x.rate}>
              <b>{x.rate}%</b>
              <span>${x.value.toLocaleString()}</span>
              <small>{x.hours} hours/year</small>
            </article>
          ))}
        </div>
        <p>{t.illustrative}</p>
        <button
          className="button primary"
          onClick={() => {
            onSave(inputs, result);
            emit('roi_calculator_completed', { tool: 'roi' });
          }}
        >
          {t.save}
        </button>
      </div>
    </section>
  );
}

function RoadmapTool({
  locale,
  data,
  industry,
  onSave,
}: {
  locale: Locale;
  data: MemberData;
  industry: IndustryKey;
  onSave: (r: { industry: string; disclaimer: string; phases: Array<{ title: string; items: string[] }> }) => void;
}) {
  const t = memberCopy[locale];
  const config = industryConfig[industry];
  const roadmap = {
    industry: localized(config.label, locale),
    disclaimer: locale === 'es' ? 'Recomendación representativa basada en su perfil. La implementación final requiere una revisión.' : locale === 'zh-cn' ? '根据您的资料提供的代表性建议。最终实施需要评审。' : locale === 'zh-tw' ? '根據您的資料提供的代表性建議。最終實施需要評審。' : 'Representative recommendation based on your profile. Final implementation requires a discovery review.',
    phases: config.roadmap.map((phase) => ({ title: localized(phase.title, locale), items: [localized(phase.item, locale)] })),
  };
  return (
    <section>
      <span className="member-kicker">{t.recommend}</span>
      <h1>{t.roadmap}</h1>
      <p>{roadmap.disclaimer}</p>
      <div className="roadmap-phases">
        {roadmap.phases.map((phase) => (
          <article key={phase.title}>
            <h2>{phase.title}</h2>
            <ul>
              {phase.items.map((x: string) => (
                <li key={x}>
                  <Check size={16} />
                  {x}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <button
        className="button primary"
        onClick={() => {
          onSave(roadmap);
          emit('industry_roadmap_generated', { industry });
        }}
      >
        {t.generate}
      </button>
    </section>
  );
}
