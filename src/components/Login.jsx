import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as authLogin } from '../store/authSlice'
import { Button, Input, Logo } from './index'
import { useDispatch } from 'react-redux'
import authService from '../services/auth'
import { useForm } from 'react-hook-form'

function Login() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { register, handleSubmit } = useForm()
    const [error, setError] = useState('')

    const login = async (data) => {
        setError('')
        try {
            const session = await authService.login(data)
            if (session) {
                const userData = await authService.getCurrentUser()
                if (userData) dispatch(authLogin(userData));
                navigate('/')
            }
        } catch (error) {
            setError(error.message)
        }
    }

    return (
        <div className='flex min-h-[calc(100vh-200px)] w-full items-center justify-center px-4 py-10'>
            <div className='grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_25px_65px_-35px_rgba(15,23,42,0.38)] lg:grid-cols-[1.15fr_0.85fr]'>
                <div className='hidden bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),transparent_55%),linear-gradient(135deg,#ecfdf5,#ffffff_45%)] p-8 lg:flex lg:flex-col lg:justify-between'>
                    <div className='inline-flex w-fit items-center rounded-full border border-emerald-200 bg-white/80 p-2.5 shadow-sm'>
                        <Logo width='132px' />
                    </div>
                    <div>
                        <p className='mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700'>Welcome back</p>
                        <h1 className='text-4xl font-black tracking-tight text-slate-950'>Continue your reading flow.</h1>
                        <p className='mt-4 max-w-md text-base leading-7 text-slate-600'>Manage saved posts, write new articles, and stay close to the work you care about.</p>
                    </div>
                    <div className='rounded-[1.5rem] border border-emerald-100 bg-white/80 p-4 shadow-sm'>
                        <p className='text-sm font-medium text-slate-500'>Member benefits</p>
                        <ul className='mt-3 space-y-3 text-sm text-slate-700'>
                            <li>• Save articles for later</li>
                            <li>• Publish and manage content</li>
                            <li>• Track writing performance</li>
                        </ul>
                    </div>
                </div>

                <div className='p-6 sm:p-8 lg:p-10'>
                    <div className='mb-5 flex justify-center lg:hidden'>
                        <span className='inline-block w-full max-w-[110px]'>
                            <Logo width='100%' />
                        </span>
                    </div>

                    <h2 className='text-center text-2xl font-black leading-tight text-slate-950'>Sign in to your account</h2>
                    <p className='mt-2 text-center text-base text-slate-600'>
                        Don&apos;t have any account?&nbsp;
                        <Link to='/signup' className='font-semibold text-emerald-700 transition hover:underline'>
                            Sign Up
                        </Link>
                    </p>

                    {error && (
                        <p className='mt-6 rounded-2xl bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-700'>
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit(login)} className='mt-8'>
                        <div className='space-y-5'>
                            <Input
                                label='Email:'
                                placeholder='Enter your email'
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
                                autoComplete='current-password'
                                {...register('password', { required: true })}
                            />
                            <Button type='submit' className='w-full bg-slate-950 hover:bg-emerald-700'>
                                Sign in
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login
