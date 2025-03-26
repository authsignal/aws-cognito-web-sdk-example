import {removeAuthenticator} from "@/api/authenticators";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {useToast} from "@/hooks/use-toast";
import {PasskeyAuthenticator} from "@/types/authenticator";
import {TrashIcon} from "@radix-ui/react-icons";
import {useQueryClient} from "@tanstack/react-query";
import {useState} from "react";

type RemovePasskeyDialog = {
  passkey: PasskeyAuthenticator;
};

export function RemovePasskeyDialog({passkey}: RemovePasskeyDialog) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  const {toast} = useToast();

  const name = `${passkey.webauthnCredential?.name ?? ""} passkey`;
  const credentialManager = passkey.webauthnCredential.aaguidMapping?.name || "credential manager";

  const handleRemovePasskey = async () => {
    setIsLoading(true);

    const {success} = await removeAuthenticator(passkey.userAuthenticatorId);

    if (success) {
      queryClient.invalidateQueries({queryKey: ["authenticators"]});

      setIsOpen(false);

      toast({
        title: `Your ${name} has been removed`,
      });
    } else {
      toast({
        title: `There was an error removing your ${name}`,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <TrashIcon className="size-4" />
          <span className="sr-only">Remove</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove your {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            You will also need to remove it from your {credentialManager}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button disabled={isLoading} isLoading={isLoading} loadingMessage="Pending" onClick={handleRemovePasskey}>
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
