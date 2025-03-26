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
import {Authenticator} from "@/types/authenticator";
import {TrashIcon} from "@radix-ui/react-icons";
import {useQueryClient} from "@tanstack/react-query";
import {useState} from "react";

type RemoveAuthenticatorDialog = {
  authenticator: Authenticator;
};

export function RemoveAuthenticatorAppDialog({authenticator}: RemoveAuthenticatorDialog) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  const {toast} = useToast();

  const handleRemoveAuthenticator = async () => {
    setIsLoading(true);

    const {success} = await removeAuthenticator(authenticator.userAuthenticatorId);

    if (success) {
      queryClient.invalidateQueries({queryKey: ["authenticators"]});

      setIsOpen(false);

      toast({
        title: `Authenticator app removed`,
      });
    } else {
      toast({
        title: `Error removing authenticator app`,
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
          <AlertDialogTitle>Remove authenticator app?</AlertDialogTitle>
          <AlertDialogDescription>
            You will no longer be able to use it for multi-factor authentication.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            disabled={isLoading}
            isLoading={isLoading}
            loadingMessage="Pending"
            onClick={handleRemoveAuthenticator}
          >
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
