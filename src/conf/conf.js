const conf = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
    tinyMceApiKey: import.meta.env.VITE_TINYMCE_API_KEY || "",
};

export default conf;
