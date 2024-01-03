export default function Select({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (s: string) => void;
}) {
  return (
    <label>
      {label}
      {" : "}
      <select
        className="my-2 font-mono text-sm border-none outline-none"
        onChange={(e) => onChange(e.target.value)}
        value={value}
      >
        {options.map((s, idx) => (
          <option value={s} key={idx}>
            {s}
          </option>
        ))}
      </select>
    </label>
  );
}
