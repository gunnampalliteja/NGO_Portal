import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });

      localStorage.setItem(
        "ngo_token",
        response.data.token
      );

      localStorage.setItem(
        "ngo_user",
        JSON.stringify(response.data.user)
      );

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-modern-page">
      {/* BACK HOME */}
      <Link to="/" className="auth-back">
        ← Back to Kindora
      </Link>

      {/* LEFT SHOWCASE */}
      <section className="auth-showcase login-showcase">
        <div className="auth-showcase-image" />

        <div className="auth-showcase-overlay" />

        <div className="auth-showcase-content">
          <div className="auth-brand">
            <span className="auth-brand-mark">✦</span>
            <span>Kindora</span>
          </div>

          <div className="auth-showcase-copy">
            <span className="auth-eyebrow">
              TOGETHER, WE CREATE CHANGE
            </span>

            <h1>
              Small actions.
              <br />
              <span>Massive impact.</span>
            </h1>

            <p>
              Every donation carries a story.
              Every act of kindness creates a ripple.
              Continue being part of something meaningful.
            </p>
          </div>

          <div className="auth-impact-line">
            <div className="impact-mini">
              <strong>12.5K+</strong>
              <span>People involved</span>
            </div>

            <div className="impact-divider" />

            <div className="impact-mini">
              <strong>84</strong>
              <span>Active campaigns</span>
            </div>

            <div className="impact-divider" />

            <div className="impact-mini">
              <strong>32</strong>
              <span>Partner NGOs</span>
            </div>
          </div>
        </div>

        <div className="auth-glow auth-glow-one" />
        <div className="auth-glow auth-glow-two" />
      </section>

      {/* RIGHT FORM */}
      <section className="auth-form-section">
        <div className="auth-form-wrapper">

          {/* MOBILE BRAND */}
          <div className="auth-mobile-brand">
            <span>✦</span>
            Kindora
          </div>

          <div className="auth-form-header">
            <span className="auth-form-label">
              WELCOME BACK
            </span>

            <h2>
              Welcome
              <br />
              <em>back.</em>
            </h2>

            <p>
              Sign in to continue making a meaningful
              impact with Kindora.
            </p>
          </div>

          {error && (
            <div className="auth-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          <form
            className="modern-auth-form"
            onSubmit={submit}
          >
            <div className="modern-field">
              <label htmlFor="login-email">
                EMAIL ADDRESS
              </label>

              <div className="input-shell">
                <span className="input-icon">✉</span>

                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="modern-field">
              <label htmlFor="login-password">
                PASSWORD
              </label>

              <div className="input-shell">
                <span className="input-icon">●</span>

                <input
                  id="login-password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="modern-auth-button"
              disabled={loading}
            >
              <span>
                {loading
                  ? "Signing in..."
                  : "Sign in"}
              </span>

              {!loading && <span>↗</span>}
            </button>
          </form>

          <div className="auth-or">
            <span />
            <small>OR</small>
            <span />
          </div>

          <div className="auth-switch">
            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create one
            </Link>
          </div>

          <button
            className="auth-home-button"
            onClick={() => navigate("/")}
          >
            ← Back to Kindora
          </button>

          <div className="auth-security">
            <span>✦</span>
            Your information is securely protected.
          </div>
        </div>
      </section>
    </main>
  );
}