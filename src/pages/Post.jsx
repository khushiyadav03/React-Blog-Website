import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";

export default function Post() {
    const [post, setPost] = useState(null);
    const [profile, setProfile] = useState(null);
    const [bookmark, setBookmark] = useState(null);
    const { slug } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);

    const isAuthor = post && userData ? post.userID === userData.$id : false;
    const imageId = post?.featuredImage || post?.featuredimage || post?.image;
    const imageUrl = appwriteService.getFileView(imageId);

    useEffect(() => {
        if (slug) {
            appwriteService.getPost(slug).then((post) => {
                if (post) setPost(post);
                else navigate("/");
            });
        } else navigate("/");
    }, [slug, navigate]);

    useEffect(() => {
        if (!post?.userID) return;

        appwriteService.getProfile(post.userID).then(setProfile);
    }, [post?.userID]);

    useEffect(() => {
        if (!userData?.$id || !post?.$id) return;

        appwriteService.getBookmark(userData.$id, post.$id).then(setBookmark);
    }, [userData?.$id, post?.$id]);

    const toggleBookmark = async () => {
        if (!userData?.$id) {
            navigate("/login");
            return;
        }

        const updatedBookmark = await appwriteService.toggleBookmark(userData.$id, post.$id);
        setBookmark(updatedBookmark);
    };

    const deletePost = () => {
        appwriteService.deletePost(post.$id).then((status) => {
            if (status) {
                appwriteService.deleteFile(post.featuredImage);
                navigate("/");
            }
        });
    };

    return post ? (
        <div className="bg-stone-50 py-10">
            <Container>
                <article className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="relative aspect-video w-full bg-stone-100">
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt={post.title}
                            className="h-full w-full object-cover"
                            onError={(event) => {
                                event.currentTarget.style.display = "none";
                            }}
                        />
                    )}
                    {!imageUrl && (
                        <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">
                            Featured image unavailable
                        </div>
                    )}

                    <div className="absolute left-5 top-5">
                        <Button bgColor={bookmark ? "bg-emerald-700" : "bg-white"} textColor={bookmark ? "text-white" : "text-slate-950"} className="rounded-full shadow-sm hover:bg-emerald-700 hover:text-white" onClick={toggleBookmark}>
                            {bookmark ? "Saved" : "Save"}
                        </Button>
                    </div>

                    {isAuthor && (
                        <div className="absolute right-5 top-5 flex gap-3">
                            <Link to={`/dashboard/posts/${post.$id}/edit`}>
                                <Button bgColor="bg-emerald-600" className="rounded-full shadow-sm hover:bg-emerald-700">
                                    Edit
                                </Button>
                            </Link>
                            <Button bgColor="bg-red-600" className="rounded-full shadow-sm hover:bg-red-700" onClick={deletePost}>
                                Delete
                            </Button>
                        </div>
                    )}
                </div>
                <div className="px-6 py-8 md:px-12 md:py-10">
                    <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Published article</p>
                    <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">{post.title}</h1>
                    {post.excerpt && <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{post.excerpt}</p>}
                    <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                        <Link to={`/authors/${post.userID}`} className="font-semibold text-slate-950 hover:text-emerald-700">
                            {profile?.name || "View author"}
                        </Link>
                        {Array.isArray(post.tags) && post.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">#{tag}</span>
                        ))}
                    </div>
                </div>
                <div className="browser-css max-w-none border-t border-slate-100 px-6 pb-12 pt-8 md:px-12">
                    {parse(post.content)}
                </div>
                </article>
            </Container>
        </div>
    ) : null;
}
