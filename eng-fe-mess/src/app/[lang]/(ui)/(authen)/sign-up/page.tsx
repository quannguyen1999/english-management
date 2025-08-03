import { getDictionary } from "@/app/[lang]/dictionaries";
import SignUpView from "@/modules/auths/sign-up-view";

export default async function SignUp({ params }: { params: { lang: "en" } }) {
  const dict = await getDictionary(params.lang);

  return (
    <>
      <SignUpView params={params} dict={dict} />
    </>
  );
}
