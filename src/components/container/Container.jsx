// Reusable wrapper jo content ko center me rakhta hai aur max width set karta hai.
function Container({children}) {
    return (
        // children ka matlab: jo bhi content Container ke andar pass hoga.
        <div className='w-full max-w-7xl mx-auto px-4'>{children}</div>
    )
}

export default Container
