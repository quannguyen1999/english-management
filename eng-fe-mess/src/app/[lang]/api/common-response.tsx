import { NextResponse } from "next/server";

export const commonResponse = async (response: Response) => {
  if (response.status === 401) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: response.status }
    );
  }

  // Check if response has content before parsing JSON
  const responseText = await response.text();
  let data;

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch (parseError) {
    console.error(
      "JSON parse error:",
      parseError,
      "Response text:",
      responseText
    );
    return NextResponse.json(
      { error: "Invalid response from server" },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: response.status });
};
