/*
Appwrite client/account setup
signup ke baad auto login logic
session create aur localStorage flag
current user check
logout/session cleanup logic
*/

import conf from '../conf/conf';
import { Client, Account, ID } from "appwrite";

const authSessionKey = "appwriteSession";

// Appwrite authentication ka sara logic is class me handle ho raha hai.
export class AuthService {
    client = new Client();
    account;
    isConfigured = Boolean(conf.appwriteUrl && conf.appwriteProjectId);

    constructor() {
        if (!this.isConfigured) {
            console.warn("Appwrite auth is not configured. Add VITE_APPWRITE_URL and VITE_APPWRITE_PROJECT_ID.");
            return;
        }

        // Appwrite client ko project URL aur project ID se configure kar rahe hain.
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId)

        // Account service login, signup, current user jaise methods provide karti hai.
        this.account = new Account(this.client);
    }

    async createAccount({email, password, name}) {
        if (!this.isConfigured) throw new Error("Appwrite auth is not configured.");

        // New user account create karte hain unique ID ke saath.
        const userAccount = await this.account.create(ID.unique(), email, password, name);

        if(userAccount){
            // Account banne ke baad user ko direct login kara dete hain.
            return this.login({email, password});
        }

        return userAccount;
    }

    async login({email, password}) {
        if (!this.isConfigured) throw new Error("Appwrite auth is not configured.");

        try {
            // Delete existing active session on the client/device, if any,
            // to prevent "Creation of a session is prohibited when a session is active" error.
            await this.account.deleteSession("current");
        } catch {
            // Ignore error if there is no active session.
        }

        // Email/password se Appwrite session create hota hai.
        const session = await this.account.createEmailPasswordSession(email, password);

        // Local flag rakhte hain taaki app ko pata rahe ki session check karna hai.
        localStorage.setItem(authSessionKey, "true");
        return session;
    }

    async getCurrentUser() {
        if (!this.isConfigured) return null;

        // Agar local session flag hi nahi hai, to user logged in nahi maana jayega.
        if (!localStorage.getItem(authSessionKey)) {
            return null;
        }

        try {
            // Appwrite se currently logged-in user ki details fetch karte hain.
            return await this.account.get();
        } catch {
            // Session invalid/expired ho to local flag hata dete hain.
            localStorage.removeItem(authSessionKey);
            return null;
        }
    }

    async logout() {
        if (!this.isConfigured) return false;

        try {
            // Appwrite ke sabhi active sessions delete karke user ko logout karte hain.
            await this.account.deleteSessions();
            localStorage.removeItem(authSessionKey);
            return true;
        } catch {
            // Error aaye tab bhi local session flag clean kar dete hain.
            localStorage.removeItem(authSessionKey);
            return false;
        }
    }
}

const authService = new AuthService();

export default authService;
