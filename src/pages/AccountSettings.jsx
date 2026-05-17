import { useSelector } from "react-redux";
import { Container } from "../components";

function AccountSettings() {
    const userData = useSelector((state) => state.auth.userData);

    return (
        <div className="bg-stone-50 py-10">
            <Container>
                <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Account</p>
                    <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">Account settings</h1>
                </div>

                <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid gap-5">
                        <div>
                            <dt className="text-sm font-semibold text-slate-500">Name</dt>
                            <dd className="mt-1 text-lg font-bold text-slate-950">{userData?.name || "Not set"}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-semibold text-slate-500">Email</dt>
                            <dd className="mt-1 text-lg font-bold text-slate-950">{userData?.email}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-semibold text-slate-500">Account ID</dt>
                            <dd className="mt-1 break-all text-sm font-medium text-slate-700">{userData?.$id}</dd>
                        </div>
                    </dl>
                    <p className="mt-6 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-slate-600">
                        Password and email changes can be added with Appwrite Account APIs as a focused phase after the CMS flow is complete.
                    </p>
                </div>
            </Container>
        </div>
    );
}

export default AccountSettings;
