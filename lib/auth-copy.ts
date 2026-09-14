import { isLocale, type Locale } from '@/lib/i18n';

// Vercel-only. Interface text for the email + password pages that replace
// Sign in with ChatGPT. Kept out of lib/member-copy.ts so that origin file
// still copies over verbatim. {email} is replaced at render time.

export type AuthCopy = {
  signInTitle: string;
  signInIntro: string;
  registerTitle: string;
  registerIntro: string;
  tabSignIn: string;
  tabRegister: string;
  email: string;
  password: string;
  passwordHint: string;
  confirmPassword: string;
  fullName: string;
  signInButton: string;
  registerButton: string;
  forgotLink: string;
  backToSignIn: string;
  working: string;
  checkEmailTitle: string;
  checkEmailBody: string;
  resend: string;
  resent: string;
  invalidCredentials: string;
  notConfirmed: string;
  suspended: string;
  weakPassword: string;
  passwordMismatch: string;
  samePassword: string;
  invalidEmail: string;
  rateLimited: string;
  genericError: string;
  forgotTitle: string;
  forgotIntro: string;
  sendResetLink: string;
  resetSent: string;
  resetTitle: string;
  resetIntro: string;
  newPassword: string;
  updatePassword: string;
  linkExpired: string;
  verifyTitle: string;
  verifyIntro: string;
  verifyButton: string;
  verifyInvalid: string;
  requestNewLink: string;
};

