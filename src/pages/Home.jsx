import {useEffect, useState} from 'react';
import appwriteService from '../appwrite/config'
import { Container, PostCard } from '../components';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Home() {
    const [posts, setPosts] = useState([])
    const [query, setQuery] = useState("")
    const navigate = useNavigate()
    const authStatus = useSelector((state) => state.auth.status)

    useEffect(() => {
        appwriteService.getPublishedPosts().then((posts) => {
            if(posts) setPosts(posts.documents)
        })
    }, [])

    const submitSearch = (event) => {
        event.preventDefault()
        navigate(query ? `/search?q=${encodeURIComponent(query)}` : "/search")
    }

    if(!authStatus){
        return (
            <div className="w-full bg-stone-50">
                <Container>
                    <section className="min-h-[calc(100vh-76px)] py-10">
                        <div className="mx-auto max-w-5xl pt-10 text-center md:pt-16">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">
                                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                                Independent stories and dev notes
                            </div>
                            <h1 className="mx-auto max-w-5xl text-5xl font-black leading-[1.02] tracking-tight text-slate-950 md:text-7xl">
                                Read practical articles on code, product thinking, and modern web development.
                            </h1>
                            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                                Explore concise tutorials, project breakdowns, and engineering notes written for curious readers. No account is needed to browse the publication.
                            </p>
                            <div className="mt-8 flex flex-wrap justify-center gap-3">
                                <Link className="rounded-full bg-slate-950 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700" to="/posts">
                                    Start reading
                                </Link>
                                <Link className="rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800" to="/search">
                                    Search library
                                </Link>
                                <Link className="rounded-full px-6 py-3 font-semibold text-slate-600 transition hover:text-slate-950" to="/login">
                                    Sign in to save
                                </Link>
                            </div>

                            <div className="mx-auto mt-10 grid max-w-4xl gap-3 text-left sm:grid-cols-3">
                                {[
                                    ["Browse", "Read published articles without creating an account."],
                                    ["Discover", "Use search and tags to find useful topics."],
                                    ["Save later", "Sign in only when you want a personal reading list."],
                                ].map(([title, copy]) => (
                                    <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <h2 className="font-black text-slate-950">{title}</h2>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="border-t border-slate-200 py-10">
                        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                            <div>
                                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Public library</p>
                                <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Start with the latest posts</h2>
                            </div>
                            <Link className="font-semibold text-emerald-700 hover:underline" to="/posts">View all posts</Link>
                        </div>

                        {posts.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {posts.slice(0, 3).map((post) => (
                                    <PostCard key={post.$id} {...post} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
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
                                ["Read freely", "Most content is public, so visitors can browse without friction."],
                                ["Discover faster", "Search, tags, and author pages make the archive easier to navigate."],
                                ["Join when useful", "Accounts are for saving posts and unlocking the writer dashboard, not for basic reading."],
                            ].map(([title, copy]) => (
                                <div key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
         <div className='w-full bg-stone-50 pb-14'>
            <Container>
                <section className="grid gap-8 py-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
                    <div>
                        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Full-stack publishing</p>
                        <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-slate-950 md:text-7xl">
                            Ideas, tutorials, and dev notes in one clean CMS.
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                            Browse polished articles, discover useful tags, and sign in to manage your own writing studio.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold text-slate-500">Project stack</p>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-bold text-slate-800">
                            <span className="rounded-xl bg-stone-100 px-3 py-2">React</span>
                            <span className="rounded-xl bg-stone-100 px-3 py-2">Appwrite</span>
                            <span className="rounded-xl bg-stone-100 px-3 py-2">Redux</span>
                            <span className="rounded-xl bg-stone-100 px-3 py-2">TinyMCE</span>
                        </div>
                    </div>
                </section>
                <div className="mb-8 flex flex-col justify-between gap-4 border-t border-slate-200 pt-8 md:flex-row md:items-end">
                    <div>
                        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Featured posts</p>
                        <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Latest writing</h2>
                    </div>
                    <p className="max-w-xl text-slate-600">Search and read published posts from the Appwrite-backed content collection.</p>
                </div>
                <form onSubmit={submitSearch} className="mb-8 flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                        placeholder="Search posts by title"
                    />
                    <button className="rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-emerald-700">Search</button>
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
