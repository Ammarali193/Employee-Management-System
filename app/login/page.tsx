"use client";

import { useContext, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import authService from "@/services/authService";

type ApiError = {
  response?: {
    data?:
      | {
          message?: string;
          error?: string;
          errors?: Array<{ msg?: string; message?: string }>;
        }
      | string;
  };
};

const getRoleFromToken = (token: string) => {
  try {
    const [, payload = ""] = token.split(".");
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = JSON.parse(atob(normalizedPayload));

    return typeof decodedPayload?.role === "string"
      ? decodedPayload.role
      : "admin";
  } catch {
    return "admin";
  }
};

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const apiError = error as ApiError;
    const responseData = apiError.response?.data;

    if (typeof responseData === "string" && responseData.trim()) {
      return responseData;
    }

    if (responseData && typeof responseData === "object") {
      if (responseData.message) {
        return responseData.message;
      }

      if (responseData.error) {
        return responseData.error;
      }

      const firstValidationError = responseData.errors?.find(
        (validationError) => validationError?.msg || validationError?.message,
      );

      if (firstValidationError?.msg) {
        return firstValidationError.msg;
      }

      if (firstValidationError?.message) {
        return firstValidationError.message;
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      toast.error("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(email.trim(), password);
      const role = response.user?.role ?? getRoleFromToken(response.token);

      console.info("[login-page] Login successful", {
        email: email.trim(),
        role,
      });

      login(response.token, role);

      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("[login-page] Login failed", {
        email: email.trim(),
        error,
      });

      toast.error(
        getErrorMessage(error, "Login failed. Please check credentials."),
      );
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl space-y-8">
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome to EMS</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        <form className="space-y-6" onSubmit={onSubmit}>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

          {/* Signup Link */}
        <div className="text-center text-sm">
          <p>
            Don&apos;t have an account?{" "}
            <span
              onClick={() => router.push("/signup")}
              className="text-blue-600 cursor-pointer font-semibold"
            >
              Sign Up
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}
