// Reusable wrapper jo content ko center me rakhta hai aur max width set karta hai.
function Container({children}) {
    return (
        <div className='mx-auto w-full max-w-7xl px-4 sm:px-6 xl:px-8'>{children}</div>
    )
}

export default Container
