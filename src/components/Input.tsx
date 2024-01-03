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
  if (type === "checkbox")
    return (
      <label>
        <input
          type={type}
          className="my-2 mx-2 font-mono text-sm border-none outline-none"
          value={value}
          onChange={(e) => onChange(e.target.checked ? "1" : "0")}
        ></input>
        {label}
      </label>
    );

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
