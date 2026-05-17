import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Container, PostCard } from "../components";

function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") || "");
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const searchTerm = searchParams.get("q") || "";

        appwriteService.searchPosts(searchTerm).then((response) => {
            setPosts(response?.documents || []);
        });
    }, [searchParams]);

    const submitSearch = (event) => {
        event.preventDefault();
        setSearchParams(query ? {q: query} : {});
    };

    return (
        <div className="bg-stone-50 py-10">
            <Container>
                <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Discover</p>
                    <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">Search posts</h1>
                    <p className="mt-4 max-w-2xl text-slate-600">Find articles by title using Appwrite indexed search.</p>
                </div>

                <form onSubmit={submitSearch} className="mb-8 flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                        placeholder="Search by title"
                    />
                    <button className="rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-emerald-700">
                        Search
                    </button>
                </form>

                {posts.length ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post) => (
                            <PostCard key={post.$id} {...post} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                        <h2 className="text-xl font-bold text-slate-950">No results</h2>
                        <p className="mt-2 text-slate-600">Try another search term or browse all posts.</p>
                    </div>
                )}
            </Container>
        </div>
    );
}

export default Search;
