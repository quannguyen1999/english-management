import SignUpView from "@/modules/auths/sign-up-view";
import { getDictionary } from "../dictionaries";

export default async function SignUp({ params }: { params: { lang: "en" } }) {
  const dict = await getDictionary(params.lang);

  return (
    <>
      <SignUpView params={params} dict={dict} />
    </>
  );
}
