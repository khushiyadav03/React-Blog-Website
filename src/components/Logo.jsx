function Logo({width = '100px'}) {
    return (
        <div style={{width}} className="inline-flex min-w-max items-center gap-2.5 text-current">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white shadow-sm ring-1 ring-white/10">
                B
            </span>
            <span className="leading-none">
                <span className="block text-lg font-black tracking-tight">Blogfolio</span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">Journal</span>
            </span>
        </div>
    )
}

export default Logo;
