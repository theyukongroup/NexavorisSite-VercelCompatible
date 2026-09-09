export type Scores = { ai:number; erp:number; automation:number; data:number; overall:number };
export type AssessmentAnswers = Record<string, number | string>;

export const assessmentQuestions = [
  { id:'industry', kind:'select', label:'Industry', options:['Wholesale / Distribution','HVAC / Field Service','Construction','Retail','Manufacturing','Professional Services','Other'] },
  { id:'employees', kind:'select', label:'Number of employees', options:['1–10','11–50','51–200','201–500','500+'] },
  { id:'locations', kind:'select', label:'Number of locations', options:['1','2–3','4–10','11+'] },
  { id:'systems', kind:'scale', label:'How connected are your current business systems?' },
  { id:'spreadsheets', kind:'scale', label:'How dependent are critical processes on spreadsheets?', reverse:true },
  { id:'dataQuality', kind:'scale', label:'How consistent are customer, product, and vendor records?' },
  { id:'sops', kind:'scale', label:'How easy is it for employees to find approved procedures?' },
  { id:'training', kind:'scale', label:'How documented and repeatable is employee training?' },
  { id:'reporting', kind:'scale', label:'How quickly can managers obtain current reports?' },
  { id:'reentry', kind:'scale', label:'How often is information re-entered between systems?', reverse:true },
  { id:'followup', kind:'scale', label:'How consistent is customer follow-up?' },
  { id:'purchasing', kind:'scale', label:'How structured is purchasing and replenishment?' },
  { id:'aiUse', kind:'scale', label:'How prepared is your team to use AI responsibly?' },
  { id:'privacy', kind:'scale', label:'How important is controlled access to company AI data?' },
  { id:'documentNeed', kind:'scale', label:'How valuable would searchable company documents be?' },
  { id:'erpInterest', kind:'scale', label:'How valuable would connected real-time operating data be?' },
] as const;

const value = (answers:AssessmentAnswers,id:string,reverse=false) => { const raw=Number(answers[id] ?? 0); return Math.max(0,Math.min(3,reverse?3-raw:raw)); };
const pct=(values:number[])=>Math.round(values.reduce((a,b)=>a+b,0)/(values.length*3)*100);

/** Deterministic estimate: each dimension is the unweighted mean of its disclosed 0–3 inputs. */
export function scoreAssessment(a:AssessmentAnswers):Scores {
  const ai=pct([value(a,'aiUse'),value(a,'privacy'),value(a,'documentNeed'),value(a,'sops')]);
  const erp=pct([value(a,'systems'),value(a,'dataQuality'),value(a,'reporting'),value(a,'purchasing'),value(a,'erpInterest')]);
  const automation=pct([value(a,'reentry',true),value(a,'followup'),value(a,'training'),value(a,'spreadsheets',true)]);
  const data=pct([value(a,'dataQuality'),value(a,'systems'),value(a,'reporting'),value(a,'sops')]);
  return {ai,erp,automation,data,overall:Math.round((ai+erp+automation+data)/4)};
}

export const opportunityOptions = [
  ['inventory','Salespeople manually check inventory','Odoo Inventory + Sales Integration','High'],
  ['followup','Customer follow-ups are inconsistent','CRM + Workflow Automation','Medium'],
  ['questions','Employees repeatedly ask the same questions','Private AI Knowledge Base','High'],
  ['sops','SOPs are hard to find','Private AI SOP Search','High'],
  ['reports','Reports require spreadsheets','ERP Reporting + Management Assistant','High'],
  ['purchasing','Purchasing is mostly manual','Purchasing + Replenishment Workflow','Medium'],
  ['visibility','Managers lack real-time visibility','Connected ERP Dashboards','High'],
  ['training','New employees depend heavily on senior staff','Employee Knowledge and Training AI','Medium'],
  ['reentry','Data is entered into multiple systems','System Integration + Workflow Automation','High'],
  ['orders','Customers order through phone, text, or email','Connected Sales Order Intake','Medium'],
  ['field','Technicians call the office for information','Mobile Field Service + Knowledge AI','High'],
  ['memberships','Recurring service memberships are manually tracked','Subscriptions + Field Service ERP','Medium'],
] as const;

export function buildOpportunities(selected:string[]) { return opportunityOptions.filter(([id])=>selected.includes(id)).map(([id,problem,solution,priority],index)=>({id,rank:index+1,problem,solution,priority,implementation:`Define the current process and owner, confirm source data, then pilot ${solution.toLowerCase()} with review checkpoints.`})); }

export type ROIInputs={employees:number;hourlyCost:number;hours:Record<string,number>};
export function calculateROI(input:ROIInputs){const weekly=Object.values(input.hours).reduce((a,b)=>a+Number(b||0),0);const annual=weekly*52*Number(input.hourlyCost||0);return{weeklyHours:weekly,annualLaborCost:Math.round(annual),scenarios:[10,20,25,30].map(rate=>({rate,value:Math.round(annual*rate/100),hours:Math.round(weekly*52*rate/100)}))};}

export function buildRoadmap(scores:Scores|null, opportunities:{solution:string}[], industry='Your business') { const lowData=(scores?.data??0)<60; return { industry, disclaimer:'Representative recommendation based on your responses. Final implementation requires a discovery review.', phases:[{title:'Phase 1 — Organize Business Foundation',items:[lowData?'Clean and assign ownership for customer, product, vendor, and document data':'Confirm data ownership and reporting definitions','Document critical workflows and approval boundaries','Select one measurable pilot outcome']},{title:'Phase 2 — ERP Foundation',items:['Connect CRM, sales, inventory, and purchasing where relevant','Define roles, permissions, and exception handling','Train users against real transactions']},{title:'Phase 3 — Private AI',items:['Create an approved company knowledge collection','Pilot SOP and employee question answering','Test citations, permissions, and escalation']},{title:'Phase 4 — AI + ERP Automation',items:opportunities.length?opportunities.slice(0,4).map(x=>x.solution):['Add read-only management reporting','Prepare controlled workflow actions','Measure adoption and improve']} ]}; }
