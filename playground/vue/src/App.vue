<script setup lang="ts">
import { AdhesiveContainer, useAdhesive } from "@adhesivejs/vue";
import { ref, useTemplateRef } from "vue";

const count = ref(0);

const targetEl = useTemplateRef("target");
const boundingEl = useTemplateRef("bounding");

useAdhesive({ target: targetEl, bounding: boundingEl });
</script>

<template>
  <div>
    <div ref="bounding">
      <div ref="target">Sticky Element</div>
      <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
        <img src="/vite.svg" class="logo" alt="Vite logo" />
      </a>
      <a href="https://vuejs.org/" target="_blank" rel="noopener noreferrer">
        <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
      </a>
    </div>
  </div>
  <AdhesiveContainer position="bottom">
    <div class="sticky-container">
      <div class="sticky-content">Sticky Component</div>
    </div>
  </AdhesiveContainer>
  <h1>Vite + Vue</h1>
  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>src/App.vue</code> and save to test HMR
    </p>
  </div>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.read-the-docs {
  color: #888;
}
</style>
