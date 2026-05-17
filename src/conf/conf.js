const getEnv = (key) => import.meta.env[key] || "";

const conf = {
    appwriteUrl : getEnv("VITE_APPWRITE_URL"),
    appwriteProjectId : getEnv("VITE_APPWRITE_PROJECT_ID"),
    appwriteDatabaseId : getEnv("VITE_APPWRITE_DATABASE_ID"),
    appwriteCollectionId : getEnv("VITE_APPWRITE_COLLECTION_ID"),
    appwriteBucketId : getEnv("VITE_APPWRITE_BUCKET_ID"),
    appwriteProfilesCollectionId : getEnv("VITE_APPWRITE_PROFILES_COLLECTION_ID"),
    appwriteCategoriesCollectionId : getEnv("VITE_APPWRITE_CATEGORIES_COLLECTION_ID"),
    appwriteBookmarksCollectionId : getEnv("VITE_APPWRITE_BOOKMARKS_COLLECTION_ID")
}



export default conf 
