import {Authsignal} from "@authsignal/node";
import {CreateAuthChallengeTriggerHandler} from "aws-lambda";

const authsignal = new Authsignal({
  apiSecretKey: process.env.AUTHSIGNAL_SECRET!,
  apiUrl: process.env.AUTHSIGNAL_URL!,
});

export const handler: CreateAuthChallengeTriggerHandler = async (event) => {
  const userId = event.request.userAttributes.sub;
  const email = event.request.userAttributes.email;

  const {token} = await authsignal.track({
    userId,
    action: "cognitoAuth",
    attributes: {
      email,
    },
  });

  event.response.publicChallengeParameters = {token};

  return event;
};
