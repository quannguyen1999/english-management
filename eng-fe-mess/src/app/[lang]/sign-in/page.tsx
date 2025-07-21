import SignInView from "@/modules/auths/sign-in-view";
import { getDictionary } from "../dictionaries";

export default async function SignIn({ params }: { params: { lang: "en" } }) {
  const dict = await getDictionary(params.lang);
  return (
    <>
      <SignInView params={params} dict={dict} />
    </>
  );
}
