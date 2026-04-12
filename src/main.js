import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router, { installRouterGuards } from "./router";
import "./styles.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
installRouterGuards(router, pinia);
app.use(router);
app.mount("#app");
