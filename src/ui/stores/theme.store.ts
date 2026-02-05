import { defineStore } from "pinia";

const useThemeStore = defineStore('theme', {
    state: () => ({
        theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light"
    }),
    actions: {
        setTheme() {
            this.theme = this.theme === "light" ? "dark" : "light";
            this.syncHtmlClass();
        },
        syncHtmlClass() {
            if (this.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    },
    getters: {
        getTheme: (state) => state.theme
    }
})

export default useThemeStore;