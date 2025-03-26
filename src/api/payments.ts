import {getCognitoAccessToken} from "@/lib/auth";

export async function authorizePayment(): Promise<{
  authsignalToken: string;
}> {
  const accessToken = await getCognitoAccessToken();

  const response = fetch("https://1kz5ypiwcd.execute-api.us-west-2.amazonaws.com/payments/authorize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((res) => res.json());

  return response;
}
