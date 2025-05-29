import { resetPassword } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { cn } from "@repo/ui/lib/utils";
import {
  ResetPasswordSchema,
  type ResetPasswordData,
} from "@repo/validation-schema";
import {
  Link,
  useNavigate,
  useParams,
  // useSearch,
} from "@tanstack/react-router";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPwVisible, setIsPwVisible] = useState<boolean>(false);
  const [isConfirmPwVisible, setIsConfirmPwVisible] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const { token } = useParams({
    from: "/reset-password/$token",
  });

  // const { callbackUrl } = useSearch({
  //   from: "/reset-password/$token",
  // });

  console.log("token", token);

  const togglePwVisibility = () => setIsPwVisible((prevState) => !prevState);
  const toggleConfirmPwVisibility = () =>
    setIsConfirmPwVisible((prevState) => !prevState);

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ResetPasswordData) {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // If token is not present, show error message
    if (!token) {
      setError("Invalid or missing reset token. Please try again.");
      return;
    }

    try {
      await resetPassword(
        {
          newPassword: data.password,
          token: token,
        },
        {
          //   onResponse: () => {
          //     setLoading(false);
          //   },
          //   onRequest: () => {
          //     resetState();
          //     setLoading(true);
          //   },
          onSuccess: () => {
            setSuccess("New password has been created");
            navigate({
              to: "/sign-in",
            });
          },
          onError: (ctx) => {
            setError(ctx.error.message);
          },
        }
      );
    } catch (err) {
      setError(
        "An error occurred while resetting your password. Please try again."
      );
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/stater-logo192.png"
              width={64}
              height={64}
              className="border rounded-full"
            />
          </div>
          <CardTitle className="text-xl">Reset Your Password</CardTitle>
          <CardDescription>
            Create a new password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <div className="grid gap-4">
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                  {success && (
                    <div className="text-green-500 text-sm">{success}</div>
                  )}

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={isPwVisible ? "text" : "password"}
                              className="pe-9"
                              {...field}
                            />
                            <button
                              className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                              type="button"
                              onClick={togglePwVisibility}
                              aria-label={
                                isPwVisible ? "Hide password" : "Show password"
                              }
                              aria-pressed={isPwVisible}
                            >
                              {isPwVisible ? (
                                <EyeOffIcon size={16} aria-hidden="true" />
                              ) : (
                                <EyeIcon size={16} aria-hidden="true" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={isConfirmPwVisible ? "text" : "password"}
                              className="pe-9"
                              {...field}
                            />
                            <button
                              className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                              type="button"
                              onClick={toggleConfirmPwVisibility}
                              aria-label={
                                isConfirmPwVisible
                                  ? "Hide password"
                                  : "Show password"
                              }
                              aria-pressed={isConfirmPwVisible}
                            >
                              {isConfirmPwVisible ? (
                                <EyeOffIcon size={16} aria-hidden="true" />
                              ) : (
                                <EyeIcon size={16} aria-hidden="true" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Resetting..." : "Reset Password"}
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Remember your password? <Link to="/sign-in">Sign in</Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
