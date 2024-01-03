export default function Input({
  type,
  label,
  value,
  onChange,
}: {
  type?: React.HTMLInputTypeAttribute;
  label: string;
  value: string;
  onChange: (s: string) => void;
}) {
  return (
    <label>
      {label}
      {" : "}
      <input
        type={type}
        className="my-2 font-mono text-sm border-none outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      ></input>
    </label>
  );
}
