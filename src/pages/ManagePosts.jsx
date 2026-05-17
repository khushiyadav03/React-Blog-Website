import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import appwriteService from "../appwrite/config";
import { Button, Container } from "../components";

function ManagePosts() {
    const userData = useSelector((state) => state.auth.userData);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        if (!userData?.$id) return;

        appwriteService.getUserPosts(userData.$id).then((response) => {
            setPosts(response?.documents || []);
        });
    }, [userData?.$id]);

    const removePost = async (post) => {
        const deleted = await appwriteService.deletePost(post.$id);

        if (deleted) {
            if (post.featuredImage) await appwriteService.deleteFile(post.featuredImage);
            setPosts((current) => current.filter((item) => item.$id !== post.$id));
        }
    };

    return (
        <div className="bg-stone-50 py-10">
            <Container>
                <div className="mb-8 flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-end md:p-8">
                    <div>
                        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Studio</p>
                        <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">Manage posts</h1>
                        <p className="mt-4 max-w-2xl text-slate-600">Review drafts, open published work, and keep your content library organized.</p>
                    </div>
                    <Link to="/dashboard/posts/new" className="inline-flex rounded-full bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-emerald-700">
                        New post
                    </Link>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    {posts.length ? (
                        <div className="divide-y divide-slate-200">
                            {posts.map((post) => (
                                <div key={post.$id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                                    <div>
                                        <div className="mb-2 flex flex-wrap items-center gap-2">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${post.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                                                {post.status === "active" ? "Published" : "Draft"}
                                            </span>
                                            <span className="text-xs font-medium text-slate-500">{post.$id}</span>
                                        </div>
                                        <h2 className="text-lg font-bold text-slate-950">{post.title}</h2>
                                        {post.excerpt && <p className="mt-1 text-sm text-slate-600">{post.excerpt}</p>}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Link to={`/post/${post.$id}`} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-stone-50">
                                            View
                                        </Link>
                                        <Link to={`/dashboard/posts/${post.$id}/edit`} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-stone-50">
                                            Edit
                                        </Link>
                                        <Button bgColor="bg-red-600" className="rounded-full px-3 py-2 text-sm hover:bg-red-700" onClick={() => removePost(post)}>
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-10 text-center">
                            <h2 className="text-xl font-bold text-slate-950">No posts yet</h2>
                            <p className="mt-2 text-slate-600">Start with a draft, then publish when it is ready.</p>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
}

export default ManagePosts;
