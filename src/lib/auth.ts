import {redirect} from "react-router-dom";
import {getCurrentUser, getAccessToken} from "@/lib/aws-auth";

export async function requireSession(request: Request) {
  try {
    const user = await getCurrentUser();
    return user;
  } catch {
    const params = new URLSearchParams();
    params.set("from", new URL(request.url).pathname);
    throw redirect("/login?" + params.toString());
  }
}

export async function getCognitoAccessToken() {
  try {
    const accessToken = await getAccessToken();
    return accessToken;
  } catch {
    throw new Response("", {status: 401});
  }
}
