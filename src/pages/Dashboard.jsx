import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import blogService from "../services/config";
import { Container, PostCard } from "../components";

function Dashboard() {
    const userData = useSelector((state) => state.auth.userData);
    const [posts, setPosts] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);

    useEffect(() => {
        if (!userData?.$id) return;

        blogService.getUserPosts(userData.$id).then((response) => {
            setPosts(response?.documents || []);
        });

        blogService.getBookmarks(userData.$id).then((response) => {
            setBookmarks(response?.documents || []);
        });
    }, [userData?.$id]);

    const stats = useMemo(() => {
        const published = posts.filter((post) => post.status === "active").length;
        const drafts = posts.length - published;

        return [
            { label: "Total posts", value: posts.length },
            { label: "Published", value: published },
            { label: "Drafts", value: drafts },
            { label: "Saved", value: bookmarks.length },
        ];
    }, [posts, bookmarks]);

    const recentPosts = posts.slice(0, 3);

    return (
        <div className="py-10">
            <Container>
                <div className="mb-8 rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_25px_60px_-35px_rgba(15,23,42,0.85)] md:p-8">
                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                        <div>
                            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Dashboard</p>
                            <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                                Welcome back, {userData?.name || "writer"}
                            </h1>
                            <p className="mt-3 max-w-2xl text-slate-300">
                                Track publishing progress, manage drafts, and jump back into your writing workflow.
                            </p>
                        </div>
                        <Link
                            to="/dashboard/posts/new"
                            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-100"
                        >
                            New post
                        </Link>
                    </div>
                </div>

                <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.28)]">
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <p className="mt-2 text-3xl font-black text-slate-950">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <section>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-950">Recent posts</h2>
                            <Link to="/dashboard/posts" className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800">
                                Manage all
                            </Link>
                        </div>
                        {recentPosts.length ? (
                            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {recentPosts.map((post) => (
                                    <PostCard key={post.$id} {...post} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-[0_18px_45px_-32px_rgba(15,23,42,0.3)]">
                                <h3 className="text-lg font-bold text-slate-950">No posts yet</h3>
                                <p className="mt-2 text-slate-600">Create your first article and it will appear here.</p>
                            </div>
                        )}
                    </section>

                    <aside className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.3)]">
                        <h2 className="text-lg font-bold text-slate-950">Quick actions</h2>
                        <div className="mt-4 grid gap-3">
                            <Link className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700" to="/dashboard/posts/new">
                                Write a post
                            </Link>
                            <Link className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700" to="/dashboard/profile">
                                Edit public profile
                            </Link>
                            <Link className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700" to="/dashboard/saved">
                                View saved posts
                            </Link>
                            <Link className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700" to="/dashboard/engagement">
                                Predict post engagement
                            </Link>
                        </div>
                    </aside>
                </div>
            </Container>
        </div>
    );
}

export default Dashboard;
