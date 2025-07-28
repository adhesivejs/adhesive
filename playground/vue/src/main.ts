import { vAdhesive } from "@adhesivejs/vue";
import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";

createApp(App).directive("adhesive", vAdhesive).mount("#app");
