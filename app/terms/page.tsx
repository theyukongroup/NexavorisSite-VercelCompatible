import {AuthorityPage} from '@/components/authority-page';import {authorityMetadata} from '@/lib/seo';
export const metadata=authorityMetadata('Terms of Use','Terms for using Nexavoris public information, assessments, calculators, member tools, and consultation forms.','/terms');
export default function Page(){return <AuthorityPage eyebrow="TERMS OF USE" title="Use planning tools as guidance—not a guarantee." intro="These terms govern use of the Nexavoris website. A signed agreement, not this website, defines any paid implementation or advisory engagement." sections={[
{title:'Educational information',body:'Website content and tools provide general operational and technology information. They are not legal, tax, accounting, regulatory, security, or financial advice.'},
{title:'Illustrative outputs',body:'Assessment scores, productivity estimates, recommendations, and scenarios depend on user-provided assumptions. They do not guarantee results, savings, timing, suitability, or implementation success.'},
{title:'Accounts and acceptable use',body:'Users are responsible for authorized account use and accurate submissions. Do not attempt unauthorized access, interfere with the service, upload unlawful material, or misuse another person’s information.'},
{title:'Engagement scope',body:'A consultation request starts a suitability discussion only. Scope, fees, deliverables, responsibilities, warranties, security requirements, and support are established in a separate written agreement.'},
{title:'Changes and contact',body:'The website and these terms may change as services evolve. Questions may be sent to info@nexavoris.ai or 281-258-8000.'}
]} />}
