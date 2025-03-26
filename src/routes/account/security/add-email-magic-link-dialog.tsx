import {addAuthenticator} from "@/api/authenticators";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {authsignal} from "@/lib/authsignal";
import {useQueryClient} from "@tanstack/react-query";
import {useState} from "react";
import {getCurrentUser, signOut} from "@/lib/aws-auth";

export function AddEmailMagicLinkDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const sendEmailMagicLink = async () => {
    const [{authsignalToken}, user] = await Promise.all([addAuthenticator(), getCurrentUser()]);

    authsignal.setToken(authsignalToken);

    const email = user.Username;

    if (!email) {
      signOut();
      return;
    }

    await authsignal.emailML.enroll({email});

    const verificationStatusResponse = await authsignal.emailML.checkVerificationStatus();

    if (verificationStatusResponse.data?.isVerified) {
      queryClient.invalidateQueries({queryKey: ["authenticators"]});
      setIsOpen(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);

        if (open) {
          sendEmailMagicLink();
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
          <DialogTitle>Check your email</DialogTitle>
          <DialogDescription>Verify your email by clicking the link we've sent you.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