export const authCopy: Record<Locale, AuthCopy> = {
  en: {
    signInTitle: 'Sign in to Nexavoris',
    signInIntro: 'Access your saved assessments, opportunity reports, ROI scenarios, and roadmap.',
    registerTitle: 'Create your free account',
    registerIntro: 'Save your AI + ERP assessment and keep improving your plan. Free, no credit card required.',
    tabSignIn: 'Sign in',
    tabRegister: 'Create account',
    email: 'Work email',
    password: 'Password',
    passwordHint: 'At least 7 characters.',
    confirmPassword: 'Confirm password',
    fullName: 'Full name (optional)',
    signInButton: 'Sign in',
    registerButton: 'Create free account',
    forgotLink: 'Forgot your password?',
    backToSignIn: 'Back to sign in',
    working: 'Please wait…',
    checkEmailTitle: 'Check your email',
    checkEmailBody: 'We sent a confirmation link to {email}. Open it to activate your account.',
    resend: 'Resend confirmation email',
    resent: 'If the address still needs confirming, a new link is on its way.',
    invalidCredentials: 'That email and password combination is not correct.',
    notConfirmed: 'Please confirm your email address first. Check your inbox for the link.',
    suspended: 'This account is suspended. Contact info@nexavoris.ai for help.',
    weakPassword: 'Choose a stronger password with at least 7 characters.',
    passwordMismatch: 'The passwords do not match.',
    samePassword: 'Choose a password different from your current one.',
    invalidEmail: 'Enter a valid email address.',
    rateLimited: 'Too many attempts. Please wait a few minutes and try again.',
    genericError: 'Something went wrong. Please try again.',
    forgotTitle: 'Reset your password',
    forgotIntro: 'Enter your account email and we will send you a secure link to choose a new password.',
    sendResetLink: 'Send reset link',
    resetSent: 'If an account exists for {email}, a password reset link is on its way.',
    resetTitle: 'Choose a new password',
    resetIntro: 'Enter a new password for your Nexavoris account.',
    newPassword: 'New password',
    updatePassword: 'Save new password',
    linkExpired: 'This link has expired or was already used. Request a new one.',
    verifyTitle: 'Confirm to continue',
    verifyIntro: 'For your security, press the button to finish verifying your email link.',
    verifyButton: 'Continue',
    verifyInvalid: 'This link is invalid or has expired.',
    requestNewLink: 'Request a new link',
  },
  'zh-cn': {
    signInTitle: '登录 Nexavoris',
    signInIntro: '查看您保存的评估、机会报告、ROI 场景和路线图。',
    registerTitle: '创建免费账户',
    registerIntro: '保存您的 AI + ERP 评估并持续完善计划。免费，无需信用卡。',
    tabSignIn: '登录',
    tabRegister: '创建账户',
    email: '工作邮箱',
    password: '密码',
    passwordHint: '至少 7 个字符。',
    confirmPassword: '确认密码',
    fullName: '姓名（可选）',
    signInButton: '登录',
    registerButton: '创建免费账户',
    forgotLink: '忘记密码？',
    backToSignIn: '返回登录',
    working: '请稍候…',
    checkEmailTitle: '请查收邮件',
    checkEmailBody: '我们已向 {email} 发送确认链接。请打开链接激活您的账户。',
    resend: '重新发送确认邮件',
    resent: '如果该地址仍需确认，新的链接已发送。',
    invalidCredentials: '邮箱或密码不正确。',
    notConfirmed: '请先确认您的邮箱地址，确认链接已发送到您的收件箱。',
    suspended: '此账户已被暂停。如需帮助，请联系 info@nexavoris.ai。',
    weakPassword: '请设置更安全的密码，至少 7 个字符。',
    passwordMismatch: '两次输入的密码不一致。',
    samePassword: '新密码不能与当前密码相同。',
    invalidEmail: '请输入有效的邮箱地址。',
    rateLimited: '尝试次数过多，请稍等几分钟后再试。',
    genericError: '出现问题，请重试。',
    forgotTitle: '重置密码',
    forgotIntro: '输入您的账户邮箱，我们将发送一个安全链接供您设置新密码。',
    sendResetLink: '发送重置链接',
    resetSent: '如果 {email} 存在账户，密码重置链接已发送。',
    resetTitle: '设置新密码',
    resetIntro: '为您的 Nexavoris 账户输入新密码。',
    newPassword: '新密码',
    updatePassword: '保存新密码',
    linkExpired: '此链接已过期或已被使用，请重新申请。',
    verifyTitle: '确认以继续',
    verifyIntro: '为保障安全，请点击按钮完成邮件链接验证。',
    verifyButton: '继续',
    verifyInvalid: '此链接无效或已过期。',
    requestNewLink: '重新申请链接',
  },
  'zh-tw': {
    signInTitle: '登入 Nexavoris',
    signInIntro: '查看您儲存的評估、機會報告、ROI 情境和路線圖。',
    registerTitle: '建立免費帳戶',
    registerIntro: '儲存您的 AI + ERP 評估並持續完善計畫。免費，無需信用卡。',
    tabSignIn: '登入',
    tabRegister: '建立帳戶',
    email: '工作電子郵件',
    password: '密碼',
    passwordHint: '至少 7 個字元。',
    confirmPassword: '確認密碼',
    fullName: '姓名（選填）',
    signInButton: '登入',
    registerButton: '建立免費帳戶',
    forgotLink: '忘記密碼？',
    backToSignIn: '返回登入',
    working: '請稍候…',
    checkEmailTitle: '請查收電子郵件',
    checkEmailBody: '我們已向 {email} 寄送確認連結。請開啟連結啟用您的帳戶。',
    resend: '重新寄送確認郵件',
    resent: '如果該地址仍需確認，新的連結已寄出。',
    invalidCredentials: '電子郵件或密碼不正確。',
    notConfirmed: '請先確認您的電子郵件地址，確認連結已寄到您的收件匣。',
    suspended: '此帳戶已被停用。如需協助，請聯絡 info@nexavoris.ai。',
    weakPassword: '請設定更安全的密碼，至少 7 個字元。',
    passwordMismatch: '兩次輸入的密碼不一致。',
    samePassword: '新密碼不能與目前密碼相同。',
    invalidEmail: '請輸入有效的電子郵件地址。',
    rateLimited: '嘗試次數過多，請稍候幾分鐘再試。',
    genericError: '發生問題，請重試。',
    forgotTitle: '重設密碼',
    forgotIntro: '輸入您的帳戶電子郵件，我們將寄送安全連結讓您設定新密碼。',
    sendResetLink: '寄送重設連結',
    resetSent: '如果 {email} 有帳戶，密碼重設連結已寄出。',
    resetTitle: '設定新密碼',
    resetIntro: '為您的 Nexavoris 帳戶輸入新密碼。',
    newPassword: '新密碼',
    updatePassword: '儲存新密碼',
    linkExpired: '此連結已過期或已被使用，請重新申請。',
    verifyTitle: '確認以繼續',
    verifyIntro: '為保障安全，請點擊按鈕完成電子郵件連結驗證。',
    verifyButton: '繼續',
    verifyInvalid: '此連結無效或已過期。',
    requestNewLink: '重新申請連結',
  },
  es: {
    signInTitle: 'Inicie sesión en Nexavoris',
    signInIntro: 'Acceda a sus evaluaciones guardadas, informes de oportunidades, escenarios de ROI y hoja de ruta.',
    registerTitle: 'Cree su cuenta gratuita',
    registerIntro: 'Guarde su evaluación de IA + ERP y siga mejorando su plan. Gratis, sin tarjeta de crédito.',
    tabSignIn: 'Iniciar sesión',
    tabRegister: 'Crear cuenta',
    email: 'Correo electrónico de trabajo',
    password: 'Contraseña',
    passwordHint: 'Al menos 7 caracteres.',
    confirmPassword: 'Confirmar contraseña',
    fullName: 'Nombre completo (opcional)',
    signInButton: 'Iniciar sesión',
    registerButton: 'Crear cuenta gratuita',
    forgotLink: '¿Olvidó su contraseña?',
    backToSignIn: 'Volver a iniciar sesión',
    working: 'Espere…',
    checkEmailTitle: 'Revise su correo',
    checkEmailBody: 'Enviamos un enlace de confirmación a {email}. Ábralo para activar su cuenta.',
    resend: 'Reenviar correo de confirmación',
    resent: 'Si la dirección aún necesita confirmación, le enviamos un nuevo enlace.',
    invalidCredentials: 'La combinación de correo y contraseña no es correcta.',
    notConfirmed: 'Primero confirme su dirección de correo. Revise su bandeja de entrada.',
    suspended: 'Esta cuenta está suspendida. Escriba a info@nexavoris.ai para obtener ayuda.',
    weakPassword: 'Elija una contraseña más segura, de al menos 7 caracteres.',
    passwordMismatch: 'Las contraseñas no coinciden.',
    samePassword: 'Elija una contraseña distinta de la actual.',
    invalidEmail: 'Introduzca un correo electrónico válido.',
    rateLimited: 'Demasiados intentos. Espere unos minutos e inténtelo de nuevo.',
    genericError: 'Algo salió mal. Inténtelo de nuevo.',
    forgotTitle: 'Restablezca su contraseña',
    forgotIntro: 'Introduzca el correo de su cuenta y le enviaremos un enlace seguro para elegir una nueva contraseña.',
    sendResetLink: 'Enviar enlace',
    resetSent: 'Si existe una cuenta para {email}, le enviamos un enlace para restablecer la contraseña.',
    resetTitle: 'Elija una nueva contraseña',
    resetIntro: 'Introduzca una nueva contraseña para su cuenta de Nexavoris.',
    newPassword: 'Nueva contraseña',
    updatePassword: 'Guardar contraseña',
    linkExpired: 'Este enlace caducó o ya se utilizó. Solicite uno nuevo.',
    verifyTitle: 'Confirme para continuar',
    verifyIntro: 'Por seguridad, pulse el botón para terminar de verificar el enlace de su correo.',
    verifyButton: 'Continuar',
    verifyInvalid: 'Este enlace no es válido o caducó.',
    requestNewLink: 'Solicitar un nuevo enlace',
  },
};

/** Language from ?lang=, else the lang carried inside the `next` path, else English. */
export function resolveAuthLocale(lang?: string | null, next?: string | null): Locale {
  if (lang && isLocale(lang)) return lang;
  if (next) {
    try {
      const inner = new URL(next, 'https://nexavoris.invalid').searchParams.get('lang');
      if (inner && isLocale(inner)) return inner;
    } catch {
      // fall through to English
    }
  }
  return 'en';
}

/** One search-param value (Next passes repeated keys as arrays). */
export const firstParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/** Appends ?lang= / &lang= for non-English locales. */
export function withLang(path: string, locale: Locale) {
  if (locale === 'en') return path;
  return `${path}${path.includes('?') ? '&' : '?'}lang=${locale}`;
}
