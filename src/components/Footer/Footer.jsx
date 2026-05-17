import { Link } from 'react-router-dom'
import Logo from '../Logo'

function Footer() {
  return (
    <section className="border-t border-slate-200 bg-slate-950 py-10 text-white">
            <div className="relative z-10 mx-auto max-w-7xl px-4">
                <div className="-m-6 flex flex-wrap">
                    <div className="w-full p-6 md:w-1/2 lg:w-5/12">
                        <div className="flex h-full flex-col justify-between">
                            <div className="mb-4 inline-flex items-center">
                                <Logo width="132px" />
                            </div>
                            <div>
                                <p className="max-w-sm text-sm leading-6 text-slate-300">
                                    A React and Appwrite blog platform built for polished publishing.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="w-full p-6 md:w-1/2 lg:w-2/12">
                        <div className="h-full">
                            <h3 className="tracking-px mb-6 text-xs font-semibold uppercase text-slate-400">
                                Explore
                            </h3>
                            <ul>
                                <li className="mb-4">
                                    <Link
                                        className="text-base font-medium text-slate-300 hover:text-white"
                                        to="/posts"
                                    >
                                        All posts
                                    </Link>
                                </li>
                                <li className="mb-4">
                                    <Link
                                        className="text-base font-medium text-slate-300 hover:text-white"
                                        to="/search"
                                    >
                                        Search
                                    </Link>
                                </li>
                                <li className="mb-4">
                                    <Link
                                        className="text-base font-medium text-slate-300 hover:text-white"
                                        to="/dashboard"
                                    >
                                        Dashboard
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="w-full p-6 md:w-1/2 lg:w-2/12">
                        <div className="h-full">
                            <h3 className="tracking-px mb-6 text-xs font-semibold uppercase text-slate-400">
                                Create
                            </h3>
                            <ul>
                                <li className="mb-4">
                                    <Link
                                        className="text-base font-medium text-slate-300 hover:text-white"
                                        to="/dashboard/posts/new"
                                    >
                                        New post
                                    </Link>
                                </li>
                                <li className="mb-4">
                                    <Link
                                        className="text-base font-medium text-slate-300 hover:text-white"
                                        to="/dashboard/posts"
                                    >
                                        Manage posts
                                    </Link>
                                </li>
                                <li className="mb-4">
                                    <Link
                                        className="text-base font-medium text-slate-300 hover:text-white"
                                        to="/dashboard/profile"
                                    >
                                        Profile
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="w-full p-6 md:w-1/2 lg:w-3/12">
                        <div className="h-full">
                            <h3 className="tracking-px mb-6 text-xs font-semibold uppercase text-slate-400">
                                Stack
                            </h3>
                            <p className="text-base leading-7 text-slate-300">
                                React, React Router, Redux Toolkit, TinyMCE, Tailwind CSS, and Appwrite Auth/Database/Storage.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
  )
}

export default Footer
