import {useEffect, useState} from 'react'
import {Container, PostForm} from '../components'
import appwriteService from "../appwrite/config";
import { useNavigate,  useParams } from 'react-router-dom';

function EditPost() {
    const [post, setPosts] = useState(null)
    const {slug} = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (slug) {
            appwriteService.getPost(slug).then((post) => {
                if (post) {
                    setPosts(post)
                }
            })
        } else {
            navigate('/')
        }
    }, [slug, navigate])
  return post ? (
    <div className='bg-stone-50 py-10'>
        <Container>
            <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Edit</p>
                <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">Update your post</h1>
                <p className="mt-4 max-w-2xl text-slate-600">Refine content, metadata, and publication status without leaving the author studio.</p>
            </div>
            <PostForm post={post} />
        </Container>
    </div>
  ) : null
}

export default EditPost
