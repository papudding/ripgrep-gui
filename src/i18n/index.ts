import { createI18n } from 'vue-i18n';
import en from './locales/en';
import zhCN from './locales/zh-CN';

// 从localStorage或默认值获取语言偏好
const getDefaultLanguage = (): string => {
  const savedLang = localStorage.getItem('language');
  if (savedLang && ['en', 'zh-CN'].includes(savedLang)) {
    return savedLang;
  }
  // 获取浏览器语言
  const browserLang = navigator.language;
  if (browserLang.startsWith('zh')) {
    return 'zh-CN';
  }
  return 'en';
};

const i18n = createI18n({
  legacy: false, // 使用组合式API
  locale: getDefaultLanguage(),
  messages: {
    en,
    'zh-CN': zhCN
  }
});

export default i18n;