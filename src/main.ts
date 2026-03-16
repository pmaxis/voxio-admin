import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from '@/App.vue';
import router from './app/router';
import '@/style.css';
import { initApiProvider } from './app/providers/api.provider';
import { useThemeStore } from '@/features/theme/store';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

initApiProvider();

const themeStore = useThemeStore();
themeStore.initTheme();

app.mount('#app');
