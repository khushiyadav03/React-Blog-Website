import {useState, useEffect} from 'react'
import { Container, PostCard } from '../components'
import appwriteService from "../appwrite/config";

function AllPosts() {
    const [posts, setPosts] = useState([])
    useEffect(() => {
        appwriteService.getPublishedPosts().then((posts) => {
            if (posts) {
                setPosts(posts.documents)
            }
        })
    }, [])
  return (
    <div className='w-full bg-stone-50 py-10'>
        <Container>
            <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Archive</p>
                <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">All posts</h1>
                <p className="mt-4 max-w-2xl text-slate-600">Browse every published article in one place.</p>
            </div>
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

export default AllPosts
