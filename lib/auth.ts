import {
  PublicClientApplication,
  type AccountInfo,
  InteractionRequiredAuthError,
  type SilentRequest,
} from "@azure/msal-browser"

// MSAL configuration
const msalConfig = {
  auth: {
    clientId: "27c750cd-8d7b-45b1-9dec-c52e444eefc9",
    authority: "https://login.microsoftonline.com/b41b72d0-4e9f-4c26-8a69-f949f367c91d",
    redirectUri: typeof window !== "undefined" ? window.location.origin : "",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
}

// Create MSAL instance
let msalInstance: PublicClientApplication | null = null
let isInitialized = false

// Initialize MSAL
const initializeMsal = async () => {
  if (!isInitialized) {
    if (typeof window === "undefined") {
      return false // Return false if running on server
    }

    try {
      msalInstance = new PublicClientApplication(msalConfig)
      await msalInstance.initialize()
      isInitialized = true
      return true
    } catch (error) {
      console.error("Error initializing MSAL:", error)
      return false
    }
  }
  return true
}

// Microsoft Graph scopes needed for calendar operations
export const graphScopes = {
  calendar: ["Calendars.ReadWrite", "User.Read"],
  mail: ["Mail.ReadWrite", "User.Read"],
}

// Login with Microsoft
export const loginWithMicrosoft = async () => {
  const initialized = await initializeMsal()
  if (!initialized || !msalInstance) {
    throw new Error("MSAL not initialized")
  }

  try {
    const loginRequest = {
      scopes: graphScopes.calendar,
      prompt: "select_account",
    }

    const response = await msalInstance.loginPopup(loginRequest)
    return response
  } catch (error) {
    console.error("Error during Microsoft login:", error)
    throw error
  }
}

// Login with Google (placeholder - would need Google OAuth implementation)
export const loginWithGoogle = async () => {
  // This would be implemented with Google OAuth
  console.log("Google login not implemented yet")
  throw new Error("Google login not implemented yet")
}

// Get access token silently (for API calls)
export const getTokenSilently = async (): Promise<string> => {
  const initialized = await initializeMsal()
  if (!initialized || !msalInstance) {
    throw new Error("MSAL not initialized")
  }

  const accounts = msalInstance.getAllAccounts()

  if (accounts.length === 0) {
    throw new Error("No accounts found. Please sign in.")
  }

  const silentRequest: SilentRequest = {
    scopes: graphScopes.calendar,
    account: accounts[0],
  }

  try {
    const response = await msalInstance.acquireTokenSilent(silentRequest)
    return response.accessToken
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      // fallback to interaction when silent call fails
      const response = await msalInstance.acquireTokenPopup(silentRequest)
      return response.accessToken
    }
    throw error
  }
}

// Logout
export const logout = async () => {
  const initialized = await initializeMsal()
  if (!initialized || !msalInstance) {
    throw new Error("MSAL not initialized")
  }

  const logoutRequest = {
    account: msalInstance.getActiveAccount() as AccountInfo,
  }

  await msalInstance.logoutPopup(logoutRequest)
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (!msalInstance) {
    return false
  }
  return msalInstance.getAllAccounts().length > 0
}

// Get current user
export const getCurrentUser = (): AccountInfo | null => {
  if (!msalInstance) {
    return null
  }
  const accounts = msalInstance.getAllAccounts()
  return accounts.length > 0 ? accounts[0] : null
}

// Initialize MSAL on module load if in browser environment
if (typeof window !== "undefined") {
  initializeMsal().catch((error) => {
    console.error("Failed to initialize MSAL:", error)
  })
}

