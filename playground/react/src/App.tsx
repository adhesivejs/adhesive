import { AdhesiveContainer, useAdhesive } from "@adhesivejs/react";
import { useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import type { AdhesivePosition } from "@adhesivejs/core";
import "./App.css";
import viteLogo from "/vite.svg";

export function App() {
  const [count, setCount] = useState(0);
  const [position, setPosition] = useState<AdhesivePosition>("top");

  const targetEl = useRef<HTMLDivElement>(null);
  const boundingEl = useRef<HTMLDivElement>(null);

  useAdhesive({ target: targetEl, bounding: boundingEl });

  return (
    <div>
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
          position={position}
          boundingEl=".adhesive-container"
          className="my-classname"
          outerClassName="my-outer-classname"
          innerClassName="my-inner-classname"
          activeClassName="my-active-classname"
          releasedClassName="my-released-classname"
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
      <button onClick={() => setPosition("top")}>Change Position to Top</button>
      <button onClick={() => setPosition("bottom")}>
        Change Position to Bottom
      </button>
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
