import i18n from "../plugins/i18n.plugin"

const translate = (key: string) => {
    if (!key) return "";
    
    // Try to translate with common prefix first
    const commonKey = `common.${key}`;
    const commonTranslation = i18n.global.t(commonKey);
    
    // If translation found and different from key, return it
    if (commonTranslation && commonTranslation !== commonKey) {
        return commonTranslation as string;
    }
    
    // Otherwise try direct key
    const directTranslation = i18n.global.t(key);
    if (directTranslation && directTranslation !== key) {
        return directTranslation as string;
    }
    
    // If no translation found, return the original key
    return key;
}

export { translate };