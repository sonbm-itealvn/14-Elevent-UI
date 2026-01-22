import { createApp } from 'vue';
import '@/shared/styles/style.css';
import App from '@/App.vue';
import i18n from '@/shared/plugins/i18n.plugin';
import router from '@/ui/routes';
import { createPinia } from 'pinia';
import { PerfectScrollbarPlugin } from 'vue3-perfect-scrollbar';
import useAuthStore from '@/ui/stores/auth.store';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);
app.use(PerfectScrollbarPlugin);

// Initialize auth store on app start
const authStore = useAuthStore();
authStore.checkAuth().then(() => {
  app.mount('#app');
});
