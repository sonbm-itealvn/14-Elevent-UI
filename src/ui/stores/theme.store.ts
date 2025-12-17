import { defineStore } from "pinia";

const useThemeStore = defineStore('theme', {
    state: () => ({
        theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light"
    }),
    actions: {
        setTheme() {
            this.theme = this.theme === "light" ? "dark" : "light";
            console.log(this.theme);
        }
    },
    getters: {
        getTheme: (state) => state.theme
    }
})

export default useThemeStore;