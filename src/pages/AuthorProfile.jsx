import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Query } from "appwrite";
import appwriteService from "../appwrite/config";
import { Container, PostCard } from "../components";

function AuthorProfile() {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        appwriteService.getProfile(id).then(setProfile);
        appwriteService.getPublishedPosts([Query.equal("userID", id)]).then((response) => {
            setPosts(response?.documents || []);
        });
    }, [id]);

    return (
        <div className="bg-stone-50 py-10">
            <Container>
                <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Author</p>
                    <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                        {profile?.name || "Blog author"}
                    </h1>
                    <p className="mt-4 max-w-3xl text-slate-600">
                        {profile?.bio || "This author has not added a public bio yet."}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
                        {profile?.website && <a className="text-emerald-700 hover:underline" href={profile.website}>Website</a>}
                        {profile?.github && <a className="text-emerald-700 hover:underline" href={profile.github}>GitHub</a>}
                        {profile?.linkedin && <a className="text-emerald-700 hover:underline" href={profile.linkedin}>LinkedIn</a>}
                    </div>
                </section>

                <div className="mb-4">
                    <h2 className="text-2xl font-black text-slate-950">Published posts</h2>
                </div>

                {posts.length ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post) => (
                            <PostCard key={post.$id} {...post} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                        <h2 className="text-xl font-bold text-slate-950">No published posts</h2>
                    </div>
                )}
            </Container>
        </div>
    );
}

export default AuthorProfile;
