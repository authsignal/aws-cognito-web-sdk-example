import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {useLocation, useNavigate} from "react-router-dom";
import {useState} from "react";
import {useToast} from "@/hooks/use-toast";
import {InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp";
import {confirmSignUp, resendSignUpCode, signIn, setTokens} from "@/lib/aws-auth";

const formSchema = z.object({
  code: z.string().min(6, {message: "Enter a valid code"}),
});

export function ConfirmSignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const {toast} = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  const handleResendCode = async () => {
    await resendSignUpCode(location.state.email);

    toast({
      title: "Code sent",
      description: "A new code has been sent to your email",
    });
  };

  const onSubmit = form.handleSubmit(async ({code}) => {
    setIsLoading(true);

    try {
      const {nextStep} = await confirmSignUp(location.state.email, code);

      if (nextStep === "SIGN_IN") {
        // Auto sign-in after confirmation
        const signInResult = await signIn({
          username: location.state.email,
        });

        if (signInResult.nextStep === "SIGN_IN_COMPLETE" && signInResult.tokens) {
          setTokens(signInResult.tokens);
          navigate("/account/security");
        } else if (signInResult.nextStep === "CUSTOM_CHALLENGE") {
          const token = signInResult.challengeParameters?.token;
          navigate("/mfa", {state: {token, email: location.state.email}});
        }
      }
    } catch (ex) {
      if (ex instanceof Error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: ex.message,
        });
      }
    }

    setIsLoading(false);
  });

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
