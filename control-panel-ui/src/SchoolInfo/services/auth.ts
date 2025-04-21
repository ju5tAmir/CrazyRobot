// Simple authentication service

interface User {
  username: string;
  role: "admin" | "user";
  name: string;
}

const STORAGE_KEY = "school_portal_auth";

// Mock users - in a real app, this would be validated against a backend
const MOCK_USERS: Record<string, User> = {
  admin: {
    username: "admin",
    role: "admin",
    name: "Admin User",
  },
  user: {
    username: "user",
    role: "user",
    name: "Regular User",
  },
};

// Mock passwords - in a real app, this would be validated against a backend
const MOCK_PASSWORDS: Record<string, string> = {
  admin: "123",
  user: "123",
};

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  private saveUserToStorage() {
    if (this.currentUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }

    // Dispatch a storage event to notify other tabs/components
    window.dispatchEvent(new Event("storage"));
  }

  login(username: string, password: string): boolean {
    // In a real app, this would validate against a backend
    if (MOCK_USERS[username] && MOCK_PASSWORDS[username] === password) {
      this.currentUser = MOCK_USERS[username];
      this.saveUserToStorage();
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUser = null;
    this.saveUserToStorage();
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === "admin";
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getUserName(): string {
    return this.currentUser?.name || "Guest";
  }
}

export const auth = new AuthService();
