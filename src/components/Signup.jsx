import {useState} from 'react';
import authService from '@/appwrite/auth';
import appwriteService from '@/appwrite/config';
import { Link, useNavigate } from 'react-router-dom';
import { login as authLogin } from '../store/authSlice'
import {Button, Input, Logo} from './index'
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';



function Signup() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [error, setError] = useState("")
    const [accountExists, setAccountExists] = useState(false)
    const {register, handleSubmit} = useForm()

    const create = async(data) => {
        setError("")
        setAccountExists(false)
        try {
            const userData = await authService.createAccount(data)
            if(userData){
                const userData = await authService.getCurrentUser()
                if(userData) {
                    await appwriteService.upsertProfile({
                        userID: userData.$id,
                        name: userData.name,
                        bio: "",
                        website: "",
                        github: "",
                        linkedin: "",
                    });
                    dispatch(authLogin(userData));
                }
                navigate("/")
            }
        } catch (error) {
            const isDuplicateAccount = error?.code === 409 || error?.type === "user_already_exists";
            setAccountExists(isDuplicateAccount);
            setError(isDuplicateAccount ? "An account with this email already exists." : error.message)
        }
    }

    return (
        <div className='flex items-center justify-center px-4'>
            <div className={`mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm`}>
                <div className="mb-2 flex justify-center">
                    <span className="inline-block w-full max-w-[100px]">
                        <Logo width ="100%" />
                    </span>
                </div>
                <h2 className="text-center text-2xl font-bold leading-tight text-slate-950">Sign up to create account</h2>
                <p className="mt-2 text-center text-base text-slate-600">
                    Already have an Account?&nbsp;
                    <Link to="/login" className='font-semibold text-emerald-700 transition-all duration-200 hover:underline'>
                        Sign In
                    </Link>
                </p>
                {error && (
                    <div className="mt-8 rounded-md bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-700">
                        <p>{error}</p>
                        {accountExists && (
                            <Link to="/login" className="mt-1 inline-block font-semibold text-red-800 underline underline-offset-2">
                                Sign in instead
                            </Link>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit(create)} className="mt-8">
                    <div className='space-y-5'>
                        <Input
                        label = "Full Name: "
                        placeholder = "Enter your full name"
                        autoComplete="name"
                        {...register("name", {
                            required: true,
                        })}
                        />

                        <Input 
                        label = "Email: "
                        placeholder = "Enter your Email"
                        type="email"
                        autoComplete="email"
                        {...register("email", {
                            required: true,
                            validate: {
                                matchPatern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                                "Email address must be a valid address",
                            }
                        })}
                        />

                        <Input 
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        autoComplete="new-password"
                        {...register("password", {
                            required: true,})}
                        />

                        <Button type="submit" className='w-full hover:bg-emerald-700'>
                            Create Account
                        </Button>
                    </div>
                </form>
            </div>

        </div>
    )
}

export default Signup
