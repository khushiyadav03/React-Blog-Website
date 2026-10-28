export default function Button({
    children,
    type = "button",
    bgColor = "bg-slate-950",
    textColor = "text-white",
    className = "",
    ...props
}) {
    return (
        <button
            type={type}
            className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold tracking-tight transition-all duration-200 shadow-[0_10px_20px_-15px_rgba(15,23,42,0.6)] hover:-translate-y-0.5 hover:shadow-[0_18px_28px_-18px_rgba(15,23,42,0.48)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 ${bgColor} ${textColor} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
