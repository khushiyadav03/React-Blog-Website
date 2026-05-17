import { Container, PostForm } from '../components'

function AddPost(){
    return (
        <div className='bg-stone-50 py-10'>
            <Container>
                <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Create</p>
                    <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">Write a new post</h1>
                    <p className="mt-4 max-w-2xl text-slate-600">Compose rich content, upload a featured image, assign metadata, and publish from one focused workspace.</p>
                </div>
                <PostForm />
            </Container>
        </div>
    )
}

export default AddPost
