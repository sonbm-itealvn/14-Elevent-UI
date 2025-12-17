import i18n from "../plugins/i18n.plugin"

const translate = (key: string) => {
    return i18n.global.t(key) as string;
}

export { translate };