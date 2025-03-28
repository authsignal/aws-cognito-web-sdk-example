import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp";
import {authsignal} from "@/lib/authsignal";
import {useToast} from "@/hooks/use-toast";
import {respondToChallenge, setTokens, getCurrentUser} from "@/lib/aws-auth";

const formSchema = z.object({
  code: z.string().min(6, {message: "Enter a valid code"}),
});

export function Mfa() {
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);
  const {toast} = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  useEffect(() => {
    if (!location.state?.token || !location.state?.email || !location.state?.session) {
      navigate("/login");
      return;
    }

    authsignal.setToken(location.state.token);
  }, [location.state, navigate]);

  const handleResendCode = async () => {
    if (!location.state?.token) {
      navigate("/login");
      return;
    }

    setIsResendingCode(true);

    try {
      await authsignal.email.challenge();

      toast({
        title: "Code sent",
        description: "A new code has been sent to your email",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send code",
      });
    }

    setIsResendingCode(false);
  };

  const onSubmit = form.handleSubmit(async ({code}) => {
    if (!location.state?.email || !location.state?.session) {
      navigate("/login");
      return;
    }

    setIsVerifyingCode(true);

    try {
      const verifyResponse = await authsignal.email.verify({code});

      if (verifyResponse.error) {
        form.setError("code", {message: "Invalid code"});
        setIsVerifyingCode(false);
        return;
      }

      const token = verifyResponse.data?.token;

      if (!token) {
        form.setError("code", {message: "Invalid code"});
        setIsVerifyingCode(false);
        return;
      }

      const challengeResult = await respondToChallenge(
        location.state.email,
        location.state.session,
        token
      );

      if (challengeResult.nextStep === "SIGN_IN_COMPLETE" && challengeResult.tokens) {
        setTokens(challengeResult.tokens);

        const user = await getCurrentUser();

        const isPasskeyAvailableOnDevice = await authsignal.passkey.isAvailableOnDevice({
          userId: user.Username!,
        });

        if (!isPasskeyAvailableOnDevice) {
          navigate("/create-passkey", {state: {email: location.state.email}});
          return;
        }

        navigate("/account/security");
      } else {
        form.setError("code", {message: "Failed to verify code"});
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify code",
      });
    }

    setIsVerifyingCode(false);
  });

  if (!location.state?.email || !location.state?.session) {
    return null;
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl">One-Time-Password</CardTitle>
        <CardDescription>
          Enter the code sent to: <span className="font-medium text-foreground">{location.state.email}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Form {...form}>
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
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
            <p className="text-sm">
              Didn't get a code?{" "}
              <button type="button" disabled={isResendingCode} onClick={handleResendCode} className="underline">
                Send again
              </button>
            </p>
            <Button type="submit" isLoading={isVerifyingCode} loadingMessage="Verifying" disabled={isVerifyingCode}>
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </>
  );
}
