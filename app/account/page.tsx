import { requireChatGPTUser } from '@/app/chatgpt-auth';
import { MemberDashboard } from '@/components/member-platform';
import { isLocale, type Locale } from '@/lib/i18n';
export const dynamic='force-dynamic';
export default async function AccountPage({searchParams}:{searchParams:Promise<{lang?:string}>}){const params=await searchParams;const user=await requireChatGPTUser(`/account${params.lang?`?lang=${params.lang}`:''}`);const locale:Locale=isLocale(params.lang??null)?params.lang as Locale:'en';return <MemberDashboard locale={locale} email={user.email} name={user.name}/>}
