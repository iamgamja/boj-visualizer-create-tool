export default function Button({
  children,
  rev = false,
  highlighted = false,
  onClick,
}: {
  children: React.ReactNode;
  rev?: boolean;
  highlighted?: boolean;
  onClick: () => void;
}) {
  return (
    <div className={`${rev && "flex flex-row-reverse"}`}>
      <button
        className={`px-2 py-1 rounded ${
          highlighted ? "bg-blue-500" : "bg-gray-400"
        }`}
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
}
