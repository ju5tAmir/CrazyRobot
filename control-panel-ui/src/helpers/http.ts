import {
    ContactsClient,
    EventsClient,
    GeneratedReportsClient,
    AdminSurveysClient,
    UserSurveysClient,
    AuthClient
} from '../api';

export class ApiClient {
    private baseUrl: string;

    // Individual client instances
    private _contacts: ContactsClient | null = null;
    private _events: EventsClient | null = null;
    private _reports: GeneratedReportsClient | null = null;
    private _adminSurveys: AdminSurveysClient | null = null;
    private _userSurveys: UserSurveysClient | null = null;
    private _auth: AuthClient | null = null;


constructor() {
        this.baseUrl = import.meta.env.VITE_API_HTTP_SCHEMA + import.meta.env.VITE_API_BASE_URL;
    }

    private createHttpClient() {
        const jwt = localStorage.getItem('jwt');

        console.log("JWT: " + jwt);

        return {
            fetch: (url: RequestInfo, init?: RequestInit) => {
                // Add auth headers if JWT exists and URL is to our API
                if (jwt && url.toString().startsWith(this.baseUrl)) {
                    return fetch(url, {
                        ...init,
                        headers: {
                            ...init?.headers,
                            'Authorization': `Bearer ${jwt}`
                        }
                    });
                }
                return fetch(url, init);
            }
        };
    }

    // Lazy-loaded client getters
    get contacts() {
        if (!this._contacts) {
            this._contacts = new ContactsClient(this.baseUrl, this.createHttpClient());
        }
        return this._contacts;
    }

    get events() {
        if (!this._events) {
            this._events = new EventsClient(this.baseUrl, this.createHttpClient());
        }
        return this._events;
    }

    get reports() {
        if (!this._reports) {
            this._reports = new GeneratedReportsClient(this.baseUrl, this.createHttpClient());
        }
        return this._reports;
    }

    get adminSurveys() {
        if (!this._adminSurveys) {
            this._adminSurveys = new AdminSurveysClient(this.baseUrl, this.createHttpClient());
        }
        return this._adminSurveys;
    }

    get userSurveys() {
        if (!this._userSurveys) {
            this._userSurveys = new UserSurveysClient(this.baseUrl, this.createHttpClient());
        }
        return this._userSurveys;
    }

    get auth() {
        if (!this._auth) {
            this._auth = new AuthClient(this.baseUrl, this.createHttpClient());
        }
        return this._auth;
    }

    // Reset clients when authentication changes
    resetClients() {
        this._contacts = null;
        this._events = null;
        this._reports = null;
        this._adminSurveys = null;
        this._userSurveys = null;
        this._auth = null;
    }
}

// Create and export a singleton instance
export const http = new ApiClient();