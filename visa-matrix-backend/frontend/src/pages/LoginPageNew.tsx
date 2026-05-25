import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { LogIn, AlertCircle, Eye, EyeOff, Loader } from "lucide-react";

import AppLogo from "../components/common/AppLogo";
import LoadingState from "../components/common/LoadingState";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isBootstrapping } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  React.useEffect(() => {
    const remembered = localStorage.getItem("remembered_email");
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  if (isBootstrapping) {
    return <LoadingState label="Checking your session..." />;
  }

  if (isAuthenticated) {
    const redirectTo =
      (location.state as { from?: { pathname?: string } } | null)?.from
        ?.pathname || "/dashboard";
    return <Navigate to={redirectTo} replace />;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Please enter email and password");
      }

      const result = await login({ email, password });

      if (result.status === "locked") {
        throw new Error("Your account has been locked. Contact support.");
      }

      if (result.forcePasswordChange) {
        navigate("/settings", { replace: true });
        return;
      }

      if (rememberMe) {
        localStorage.setItem("remembered_email", email);
      } else {
        localStorage.removeItem("remembered_email");
      }

      const redirectTo =
        (location.state as { from?: { pathname?: string } } | null)?.from
          ?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex justify-center mb-4">
              <AppLogo />
            </div>
            <h1 className="text-2xl font-bold text-white text-center">
              Visa Matrix ERP
            </h1>
            <p className="text-blue-100 text-center mt-2">Employee Login</p>
          </div>

          <div className="p-6">
            {error ? (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle
                  className="text-red-600 flex-shrink-0 mt-0.5"
                  size={20}
                />
                <div className="text-red-800 text-sm">{error}</div>
              </div>
            ) : null}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                  Remember this email
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    Login
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-xs text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            <div className="space-y-2 text-center text-sm text-gray-600">
              <p>
                Need an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  Register
                </Link>
              </p>
              <p>Need help? Contact support@visamatrix.com</p>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-center text-xs text-gray-600">
            <p>Secure Employee Access • Enterprise Authentication</p>
          </div>
        </div>

        <div className="mt-6 text-center text-blue-100 text-xs">
          <p>This is a secure system. Unauthorized access is prohibited.</p>
        </div>
      </div>
    </div>
  );
}
