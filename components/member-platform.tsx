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
}: {
  locale: Locale;
  member?: boolean;
  onSaved?: (answers: AssessmentAnswers, scores: Scores) => void;
}) {
  const t = memberCopy[locale];
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<AssessmentAnswers>({});
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

// NOTE: MemberDashboard and its D1/ChatGPT-backed tools are intentionally omitted
// on Vercel. Only the public, self-contained tools are ported. See README.
