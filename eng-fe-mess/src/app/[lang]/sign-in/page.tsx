import SignInView from "@/modules/auths/sign-in-view";
import { getDictionary } from "../dictionaries";

export default async function SignIn({ params }: { params: { lang: "en" } }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return (
    <>
      <SignInView params={params} dict={dict} />
    </>
  );
}
