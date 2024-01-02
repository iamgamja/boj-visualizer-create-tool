import { useState } from "react";
import Input from "./Input";
import Textarea from "./Textarea";
import Button from "./Button";

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
        <Input label="name" onChange={setName} />
        <Input label="link" onChange={setLink} />
        {examples.map((s, idx) => (
          <Textarea
            label={`example ${idx + 1}`}
            onChange={(s) =>
              setExamples((prev) => {
                const now = [...prev];
                now[idx] = s;
                return now;
              })
            }
            key={idx}
          />
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
          + add example
        </Button>

        <Button onClick={() => next(makecode())} rev highlighted>
          Next
        </Button>
      </div>
    </>
  );
}
