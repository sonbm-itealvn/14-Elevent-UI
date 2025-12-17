import { createApp } from 'vue'
import '@/shared/styles/style.css'
import App from '@/App.vue'
import i18n from '@/shared/plugins/i18n.plugin'
import router from '@/ui/routes'
import { createPinia } from 'pinia'
import { PerfectScrollbarPlugin } from 'vue3-perfect-scrollbar'
import { translate } from './shared/utils'


const app = createApp(App)

router.afterEach(() => {
    const titleKey = (router.currentRoute.value.name as string).toLowerCase();
    const nameTitle = translate('common.' + titleKey);
    document.title = nameTitle ? `${nameTitle} | FilmHub` : 'FilmHub';

})

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(PerfectScrollbarPlugin)


app.mount('#app')
