export default function Tooltip({ label, children, side = 'top' }) {
  const pos = side === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2';
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-50 w-max max-w-[16rem] -translate-x-1/2 rounded-md bg-sidebar px-2.5 py-1.5 text-center text-xs font-medium leading-snug text-white opacity-0 shadow-pop transition-opacity group-hover/tip:opacity-100 group-focus-within/tip:opacity-100 ${pos}`}
      >
        {label}
      </span>
    </span>
  );
}
