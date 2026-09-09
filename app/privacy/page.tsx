import {AuthorityPage} from '@/components/authority-page';import {authorityMetadata} from '@/lib/seo';
export const metadata=authorityMetadata('Privacy Policy','How Nexavoris handles information submitted through its website, assessments, member tools, and consultation requests.','/privacy');
export default function Page(){return <AuthorityPage eyebrow="PRIVACY & DATA" title="Clear expectations for information you share." intro="This policy explains current website practices. Nexavoris does not sell personal information. Questions or requests may be sent to info@nexavoris.ai." sections={[
{title:'Information collected',body:'Contact destination details, company and project information, assessment responses, profile information, saved roadmaps, and consultation requests may be collected when you choose to provide or save them.'},
{title:'How information is used',body:'Information supports requested tools and services, account administration, consultation follow-up, security, troubleshooting, and improvement of the Nexavoris experience. Personalized data is not published as public SEO content.'},
{title:'Access and retention',body:'Access should be limited to authorized personnel and service providers needed to operate the platform. Retention depends on the account, service, operational, legal, and security purpose involved.'},
{title:'Your choices',body:'You may choose not to submit a consultation request or create an account. To request access, correction, or deletion where applicable, contact Nexavoris and provide enough information to verify the account or request.'},
{title:'Contact',body:'Nexavoris AI & ERP Systems, 13366 Murphy Road, Stafford, TX 77477. Phone: 281-258-8000. Email: info@nexavoris.ai.'}
]} />}
