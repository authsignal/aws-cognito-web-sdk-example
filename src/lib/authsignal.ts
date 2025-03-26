import {Authsignal} from "@authsignal/browser";

export const authsignal = new Authsignal({
  tenantId: import.meta.env.VITE_AUTHSIGNAL_TENANT_ID!,
  baseUrl: import.meta.env.VITE_AUTHSIGNAL_URL!,
});

// const AuthsignalContext = React.createContext<Authsignal>(authsignal);

// export function AuthsignalProvider({children}: {children: React.ReactNode}) {
//   return <AuthsignalContext.Provider value={authsignal}>{children}</AuthsignalContext.Provider>;
// }

// export function useAuthsignal() {
//   const context = React.useContext(AuthsignalContext);

//   if (context === undefined) {
//     throw new Error("useAuthsignal must be used within a AuthsignalProvider");
//   }

//   return context;
// }
