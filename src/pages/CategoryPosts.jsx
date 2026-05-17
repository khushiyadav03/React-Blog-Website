import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Query } from "appwrite";
import appwriteService from "../appwrite/config";
import { Container, PostCard } from "../components";

function CategoryPosts() {
    const { slug } = useParams();
    const [category, setCategory] = useState(null);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        appwriteService.getCategory(slug).then((categoryData) => {
            setCategory(categoryData);

            if (categoryData?.$id) {
                appwriteService.getPublishedPosts([Query.equal("categoryID", categoryData.$id)]).then((response) => {
                    setPosts(response?.documents || []);
                });
            } else {
                setPosts([]);
            }
        });
    }, [slug]);

    return (
        <div className="bg-stone-50 py-10">
            <Container>
                <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Category</p>
                    <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                        {category?.name || slug}
                    </h1>
                    {category?.description && <p className="mt-4 max-w-2xl text-slate-600">{category.description}</p>}
                </div>

                {posts.length ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post) => (
                            <PostCard key={post.$id} {...post} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                        <h2 className="text-xl font-bold text-slate-950">No posts in this category</h2>
                        <p className="mt-2 text-slate-600">Add categories in Appwrite and assign posts to enable this archive.</p>
                    </div>
                )}
            </Container>
        </div>
    );
}

export default CategoryPosts;
