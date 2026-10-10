import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Users,
  ArrowUpRight,
  Loader2,
  Heart,
} from "lucide-react";

import { getCampaigns } from "../api/campaigns.js";

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
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCampaigns() {
      try {
        setLoading(true);
        setError("");

        const data = await getCampaigns({
          category,
          search,
        });

        if (!cancelled) {
          setCampaigns(data.campaigns || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    const timer = setTimeout(loadCampaigns, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [category, search]);

  return (
    <section className="campaign-section" id="campaigns">
      <div className="campaign-header">
        <div>
          <span className="section-eyebrow">
            MAKE AN IMPACT
          </span>

          <h2>Campaigns that need you</h2>

          <p>
            Find a cause you believe in and help create
            meaningful change.
          </p>
        </div>

        <div className="campaign-search">
          <Search size={20} />

          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="campaign-filters">
        {categories.map((item) => (
          <button
            key={item}
            className={category === item ? "active" : ""}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {loading && (
        <div className="campaign-loading">
          <Loader2 className="spin" size={32} />
          <span>Finding campaigns...</span>
        </div>
      )}

      {error && !loading && (
        <div className="campaign-error">
          <p>{error}</p>

          <button
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && campaigns.length === 0 && (
        <div className="campaign-empty">
          <Heart size={42} />
          <h3>No campaigns found</h3>
          <p>
            Try another search or choose a different category.
          </p>
        </div>
      )}

      <div className="campaign-grid">
        <AnimatePresence mode="popLayout">
          {campaigns.map((campaign, index) => {
            const progress =
              campaign.fundingPercentage ??
              Math.min(
                Math.round(
                  (campaign.raisedAmount /
                    campaign.goalAmount) *
                    100
                ),
                100
              );

            return (
              <motion.article
                key={campaign._id}
                layout
                initial={{
                  opacity: 0,
                  y: 40,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                }}
                transition={{
                  delay: index * 0.06,
                  duration: 0.5,
                }}
                whileHover={{
                  y: -10,
                }}
                className="campaign-card"
              >
                <div className="campaign-image-wrapper">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    loading="lazy"
                  />

                  <div className="campaign-category">
                    {campaign.category}
                  </div>

                  {campaign.featured && (
                    <div className="campaign-featured">
                      ⭐ Featured
                    </div>
                  )}
                </div>

                <div className="campaign-content">
                  <h3>{campaign.title}</h3>

                  <p className="campaign-description">
                    {campaign.description}
                  </p>

                  <div className="campaign-location">
                    <MapPin size={16} />
                    {campaign.location}
                  </div>

                  <div className="campaign-progress">
                    <div className="progress-info">
                      <strong>
                        ₹
                        {Number(
                          campaign.raisedAmount || 0
                        ).toLocaleString("en-IN")}
                      </strong>

                      <span>
                        of ₹
                        {Number(
                          campaign.goalAmount || 0
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="progress-track">
                      <motion.div
                        className="progress-bar"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${progress}%`,
                        }}
                        transition={{
                          duration: 1,
                          delay: 0.2,
                        }}
                      />
                    </div>

                    <div className="progress-bottom">
                      <span>{progress}% funded</span>

                      <span>
                        <Users size={15} />
                        {campaign.donorCount || 0} donors
                      </span>
                    </div>
                  </div>

                  <button className="campaign-button">
                    View Campaign
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}