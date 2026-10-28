import { useEffect, useState } from "react";
import { Container } from "../components";
import blogService from "../services/config";

const initialFeatures = { title_length: 40, word_count: 500, tag_count: 3, age_days: 7 };

export default function Engagement() {
    const [features, setFeatures] = useState(initialFeatures);
    const [model, setModel] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const refreshModel = async () => {
        try { setModel(await blogService.getModelInfo()); } catch (err) { setError(err.message); }
    };
    useEffect(() => {
        let active = true;
        blogService.getModelInfo().then((data) => { if (active) setModel(data); }).catch((err) => { if (active) setError(err.message); });
        return () => { active = false; };
    }, []);

    const train = async () => {
        setBusy(true); setError(""); setPrediction(null);
        try { await blogService.trainEngagementModel(); await refreshModel(); }
        catch (err) { setError(err.message); }
        finally { setBusy(false); }
    };

    const submit = async (event) => {
        event.preventDefault(); setBusy(true); setError(""); setPrediction(null);
        try { setPrediction(await blogService.predictEngagement(Object.fromEntries(Object.entries(features).map(([key, value]) => [key, Number(value)])))); }
        catch (err) { setError(err.message); }
        finally { setBusy(false); }
    };

    return <div className="bg-stone-50 py-10"><Container>
        <header className="mb-8 rounded-3xl bg-slate-950 p-7 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Machine learning</p>
            <h1 className="mt-2 text-3xl font-black md:text-5xl">Blog engagement prediction</h1>
            <p className="mt-3 max-w-2xl text-slate-300">Train a Linear Regression model on published posts and their recorded views, then estimate views from post details.</p>
        </header>
        {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}
        <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-bold">Model status</h2>
                <p className="mt-2 text-slate-600">Algorithm: {model?.algorithm || "Loading…"}</p>
                <p className="mt-1 text-slate-600">Training posts: {model?.training_records ?? 0}</p>
                {model?.metrics && <div className="mt-3 space-y-1 text-sm text-slate-700"><p>MAE: {model.metrics.mae.toFixed(2)}</p><p>RMSE: {model.metrics.rmse.toFixed(2)}</p><p>R²: {model.metrics.r2.toFixed(3)}</p></div>}
                <button disabled={busy} onClick={train} className="mt-5 rounded-full bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-60">{busy ? "Working…" : "Train model"}</button>
                <p className="mt-3 text-sm text-slate-500">Training needs at least five published posts with recorded views. Opening a published post records one view.</p>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-bold">Predict expected views</h2>
                <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
                    {[["title_length", "Title characters"], ["word_count", "Content words"], ["tag_count", "Number of tags"], ["age_days", "Post age in days"]].map(([key, label]) => <label key={key} className="grid gap-1 text-sm font-medium text-slate-700">{label}<input required type="number" min={key === "title_length" || key === "word_count" ? "1" : "0"} step={key === "age_days" ? "any" : "1"} value={features[key]} onChange={(event) => setFeatures({ ...features, [key]: event.target.value })} className="rounded-lg border border-slate-300 px-3 py-2" /></label>)}
                    <button disabled={busy} className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white disabled:opacity-60 sm:col-span-2">Predict engagement</button>
                </form>
                {prediction && <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-lg font-bold text-emerald-900">Estimated views: {prediction.prediction}</p>}
            </section>
        </div>
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold">How it works</h2>
            <p className="mt-2 text-slate-600">Published post records → PyMongo reads post features and view counts → an 80/20 train/test split evaluates Linear Regression → your post details are used to estimate its views.</p>
            <p className="mt-2 text-sm text-slate-500">Inputs: title length, word count, tag count, and age in days. Target: recorded view count. The model stays in memory and must be trained again after a backend restart.</p>
        </section>
    </Container></div>;
}
