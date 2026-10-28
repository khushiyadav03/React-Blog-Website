import { useEffect, useRef, useState } from "react";
import { Heart, Share2, Bookmark, BookmarkCheck, Eye } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import blogService from "../services/config";
import { Button, Container } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";

export default function Post() {
    const [post, setPost] = useState(null);
    const [profile, setProfile] = useState(null);
    const [bookmark, setBookmark] = useState(null);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [shareStatus, setShareStatus] = useState("");
    const [likeBusy, setLikeBusy] = useState(false);
    const [bookmarkBusy, setBookmarkBusy] = useState(false);
    const [likeStateLoading, setLikeStateLoading] = useState(false);
    const [bookmarkStateLoading, setBookmarkStateLoading] = useState(false);
    const [interactionError, setInteractionError] = useState("");
    const viewRequestSlug = useRef(null);
    const { slug } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);

    const isAuthor = post && userData ? post.userID === userData.$id : false;
    const imageId = post?.featuredImage || post?.featuredimage || post?.image;
    const imageUrl = blogService.getFileView(imageId);

    useEffect(() => {
        if (viewRequestSlug.current !== slug) viewRequestSlug.current = null;
        if (slug) {
            blogService.getPost(slug).then((post) => {
                if (post) setPost(post);
                else navigate("/");
            });
        } else navigate("/");
    }, [slug, navigate]);

    useEffect(() => {
        if (!post || post.$id !== slug || post.status !== "active" || viewRequestSlug.current === slug) return;

        // Remember the slug before requesting so React Strict Mode's repeated effect setup cannot double-count it.
        viewRequestSlug.current = slug;
        blogService.recordPostView(post.$id).then(({ view_count: viewCount }) => {
            setPost((current) => current?.$id === post.$id ? { ...current, viewCount } : current);
        }).catch((error) => {
            console.error("Could not record post view", error);
        });
    }, [post, slug]);

    useEffect(() => {
        if (!post?.userID) return;

        blogService.getProfile(post.userID).then(setProfile);
    }, [post?.userID]);

    useEffect(() => {
        if (!post?.$id) return;
        setBookmark(null);
        if (!userData?.$id) {
            setBookmarkStateLoading(false);
            return;
        }

        let active = true;
        setBookmarkStateLoading(true);
        blogService.getBookmark(userData.$id, post.$id).then((result) => {
            if (active) setBookmark(result);
        }).catch((error) => {
            console.error("Could not load bookmark state", error);
        }).finally(() => {
            if (active) setBookmarkStateLoading(false);
        });
        return () => { active = false; };
    }, [userData?.$id, post?.$id]);

    useEffect(() => {
        if (!post) return;
        setLikeCount(Number(post.likes) || 0);
        setLiked(false);
        if (!userData?.$id || post.status !== "active") {
            setLikeStateLoading(false);
            return;
        }

        let active = true;
        setLikeStateLoading(true);
        blogService.getLikeState(post.$id).then((result) => {
            if (!active) return;
            setLiked(Boolean(result.liked));
            setLikeCount(Number(result.like_count) || 0);
        }).catch((error) => {
            console.error("Could not load like state", error);
        }).finally(() => {
            if (active) setLikeStateLoading(false);
        });
        return () => { active = false; };
    }, [post?.$id, userData?.$id]);

    const toggleBookmark = async () => {
        if (!userData?.$id) {
            navigate("/login");
            return;
        }

        setBookmarkBusy(true);
        setInteractionError("");
        try {
            const updatedBookmark = await blogService.toggleBookmark(userData.$id, post.$id);
            setBookmark(updatedBookmark);
        } catch (error) {
            console.error("Could not update bookmark", error);
            setInteractionError(error.message || "Could not update saved state. Please try again.");
        } finally {
            setBookmarkBusy(false);
        }
    };

    const toggleLike = async () => {
        if (!userData?.$id) {
            navigate("/login");
            return;
        }

        const previousLiked = liked;
        const previousCount = likeCount;
        const nextLiked = !previousLiked;
        setLiked(nextLiked);
        setLikeCount(Math.max(0, previousCount + (nextLiked ? 1 : -1)));
        setLikeBusy(true);
        setInteractionError("");
        try {
            const result = nextLiked ? await blogService.likePost(post.$id) : await blogService.unlikePost(post.$id);
            setLiked(Boolean(result.liked));
            setLikeCount(Number(result.like_count) || 0);
        } catch (error) {
            console.error("Could not update like", error);
            setLiked(previousLiked);
            setLikeCount(previousCount);
            setInteractionError(error.message || "Could not update like. Please try again.");
        } finally {
            setLikeBusy(false);
        }
    };

    const sharePost = async () => {
        const shareUrl = window.location.href;
        const shareTitle = post?.title || "Read this article";

        try {
            if (navigator.share) {
                await navigator.share({
                    title: shareTitle,
                    text: post?.excerpt || "Check out this article",
                    url: shareUrl,
                });
                setShareStatus("Shared");
                return;
            }

            await navigator.clipboard.writeText(shareUrl);
            setShareStatus("Link copied");
        } catch (error) {
            if (error?.name !== "AbortError") {
                setShareStatus("Copy failed");
            }
            return;
        }

        window.setTimeout(() => setShareStatus(""), 1800);
    };

    const deletePost = () => {
        blogService.deletePost(post.$id).then((status) => {
            if (status) {
                blogService.deleteFile(post.featuredImage);
                navigate("/");
            }
        });
    };

    return post ? (
        <div className="py-10">
            <Container>
                <article className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_25px_65px_-35px_rgba(15,23,42,0.38)]">
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

                        <div className="absolute left-5 top-5 flex flex-wrap items-center gap-2">
                            <Button
                                bgColor={bookmark ? "bg-emerald-700" : "bg-white"}
                                textColor={bookmark ? "text-white" : "text-slate-950"}
                                className="rounded-full shadow-sm hover:bg-emerald-700 hover:text-white"
                                onClick={toggleBookmark}
                                disabled={bookmarkBusy || bookmarkStateLoading}
                            >
                                <span className="inline-flex items-center gap-2">
                                    {bookmark ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                                    {bookmark ? "Saved" : "Save"}
                                </span>
                            </Button>

                            <Button
                                bgColor={liked ? "bg-rose-600" : "bg-white"}
                                textColor={liked ? "text-white" : "text-slate-950"}
                                className="rounded-full shadow-sm hover:bg-rose-600 hover:text-white"
                                onClick={toggleLike}
                                disabled={likeBusy || likeStateLoading || post.status !== "active"}
                            >
                                <span className="inline-flex items-center gap-2">
                                    <Heart size={16} fill={liked ? "currentColor" : "none"} />
                                    {liked ? "Liked" : "Like"}
                                    <span className="text-xs opacity-80">{likeCount}</span>
                                </span>
                            </Button>

                            <Button
                                bgColor="bg-white"
                                textColor="text-slate-950"
                                className="rounded-full shadow-sm hover:bg-slate-100"
                                onClick={sharePost}
                            >
                                <span className="inline-flex items-center gap-2">
                                    <Share2 size={16} />
                                    {shareStatus || "Share"}
                                </span>
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

                    <div className="px-6 pb-8 pt-8 md:px-12 md:pb-10 md:pt-10">
                        <div className="mx-auto max-w-3xl">
                            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Published article</p>
                            <h1 className="text-4xl font-black leading-[0.96] tracking-[-0.05em] text-slate-950 md:text-6xl">
                                {post.title}
                            </h1>
                            {post.excerpt && <p className="mt-5 text-lg leading-8 text-slate-600">{post.excerpt}</p>}
                            <div className="mt-6 flex flex-wrap items-center gap-3 border-b border-slate-200 pb-6 text-sm text-slate-600">
                                <Link to={`/authors/${post.userID}`} className="font-semibold text-slate-950 transition hover:text-emerald-700">
                                    {profile?.name || "View author"}
                                </Link>
                                <span className="h-1 w-1 rounded-full bg-slate-300" />
                                <span>Reader feature</span>
                                <span className="inline-flex items-center gap-1.5" title="Post views">
                                    <Eye size={16} aria-hidden="true" />
                                    <span>{post.viewCount ?? 0} views</span>
                                </span>
                                {Array.isArray(post.tags) && post.tags.length > 0 && (
                                    <>
                                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                                        <div className="flex flex-wrap items-center gap-2">
                                            {post.tags.map((tag) => (
                                                <span key={tag} className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                            {interactionError && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{interactionError}</p>}
                        </div>
                    </div>

                    <div className="browser-css border-t border-slate-100 px-6 pb-12 pt-8 md:px-12 md:pb-16 md:pt-10">
                        {parse(post.content)}
                    </div>
                </article>
            </Container>
        </div>
    ) : null;
}
