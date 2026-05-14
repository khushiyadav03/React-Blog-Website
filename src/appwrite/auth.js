import conf from '../conf/conf';
import { Client, Account, ID } from "appwrite";

const authSessionKey = "appwriteSession";

export class AuthService {
    client = new Client();
    account;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId)
        this.account = new Account(this.client);
    }

    async createAccount({email, password, name}) {
        try {
            const userAccount = await this.account.create(ID.unique(), email, password, name);
            if(userAccount){
                // call another method
                return this.login({email, password});
            } else {
                return userAccount;
            }
        } catch (error) {
            throw error;
        }
    }

    async login({email, password}) {
        try {
            const session = await this.account.createEmailPasswordSession(email, password);
            localStorage.setItem(authSessionKey, "true");
            return session;
        } catch (error) {
            throw error;
        }
    }

    async getCurrentUser() {
        if (!localStorage.getItem(authSessionKey)) {
            return null;
        }

        try {
            return await this.account.get();
        } catch (error) {
            localStorage.removeItem(authSessionKey);
            return null;
        }
    }

    async logout() {
        try {
            await this.account.deleteSessions();
            localStorage.removeItem(authSessionKey);
            return true;
        } catch (error) {
            localStorage.removeItem(authSessionKey);
            return false;
        }
    }
}

const authService = new AuthService();

export default authService;
