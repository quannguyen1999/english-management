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
import { signInSchema } from "@/schema";
import { signIn } from "@/service/api-auth";
import { saveTokens } from "@/utils/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import GoogleInView from "./google-in-view";

export default function SignInView({
  params,
  dict,
}: {
  params: { lang: string };
  dict: any;
}) {
  const router = useRouter();
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    const response: any = await signIn(values);
    if (response.status === 400) {
      toast.error(dict.login[response.data.error]);
    } else if (response.status === 200) {
      // Save tokens to localStorage for client-side access
      if (response.data.access_token) {
        saveTokens(response.data);
      }
      toast.success(dict.login.success);
      router.push("/");
    } else {
      router.push("/sign-in");
      toast.error(dict.login.error);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            {dict.login.title}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {dict.login.description}{" "}
            <a
              href="/sign-up"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {dict.login.create_account}
            </a>
          </p>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-card py-8 px-4 shadow-sm border border-border rounded-lg sm:px-10">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div>
                  <div className="mt-1">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            {dict.login.username}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Username"
                              className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-ring"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <div className="mt-1">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            {dict.login.password}
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
                        {dict.login.button}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </Form>

            <div className="mt-6 space-y-5">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">
                    {dict.login.new_on_platform}
                  </span>
                </div>
              </div>
              <GoogleInView />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
