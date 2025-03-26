import {Authsignal} from "@authsignal/node";
import {APIGatewayProxyEventV2WithJWTAuthorizer} from "aws-lambda";

const authsignal = new Authsignal({
  apiSecretKey: process.env.AUTHSIGNAL_SECRET!,
  apiUrl: process.env.AUTHSIGNAL_URL!,
});

export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
  const claims = event.requestContext.authorizer.jwt.claims;

  const userId = claims.sub as string;

  const {token: authsignalToken} = await authsignal.track({
    userId,
    action: "addAuthenticator",
    attributes: {
      scope: "add:authenticators",
    },
  });

  return {
    authsignalToken,
  };
};
