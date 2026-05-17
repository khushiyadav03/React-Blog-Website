import {useState, useEffect} from 'react'
import { Container, PostCard } from '../components'
import appwriteService from "../appwrite/config";
import { Link } from 'react-router-dom';

function AllPosts() {
    const [posts, setPosts] = useState([])
    const [categories, setCategories] = useState([])
    useEffect(() => {
        appwriteService.getPublishedPosts().then((posts) => {
            if (posts) {
                setPosts(posts.documents)
            }
        })
        appwriteService.getCategories().then((response) => setCategories(response?.documents || []))
    }, [])
  return (
    <div className='w-full bg-stone-50 py-10'>
        <Container>
            <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Archive</p>
                <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">All posts</h1>
                <p className="mt-4 max-w-2xl text-slate-600">Browse every published article and filter by category when your Appwrite category collection is populated.</p>
            </div>
            {categories.length > 0 && (
                <div className="mb-8 flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <Link key={category.$id} to={`/categories/${category.slug}`} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                            {category.name}
                        </Link>
                    ))}
                </div>
            )}
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
