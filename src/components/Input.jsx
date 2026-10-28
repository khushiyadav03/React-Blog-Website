import React, { useId } from 'react'

const Input = React.forwardRef(function Input({
    label,
    type = "text",
    className = "",
    ...props
}, ref) {
    const id = useId()

    return (
        <div className='w-full'>
            {label && (
                <label className='mb-1.5 inline-block pl-1 text-sm font-medium text-slate-700' htmlFor={id}>
                    {label}
                </label>
            )}
            <input
                type={type}
                className={`w-full rounded-2xl border border-slate-200 bg-white/90 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 ${className}`}
                ref={ref}
                {...props}
                id={id}
            />
        </div>
    )
})

export default Input
