import { useState } from "react";
import Input from "./Input";
import Textarea from "./Textarea";
import Button from "./Button";
import Line from "./Line";
import Warning from "./Warning";

export default function SetData({ next }: { next: (data: string) => void }) {
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [examples, setExamples] = useState([""]);

  function makecode(): string {
    return `
    export const data: datatype = {
      name: "${name}",
      link: "${link}",
      examples: [
        ${examples.map((s) => "`" + s + "`,").join(" \n")}
      ]
    }
    `.trim();
  }

  return (
    <>
      <div className="flex flex-col gap-2 p-5 m-5 bg-gray-200 font-mono">
        <p>시뮬레이션의 정보를 설정합니다.</p>
        <Line highlighted />
        <Warning>
          name은 다른 시뮬레이션과 겹치지 않아야 합니다. 다른 시뮬레이션의
          이름은{" "}
          <a
            href="https://iamgamja.github.io/boj-visualizer/"
            className="underline"
          >
            BOJ Visualizer
          </a>
          에서 확인할 수 있습니다.
        </Warning>
        <Input label="name" value={name} onChange={setName} />
        <Line highlighted />
        <Input label="link" value={link} onChange={setLink} />
        <Line highlighted />
        {examples.map((_, idx) => (
          <div className="flex flex-col gap-2" key={idx}>
            <Textarea
              label={`example ${idx + 1}`}
              value={examples[idx]}
              onChange={(s) =>
                setExamples((prev) => {
                  const now = [...prev];
                  now[idx] = s;
                  return now;
                })
              }
            />
            <Line />
          </div>
        ))}
        <Button
          onClick={() =>
            setExamples((prev) => {
              const now = [...prev];
              now.push("");
              return now;
            })
          }
        >
          예제 입력 추가
        </Button>
        <Line highlighted />
        <Button onClick={() => next(makecode())} rev highlighted>
          Next
        </Button>
      </div>
    </>
  );
}
