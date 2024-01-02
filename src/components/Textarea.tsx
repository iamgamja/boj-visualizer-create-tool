export default function Textarea({
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
      <div>
        <textarea
          className="my-2 font-mono text-sm h-16 border-none outline-none"
          onChange={(e) => onChange(e.target.value)}
        ></textarea>
      </div>
    </label>
  );
}
