import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import appwriteService from "../appwrite/config";
import { Button, Container, Input } from "../components";

function ProfileSettings() {
    const userData = useSelector((state) => state.auth.userData);
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({
        name: "",
        bio: "",
        website: "",
        github: "",
        linkedin: "",
    });
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!userData?.$id) return;

        appwriteService.getProfile(userData.$id).then((profileData) => {
            setProfile(profileData);
            setForm({
                name: profileData?.name || userData.name || "",
                bio: profileData?.bio || "",
                website: profileData?.website || "",
                github: profileData?.github || "",
                linkedin: profileData?.linkedin || "",
            });
        });
    }, [userData]);

    const updateField = (event) => {
        setForm((current) => ({
            ...current,
            [event.target.name]: event.target.value,
        }));
    };

    const saveProfile = async (event) => {
        event.preventDefault();
        setMessage("");

        const saved = await appwriteService.upsertProfile({
            ...form,
            userID: userData.$id,
            avatar: profile?.avatar,
        });

        setProfile(saved);
        setMessage(saved ? "Profile saved." : "Add profile collection env/configuration to enable this feature.");
    };

    return (
        <div className="bg-stone-50 py-10">
            <Container>
                <div className="mb-8 flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-end md:p-8">
                    <div>
                        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Profile</p>
                        <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">Public profile</h1>
                        <p className="mt-4 max-w-2xl text-slate-600">Shape the author identity visitors see beside your posts.</p>
                    </div>
                    <Link to={`/authors/${userData?.$id}`} className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-stone-50">
                        View public profile
                    </Link>
                </div>

                <form onSubmit={saveProfile} className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid gap-5">
                        <Input label="Display name" name="name" value={form.name} onChange={updateField} />
                        <div>
                            <label className="mb-1 inline-block pl-1 text-sm font-medium text-slate-700">Bio</label>
                            <textarea
                                name="bio"
                                value={form.bio}
                                onChange={updateField}
                                rows="5"
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                                placeholder="Write a short author bio"
                            />
                        </div>
                        <Input label="Website" name="website" value={form.website} onChange={updateField} />
                        <Input label="GitHub" name="github" value={form.github} onChange={updateField} />
                        <Input label="LinkedIn" name="linkedin" value={form.linkedin} onChange={updateField} />
                        {message && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{message}</p>}
                        <Button type="submit" className="w-full hover:bg-emerald-700">
                            Save profile
                        </Button>
                    </div>
                </form>
            </Container>
        </div>
    );
}

export default ProfileSettings;
