/*
Appwrite database se posts create/update/delete/fetch ho rahe hain, 
aur storage bucket se images upload/delete/preview handle ho raha hai
*/

import conf from "../conf/conf";
import { Client, ID, Databases, Storage, Query, Permission, Role } from "appwrite";

// Blog posts aur files ke Appwrite operations yahin se handle hote hain.
export class Service{
    client = new Client();
    databases;
    bucket;
    isConfigured = Boolean(
        conf.appwriteUrl &&
        conf.appwriteProjectId &&
        conf.appwriteDatabaseId &&
        conf.appwriteCollectionId &&
        conf.appwriteBucketId
    );

    constructor() {
        if (!this.isConfigured) {
            console.warn("Appwrite data service is not configured. Add VITE_APPWRITE_* variables in Vercel.");
            return;
        }

        // Appwrite client ko project URL aur project ID se connect kar rahe hain.
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId)

        // Databases posts ke liye, Storage images/files ke liye use hoga.
        this.databases = new Databases(this.client)
        this.bucket = new Storage(this.client)
    }

    optionalCollection(collectionId) {
        return collectionId && collectionId !== "undefined";
    }

    emptyList() {
        return { documents: [] };
    }

    buildPostPayload({title, content, featuredImage, status, userID, excerpt, tags}) {
        const payload = {
            title,
            content,
            featuredImage,
            status,
            userID,
        };

        if (excerpt) payload.excerpt = excerpt;
        if (tags?.length) payload.tags = Array.isArray(tags) ? tags : String(tags).split(",").map((tag) => tag.trim()).filter(Boolean);

        return payload;
    }

    async createPost({title, slug, content, featuredImage, status, userID, excerpt, tags}) {
        if (!this.isConfigured) return null;

        try {
            // Slug ko document ID bana kar new blog post create kar rahe hain.
            return await this.databases.createDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, slug, this.buildPostPayload({
                title,
                content,
                featuredImage,
                status,
                userID,
                excerpt,
                tags,
            }),
            [
                Permission.read(Role.any()),
                Permission.update(Role.user(userID)),
                Permission.delete(Role.user(userID)),
            ])
        } catch(error){
            console.log("Appwrite service :: createPost :: error", error);
        }
    }

    async updatePost(slug, {title, content, featuredImage, status, excerpt, tags}){
        if (!this.isConfigured) return null;

        try {
            const payload = this.buildPostPayload({
                title,
                content,
                featuredImage,
                status,
                excerpt,
                tags,
            });

            if (!featuredImage) delete payload.featuredImage;
            delete payload.userID;

            // Existing post ko slug/document ID ke basis par update kar rahe hain.
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug,
                payload
            )
        } catch (error) {
            console.log("Appwrite service :: updatePost :: error", error);
        }
    }

    async getUserPosts(userID) {
        if (!this.isConfigured || !userID) return this.emptyList();

        return this.getPosts([Query.equal("userID", userID), Query.orderDesc("$createdAt")]);
    }

    async getPublishedPosts(extraQueries = []) {
        if (!this.isConfigured) return this.emptyList();

        return this.getPosts([Query.equal("status", "active"), Query.orderDesc("$createdAt"), ...extraQueries]);
    }

    async searchPosts(searchTerm) {
        if (!this.isConfigured) return this.emptyList();

        const queries = [Query.equal("status", "active"), Query.orderDesc("$createdAt")];

        if (searchTerm) {
            queries.unshift(Query.search("title", searchTerm));
        }

        return this.getPosts(queries);
    }

    async getProfile(userID) {
        if (!this.isConfigured || !userID || !this.optionalCollection(conf.appwriteProfilesCollectionId)) return null;

        try {
            const profiles = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteProfilesCollectionId,
                [Query.equal("userID", userID)]
            )

            return profiles.documents[0] || null;
        } catch (error) {
            console.log("Appwrite service :: getProfile :: error", error);
            return null;
        }
    }

    async upsertProfile({userID, name, bio, avatar, website, github, linkedin}) {
        if (!this.isConfigured || !userID || !this.optionalCollection(conf.appwriteProfilesCollectionId)) return null;

        const payload = {userID, name, bio};
        if (avatar) payload.avatar = avatar;
        if (website) payload.website = website;
        if (github) payload.github = github;
        if (linkedin) payload.linkedin = linkedin;

        try {
            const existing = await this.getProfile(userID);

            if (existing) {
                return await this.databases.updateDocument(
                    conf.appwriteDatabaseId,
                    conf.appwriteProfilesCollectionId,
                    existing.$id,
                    payload
                )
            }

            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteProfilesCollectionId,
                ID.unique(),
                payload,
                [
                    Permission.read(Role.any()),
                    Permission.update(Role.user(userID)),
                    Permission.delete(Role.user(userID)),
                ]
            )
        } catch (error) {
            console.log("Appwrite service :: upsertProfile :: error", error);
            return null;
        }
    }

    async getBookmarks(userID) {
        if (!this.isConfigured || !userID || !this.optionalCollection(conf.appwriteBookmarksCollectionId)) return this.emptyList();

        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteBookmarksCollectionId,
                [Query.equal("userID", userID), Query.orderDesc("$createdAt")]
            )
        } catch (error) {
            console.log("Appwrite service :: getBookmarks :: error", error);
            return { documents: [] };
        }
    }

    async getBookmark(userID, postID) {
        if (!this.isConfigured || !userID || !postID || !this.optionalCollection(conf.appwriteBookmarksCollectionId)) return null;

        try {
            const bookmarks = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteBookmarksCollectionId,
                [Query.equal("userID", userID), Query.equal("postID", postID)]
            )

            return bookmarks.documents[0] || null;
        } catch (error) {
            console.log("Appwrite service :: getBookmark :: error", error);
            return null;
        }
    }

    async toggleBookmark(userID, postID) {
        if (!this.isConfigured || !userID || !postID || !this.optionalCollection(conf.appwriteBookmarksCollectionId)) return null;

        try {
            const existing = await this.getBookmark(userID, postID);

            if (existing) {
                await this.databases.deleteDocument(
                    conf.appwriteDatabaseId,
                    conf.appwriteBookmarksCollectionId,
                    existing.$id
                )

                return null;
            }

            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteBookmarksCollectionId,
                ID.unique(),
                {userID, postID},
                [
                    Permission.read(Role.user(userID)),
                    Permission.update(Role.user(userID)),
                    Permission.delete(Role.user(userID)),
                ]
            )
        } catch (error) {
            console.log("Appwrite service :: toggleBookmark :: error", error);
            return null;
        }
    }

    async deletePost(slug){
        if (!this.isConfigured) return false;

        try {
            // Slug/document ID se post delete karte hain.
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug
            )
            return true;
        } catch (error) {
            console.log("Appwrite service :: deletePost :: error", error);
            return false;
        }
    }

    async getPost(slug) {
        if (!this.isConfigured) return false;

        try {
            // Single post fetch karte hain using slug/document ID.
            return await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug
            )
        } catch(error) {
            console.log("Appwrite service :: getPost :: error", error);
            return false;
        }
    }

    async getPosts(queries = [Query.equal("status", "active")]){
        if (!this.isConfigured) return this.emptyList();

        try {
            // By default sirf active posts list hote hain; custom queries bhi pass kar sakte hain.
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                queries,
            )
        } catch (error) {
            console.log("Appwrite service :: getPosts :: error", error);
        }
    }

    async uploadFile(file){
        if (!this.isConfigured) return false;

        try {
            // Image/file ko Appwrite bucket me unique ID ke saath upload karte hain.
            return await this.bucket.createFile(
                conf.appwriteBucketId,
                ID.unique(),
                file,
                [
                    Permission.read(Role.any()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users()),
                ]
            )
        } catch (error){
            console.log("Appwrite service :: uploadFile :: error", error);
            return false;
        }
    }

    async deleteFile(fileID){
        if (!this.isConfigured) return false;

        try {
            // Bucket se uploaded file delete karte hain.
            await this.bucket.deleteFile(
                conf.appwriteBucketId,
                fileID
            )
            return true
        } catch (error) {
            console.log("Appwrite service :: deleteFile :: error", error);
            return false;
        }
    }

    getFileView(fileId){
        if (!this.isConfigured || !fileId) return "";

        // Direct file URL is more reliable than transformed previews for public blog images.
        const fileView = this.bucket.getFileView(
            conf.appwriteBucketId,
            fileId
        )

        return fileView.href || fileView.toString()
    }

    getFilePreview(fileId){
        return this.getFileView(fileId)
    }
}

const service = new Service()
export default service
