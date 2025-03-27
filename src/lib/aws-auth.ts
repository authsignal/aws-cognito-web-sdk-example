import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  GetUserCommand,
  GlobalSignOutCommand,
  RespondToAuthChallengeCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { redirect } from "react-router-dom";

const client = new CognitoIdentityProviderClient({
  region: import.meta.env.VITE_AWS_REGION || "us-west-2",
});

const CLIENT_ID = import.meta.env.VITE_USER_POOL_CLIENT_ID!;

interface SignUpParams {
  username: string;
  password: string;
  userAttributes?: Record<string, string>;
}

interface SignInParams {
  username: string;
  password?: string;
}

export async function signUp({ username, password, userAttributes }: SignUpParams) {
  try {
    const command = new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: username,
      Password: password,
      UserAttributes: Object.entries(userAttributes || {}).map(([Name, Value]) => ({
        Name,
        Value,
      })),
    });

    const response = await client.send(command);
    return {
      isSignUpComplete: response.UserConfirmed,
      nextStep: response.UserConfirmed ? "SIGN_IN" : "CONFIRM_SIGN_UP",
    };
  } catch (error) {
    console.error("Error during sign up:", error);
    throw error;
  }
}

export async function confirmSignUp(username: string, code: string) {
  try {
    const command = new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      Username: username,
      ConfirmationCode: code,
    });

    await client.send(command);
    return { nextStep: "SIGN_IN" };
  } catch (error) {
    console.error("Error during sign up confirmation:", error);
    throw error;
  }
}

export async function resendSignUpCode(username: string) {
  try {
    const command = new ResendConfirmationCodeCommand({
      ClientId: CLIENT_ID,
      Username: username,
    });

    await client.send(command);
  } catch (error) {
    console.error("Error resending confirmation code:", error);
    throw error;
  }
}

export async function signIn({ username, password }: SignInParams) {
  try {
    const command = new InitiateAuthCommand({
      ClientId: CLIENT_ID,
      AuthFlow: password ? "USER_PASSWORD_AUTH" : "CUSTOM_AUTH",
      AuthParameters: {
        USERNAME: username,
        ...(password && { PASSWORD: password }),
      },
    });

    const response = await client.send(command);
    
    if (response.ChallengeName) {
      return {
        nextStep: "CUSTOM_CHALLENGE",
        challengeName: response.ChallengeName,
        challengeParameters: response.ChallengeParameters,
        session: response.Session,
      };
    }

    return {
      nextStep: "SIGN_IN_COMPLETE",
      tokens: response.AuthenticationResult,
    };
  } catch (error) {
    console.error("Error during sign in:", error);
    throw error;
  }
}

export async function respondToChallenge(
  username: string,
  session: string,
  challengeResponse: string
) {
  try {
    const command = new RespondToAuthChallengeCommand({
      ClientId: CLIENT_ID,
      ChallengeName: "CUSTOM_CHALLENGE",
      Session: session,
      ChallengeResponses: {
        USERNAME: username,
        ANSWER: challengeResponse,
      },
    });

    const response = await client.send(command);

    if (response.ChallengeName) {
      return {
        nextStep: "CUSTOM_CHALLENGE",
        challengeName: response.ChallengeName,
        challengeParameters: response.ChallengeParameters,
        session: response.Session,
      };
    }

    return {
      nextStep: "SIGN_IN_COMPLETE",
      tokens: response.AuthenticationResult,
    };
  } catch (error) {
    console.error("Error responding to challenge:", error);
    throw error;
  }
}

export async function getCurrentUser() {
  // eslint-disable-next-line no-useless-catch
  try {
    const command = new GetUserCommand({
      AccessToken: await getAccessToken(),
    });

    const response = await client.send(command);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function signOut() {
  try {
    const command = new GlobalSignOutCommand({
      AccessToken: await getAccessToken(),
    });

    await client.send(command);
    clearTokens();
  } catch (error) {
    console.error("Error during sign out:", error);
    clearTokens();
    throw error;
  }
}

// Token management
const ACCESS_TOKEN_KEY = "accessToken";
const ID_TOKEN_KEY = "idToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export function setTokens(tokens: {
  AccessToken?: string;
  IdToken?: string;
  RefreshToken?: string;
}) {
  if (tokens.AccessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.AccessToken);
  }
  if (tokens.IdToken) {
    localStorage.setItem(ID_TOKEN_KEY, tokens.IdToken);
  }
  if (tokens.RefreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.RefreshToken);
  }
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ID_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export async function getAccessToken(): Promise<string> {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) {
    throw new Error("No access token found");
  }
  return token;
}

export async function requireSession(request: Request) {
  try {
    await getCurrentUser();
    return true;
  } catch {
    const params = new URLSearchParams();
    params.set("from", new URL(request.url).pathname);
    throw redirect("/login?" + params.toString());
  }
} 