import { account, ID } from "./appwrite";
import { Models } from "appwrite";

export type AppwriteUser = Models.User<Models.Preferences>;

// ─── Sign Up ─────────────────────────────────────────────────────────────────
export async function signUp(
  name: string,
  email: string,
  password: string
): Promise<AppwriteUser> {
  await account.create(ID.unique(), email, password, name);
  await account.createEmailPasswordSession(email, password);
  return account.get();
}

// ─── Log In ──────────────────────────────────────────────────────────────────
export async function logIn(
  email: string,
  password: string
): Promise<AppwriteUser> {
  await account.createEmailPasswordSession(email, password);
  return account.get();
}

// ─── Log Out ─────────────────────────────────────────────────────────────────
export async function logOut(): Promise<void> {
  await account.deleteSession("current");
}

// ─── Get Current Session ─────────────────────────────────────────────────────
export async function getCurrentUser(): Promise<AppwriteUser | null> {
  try {
    return await account.get();
  } catch {
    return null;
  }
}
