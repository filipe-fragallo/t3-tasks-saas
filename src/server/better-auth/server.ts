import { auth } from ".";
import { headers } from "next/headers";
import { cache } from "react";

export const getSession = cache(async () => {
  const h = await headers();

  return auth.api.getSession({
    headers: h,
    query: { disableCookieCache: true },
  });
});
