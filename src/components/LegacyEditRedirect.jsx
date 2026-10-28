import { Navigate, useParams } from "react-router-dom";

export default function LegacyEditRedirect() {
    const { slug } = useParams();
    return <Navigate to={`/dashboard/posts/${encodeURIComponent(slug)}/edit`} replace />;
}
