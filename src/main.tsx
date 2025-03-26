import {createRoot} from "react-dom/client";
import {createBrowserRouter, Navigate, RouterProvider} from "react-router-dom";
import "./index.css";
import {Login} from "./routes/login/login.tsx";
import {SignUp} from "./routes/sign-up/sign-up.tsx";
import {Toaster} from "./components/ui/toaster.tsx";
import {ConfirmSignUp} from "./routes/confirm-sign-up/confirm-sign-up.tsx";
import {Account} from "./routes/account/account.tsx";
import {Mfa} from "./routes/mfa/mfa.tsx";
import {CreatePasskey} from "./routes/create-passkey/create-passkey.tsx";
import {LoginLayout, loader as loginLoader} from "./routes/login/login-layout.tsx";
import {Security, loader as securityLoader} from "./routes/account/security/security.tsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {RootBoundary} from "./routes/root/root-boundary.tsx";
import {AppLayout} from "./routes/app/app-layout.tsx";
import {Checkout, loader as checkoutLoader} from "./routes/checkout/checkout.tsx";
import {AuthsignalProvider} from "@authsignal/react";
import {OrderConfirmation} from "./routes/order-confirmation/order-confirmation.tsx";
import {PasswordLogin} from "./routes/password-login/password-login.tsx";
import {PasswordSignUp} from "./routes/password-sign-up/password-sign-up.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" />,
  },
  {
    path: "/",
    errorElement: <RootBoundary />,
    children: [
      {
        loader: loginLoader,
        element: <LoginLayout />,
        children: [
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "mfa",
            element: <Mfa />,
          },
          {
            path: "create-passkey",
            element: <CreatePasskey />,
          },
          {
            path: "sign-up",
            element: <SignUp />,
          },
          {
            path: "confirm-sign-up",
            element: <ConfirmSignUp />,
          },
        ],
      },
      {
        loader: loginLoader,
        element: <LoginLayout />,
        children: [
          {
            path: "password-login",
            element: <PasswordLogin />,
          },
          {
            path: "password-sign-up",
            element: <PasswordSignUp />,
          },
        ],
      },
      {
        element: <AppLayout />,
        children: [
          {
            path: "account",
            element: <Account />,
            children: [
              {
                path: "security",
                loader: securityLoader(queryClient),
                element: <Security />,
              },
            ],
          },
        ],
      },
      {
        path: "checkout",
        loader: checkoutLoader,
        element: <Checkout />,
      },
      {
        path: "order-confirmation",
        element: <OrderConfirmation />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <AuthsignalProvider tenantId={import.meta.env.VITE_AUTHSIGNAL_TENANT_ID}>
      <RouterProvider router={router} />
    </AuthsignalProvider>
    <ReactQueryDevtools buttonPosition="bottom-right" />
  </QueryClientProvider>,
);
