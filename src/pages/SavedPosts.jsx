import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import appwriteService from "../appwrite/config";
import { Container, PostCard } from "../components";

function SavedPosts() {
    const userData = useSelector((state) => state.auth.userData);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        if (!userData?.$id) return;

        appwriteService.getBookmarks(userData.$id).then(async (response) => {
            const savedPosts = await Promise.all(
                (response?.documents || []).map((bookmark) => appwriteService.getPost(bookmark.postID))
            );

            setPosts(savedPosts.filter(Boolean));
        });
    }, [userData?.$id]);

    return (
        <div className="bg-stone-50 py-10">
            <Container>
                <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Library</p>
                    <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">Saved posts</h1>
                    <p className="mt-4 max-w-2xl text-slate-600">A personal reading queue for articles worth returning to.</p>
                </div>

                {posts.length ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post) => (
                            <PostCard key={post.$id} {...post} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                        <h2 className="text-xl font-bold text-slate-950">Nothing saved yet</h2>
                        <p className="mt-2 text-slate-600">Bookmark posts from the article page and they will show here.</p>
                    </div>
                )}
            </Container>
        </div>
    );
}

export default SavedPosts;
