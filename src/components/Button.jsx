export default function Button({
    children,
    type = "button",
    bgColor = "bg-slate-950",
    textColor = "text-white",
    className = "",
    ...props
}) {

  // React forwardRef is a utility function that allows a parent component to pass a reference (ref) through a child component to access a specific DOM node or instance within that child
    return (
        <button type={type} className={`rounded-md px-4 py-2 font-semibold transition duration-200 ${bgColor} ${textColor} ${className}`} {...props}>
            {children}
        </button>
    );
}
