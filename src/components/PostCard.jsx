import appwriteService from '../appwrite/config'
import { Link } from 'react-router-dom';

function PostCard({$id, title, featuredImage, featuredimage, image, excerpt, tags}){
    const imageId = featuredImage || featuredimage || image
    const imageUrl = appwriteService.getFileView(imageId)

    return (
        <Link to={`/post/${$id}`} className="group block h-full">
            <article className='h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-2xl'>
                <div className='relative aspect-video w-full overflow-hidden bg-stone-100'>
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt={title}
                            loading="lazy"
                            className='h-full w-full object-cover transition duration-300 group-hover:scale-105'
                            onError={(event) => {
                                event.currentTarget.style.display = "none";
                            }}
                        />
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/35 to-transparent opacity-0 transition group-hover:opacity-100" />
                    {!imageUrl && (
                        <div className="flex h-full items-center justify-center px-4 text-center text-sm font-semibold text-slate-500">
                            Image unavailable
                        </div>
                    )}
                </div>

                <div className="p-5">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Article</p>
                    <h2 className='line-clamp-2 text-xl font-black leading-snug text-slate-950 group-hover:text-emerald-700'>{title}</h2>
                    {excerpt && <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{excerpt}</p>}
                    {Array.isArray(tags) && tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-slate-600">#{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            </article>
        </Link>
    )
}

export default PostCard
