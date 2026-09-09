import {AuthorityPage} from '@/components/authority-page';import {authorityMetadata} from '@/lib/seo';
export const metadata=authorityMetadata('Productivity Calculator Methodology','Assumptions, inputs, interpretation, and limitations for the Nexavoris AI and ERP productivity calculator.','/methodology/roi-calculator');
export default function Page(){return <AuthorityPage eyebrow="CALCULATOR METHODOLOGY" title="An illustrative productivity estimate—not a financial promise." intro="The calculator organizes user-provided operating assumptions into a planning estimate. It supports questions; it does not forecast guaranteed savings, revenue, profit, or payback." sections={[
{title:'Inputs',body:'The estimate uses values entered by the user, such as people involved, time spent, frequency, and an assumed value of time. Inputs should reflect a defined workflow and representative period.'},
{title:'Calculation approach',body:'Entered frequency, time, and labor-value assumptions produce an addressable productivity estimate. Any scenario should be checked against actual payroll, utilization, exceptions, and adoption.'},
{title:'What it excludes',body:'The result does not automatically include implementation, software, hardware, migration, training, maintenance, downtime, change management, tax, risk, or employee judgment.'},
{title:'Responsible use',body:'Validate a baseline before implementation, measure the same workflow after adoption, and distinguish time released from cash actually saved. A business decision requires discovery and financial review.'},
]} />}
