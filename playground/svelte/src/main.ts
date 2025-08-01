import { mount } from "svelte";
import App from "./App.svelte";
import "./app.css";

const app = mount(App, {
  target: document.querySelector("#app")!,
});

// eslint-disable-next-line import/no-default-export
export default app;
