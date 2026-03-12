"use client";

import { useState, useEffect, useContext } from \"react\";
import { useForm } from \"react-hook-form\";
import { zodResolver } from \"@hookform/resolvers/zod\";
import * as z from \"zod\";
import { useRouter } from \"next/navigation\";
import { AuthContext } from \"@/context/AuthContext\";
import { toast } from \"react-hot-toast\";
import authService from \"@/services/authService\";

const loginSchema = z.object({
  email: z.string().email(\"Valid email required\").min(1, \"Email required\"),
  password: z.string().min(6, \"Password must be at least 6 characters\").max(100),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (user) {
      router.push(\"/dashboard\");
    }
  }, [user, router]);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const response = await authService.login(data.email, data.password);
      localStorage.setItem(\"token\", response.token);
      setUser(response.user);
      toast.success(\"Login successful!\");
      router.push(\"/dashboard\");
      reset();
    } catch (error: any) {
      const message = error?.response?.data?.message || \"Login failed. Please check credentials.\";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=\"min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8\">
      <div className=\"max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl\">
        <div className=\"text-center\">
          <h2 className=\"text-3xl font-bold text-gray-900\">Welcome to EMS</h2>
          <p className=\"mt-2 text-sm text-gray-600\">Sign in to your account</p>
        </div>

        <form className=\"space-y-6\" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor=\"email\" className=\"block text-sm font-medium text-gray-700 mb-2\">
              Email Address
            </label>
            <input
              id=\"email\"
              type=\"email\"
              className={`w-full px-4 py-3 rounded-xl border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? \"border-red-400\" : \"border-gray-300\"
              }`}
              placeholder=\"Enter your email\"
              {...register(\"email\")}
              disabled={loading}
            />
            {errors.email && (
              <p className=\"mt-1 text-sm text-red-600\">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor=\"password\" className=\"block text-sm font-medium text-gray-700 mb-2\">
              Password
            </label>
            <input
              id=\"password\"
              type=\"password\"
              className={`w-full px-4 py-3 rounded-xl border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.password ? \"border-red-400\" : \"border-gray-300\"
              }`}
              placeholder=\"Enter your password\"
              {...register(\"password\")}
              disabled={loading}
            />
            {errors.password && (
              <p className=\"mt-1 text-sm text-red-600\">{errors.password.message}</p>
            )}
          </div>

          <button
            type=\"submit\"
            disabled={loading}
            className=\"w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed\"
          >
            {loading ? \"Signing in...\" : \"Sign In\"}
          </button>
        </form>

        <div className=\"text-center\">
          <button
            type=\"button\"
            className=\"text-blue-600 hover:text-blue-500 text-sm font-medium\"
            onClick={() => toast(\"Coming soon!\")}
          >
            Forgot your password?
          </button>
        </div>
      </div>
    </div>
  );
}
