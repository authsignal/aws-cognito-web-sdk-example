import {CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {useLocation, useNavigate} from "react-router-dom";
import {useToast} from "@/hooks/use-toast";
import {PasskeyIcon} from "@/components/icons/passkey-icon";
import {authsignal} from "@/lib/authsignal";
import {useState} from "react";

export function CreatePasskey() {
  const [isLoading, setIsLoading] = useState(false);

  const {toast} = useToast();

  const navigate = useNavigate();

  const location = useLocation();

  const createPasskey = async () => {
    setIsLoading(true);

    try {
      const passkeySignUpResponse = await authsignal.passkey.signUp({
        username: location.state.email,
        displayName: location.state.email,
      });

      if (passkeySignUpResponse && "error" in passkeySignUpResponse) {
        toast({
          variant: "destructive",
          title: "Error",
          description: passkeySignUpResponse.error,
        });

        setIsLoading(false);
        return;
      }

      if (passkeySignUpResponse?.data?.token) {
        toast({
          title: "Passkey created",
        });

        navigate("/account/security");
      }
    } catch (e) {
      // Hide this confusing error from the user, and make it seem as if the passkey was created.
      if (e instanceof Object && "code" in e && e.code === "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED") {
        toast({
          title: "Passkey created",
        });

        navigate("/account/security");
      }
    }

    setIsLoading(false);
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-x-2">
          <PasskeyIcon className="size-10" /> Faster, safer login with passkeys
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p>Use your fingerprint, face or screen lock next time you log in.</p>
        <div className="flex gap-2">
          <Button
            disabled={isLoading}
            isLoading={isLoading}
            loadingMessage="Pending"
            type="button"
            onClick={createPasskey}
          >
            Create passkey
          </Button>
          <Button variant="ghost" onClick={() => navigate("/account/security")}>
            Not now
          </Button>
        </div>
      </CardContent>
    </>
  );
}
