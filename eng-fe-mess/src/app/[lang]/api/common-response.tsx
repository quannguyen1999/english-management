import { NextResponse } from "next/server";

export const commonResponse = async (response: Response) => {
  if (response.status === 401) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
};
