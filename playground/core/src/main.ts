import { Adhesive, type AdhesivePosition } from "@adhesivejs/core";
import "./style.css";

let count = 0;
let enabled = true;
let position: AdhesivePosition = "top";

let adhesiveInstance: Adhesive | null = null;

function setupAdhesive() {
  if (adhesiveInstance) {
    adhesiveInstance.cleanup();
    adhesiveInstance = null;
  }

  adhesiveInstance = Adhesive.create({
    targetEl: "#target-element",
    boundingEl: "#bounding-element",
    enabled,
    position,
  });
}

function updateApp() {
  setupAdhesive();

  const toggleButton = document.querySelector("#enable-toggle");
  if (toggleButton) {
    toggleButton.textContent = enabled ? "Disable Sticky" : "Enable Sticky";
  }

  const positionButton = document.querySelector("#position-toggle");
  if (positionButton) {
    positionButton.textContent = `Switch to ${position === "top" ? "bottom" : "top"}`;
  }

  const counterButton = document.querySelector("#counter");
  if (counterButton) {
    counterButton.textContent = `count is ${count}`;
  }
}

function setupApp() {
  updateApp();

  document.body.addEventListener("click", (event) => {
    if (event.target instanceof HTMLButtonElement) {
      if (event.target.id === "enable-toggle") {
        enabled = !enabled;
        updateApp();
        return;
      }

      if (event.target.id === "position-toggle") {
        position = position === "top" ? "bottom" : "top";
        updateApp();
        return;
      }

      if (event.target.id === "counter") {
        count++;
        updateApp();
        return;
      }
    }
  });
}

setupApp();
