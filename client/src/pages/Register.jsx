import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      localStorage.setItem("ngo_token", response.data.token);

      localStorage.setItem(
        "ngo_user",
        JSON.stringify(response.data.user)
      );

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
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

      {/* =================================================
          LEFT SHOWCASE
      ================================================= */}

      <section className="auth-showcase">
        <div className="auth-showcase-image" />
        <div className="auth-showcase-overlay" />

        <div className="auth-showcase-content">
          <div className="auth-brand">
            <span className="auth-brand-mark">✦</span>
            <span>Kindora</span>
          </div>

          <div className="auth-showcase-copy">
            <span className="auth-eyebrow">
              JOIN THE MOVEMENT
            </span>

            <h1>
              Small acts.
              <br />
              <span>Real impact.</span>
            </h1>

            <p>
              Join a growing community of people supporting
              meaningful causes and helping communities build
              a better tomorrow.
            </p>

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
        </div>

        <div className="auth-glow auth-glow-one" />
        <div className="auth-glow auth-glow-two" />
      </section>

      {/* =================================================
          RIGHT FORM
      ================================================= */}

      <section className="auth-form-section">
        <form
          className="auth-form-wrapper"
          onSubmit={submit}
        >
          {/* MOBILE BRAND */}
          <div className="auth-mobile-brand">
            <span>✦</span>
            <strong>Kindora</strong>
          </div>

          {/* HEADER */}
          <div className="auth-form-header">
            <span className="auth-form-label">
              CREATE ACCOUNT
            </span>

            <h2>
              Start making
              <br />
              <em>impact.</em>
            </h2>

            <p>
              Create your account and become part of a
              community creating meaningful change.
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="auth-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          {/* NAME */}
          <div className="modern-field">
            <label htmlFor="name">
              FULL NAME
            </label>

            <div className="input-shell">
              <span className="input-icon">♙</span>

              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="modern-field">
            <label htmlFor="email">
              EMAIL ADDRESS
            </label>

            <div className="input-shell">
              <span className="input-icon">✉</span>

              <input
                id="email"
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

          {/* PASSWORD */}
          <div className="modern-field">
            <label htmlFor="password">
              PASSWORD
            </label>

            <div className="input-shell">
              <span className="input-icon">⌁</span>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? "◉" : "◌"}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="modern-field">
            <label htmlFor="confirmPassword">
              CONFIRM PASSWORD
            </label>

            <div className="input-shell">
              <span className="input-icon">⌁</span>

              <input
                id="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? "◉" : "◌"}
              </button>
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="modern-auth-button"
            disabled={loading}
          >
            <span>
              {loading
                ? "Creating account..."
                : "Create account"}
            </span>

            {!loading && <span>↗</span>}
          </button>

          {/* SWITCH */}
          <div className="auth-switch">
            Already have an account?

            <Link to="/login">
              Sign in
            </Link>
          </div>

          {/* SECURITY */}
          <div className="auth-security">
            <span>✦</span>
            Your information is securely protected.
          </div>
        </form>
      </section>
    </main>
  );
}