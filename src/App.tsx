import { useState } from "react";
import SetData from "./components/SetData";
import SetParseBoard from "./components/SetParseBoard";

export default function App() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<string[]>([
    `
      /* eslint-disable @typescript-eslint/no-explicit-any */
      import {
        Cell,
        Board,
        stepstype,
        datatype,
        Direction,
        styletype,
      } from "../utils";
    `.trim(),
  ]);

  function nextStep(data: string) {
    setData((prev) => [...prev, data]);
    setStep((prev) => prev + 1);
  }

  return (
    <>
      <div className="h-full flex flex-col">
        <h2 className="p-16 font-bold text-5xl text-center">
          BOJ Visualizer Create Tool
        </h2>

        <code>
          <pre>{data.join("\n\n")}</pre>
        </code>

        {step === 0 && <SetData next={nextStep} />}
        {step === 1 && <SetParseBoard next={nextStep} />}
      </div>
    </>
  );
}
