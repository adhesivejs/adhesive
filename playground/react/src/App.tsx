import {
  AdhesiveContainer,
  useAdhesive,
  type AdhesivePosition,
} from "@adhesivejs/react";
import { useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import viteLogo from "/vite.svg";

export function App() {
  const [count, setCount] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const [position, setPosition] = useState<AdhesivePosition>("top");

  const targetEl = useRef<HTMLDivElement>(null);
  const boundingEl = useRef<HTMLDivElement>(null);

  useAdhesive(targetEl, { boundingEl, enabled, position });

  return (
    <div>
      <button onClick={() => setEnabled(!enabled)}>
        {enabled ? "Disable" : "Enable"} Sticky
      </button>

      <button
        onClick={() => setPosition(position === "top" ? "bottom" : "top")}
      >
        Switch to {position === "top" ? "bottom" : "top"}
      </button>
      <br />
      <br />
      <div ref={boundingEl}>
        <div ref={targetEl}>Sticky Element</div>
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <div className="adhesive-container">
        <AdhesiveContainer
          enabled={enabled}
          position={position}
          boundingEl=".adhesive-container"
          className="custom-class"
          outerClassName="custom-outer"
          innerClassName="custom-inner"
          activeClassName="custom-active"
          releasedClassName="custom-released"
          style={{
            width: "100%",
            height: "100px",
            backgroundColor: "lightblue",
          }}
        >
          Sticky Element
        </AdhesiveContainer>
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}
