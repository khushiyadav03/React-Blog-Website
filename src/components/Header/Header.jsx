import {Container, Logo, LogoutBtn} from '../index'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {useSelector} from 'react-redux'

function Header() {
  const authStatus = useSelector((state) => state.auth.status)
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    {
      name: 'Home',
      slug: "/",
      active: true
    }, 
    {
      name: "Explore",
      slug: "/posts",
      active: true,
    },
    {
      name: "Search",
      slug: "/search",
      active: true,
    },
    {
      name: "Login",
      slug: "/login",
      active: !authStatus,
  },
  {
      name: "Signup",
      slug: "/signup",
      active: !authStatus,
  },
  {
      name: "Dashboard",
      slug: "/dashboard",
      active: authStatus,
  },
  {
      name: "Write",
      slug: "/dashboard/posts/new",
      active: authStatus,
  },
  ]


  return (
    <header className='sticky top-0 z-50 border-b border-slate-200/80 bg-stone-50/90 py-3 backdrop-blur-xl'>
      <Container>
        <nav className='flex flex-col gap-3 md:flex-row md:items-center'>
          <div className='mr-4 flex items-center justify-between'>
            <Link to='/' className="text-xl font-black tracking-tight text-slate-950">
              <Logo width='132px'   />
            </Link>
          </div>
          <ul className='ml-auto flex flex-wrap items-center gap-1.5'>
            {navItems.map((item) => 
            item.active ? (
              <li key={item.name}>
                <button
                onClick={() => navigate(item.slug)}
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold duration-200 ${
                  location.pathname === item.slug
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm"
                }`}
                >{item.name}</button>
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
