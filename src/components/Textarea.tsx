export default function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
}) {
  return (
    <label>
      {label}
      {" : "}
      <div>
        <textarea
          value={value}
          className="my-2 font-mono text-sm h-16 border-none outline-none"
          onChange={(e) => onChange(e.target.value)}
        ></textarea>
      </div>
    </label>
  );
}
