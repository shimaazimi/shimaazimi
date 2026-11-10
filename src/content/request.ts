import type { Text } from './content';

// Web3Forms access key. Keys are meant to be public; leave empty to send every request by email instead.
export const FORM_KEY = '';

type Option = { id: string; label: Text };

export const request = {
  kicker: { en: 'Start a project', fa: 'شروع پروژه' } as Text,
  title: { en: 'Tell me about your idea.', fa: 'ایده‌ات را برایم بنویس.' } as Text,
  intro: {
    en: 'Three short steps, about two minutes. I read every request myself.',
    fa: 'سه مرحله‌ی کوتاه، حدود دو دقیقه. همه‌ی درخواست‌ها را خودم می‌خوانم.',
  } as Text,
  steps: [
    { en: 'The project', fa: 'پروژه' },
    { en: 'Scope', fa: 'دامنه‌ی کار' },
    { en: 'You', fa: 'اطلاعات تو' },
  ] as Text[],

  type: {
    label: { en: 'What do you need?', fa: 'چه چیزی لازم داری؟' } as Text,
    options: [
      { id: 'website', label: { en: 'Website', fa: 'وب‌سایت' } },
      { id: 'store', label: { en: 'Online store', fa: 'فروشگاه آنلاین' } },
      { id: 'webapp', label: { en: 'Web app or dashboard', fa: 'وب‌اپ یا داشبورد' } },
      { id: 'mobile', label: { en: 'Mobile app', fa: 'اپلیکیشن موبایل' } },
      { id: 'other', label: { en: 'Something else', fa: 'چیز دیگری' } },
    ] as Option[],
  },
  stage: {
    label: { en: 'Where are you now?', fa: 'الان در چه مرحله‌ای هستی؟' } as Text,
    options: [
      { id: 'idea', label: { en: 'Just an idea', fa: 'فقط یک ایده دارم' } },
      { id: 'design', label: { en: 'I have a design', fa: 'طراحی آماده دارم' } },
      { id: 'existing', label: { en: 'Improve an existing product', fa: 'محصول موجود را بهتر کنم' } },
    ] as Option[],
  },
  features: {
    label: { en: 'What should it include?', fa: 'چه امکاناتی لازم است؟' } as Text,
    hint: { en: 'Pick any that apply.', fa: 'هر چند مورد که لازم است.' } as Text,
    options: [
      { id: 'accounts', label: { en: 'User accounts', fa: 'حساب کاربری' } },
      { id: 'payments', label: { en: 'Online payments', fa: 'پرداخت آنلاین' } },
      { id: 'admin', label: { en: 'Admin panel', fa: 'پنل مدیریت' } },
      { id: 'bilingual', label: { en: 'Two languages', fa: 'دوزبانه' } },
      { id: 'content', label: { en: 'Blog or content updates', fa: 'وبلاگ یا به‌روزرسانی محتوا' } },
      { id: 'notsure', label: { en: 'Not sure yet', fa: 'هنوز نمی‌دانم' } },
    ] as Option[],
  },
  timeline: {
    label: { en: 'When do you need it?', fa: 'کی لازمش داری؟' } as Text,
    options: [
      { id: 'asap', label: { en: 'As soon as possible', fa: 'هرچه زودتر' } },
      { id: '1-3', label: { en: 'In 1–3 months', fa: 'ظرف ۱ تا ۳ ماه' } },
      { id: 'flexible', label: { en: 'Flexible', fa: 'زمان انعطاف دارد' } },
    ] as Option[],
  },
  budget: {
    label: { en: 'Approximate budget', fa: 'بودجه‌ی تقریبی' } as Text,
    hint: { en: 'Optional. A rough range helps me suggest the right scope.', fa: 'اختیاری. یک بازه‌ی تقریبی کمک می‌کند دامنه‌ی مناسب را پیشنهاد بدهم.' } as Text,
  },
  name: { en: 'Your name', fa: 'نام تو' } as Text,
  contact: {
    label: { en: 'How can I reach you?', fa: 'از چه راهی با تو در تماس باشم؟' } as Text,
    hint: { en: 'Email, phone, or Telegram ID.', fa: 'ایمیل، شماره تلفن یا آیدی تلگرام.' } as Text,
  },
  message: {
    label: { en: 'Anything else?', fa: 'توضیح بیشتر' } as Text,
    hint: { en: 'Optional. Links to examples you like are welcome.', fa: 'اختیاری. لینک نمونه‌هایی که دوست داری هم خوب است.' } as Text,
  },

  next: { en: 'Next', fa: 'بعدی' } as Text,
  back: { en: 'Back', fa: 'قبلی' } as Text,
  send: { en: 'Send request', fa: 'ارسال درخواست' } as Text,
  sending: { en: 'Sending…', fa: 'در حال ارسال…' } as Text,
  required: { en: 'Please choose or fill this in.', fa: 'لطفاً این مورد را انتخاب یا پر کن.' } as Text,
  stepOf: { en: 'Step {n} of 3', fa: 'مرحله‌ی {n} از ۳' } as Text,

  sent: {
    title: { en: 'Thank you, your request is in.', fa: 'ممنون، درخواستت رسید.' } as Text,
    body: { en: 'I will read it and get back to you soon.', fa: 'آن را می‌خوانم و به‌زودی جواب می‌دهم.' } as Text,
  },
  byEmail: {
    title: { en: 'One last step: send the email.', fa: 'یک قدم مانده: ایمیل را بفرست.' } as Text,
    body: {
      en: 'Your email app should have opened with the request filled in. If it did not, copy the summary below and send it to',
      fa: 'برنامه‌ی ایمیلت باید با متن آماده باز شده باشد. اگر باز نشد، خلاصه‌ی زیر را کپی کن و بفرست به',
    } as Text,
    copy: { en: 'Copy summary', fa: 'کپی خلاصه' } as Text,
    copied: { en: 'Copied', fa: 'کپی شد' } as Text,
    open: { en: 'Open email again', fa: 'باز کردن دوباره‌ی ایمیل' } as Text,
  },
  again: { en: 'Send another request', fa: 'ارسال درخواست دیگر' } as Text,
};
