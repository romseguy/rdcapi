import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { Client } from "pg";

export const localize = (locale: string) => (fr: string, en: string) => {
  if (!en) return locale === "en" ? `${fr}_en` : fr;
  return locale === "en" ? en : fr;
};

export const pre = async (req, res, opts) => {
  let { prefix, log = true } = opts;

  prefix =
    process.env.NEXT_PUBLIC_ENV + " ~ " + new Date() + " ~ " + prefix + " ~ ";
  if (log) console.log(prefix);

  const client =
    process.env.NEXT_PUBLIC_ENV === "production"
      ? new Client({
          connectionString: process.env.DATABASE_URL,
        })
      : {
          connect() {},
          end() {},
          query(sql, values) {
            console.log("🚀 ~ query ~ sql:", sql);
            console.log("🚀 ~ query ~ values:", values);
            return { rowCount: 1, rows: [{ id: "999" }] };
          },
        };

  let { authorization, locale } = req.headers;

  locale =
    typeof locale === "string" && ["fr", "en"].includes(locale) ? locale : "fr";

  let user;
  if (process.env.NEXT_PUBLIC_ENV === "development") {
    user = { id: "219f680c-46f1-4024-a72c-6b373c7981ab" };

    return {
      client,
      user,
      locale,
    };
  }

  if (authorization) {
    const bearer = authorization.substring(7, authorization.length);
    if (typeof bearer !== "undefined" && bearer !== "undefined") {
      const token = JSON.parse(bearer);
      const supabase = createPagesServerClient({ req, res });
      const { data } = await supabase.auth.setSession({
        access_token: token.access_token,
        refresh_token: token.refresh_token,
      });
      user = data.user;
    }
  }

  return {
    client,
    user,
    locale,
  };
};
