import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import { login as authLogin } from '../store/authSlice'
import {Button, Input, Logo} from "./index"
import {useDispatch} from "react-redux"
import authService from "../appwrite/auth"
import {useForm} from "react-hook-form"

function Login() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    // react-hook-form se form fields register aur submit handle karte hain.
    const {register, handleSubmit} = useForm()
    const [error, setError] = useState("")

    const login = async(data) => {
        // Har new login attempt par previous error clear kar dete hain.
        setError("")
        try {
            // Appwrite me email/password se login session create karte hain.
            const session = await authService.login(data)
            if (session) {
                // Login success ke baad current user data fetch karte hain.
                const userData = await authService.getCurrentUser()
                if(userData) dispatch(authLogin(userData));
                // Redux me user save karke home page par redirect karte hain.
                navigate("/")
            }
        } catch (error) {
            // Login fail ho to error message UI me show hota hai.
            setError(error.message)
        }
    }

  return (
    <div className='flex w-full items-center justify-center px-4'>
        <div className={`mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm`}>
        <div className="mb-2 flex justify-center">
                    <span className="inline-block w-full max-w-[100px]">
                        <Logo width="100%" />
                    </span>
        </div>
        <h2 className="text-center text-2xl font-bold leading-tight text-slate-950">Sign in to your account</h2>
        <p className="mt-2 text-center text-base text-slate-600">
                    Don&apos;t have any account?&nbsp;
                    <Link
                        to="/signup"
                        className="font-semibold text-emerald-700 transition-all duration-200 hover:underline"
                    >
                        Sign Up
                    </Link>
        </p>
        {/* Error state me message red color me dikhate hain. */}
        {error && <p className="mt-8 rounded-md bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-700">{error}</p>}
        <form onSubmit={handleSubmit(login)} className='mt-8'>
            <div className='space-y-5'>
                <Input
                label="Email: "
                placeholder="Enter your email"
                type="email"
                autoComplete="email"
                {...register("email", {
                    required: true,
                    validate: {
                        // Basic email format validation.
                        matchPatern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                        "Email address must be a valid address",
                    }
                })}
                />
                <Input
                label="Password: "
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register("password", {
                    required: true,
                })}
                />
                <Button
                type="submit"
                className="w-full hover:bg-emerald-700"
                >Sign in</Button>
            </div>
        </form>
        </div>
    </div>
  )
}

export default Login
