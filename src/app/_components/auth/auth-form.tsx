"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { loginSchema, type LoginSchema } from "schema/auth/login.schema";
import { registerSchema, type RegisterSchema } from "schema/auth/register.schema";

interface AuthFormProps {
  mode: "login" | "register";
}

function RegisterForm() {
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const { handleSubmit, formState: { isSubmitting, errors }, setError: setFormError, clearErrors } = form;

  const onSubmit = async (data: RegisterSchema) => {
    clearErrors();

    const registerProcess = async () => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details) {
          result.details.forEach((error: any) => {
            setFormError(error.path[0] as keyof RegisterSchema, {
              type: "server",
              message: error.message,
            });
          });
          throw new Error("Please fix the form errors");
        }
        throw new Error(result.error || "Registration failed");
      }

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirectTo: "/dashboard",
      });

      if (signInResult?.error) {
        setFormError("root", {
          type: "server",
          message: "Registration successful but login failed",
        });
        throw new Error("Registration successful but login failed");
      }

      return "Account created and signed in successfully!";
    };

    toast.promise(registerProcess(), {
      loading: "Creating your account...",
      success: "Account created and signed in successfully!",
      error: (err) => err.message || "Registration failed",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                Full Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your full name"
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-ring"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                Email Address
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-ring"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                Password
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-ring"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {errors.root && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-destructive">
            {errors.root.message}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </Button>
      </form>
    </Form>
  );
}

function LoginForm() {
  const router = useRouter();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { handleSubmit, formState: { isSubmitting, errors }, setError: setFormError, clearErrors } = form;

  const onSubmit = async (data: LoginSchema) => {
    clearErrors();

    const loginProcess = async () => {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirectTo: "/dashboard",
      });

      if (result?.error) {
        setFormError("root", {
          type: "server",
          message: "Invalid email or password",
        });
        throw new Error("Invalid email or password");
      }

      return "Welcome back! Signed in successfully!";
    };

    toast.promise(loginProcess(), {
      loading: "Signing you in...",
      success: "Welcome back! Signed in successfully!",
      error: (err) => err.message || "Login failed",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                Email Address
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-ring"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                Password
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-ring"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {errors.root && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-destructive">
            {errors.root.message}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </Form>
  );
}

export function AuthForm({ mode }: AuthFormProps) {
  return (
    <div className="w-full max-w-md space-y-6 bg-card p-8 rounded-2xl shadow-2xl border border-border">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-card-foreground">
          {mode === "login" ? "Sign In" : "Create Account"}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {mode === "login"
            ? "Welcome back! Please sign in to your account."
            : "Join us! Create your account to get started."}
        </p>
      </div>

      {mode === "register" ? <RegisterForm /> : <LoginForm />}

      <div className="text-center">
        {mode === "login" ? (
          <p className="text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:text-primary/90 underline font-medium">
              Sign up here
            </Link>
          </p>
        ) : (
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-primary/90 underline font-medium">
              Sign in here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
