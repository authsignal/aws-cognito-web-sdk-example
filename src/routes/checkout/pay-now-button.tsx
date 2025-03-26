import * as React from "react";

import {useMediaQuery} from "@/hooks/use-media-query";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger} from "@/components/ui/drawer";
import {AuthpayLogo} from "./authpay-logo";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {PasskeyIcon} from "@/components/icons/passkey-icon";
import {useToast} from "@/hooks/use-toast";
import {authsignal} from "@/lib/authsignal";
import {cn} from "@/lib/utils";

type PayNowButtonProps = {
  authsignalToken: string;
  email: string;
};

export function PayNowButton({authsignalToken, email}: PayNowButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const {toast} = useToast();

  const isDesktop = useMediaQuery("(min-width: 768px)");

  React.useEffect(() => {
    if (open) {
      authsignal.email.challenge();
    }
  }, [open]);

  const handlePasskeySignIn = async () => {
    const handleError = () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passkey login failed",
      });

      setIsLoading(false);
    };

    try {
      const signInResponse = await authsignal.passkey.signIn({token: authsignalToken});

      setIsLoading(true);

      if (signInResponse.error) {
        handleError();
        return;
      }

      if (signInResponse.data?.token) {
        window.location.reload();
      } else {
        handleError();
      }

      setIsLoading(false);
    } catch {
      // user cancelled the passkey request
      setIsLoading(false);
    }
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-[#313139]" size="lg">
            Pay now
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] pb-10" aria-describedby={undefined}>
          <DialogHeader>
            <AuthpayLogo />
            <span className="text-muted-foreground text-xs">{email}</span>
          </DialogHeader>
          <div className="flex flex-col items-center gap-2 mt-6">
            <DialogTitle className="font-medium text-xl">Confirm it's you</DialogTitle>

            <EmailOtpForm email={email} />
            <Button onClick={handlePasskeySignIn} className="text-indigo-600 mt-2" variant="link">
              <PasskeyIcon className="size-7" /> Use a passkey instead
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="bg-[#313139]" size="lg">
          Pay now
        </Button>
      </DrawerTrigger>
      <DrawerContent className="pb-10" aria-describedby={undefined}>
        <DrawerHeader className="text-left">
          <AuthpayLogo />
          <span className="text-muted-foreground text-xs">{email}</span>
        </DrawerHeader>
        <div className="flex flex-col items-center gap-2 mt-4">
          <DrawerTitle className="font-medium text-xl">Confirm it's you</DrawerTitle>

          <EmailOtpForm email={email} />
          <Button onClick={handlePasskeySignIn} disabled={isLoading} className="mt-2 text-indigo-600" variant="link">
            <PasskeyIcon className="size-7" /> Use a passkey instead
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

const formSchema = z.object({
  code: z.string().min(6, {message: "Enter a valid code"}),
});

enum OtpInputState {
  IDLE = "IDLE",
  LOADING = "LOADING",
  ERROR = "ERROR",
}

function EmailOtpForm({email}: {email: string}) {
  const [codeState, setCodeState] = React.useState<OtpInputState>(OtpInputState.IDLE);

  const submitButtonRef = React.useRef<HTMLButtonElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  const code = form.watch("code");

  React.useEffect(() => {
    if (code?.length === 6) {
      submitButtonRef.current?.click();
    }
  }, [code]);

  const onSubmit = form.handleSubmit(async ({code}) => {
    setCodeState(OtpInputState.LOADING);

    const verifyResponse = await authsignal.email.verify({code});

    if (verifyResponse.error) {
      // Handle error
      return;
    }

    if (verifyResponse.data?.isVerified) {
      window.location.reload();
    } else {
      setCodeState(OtpInputState.ERROR);

      setTimeout(() => {
        setCodeState(OtpInputState.IDLE);

        form.resetField("code");

        setTimeout(() => {
          form.setFocus("code");
        }, 0);
      }, 500);
    }
  });

  return (
    <div className="flex flex-col gap-4">
      <span className="text-sm text-center">
        Enter the code sent to {email} <br /> to proceed with your payment.
      </span>
      <Form {...form}>
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4 w-full">
          <FormField
            control={form.control}
            name="code"
            render={({field}) => (
              <FormItem className="mx-auto">
                <FormLabel className="sr-only">Code</FormLabel>
                <FormControl>
                  <InputOTP disabled={codeState === OtpInputState.LOADING} maxLength={6} {...field}>
                    <InputOTPGroup className={cn("gap-2", codeState === OtpInputState.ERROR && "animate-shake")}>
                      <InputOTPSlot
                        className={cn(
                          "rounded-lg border border-gray-500 size-12",
                          codeState === OtpInputState.ERROR && "border-red-600",
                        )}
                        index={0}
                      />
                      <InputOTPSlot
                        className={cn(
                          "rounded-lg border border-gray-500 size-12",
                          codeState === OtpInputState.ERROR && "border-red-600",
                        )}
                        index={1}
                      />
                      <InputOTPSlot
                        className={cn(
                          "rounded-lg border border-gray-500 size-12",
                          codeState === OtpInputState.ERROR && "border-red-600",
                        )}
                        index={2}
                      />
                      <InputOTPSlot
                        className={cn(
                          "rounded-lg border border-gray-500 size-12",
                          codeState === OtpInputState.ERROR && "border-red-600",
                        )}
                        index={3}
                      />
                      <InputOTPSlot
                        className={cn(
                          "rounded-lg border border-gray-500 size-12",
                          codeState === OtpInputState.ERROR && "border-red-600",
                        )}
                        index={4}
                      />
                      <InputOTPSlot
                        className={cn(
                          "rounded-lg border border-gray-500 size-12",
                          codeState === OtpInputState.ERROR && "border-red-600",
                        )}
                        index={5}
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage className="sr-only" />
              </FormItem>
            )}
          />
          <button hidden type="submit" ref={submitButtonRef} />
        </form>
      </Form>
    </div>
  );
}
