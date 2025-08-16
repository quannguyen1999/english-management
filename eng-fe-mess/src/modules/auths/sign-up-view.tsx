"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signUpSchema } from "@/schema";
import { signUp } from "@/service/api-auth";
import { extractDetailBadRequest } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import GoogleInView from "./google-in-view";

export default function SignUpView({
  params,
  dict,
}: {
  params: { lang: "en" };
  dict: any;
}) {
  const router = useRouter();
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
    const response: any = await signUp(values);
    if (response.status === 200 || response.status === 201) {
      toast.success(dict.register.success);
      router.push("/sign-in");
    } else {
      toast.error(dict.register[extractDetailBadRequest(response.data)]);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            {dict.register.title}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {dict.register.have_account}{" "}
            <a
              href="/sign-in"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {dict.register.sign_in}
            </a>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-card py-8 px-4 shadow-sm border border-border rounded-lg sm:px-10 space-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          {dict.register.username}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-ring"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          {dict.register.email}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Email"
                            className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-ring"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          {dict.register.password}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Password"
                            className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-ring"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          {dict.register.confirm_password}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm Password"
                            className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-ring"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="w-full cursor-pointer flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:bg-muted disabled:text-muted-foreground transition-colors"
                  >
                    {form.formState.isSubmitting ? (
                      <Loader2Icon className="size-6 animate-spin text-primary-foreground" />
                    ) : (
                      <span className="flex items-center">
                        {"  "}
                        {dict.register.create_account}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </Form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">
                  {dict.register.or}
                </span>
              </div>
            </div>
            <GoogleInView />
          </div>
        </div>
      </div>
    </>
  );
}
