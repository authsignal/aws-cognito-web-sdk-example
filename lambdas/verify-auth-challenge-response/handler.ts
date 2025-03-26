import {Authsignal} from "@authsignal/node";
import {VerifyAuthChallengeResponseTriggerHandler} from "aws-lambda";

const authsignal = new Authsignal({
  apiSecretKey: process.env.AUTHSIGNAL_SECRET!,
  apiUrl: process.env.AUTHSIGNAL_URL!,
});

export const handler: VerifyAuthChallengeResponseTriggerHandler = async (event) => {
  const userId = event.request.userAttributes.sub;
  const token = event.request.challengeAnswer;

  const {state} = await authsignal.validateChallenge({
    userId,
    action: "cognitoAuth",
    token,
  });

  event.response.answerCorrect = state === "CHALLENGE_SUCCEEDED";

  return event;
};
