import {getCognitoAccessToken} from "@/lib/auth";
import {Authenticator} from "@/types/authenticator";

const url = "https://1kz5ypiwcd.execute-api.us-west-2.amazonaws.com/authenticators";

export async function getAuthenticators(): Promise<Authenticator[]> {
  const accessToken = await getCognitoAccessToken();

  const response = fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((res) => res.json());

  return response;
}

export async function addAuthenticator(): Promise<{authsignalToken: string}> {
  const accessToken = await getCognitoAccessToken();

  const response = fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((res) => res.json());

  return response;
}

export async function removeAuthenticator(userAuthenticatorId: string): Promise<void> {
  const accessToken = await getCognitoAccessToken();

  await fetch(`${url}/${userAuthenticatorId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
