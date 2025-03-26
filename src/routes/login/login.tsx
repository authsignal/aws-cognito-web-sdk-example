import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Link, redirect, useNavigate} from "react-router-dom";
import {PasskeyIcon} from "@/components/icons/passkey-icon";
import {useCallback, useEffect, useState} from "react";
import {useToast} from "@/hooks/use-toast";
import {authsignal} from "@/lib/authsignal";
import {getCurrentUser, signIn, respondToChallenge, setTokens} from "@/lib/aws-auth";

export async function loader() {
  try {
    await getCurrentUser();
    return redirect("/account/security");
  } catch {
    return null;
  }
}

const formSchema = z.object({
  email: z.string({required_error: "Enter your email"}).email({message: "Enter a valid email"}),
});

export function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const {toast} = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handlePasskeySignIn = useCallback(
    async ({autofill = false}: {autofill: boolean}) => {
      if (!autofill) {
        setIsLoading(true);
      }

      const handleError = () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Passkey login failed",
        });
        setIsLoading(false);
      };

      try {
        const signInResponse = await authsignal.passkey.signIn({action: "cognitoAuth", autofill});

        setIsLoading(true);

        if (signInResponse.error) {
          handleError();
          return;
        }

        if (signInResponse.data?.token && signInResponse.data?.username) {
          const signInResult = await signIn({
            username: signInResponse.data.username,
          });

          if (signInResult.nextStep === "CUSTOM_CHALLENGE") {
            const challengeResult = await respondToChallenge(
              signInResponse.data.username,
              signInResult.session!,
              signInResponse.data.token
            );

            if (challengeResult.nextStep === "SIGN_IN_COMPLETE" && challengeResult.tokens) {
              setTokens(challengeResult.tokens);
              navigate("/account/security");
            }
          }
        }

        setIsLoading(false);
      } catch {
        // user cancelled the passkey request
        setIsLoading(false);
      }
    },
    [navigate, toast],
  );

  useEffect(() => {
    handlePasskeySignIn({autofill: true});
  }, [handlePasskeySignIn]);

  const onSubmit = form.handleSubmit(async ({email}) => {
    setIsLoading(true);

    try {
      const signInResult = await signIn({
        username: email,
      });

      if (signInResult.nextStep === "CUSTOM_CHALLENGE") {
        const token = signInResult.challengeParameters?.token;
        navigate("/mfa", {state: {token, email, session: signInResult.session}});
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
        <CardTitle className="text-xl">Sign In</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Form {...form}>
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="username webauthn" spellCheck={false} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              Continue
            </Button>
          </form>
        </Form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-gray-900 text-sm font-medium leading-6">or</span>
          </div>
        </div>
        <Button
          className="flex gap-1"
          disabled={isLoading}
          isLoading={isLoading}
          loadingMessage="Pending"
          onClick={() => handlePasskeySignIn({autofill: false})}
        >
          Sign in with passkey <PasskeyIcon className="size-7" />
        </Button>
        <p className="text-sm text-center">
          Don't have an account?{" "}
          <Link className="underline" to="/sign-up">
            Sign up
          </Link>
        </p>
      </CardContent>
    </>
  );
}
