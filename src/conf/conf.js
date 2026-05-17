const conf = {
    appwriteUrl : String(import.meta.env.VITE_APPWRITE_URL),
    appwriteProjectId : String(import.meta.env.VITE_APPWRITE_PROJECT_ID),
    appwriteDatabaseId : String(import.meta.env.VITE_APPWRITE_DATABASE_ID),
    appwriteCollectionId : String(import.meta.env.VITE_APPWRITE_COLLECTION_ID),
    appwriteBucketId : String(import.meta.env.VITE_APPWRITE_BUCKET_ID),
    appwriteProfilesCollectionId : String(import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID || ""),
    appwriteCategoriesCollectionId : String(import.meta.env.VITE_APPWRITE_CATEGORIES_COLLECTION_ID || ""),
    appwriteBookmarksCollectionId : String(import.meta.env.VITE_APPWRITE_BOOKMARKS_COLLECTION_ID || "")
}



export default conf 
