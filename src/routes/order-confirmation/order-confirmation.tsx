import iphoneImg from "@/assets/iphone.webp";
import {Card, CardFooter} from "@/components/ui/card";
import {cn} from "@/lib/utils";

import mapImg from "@/assets/map.png";
import {CheckCircledIcon} from "@radix-ui/react-icons";

export function OrderConfirmation() {
  return (
    <div className="min-h-screen lg:grid grid-cols-12 container">
      <div className="lg:col-span-7 lg:px-10 py-10 flex flex-col gap-6">
        <header className="flex items-center gap-3">
          <CheckCircledIcon className="size-14 text-blue-600" />
          <div>
            <span className="text-muted-foreground text-sm">Confirmation #ABC123EXAMPLE</span>
            <h1 className="text-xl font-semibold">Thank you!</h1>
          </div>
        </header>
        <Card>
          <img className="rounded-t-xl" src={mapImg} alt="" />
          <CardFooter className="p-3">
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-medium">Your order is confirmed</h2>
              <p className="text-xs">You&apos;ll receive a confirmation email with your order number shortly.</p>
            </div>
          </CardFooter>
        </Card>
        <OrderSummary className="lg:hidden" />

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
