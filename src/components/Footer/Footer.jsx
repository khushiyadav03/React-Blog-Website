import { Link } from 'react-router-dom'
import Logo from '../Logo'

function Footer() {
    return (
        <section className="border-t border-slate-200 bg-slate-950 py-10 text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8">
                <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1.1fr]">
                    <div className="space-y-4">
                        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 p-2.5">
                            <Logo width="132px" />
                        </div>
                        <p className="max-w-sm text-sm leading-6 text-slate-300">
                            A React blog platform built for polished publishing.
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Explore
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link className="text-base font-medium text-slate-300 transition hover:text-white" to="/posts">
                                    All posts
                                </Link>
                            </li>
                            <li>
                                <Link className="text-base font-medium text-slate-300 transition hover:text-white" to="/search">
                                    Search
                                </Link>
                            </li>
                            <li>
                                <Link className="text-base font-medium text-slate-300 transition hover:text-white" to="/dashboard">
                                    Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Create
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link className="text-base font-medium text-slate-300 transition hover:text-white" to="/dashboard/posts/new">
                                    New post
                                </Link>
                            </li>
                            <li>
                                <Link className="text-base font-medium text-slate-300 transition hover:text-white" to="/dashboard/posts">
                                    Manage posts
                                </Link>
                            </li>
                            <li>
                                <Link className="text-base font-medium text-slate-300 transition hover:text-white" to="/dashboard/profile">
                                    Profile
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Stack
                        </h3>
                        <p className="text-base leading-7 text-slate-300">
                            React, React Router, Redux Toolkit, TinyMCE, Tailwind CSS, FastAPI, and MongoDB.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Footer
