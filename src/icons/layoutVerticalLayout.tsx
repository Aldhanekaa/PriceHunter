export default function LayoutListIcon({
  className = "w-5 h-5",
}: {
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4 2h6a1 1 0 0 1 1 1v18a1 1 0 0 1 -1 1h-6a2 2 0 0 1 -2 -2v-16a2 2 0 0 1 2 -2" />
      <path d="M14 2h6a2 2 0 0 1 2 2v16a2 2 0 0 1 -2 2h-6a1 1 0 0 1 -1 -1v-18a1 1 0 0 1 1 -1" />
    </svg>
  );
}
