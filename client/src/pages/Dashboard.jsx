
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

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Date unavailable";

const statusClass = (status) => {
  if (status === "completed") return "completed";
  if (status === "failed") return "failed";
  return "pending";
};

export default function Dashboard() {
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("ngo_user") || "{}");
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    let active = true;

    Promise.all([
      api.get("/donations/mine"),
      api.get("/campaigns"),
    ])
      .then(([donationResponse, campaignResponse]) => {
        if (!active) return;

        const donationData = donationResponse.data;
        const campaignData = campaignResponse.data;

        setDonations(
          Array.isArray(donationData)
            ? donationData
            : donationData.donations || []
        );

        setCampaigns(
          Array.isArray(campaignData)
            ? campaignData
            : campaignData.campaigns || []
        );
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.message ||
              "We couldn't load your dashboard. Please try again."
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

  const completed = useMemo(
    () => donations.filter((item) => item.paymentStatus === "completed"),
    [donations]
  );

  const totalDonated = completed.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  const supportedCampaigns = new Set(
    completed.map((item) => item.campaign?._id || item.campaign).filter(Boolean)
  ).size;

  const recentDonations = useMemo(() => {
    const sorted = [...donations].sort(
      (a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    return filter === "all"
      ? sorted
      : sorted.filter((item) => item.paymentStatus === filter);
  }, [donations, filter]);

  const name =
    user.name ||
    user.fullName ||
    user.firstName ||
    user.username ||
    "there";

  return (
    <main className="kindora-page">
      <header className="kindora-topbar">
        <Link to="/" className="kindora-brand">
          <span className="kindora-brand-icon">K</span>
          kindora<span className="kindora-brand-dot">.</span>
        </Link>

        <nav className="kindora-nav">
          <Link to="/">Home</Link>
          <Link to="/campaigns">Campaigns</Link>
          <Link to="/dashboard" className="active">Dashboard</Link>
        </nav>

        <Link to="/campaigns" className="kindora-nav-cta">
          Donate again <span>↗</span>
        </Link>
      </header>

      <section className="kindora-dashboard-hero">
        <div className="kindora-dashboard-welcome">
          <div className="kindora-eyebrow">
            <span className="kindora-live-dot" />
            YOUR KINDORA SPACE
          </div>

          <h1>
            Welcome back,
            <br />
            <span>{name}.</span>
          </h1>

          <p>
            Every act of kindness leaves a mark. Here's a look at the
            difference you've made so far.
          </p>

          <Link to="/campaigns" className="kindora-primary-btn">
            Discover more causes <span>↗</span>
          </Link>
        </div>

        <div className="kindora-dashboard-art" aria-hidden="true">
          <div className="kindora-dashboard-orbit orbit-a" />
          <div className="kindora-dashboard-orbit orbit-b" />
          <div className="kindora-dashboard-heart">♥</div>
          <span className="kindora-floating-star star-a">✦</span>
          <span className="kindora-floating-star star-b">✳</span>
          <span className="kindora-floating-star star-c">+</span>
          <div className="kindora-dashboard-art-note">
            <span>YOUR IMPACT</span>
            <strong>Kindness in action.</strong>
          </div>
        </div>
      </section>

      <section className="kindora-dashboard-content">
        {loading ? (
          <div className="kindora-state">
            <span className="kindora-loader" />
            <p>Gathering your impact...</p>
          </div>
        ) : error ? (
          <div className="kindora-state kindora-error">
            <span>!</span>
            <h3>Unable to load your dashboard</h3>
            <p>{error}</p>
            <button
              className="kindora-primary-btn"
              onClick={() => window.location.reload()}
            >
              Try again ↻
            </button>
          </div>
        ) : (
          <>
            <div className="kindora-dashboard-section-title">
              <div>
                <span className="kindora-eyebrow">YOUR JOURNEY</span>
                <h2>Your impact at a glance<span>.</span></h2>
              </div>
              <span className="kindora-live-badge">
                <span className="kindora-live-dot" />
                Live account data
              </span>
            </div>

            <div className="kindora-stats-grid">
              <article className="kindora-stat-card stat-primary">
                <div className="kindora-stat-top">
                  <span>Total donated</span>
                  <span className="kindora-stat-icon">₹</span>
                </div>
                <strong>{money(totalDonated)}</strong>
                <p>Successfully completed payments</p>
                <div className="kindora-stat-decoration">₹</div>
              </article>

              <article className="kindora-stat-card">
                <div className="kindora-stat-top">
                  <span>Completed donations</span>
                  <span className="kindora-stat-icon">✓</span>
                </div>
                <strong>{completed.length}</strong>
                <p>Successful contributions</p>
                <div className="kindora-stat-decoration">✓</div>
              </article>

              <article className="kindora-stat-card">
                <div className="kindora-stat-top">
                  <span>Causes supported</span>
                  <span className="kindora-stat-icon">♡</span>
                </div>
                <strong>{supportedCampaigns}</strong>
                <p>Unique campaigns supported</p>
                <div className="kindora-stat-decoration">♡</div>
              </article>

              <article className="kindora-stat-card">
                <div className="kindora-stat-top">
                  <span>Payment attempts</span>
                  <span className="kindora-stat-icon">↗</span>
                </div>
                <strong>{donations.length}</strong>
                <p>Including pending and failed attempts</p>
                <div className="kindora-stat-decoration">↗</div>
              </article>
            </div>

            <div className="kindora-dashboard-main-grid">
              <section className="kindora-panel kindora-donation-panel">
                <div className="kindora-panel-heading">
                  <div>
                    <span className="kindora-eyebrow">YOUR GENEROSITY</span>
                    <h2>Donation history</h2>
                    <p>Every contribution tells a story.</p>
                  </div>

                  <span className="kindora-history-count">
                    {donations.length} records
                  </span>
                </div>

                <div className="kindora-history-filters">
                  {[
                    ["all", "All"],
                    ["completed", "Completed"],
                    ["pending", "Pending"],
                    ["failed", "Failed"],
                  ].map(([value, label]) => (
                    <button
                      type="button"
                      key={value}
                      className={
                        filter === value
                          ? "kindora-history-filter active"
                          : "kindora-history-filter"
                      }
                      onClick={() => setFilter(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {recentDonations.length === 0 ? (
                  <div className="kindora-history-empty">
                    <span>♡</span>
                    <h3>
                      {donations.length
                        ? "No records in this filter"
                        : "Your journey starts here"}
                    </h3>
                    <p>
                      {donations.length
                        ? "Try selecting another payment status."
                        : "Your first contribution could make someone's day."}
                    </p>
                    {!donations.length && (
                      <Link
                        to="/campaigns"
                        className="kindora-primary-btn"
                      >
                        Explore campaigns ↗
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="kindora-history-list">
                    {recentDonations.map((donation) => {
                      const campaign =
                        typeof donation.campaign === "object"
                          ? donation.campaign
                          : null;

                      const campaignName =
                        campaign?.title || "Kindora campaign";

                      const campaignId =
                        campaign?._id ||
                        (typeof donation.campaign === "string"
                          ? donation.campaign
                          : null);

                      return (
                        <article
                          className="kindora-history-item"
                          key={donation._id}
                        >
                          <div className="kindora-history-avatar">
                            {campaign?.image ? (
                              <img src={campaign.image} alt="" loading="lazy" />
                            ) : (
                              <span>♡</span>
                            )}
                          </div>

                          <div className="kindora-history-details">
                            <strong>{campaignName}</strong>
                            <span>{formatDate(donation.createdAt)}</span>
                            <span className="kindora-history-receipt">
                              {donation.receiptNumber
                                ? `Receipt · ${donation.receiptNumber}`
                                : donation.transactionId
                                  ? `Reference · ${donation.transactionId}`
                                  : "Donation record"}
                            </span>
                          </div>

                          <div className="kindora-history-amount">
                            <strong>{money(donation.amount)}</strong>
                            <span
                              className={`kindora-status ${statusClass(
                                donation.paymentStatus
                              )}`}
                            >
                              {donation.paymentStatus || "pending"}
                            </span>
                          </div>

                          {campaignId && (
                            <Link
                              to={`/campaigns/${campaignId}`}
                              className="kindora-history-link"
                              aria-label={`View ${campaignName}`}
                            >
                              ↗
                            </Link>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              <aside className="kindora-side-column">
                <section className="kindora-panel kindora-journey-panel">
                  <span className="kindora-eyebrow">YOUR STORY</span>
                  <div className="kindora-journey-heart">♥</div>
                  <h2>Kindness looks good on you.</h2>
                  <p>
                    Every successful contribution helps move a cause closer
                    to its goal. Thank you for being part of the journey.
                  </p>

                  <div className="kindora-journey-divider" />

                  <div className="kindora-journey-number">
                    <strong>{money(totalDonated)}</strong>
                    <span>Successfully contributed</span>
                  </div>

                  <Link to="/campaigns" className="kindora-primary-btn">
                    Make an impact <span>↗</span>
                  </Link>
                </section>

                <section className="kindora-panel kindora-recommendations">
                  <div className="kindora-panel-heading">
                    <div>
                      <span className="kindora-eyebrow">KEEP THE GOOD GOING</span>
                      <h2>Discover causes</h2>
                    </div>
                  </div>

                  {campaigns
                    .filter((campaign) => campaign.status === "active")
                    .slice(0, 3)
                    .map((campaign) => (
                      <Link
                        to={`/campaigns/${campaign._id}`}
                        className="kindora-mini-campaign"
                        key={campaign._id}
                      >
                        <div className="kindora-mini-image">
                          {campaign.image ? (
                            <img
                              src={campaign.image}
                              alt=""
                              loading="lazy"
                            />
                          ) : (
                            <span>♡</span>
                          )}
                        </div>

                        <div>
                          <strong>{campaign.title}</strong>
                          <span>
                            {money(campaign.raisedAmount)} raised
                          </span>
                        </div>

                        <span className="kindora-mini-arrow">↗</span>
                      </Link>
                    ))}

                  {!campaigns.some(
                    (campaign) => campaign.status === "active"
                  ) && (
                    <p className="kindora-muted">
                      New causes will appear here when campaigns are available.
                    </p>
                  )}

                  <Link to="/campaigns" className="kindora-all-campaigns">
                    View all campaigns <span>→</span>
                  </Link>
                </section>
              </aside>
            </div>
          </>
        )}
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