import { useDispatch } from 'react-redux';
import authService from '../../appwrite/auth';
import { logout } from '../../store/authSlice';

function LogoutBtn() {
    const dispatch = useDispatch()
    const logoutHandler = () => {
        authService.logout().then(() => {
            dispatch(logout())
        })
    }
    return (
        <button
            onClick={logoutHandler}
            className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-slate-600 duration-200 hover:bg-red-50 hover:text-red-700"
        >
            Logout
        </button>
    )
}

export default LogoutBtn
