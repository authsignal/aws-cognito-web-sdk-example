import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

import iphoneImg from "@/assets/iphone.webp";
import simplifyLogo from "./simplify.svg";
import {cn} from "@/lib/utils";
import {AuthpayLogo} from "./authpay-logo";
import {authorizePayment} from "@/api/payments";
import {useLoaderData, useNavigate} from "react-router-dom";
import React from "react";
import {useToast} from "@/hooks/use-toast";
import {useAuthsignal, ChallengeError} from "@authsignal/react";
import {getCurrentUser} from "@/lib/aws-auth";
import type {GetUserCommandOutput} from "@aws-sdk/client-cognito-identity-provider";

export async function loader() {
  const user = await getCurrentUser();
  return {user};
}

export function Checkout() {
  const {user} = useLoaderData() as {user: GetUserCommandOutput};
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();
  const {toast} = useToast();
  const {startChallengeAsync} = useAuthsignal();

  const email = user.Username;

  const handlePayment = async () => {
    if (isLoading) return;

    setIsLoading(true);

    const {authsignalToken: token} = await authorizePayment();

    try {
      await startChallengeAsync({
        token,
      });

      navigate("/order-confirmation");
    } catch (e) {
      let message = "An error occurred";

      if (e instanceof ChallengeError) {
        console.error(e);
        if (e.code === "USER_CANCELED") {
          message = "Payment canceled";
        } else if (e.code === "TOKEN_EXPIRED") {
          message = "Session expired";
        }
      }

      toast({title: message, variant: "destructive"});
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen lg:grid grid-cols-12 container">
      <div className="lg:col-span-7 lg:px-10 py-10 flex flex-col gap-6">
        <header className="lg:pb-10">
          <img alt="Simplify" src={simplifyLogo} className="mx-auto h-10" />
        </header>
        <div className="divide-y">
          <div className="flex flex-col gap-2 py-4 border-t lg:border-t-0">
            <h2>
              <AuthpayLogo />
              <span className="sr-only">Authpay</span>
            </h2>
            <span className="text-sm">{email}</span>
          </div>
          <div className="flex flex-col gap-2 py-4">
            <h2 className="text-muted-foreground font-medium text-sm">Ship to</h2>
            <span className="text-sm">Hamish Meikle, 1/123 Hazlewood Street, Spikebury NSW 2713, AU</span>
          </div>
          <div className="flex flex-col gap-2 py-4">
            <h2 className="text-muted-foreground font-medium text-sm">Shipping method</h2>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm">
                DHL EXPRESS WORLDWIDE · <span className="font-bold">$34.00</span>
              </span>
              <span className="text-sm text-muted-foreground">6 business days</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 py-4">
            <h2 className="text-muted-foreground font-medium text-sm">Payment method</h2>
            <div className="flex gap-2 items-center">
              <img
                className="h-6"
                alt="Mastercard"
                src="https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.en/assets/master.CzeoQWmc.svg"
              />
              <span className="text-sm">Kiwibank ···· 1234</span>
            </div>
          </div>
        </div>
        <OrderSummary className="lg:hidden" />

        <Button
          isLoading={isLoading}
          loadingMessage="Authorizing"
          onClick={handlePayment}
          className="bg-[#313139]"
          size="lg"
        >
          Pay now
        </Button>

        <footer className="border-t mt-10 text-sm py-4 flex flex-wrap gap-2">
          <span className="underline">Refund policy</span>
          <span className="underline">Shipping policy</span>
          <span className="underline">Privacy policy</span>
          <span className="underline">Terms of service</span>
          <span className="underline">Subscription policy</span>
          <span className="underline">Contact information</span>
        </footer>
      </div>
      <OrderSummary className="hidden lg:flex" />
    </div>
  );
}

function OrderSummary({className}: {className?: string}) {
  return (
    <div className={cn("lg:col-span-5 bg-gray-100 p-10 flex flex-col gap-6 rounded-lg lg:rounded-none", className)}>
      <div className="flex items-center gap-4">
        <img className="size-14" src={iphoneImg} alt=""></img>
        <div className="flex flex-col gap-1">
          <span className="text-sm">Apple iPhone 16 Plus 256GB</span>
          <span className="text-xs text-muted-foreground">White</span>
        </div>
        <span className="text-sm ml-auto">$1099.99</span>
      </div>
      <div className="flex gap-2">
        <Input className="bg-white" placeholder="Discount code" />
        <Button className="border" variant="secondary">
          Apply
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-sm flex justify-between">
          <span>Subtotal</span>
          <span>$1099.99</span>
        </div>
        <div className="text-sm flex justify-between">
          <span>Shipping</span>
          <span>$34.00</span>
        </div>
      </div>
      <div className="text-lg font-bold flex justify-between">
        <span>Total</span>
        <span>$1133.99</span>
      </div>
    </div>
  );
}
