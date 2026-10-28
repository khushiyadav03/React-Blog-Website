import { Container, Logo, LogoutBtn } from '../index'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

function Header() {
  const authStatus = useSelector((state) => state.auth.status)
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { name: 'Home', slug: '/', active: true },
    { name: 'Explore', slug: '/posts', active: true },
    { name: 'Search', slug: '/search', active: true },
    { name: 'Login', slug: '/login', active: !authStatus },
    { name: 'Signup', slug: '/signup', active: !authStatus },
    { name: 'Dashboard', slug: '/dashboard', active: authStatus },
    { name: 'Write', slug: '/dashboard/posts/new', active: authStatus },
  ]

  return (
    <header className='sticky top-0 z-50 border-b border-slate-200/80 bg-[#f5f5f4]/85 backdrop-blur-xl'>
      <Container>
        <nav className='flex items-center gap-3 py-3'>
          <div className='mr-2 flex items-center'>
            <Link to='/' className='rounded-full border border-slate-200 bg-white/80 p-2 shadow-sm transition hover:border-slate-300'>
              <Logo width='132px' />
            </Link>
          </div>

          <ul className='ml-auto flex flex-wrap items-center justify-end gap-2'>
            {navItems.map((item) =>
              item.active ? (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.slug)}
                    className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                      location.pathname === item.slug
                        ? 'bg-slate-950 text-white shadow-[0_14px_24px_-18px_rgba(15,23,42,0.8)]'
                        : 'text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm'
                    }`}
                  >
                    {item.name}
                  </button>
                </li>
              ) : null
            )}
            {authStatus && (
              <li>
                <LogoutBtn />
              </li>
            )}
          </ul>
        </nav>
      </Container>
    </header>
  )
}

export default Header
