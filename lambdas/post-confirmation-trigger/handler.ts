import {Authsignal, VerificationMethod} from "@authsignal/node";
import {PostConfirmationTriggerHandler} from "aws-lambda";

const authsignal = new Authsignal({
  apiSecretKey: process.env.AUTHSIGNAL_SECRET!,
  apiUrl: process.env.AUTHSIGNAL_URL!,
});

export const handler: PostConfirmationTriggerHandler = async (event) => {
  const userId = event.request.userAttributes.sub;
  const email = event.request.userAttributes.email;

  await authsignal.enrollVerifiedAuthenticator({
    userId,
    attributes: {
      verificationMethod: VerificationMethod.EMAIL_OTP,
      email,
    },
  });

  return event;
};
