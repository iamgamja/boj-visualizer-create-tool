import { useRef } from "react";

export default function Select({
  label,
  options,
  value,
  colorobj,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  colorobj: Record<string, string>;
  onChange: (s: string) => void;
}) {
  const select = useRef<HTMLSelectElement>(null);
  return (
    <label>
      {label}
      {" : "}
      <select
        ref={select}
        className={`my-2 font-mono text-sm border-none outline-none ${value} ${colorobj[value]}`}
        onChange={(e) => onChange(e.target.value)}
        value={value}
      >
        {options.map((s, idx) => (
          <option value={s} className={`${s} ${colorobj[s]}`} key={idx}>
            {s}
          </option>
        ))}
      </select>
    </label>
  );
}
