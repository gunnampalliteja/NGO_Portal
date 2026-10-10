
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import "./DonationPages.css";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const categories = [
  "All",
  "Education",
  "Healthcare",
  "Food",
  "Clean Water",
  "Environment",
  "Emergency",
  "Other",
];

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    let active = true;

    api
      .get("/campaigns")
      .then((response) => {
        if (active) {
          const data = response.data;
          setCampaigns(
            Array.isArray(data)
              ? data
              : data.campaigns || []
          );
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load campaigns. Please try again."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let result = campaigns.filter((campaign) => {
      const term = search.toLowerCase().trim();

      const matchesSearch =
        !term ||
        [campaign.title, campaign.description, campaign.location]
          .some((value) =>
            String(value || "").toLowerCase().includes(term)
          );

      const matchesCategory =
        category === "All" || campaign.category === category;

      return (
        matchesSearch &&
        matchesCategory &&
        campaign.status === "active"
      );
    });

    if (sort === "progress") {
      result = [...result].sort(
        (a, b) =>
          Number(b.raisedAmount || 0) /
            Math.max(Number(b.goalAmount) || 1, 1) -
          Number(a.raisedAmount || 0) /
            Math.max(Number(a.goalAmount) || 1, 1)
      );
    } else if (sort === "ending") {
      result = [...result].sort(
        (a, b) =>
          new Date(a.deadline || "9999-12-31") -
          new Date(b.deadline || "9999-12-31")
      );
    } else if (sort === "newest") {
      result = [...result].sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );
    } else {
      result = [...result].sort(
        (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))
      );
    }

    return result;
  }, [campaigns, search, category, sort]);

  const totalRaised = campaigns.reduce(
    (sum, campaign) => sum + (Number(campaign.raisedAmount) || 0),
    0
  );

  const totalGoal = campaigns.reduce(
    (sum, campaign) => sum + (Number(campaign.goalAmount) || 0),
    0
  );

  return (
    <main className="kindora-page">
      <header className="kindora-topbar">
        <Link to="/" className="kindora-brand">
          <span className="kindora-brand-icon">K</span>
          kindora<span className="kindora-brand-dot">.</span>
        </Link>

        <nav className="kindora-nav">
          <Link to="/">Home</Link>
          <Link to="/campaigns" className="active">Campaigns</Link>
          <Link to="/dashboard">Dashboard</Link>
        </nav>

        <Link to="/dashboard" className="kindora-nav-cta">
          My activity <span>↗</span>
        </Link>
      </header>

      <section className="kindora-hero">
        <div className="kindora-hero-content">
          <div className="kindora-eyebrow">
            <span className="kindora-live-dot" />
            SMALL ACTS. LASTING CHANGE.
          </div>

          <h1>
            Find a cause.
            <br />
            <span>Change a life.</span>
          </h1>

          <p>
            Every campaign is an opportunity to make a real difference.
            Discover the causes that matter to you and be part of something
            meaningful.
          </p>

          <a href="#campaign-list" className="kindora-primary-btn">
            Explore campaigns <span>↓</span>
          </a>
        </div>

        <div className="kindora-hero-art" aria-hidden="true">
          <div className="kindora-art-ring ring-one" />
          <div className="kindora-art-ring ring-two" />
          <div className="kindora-art-glow" />
          <div className="kindora-art-center">♡</div>
          <span className="kindora-art-spark spark-one">✳</span>
          <span className="kindora-art-spark spark-two">✦</span>
          <span className="kindora-art-spark spark-three">+</span>
          <div className="kindora-art-caption">
            <span>YOUR KINDNESS</span>
            <strong>Matters here.</strong>
          </div>
        </div>
      </section>

      <section className="kindora-impact-strip">
        <div>
          <span className="kindora-mini-label">CAMPAIGNS</span>
          <strong>{campaigns.length}</strong>
          <span className="kindora-muted">Causes to explore</span>
        </div>

        <div>
          <span className="kindora-mini-label">TOTAL FUNDING</span>
          <strong>{money(totalRaised)}</strong>
          <span className="kindora-muted">Raised across campaigns</span>
        </div>

        <div>
          <span className="kindora-mini-label">FUNDING GOALS</span>
          <strong>{money(totalGoal)}</strong>
          <span className="kindora-muted">Combined campaign targets</span>
        </div>

        <div className="kindora-strip-message">
          <span className="kindora-strip-heart">♥</span>
          <span>
            <strong>Be someone's reason to smile.</strong>
            <small>Every contribution counts.</small>
          </span>
        </div>
      </section>

      <section className="kindora-campaign-section" id="campaign-list">
        <div className="kindora-section-heading">
          <div>
            <span className="kindora-eyebrow">MAKE YOUR IMPACT</span>
            <h2>Explore campaigns<span>.</span></h2>
            <p>Find a cause that speaks to your heart.</p>
          </div>

          <label className="kindora-sort">
            <span>Sort by</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="featured">Featured first</option>
              <option value="progress">Most funded</option>
              <option value="ending">Ending soon</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </div>

        <div className="kindora-filter-row">
          <label className="kindora-search">
            <span aria-hidden="true">⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search causes, places..."
              aria-label="Search campaigns"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </label>

          <div className="kindora-category-list">
            {categories.map((item) => (
              <button
                type="button"
                key={item}
                className={
                  category === item
                    ? "kindora-category active"
                    : "kindora-category"
                }
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="kindora-state">
            <span className="kindora-loader" />
            <p>Finding meaningful causes...</p>
          </div>
        ) : error ? (
          <div className="kindora-state kindora-error">
            <span>!</span>
            <h3>We couldn't load the campaigns</h3>
            <p>{error}</p>
            <button
              className="kindora-primary-btn"
              onClick={() => window.location.reload()}
            >
              Try again ↻
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="kindora-state">
            <span className="kindora-empty-icon">♡</span>
            <h3>No campaigns found</h3>
            <p>Try a different search or select another category.</p>
            <button
              className="kindora-secondary-btn"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="kindora-campaign-grid">
            {filtered.map((campaign) => {
              const raised = Math.max(
                0,
                Number(campaign.raisedAmount) || 0
              );
              const goal = Math.max(
                0,
                Number(campaign.goalAmount) || 0
              );
              const percentage = goal
                ? Math.min(100, Math.round((raised / goal) * 100))
                : 0;

              const days = campaign.deadline
                ? Math.ceil(
                    (new Date(campaign.deadline).getTime() - Date.now()) /
                      86400000
                  )
                : null;

              return (
                <article className="kindora-campaign-card" key={campaign._id}>
                  <Link
                    to={`/campaigns/${campaign._id}`}
                    className="kindora-card-image"
                  >
                    {campaign.image ? (
                      <img
                        src={campaign.image}
                        alt={campaign.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="kindora-image-placeholder">
                        <span>♡</span>
                        <small>Every act of kindness matters</small>
                      </div>
                    )}

                    <span className="kindora-image-category">
                      {campaign.category || "Community"}
                    </span>

                    {campaign.featured && (
                      <span className="kindora-featured">✦ Featured</span>
                    )}
                  </Link>

                  <div className="kindora-card-body">
                    <div className="kindora-card-location">
                      <span>⌖</span> {campaign.location || "Community initiative"}
                    </div>

                    <h3>
                      <Link to={`/campaigns/${campaign._id}`}>
                        {campaign.title}
                      </Link>
                    </h3>

                    <p className="kindora-card-description">
                      {campaign.description ||
                        "Join this initiative and help create a positive impact."}
                    </p>

                    <div className="kindora-progress-label">
                      <span>Funding progress</span>
                      <strong>{percentage}%</strong>
                    </div>

                    <div
                      className="kindora-progress-track"
                      role="progressbar"
                      aria-label={`${campaign.title} funding progress`}
                      aria-valuenow={percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <span style={{ width: `${percentage}%` }} />
                    </div>

                    <div className="kindora-funding-row">
                      <div>
                        <strong>{money(raised)}</strong>
                        <span> raised</span>
                      </div>
                      <div>
                        <span>Goal </span>
                        <strong>{money(goal)}</strong>
                      </div>
                    </div>

                    <div className="kindora-card-footer">
                      <span>
                        {days === null
                          ? "Every day counts"
                          : days > 0
                            ? `${days} days left`
                            : days === 0
                              ? "Deadline today"
                              : "Deadline passed"}
                      </span>

                      <Link
                        to={`/campaigns/${campaign._id}`}
                        className="kindora-card-action"
                        aria-label={`View ${campaign.title}`}
                      >
                        View campaign <span>↗</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="kindora-bottom-cta">
        <div className="kindora-cta-heart">♡</div>
        <div>
          <span className="kindora-eyebrow">BE THE DIFFERENCE</span>
          <h2>Your kindness can go further.</h2>
          <p>Choose a cause today. Help create a better tomorrow.</p>
        </div>
        <a href="#campaign-list" className="kindora-primary-btn">
          Find your cause <span>↗</span>
        </a>
      </section>

      <footer className="kindora-footer">
        <Link to="/" className="kindora-brand">
          <span className="kindora-brand-icon">K</span>
          kindora<span className="kindora-brand-dot">.</span>
        </Link>
        <p>Making kindness count, one contribution at a time.</p>
        <span>Made with ♥ for a better world.</span>
      </footer>
    </main>
  );
}
