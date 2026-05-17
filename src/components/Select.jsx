import React , {useId} from 'react';

function Select ({
    options,
    labels = {},
    label,
    className = "",
    ...props
}, ref){
    const id = useId()
    return (
        <div className='w-full'>
            {label && <label htmlFor={id} className='mb-1 inline-block pl-1 text-sm font-medium text-slate-700'>{label}</label>}
            <select
            {...props}
            id={id}
            ref = {ref}
            className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 ${className}`}
            >
                {options?.map((option) => (
                    <option key={option} value={option}>
                        {labels[option] || option}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default React.forwardRef(Select);
