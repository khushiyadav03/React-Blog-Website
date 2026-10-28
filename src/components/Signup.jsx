import { useState } from 'react';
import authService from '@/services/auth';
import blogService from '@/services/config';
import { Link, useNavigate } from 'react-router-dom';
import { login as authLogin } from '../store/authSlice'
import { Button, Input, Logo } from './index'
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';

function Signup() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [error, setError] = useState("")
    const [accountExists, setAccountExists] = useState(false)
    const { register, handleSubmit } = useForm()

    const create = async (data) => {
        setError("")
        setAccountExists(false)
        try {
            const userData = await authService.createAccount(data)
            if (userData) {
                const currentUser = await authService.getCurrentUser()
                if (currentUser) {
                    await blogService.upsertProfile({
                        userID: currentUser.$id,
                        name: currentUser.name,
                        bio: "",
                        website: "",
                        github: "",
                        linkedin: "",
                    });
                    dispatch(authLogin(currentUser));
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
        <div className='flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-10'>
            <div className='grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_25px_65px_-35px_rgba(15,23,42,0.38)] lg:grid-cols-[1.15fr_0.85fr]'>
                <div className='hidden bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),transparent_55%),linear-gradient(135deg,#ecfdf5,#ffffff_45%)] p-8 lg:flex lg:flex-col lg:justify-between'>
                    <div className='inline-flex w-fit items-center rounded-full border border-emerald-200 bg-white/80 p-2.5 shadow-sm'>
                        <Logo width='132px' />
                    </div>
                    <div>
                        <p className='mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700'>Create your profile</p>
                        <h1 className='text-4xl font-black tracking-tight text-slate-950'>Set up your writer identity.</h1>
                        <p className='mt-4 max-w-md text-base leading-7 text-slate-600'>Start publishing your own ideas, save favorite reads, and build a clean personal author presence.</p>
                    </div>
                    <div className='rounded-[1.5rem] border border-emerald-100 bg-white/80 p-4 shadow-sm'>
                        <p className='text-sm font-medium text-slate-500'>Why join</p>
                        <ul className='mt-3 space-y-3 text-sm text-slate-700'>
                            <li>• Publish new writing</li>
                            <li>• Save interesting posts</li>
                            <li>• Manage your author profile</li>
                        </ul>
                    </div>
                </div>

                <div className='p-6 sm:p-8 lg:p-10'>
                    <div className='mb-5 flex justify-center lg:hidden'>
                        <span className='inline-block w-full max-w-[110px]'>
                            <Logo width='100%' />
                        </span>
                    </div>

                    <h2 className='text-center text-2xl font-black leading-tight text-slate-950'>Sign up to create account</h2>
                    <p className='mt-2 text-center text-base text-slate-600'>
                        Already have an Account?&nbsp;
                        <Link to='/login' className='font-semibold text-emerald-700 transition hover:underline'>
                            Sign In
                        </Link>
                    </p>

                    {error && (
                        <div className='mt-6 rounded-2xl bg-red-50 px-3 py-3 text-center text-sm font-medium text-red-700'>
                            <p>{error}</p>
                            {accountExists && (
                                <Link to='/login' className='mt-1 inline-block font-semibold text-red-800 underline underline-offset-2'>
                                    Sign in instead
                                </Link>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(create)} className='mt-8'>
                        <div className='space-y-5'>
                            <Input
                                label='Full Name:'
                                placeholder='Enter your full name'
                                autoComplete='name'
                                {...register('name', { required: true })}
                            />

                            <Input
                                label='Email:'
                                placeholder='Enter your Email'
                                type='email'
                                autoComplete='email'
                                {...register('email', {
                                    required: true,
                                    validate: {
                                        matchPatern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                                            'Email address must be a valid address',
                                    },
                                })}
                            />

                            <Input
                                label='Password:'
                                type='password'
                                placeholder='Enter your password'
                                autoComplete='new-password'
                                {...register('password', { required: true })}
                            />

                            <Button type='submit' className='w-full bg-slate-950 hover:bg-emerald-700'>
                                Create Account
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Signup
