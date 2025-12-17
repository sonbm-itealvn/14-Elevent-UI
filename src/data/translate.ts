import { Language } from "@/domain/enums/language.enum";

const modules = import.meta.glob('./locales/**/**/*.json', { eager: true });

const translate: any = {};

for (const path in modules) {
    const matched = path.match(/locales\/(.*?)\/(.*?)\.json$/);
    if (!matched) continue;

    const locale = matched[1]; 
    const moduleName = matched[2];   

    const enumKey = Object.values(Language).find(
        (item) => item.toLowerCase() === locale.toLowerCase()
    );

    if (!enumKey) continue; 

    if (!translate[enumKey]) translate[enumKey] = {};

    translate[enumKey][moduleName] = modules[path];
}

export default translate;
