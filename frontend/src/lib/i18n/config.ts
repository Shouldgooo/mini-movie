export const LANGUAGE_STORAGE_KEY = "minimovie-language";
export const DEFAULT_LANGUAGE = "en" as const;

export const LANGUAGE_BOOTSTRAP_SCRIPT = `(function(){try{var s=localStorage.getItem(${JSON.stringify(LANGUAGE_STORAGE_KEY)});document.documentElement.lang=s==="zh"?"zh-CN":"en";}catch(e){document.documentElement.lang="en";}})();`;
