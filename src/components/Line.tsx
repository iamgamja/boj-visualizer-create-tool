export default function Line({
  highlighted = false,
}: {
  highlighted?: boolean;
}) {
  return (
    <div
      className={`${
        highlighted
          ? "border-gray-900 border-b-[2px]"
          : "border-gray-400 border-b-[1px]"
      }`}
    ></div>
  );
}
