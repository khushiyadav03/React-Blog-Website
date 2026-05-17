const conf = {
    appwriteUrl : import.meta.env.VITE_APPWRITE_URL || "",
    appwriteProjectId : import.meta.env.VITE_APPWRITE_PROJECT_ID || "",
    appwriteDatabaseId : import.meta.env.VITE_APPWRITE_DATABASE_ID || "",
    appwriteCollectionId : import.meta.env.VITE_APPWRITE_COLLECTION_ID || "",
    appwriteBucketId : import.meta.env.VITE_APPWRITE_BUCKET_ID || "",
    appwriteProfilesCollectionId : import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID || "",
    appwriteCategoriesCollectionId : import.meta.env.VITE_APPWRITE_CATEGORIES_COLLECTION_ID || "",
    appwriteBookmarksCollectionId : import.meta.env.VITE_APPWRITE_BOOKMARKS_COLLECTION_ID || ""
}



export default conf 
