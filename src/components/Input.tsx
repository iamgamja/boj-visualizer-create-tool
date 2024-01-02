export default function Input({
  label = "",
  onChange,
}: {
  label?: string;
  onChange: (s: string) => void;
}) {
  return (
    <label>
      {label}
      {" : "}
      <input
        className="my-2 font-mono text-sm border-none outline-none"
        onChange={(e) => onChange(e.target.value)}
      ></input>
    </label>
  );
}
