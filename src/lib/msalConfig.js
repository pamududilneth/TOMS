import { LogLevel } from "@azure/msal-browser";

export const msalConfig = {
    auth: {
        clientId: import.meta.env.VITE_ENTRA_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_ENTRA_TENANT_ID}`,
        redirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: "localStorage",
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) return;
                console.log(`[MSAL] ${message}`);
            },
            logLevel: LogLevel.Verbose,
            piiLoggingEnabled: false,
        },
    },
};

export const loginRequest = {
    scopes: ["User.Read"],
};