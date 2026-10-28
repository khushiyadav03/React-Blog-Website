import { useEffect, useState } from 'react';
import blogService from '../services/config'
import { Container, PostCard } from '../components';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Home() {
    const [posts, setPosts] = useState([])
    const [query, setQuery] = useState("")
    const navigate = useNavigate()
    const authStatus = useSelector((state) => state.auth.status)

    useEffect(() => {
        blogService.getPublishedPosts().then((posts) => {
            if (posts) setPosts(posts.documents)
        })
    }, [])

    const submitSearch = (event) => {
        event.preventDefault()
        navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search')
    }

    if (!authStatus) {
        return (
            <div className="w-full pb-16">
                <Container>
                    <section className="py-10 md:py-16">
                        <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-[0_25px_65px_-35px_rgba(15,23,42,0.38)] backdrop-blur-sm md:p-10">
                            <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
                                <div>
                                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">
                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                                        Independent stories and dev notes
                                    </div>
                                    <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-slate-950 md:text-6xl xl:text-7xl">
                                        Read practical articles on code, product thinking, and modern web development.
                                    </h1>
                                    <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                                        Explore concise tutorials, project breakdowns, and engineering notes written for curious readers. No account is needed to browse the publication.
                                    </p>
                                    <div className="mt-8 flex flex-wrap justify-start gap-3">
                                        <Link className="inline-flex items-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_-18px_rgba(15,23,42,0.8)] transition hover:bg-emerald-700" to="/posts">
                                            Start reading
                                        </Link>
                                        <Link className="inline-flex items-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800" to="/search">
                                            Search library
                                        </Link>
                                        <Link className="inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold text-slate-600 transition hover:text-slate-950" to="/login">
                                            Sign in to save
                                        </Link>
                                    </div>
                                </div>

                                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_20px_48px_-30px_rgba(15,23,42,0.8)]">
                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Reader workflow</p>
                                    <div className="mt-5 space-y-3">
                                        {[
                                            ['Browse', 'Read published articles without creating an account.'],
                                            ['Discover', 'Use search and tags to find useful topics.'],
                                            ['Save later', 'Sign in only when you want a personal reading list.'],
                                        ].map(([title, copy]) => (
                                            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                <h2 className="text-base font-bold text-white">{title}</h2>
                                                <p className="mt-1 text-sm leading-6 text-slate-300">{copy}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="border-t border-slate-200 py-10">
                        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                            <div>
                                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Public library</p>
                                <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Start with the latest posts</h2>
                            </div>
                            <Link className="font-semibold text-emerald-700 transition hover:text-emerald-800" to="/posts">
                                View all posts
                            </Link>
                        </div>

                        {posts.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {posts.slice(0, 3).map((post) => (
                                    <PostCard key={post.$id} {...post} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)]">
                                <h2 className="text-2xl font-black text-slate-950">The library is being prepared.</h2>
                                <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                                    Published posts will appear here as soon as authors add content. Visitors can still use the navigation to explore the site structure.
                                </p>
                            </div>
                        )}
                    </section>

                    <section className="border-t border-slate-200 py-10">
                        <div className="grid gap-5 md:grid-cols-3">
                            {[
                                ['Read freely', 'Most content is public, so visitors can browse without friction.'],
                                ['Discover faster', 'Search, tags, and author pages make the archive easier to navigate.'],
                                ['Join when useful', 'Accounts are for saving posts and unlocking the writer dashboard, not for basic reading.'],
                            ].map(([title, copy]) => (
                                <div key={title} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.25)]">
                                    <h2 className="text-xl font-black text-slate-950">{title}</h2>
                                    <p className="mt-3 leading-7 text-slate-600">{copy}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </Container>
            </div>
        )
    }

    return (
        <div className='w-full pb-14'>
            <Container>
                <section className="py-10 md:py-14">
                    <div className="mx-auto max-w-3xl text-center md:text-left">
                        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Latest from the journal</p>
                        <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-slate-950 md:text-6xl xl:text-7xl">
                            Fresh ideas, thoughtful writing, and practical stories.
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                            Discover the newest posts, browse by topic, and settle in with writing built for real reading.
                        </p>
                    </div>
                </section>

                <div className="mb-8 flex flex-col justify-between gap-4 border-t border-slate-200 pt-8 md:flex-row md:items-end">
                    <div>
                        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Featured posts</p>
                        <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Latest writing</h2>
                    </div>
                    <p className="max-w-xl text-slate-600">Search and read published posts from the content collection.</p>
                </div>

                <form onSubmit={submitSearch} className="mb-8 flex flex-col gap-3 rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.32)] md:flex-row">
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                        placeholder="Search posts by title"
                    />
                    <button className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700">
                        Search
                    </button>
                </form>

                <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                    {posts.map((post) => (
                        <div key={post.$id}>
                            <PostCard {...post} />
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    )
}

export default Home
