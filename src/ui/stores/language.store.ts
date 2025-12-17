import { Language } from "@/domain/enums/language.enum";
import i18n from "@/shared/plugins/i18n.plugin";
import { defineStore } from "pinia";

const useLanguageStore = defineStore("language", {
  state: () => ({   
    language: i18n.global.locale.value as Language,
  }),
  actions: {
    setLanguage(language: Language) {
      i18n.global.locale.value = language as typeof i18n.global.locale.value;
      this.language = language;
    },
  },
  getters: {
    getLanguage: (state) => state.language,
  },
});

export default useLanguageStore;