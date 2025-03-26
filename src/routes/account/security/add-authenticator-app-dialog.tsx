import {addAuthenticator} from "@/api/authenticators";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp";
import {useToast} from "@/hooks/use-toast";
import {authsignal} from "@/lib/authsignal";
import {AuthsignalResponse, EnrollTotpResponse} from "@authsignal/browser";
import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {QRCode as QRCodeComponent} from "react-qrcode-logo";
import {z} from "zod";

const formSchema = z.object({
  code: z.string().min(6, {message: "Enter a valid code"}),
});

export function AddAuthenticatorAppDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const [totpEnrollResponse, setTotpEnrollResponse] = useState<AuthsignalResponse<EnrollTotpResponse> | null>(null);

  const {toast} = useToast();

  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  const handleGenerateQRCode = async () => {
    const errorToast = () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    };

    try {
      const {authsignalToken} = await addAuthenticator();

      authsignal.setToken(authsignalToken);

      const totpEnrollResponse = await authsignal.totp.enroll();

      if (!totpEnrollResponse || "error" in totpEnrollResponse) {
        errorToast();

        return;
      }

      setTotpEnrollResponse(totpEnrollResponse);
    } catch {
      errorToast();
    }
  };

  const handleSubmit = form.handleSubmit(async ({code}) => {
    const verifyResponse = await authsignal.totp.verify({code});

    if (!verifyResponse || "error" in verifyResponse) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong.",
      });

      return;
    }

    if (verifyResponse.data?.isVerified) {
      queryClient.invalidateQueries({queryKey: ["authenticators"]});

      setIsOpen(false);
    } else {
      form.setError("code", {
        message: "Invalid code",
      });
    }
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);

        if (open) {
          handleGenerateQRCode();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add authenticator app</DialogTitle>
          <DialogDescription>Scan the QR code with your authenticator app then enter the code.</DialogDescription>
        </DialogHeader>
        <div aria-hidden>
          <QRCode uri={totpEnrollResponse?.data?.uri} />
        </div>
        <Form {...form}>
          <form onSubmit={handleSubmit}>
            <FormField
              control={form.control}
              name="code"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Continue</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function QRCode({uri}: {uri?: string}) {
  if (!uri) {
    return <div className="h-44 w-44 animate-pulse bg-gray-200" />;
  }

  return <QRCodeComponent value={uri} size={166} ecLevel="M" quietZone={5} />;
}
