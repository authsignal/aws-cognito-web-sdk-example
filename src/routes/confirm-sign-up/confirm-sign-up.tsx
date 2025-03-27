import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {useToast} from "@/hooks/use-toast";
import {InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp";
import {authsignal} from "@/lib/authsignal";
import {respondToChallenge, setTokens} from "@/lib/aws-auth";

const formSchema = z.object({
  code: z.string().min(6, {message: "Enter a valid code"}),
});

export function ConfirmSignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const {toast} = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!location.state?.email || !location.state?.session || !location.state?.token) {
      navigate("/sign-up");
      return;
    }
    
    authsignal.setToken(location.state.token);
  }, [location.state, navigate]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  const handleResendCode = async () => {
    if (!location.state?.email) {
      navigate("/sign-up");
      return;
    }

    await authsignal.email.enroll({email: location.state.email});

    toast({
      title: "Code sent",
      description: "A new code has been sent to your email",
    });
  };

  const onSubmit = form.handleSubmit(async ({code}) => {
    if (!location.state?.email || !location.state?.session) {
      navigate("/sign-up");
      return;
    }

    setIsLoading(true);

    try {
      const {data, error} = await authsignal.email.verify({code});

      if (data?.token && !error) {
        const challengeResult = await respondToChallenge(
          location.state.email,
          location.state.session,
          data.token
        );

        if (challengeResult.nextStep === "SIGN_IN_COMPLETE" && challengeResult.tokens) {
          setTokens(challengeResult.tokens);
          navigate("/account/security");
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to complete sign in",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify code",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify code",
      });
    }

    setIsLoading(false);
  });

  if (!location.state?.email) {
    return null;
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl">Confirm Sign up</CardTitle>
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
              <button type="button" onClick={handleResendCode} className="underline">
                Send again
              </button>
            </p>
            <Button type="submit" isLoading={isLoading} loadingMessage="Verifying" disabled={isLoading}>
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </>
  );
}
