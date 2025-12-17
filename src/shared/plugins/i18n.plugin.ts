import { createI18n } from "vue-i18n";
import translate from "@/data/translate";
import { Language } from "@/domain/enums/language.enum";

const i18n = createI18n({
    locale: Language.Vietnamese,
    legacy: false,
    globalInjection: true,
    fallbackLocale: Language.Vietnamese,
    messages: translate,
})

export default i18n;