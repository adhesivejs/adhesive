<script setup lang="ts">
import {
  AdhesiveContainer,
  useAdhesive,
  type AdhesivePosition,
} from "@adhesivejs/vue";
import { ref, useTemplateRef } from "vue";

const count = ref(0);
const enabled = ref(true);
const position = ref<AdhesivePosition>("top");

const targetRef = useTemplateRef("target");
const boundingRef = useTemplateRef("bounding");

useAdhesive(targetRef, () => ({
  boundingRef: boundingRef.value,
  enabled: enabled.value,
  position: position.value,
}));
</script>

<template>
  <div>
    <button type="button" @click="enabled = !enabled">
      {{ enabled ? "Disable" : "Enable" }} Sticky
    </button>
    <button
      type="button"
      @click="position = position === 'top' ? 'bottom' : 'top'"
    >
      Switch to {{ position === "top" ? "bottom" : "top" }}
    </button>
    <br />
    <br />
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
  <div className="adhesive-container">
    <AdhesiveContainer
      :enabled
      :position
      bounding-el=".adhesive-container"
      class="custom-class"
      outer-class="custom-outer"
      inner-class="custom-inner"
      active-class="custom-active"
      released-class="custom-released"
      style="width: 100%; height: 100px; background-color: lightblue"
    >
      Sticky Element
    </AdhesiveContainer>
    <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank" rel="noopener noreferrer">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
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
