import { commonResponse } from "@/app/[lang]/api/common-response";
import { CLIENT_ID, CLIENT_SECRET, GRANT_TYPE, USER_API } from "@/config";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, password } = body;
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);
  params.append("grant_type", GRANT_TYPE);
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  const response = await fetch(
    `${USER_API}/oauth2/token?${params.toString()}`,
    {
      method: "POST",
    }
  );
  return commonResponse(response);
}
