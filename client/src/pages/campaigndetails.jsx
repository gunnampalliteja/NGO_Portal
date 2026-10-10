import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api.js";

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("500");
  const [donorName, setDonorName] = useState("");
  const [message, setMessage] = useState("");
  const [donating, setDonating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCampaign = async () => {
    try {
      const response = await api.get("/campaigns/" + id);
      setCampaign(response.data.campaign);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load campaign."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const handleDonation = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const donationAmount = Number(amount);

    if (!Number.isFinite(donationAmount) || donationAmount < 1) {
      setError("Please enter a valid donation amount.");
      return;
    }

    if (!Number.isSafeInteger(donationAmount)) {
      setError("Please enter a whole-number donation amount.");
      return;
    }

    if (!localStorage.getItem("ngo_token")) {
      setShowModal(false);
      navigate("/login");
      return;
    }

    if (
      !campaign ||
      campaign.status !== "active" ||
      donationAmount > Math.max(
        Number(campaign.goalAmount) - Number(campaign.raisedAmount),
        0
      )
    ) {
      setError("Please check the amount. This campaign may no longer accept it.");
      return;
    }

    setDonating(true);

    try {
      const loaded = await loadRazorpay();

      if (!loaded) {
        throw new Error(
          "Unable to load Razorpay. Check your internet connection."
        );
      }

      const orderResponse = await api.post("/donations/create-order", {
        campaignId: campaign._id,
        amount: donationAmount,
        donorName: donorName.trim() || "Anonymous",
        message: message.trim(),
      });

      const orderData = orderResponse.data;

      if (
        !orderData.success ||
        !orderData.order?.id ||
        !orderData.key ||
        !orderData.donationId
      ) {
        throw new Error("The server returned incomplete payment details.");
      }

      const checkout = new window.Razorpay({
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency || "INR",
        name: "Kindora",
        description: "Donation to " + campaign.title,
        order_id: orderData.order.id,
        prefill: {
          name: donorName.trim(),
        },
        theme: {
          color: "#e5485d",
        },
        modal: {
          ondismiss: () => {
            setDonating(false);
          },
        },
        handler: async (payment) => {
          try {
            const verification = await api.post("/donations/verify", {
              razorpay_order_id: payment.razorpay_order_id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature,
              donationId: orderData.donationId,
            });

            if (!verification.data.success) {
              throw new Error(
                verification.data.message || "Payment verification failed."
              );
            }

            setSuccess("Thank you! Your donation was verified successfully.");
            setShowModal(false);
            setAmount("500");
            setDonorName("");
            setMessage("");
            await fetchCampaign();
          } catch (err) {
            setError(
              err.response?.data?.message ||
                err.message ||
                "Unable to verify payment. Please contact support before trying another payment."
            );
          } finally {
            setDonating(false);
          }
        },
      });

      checkout.on("payment.failed", (response) => {
        setError(
          response.error?.description || "Payment failed. Please try again."
        );
        setDonating(false);
      });

      checkout.open();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start your donation."
      );
      setDonating(false);
    }
  };

  if (loading) {
    return (
      <main className="campaign-details-page">
        <p>Loading campaign...</p>
      </main>
    );
  }

  if (!campaign) {
    return (
      <main className="campaign-details-page">
        <p>{error || "Campaign not found."}</p>
        <Link to="/campaigns">Back to campaigns</Link>
      </main>
    );
  }

  const goal = Number(campaign.goalAmount) || 0;
  const raised = Number(campaign.raisedAmount) || 0;
  const remaining = Math.max(goal - raised, 0);
  const progress =
    goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

  return (
    <main className="campaign-details-page">
      <nav className="campaign-details-nav">
        <Link to="/" className="campaign-details-brand">
          Kindora<span>.</span>
        </Link>
        <Link to="/campaigns" className="campaign-back-link">
          ← All campaigns
        </Link>
      </nav>

      <section className="campaign-details-container">
        <div className="campaign-details-image-wrap">
          <img
            className="campaign-details-image"
            src={campaign.image}
            alt={campaign.title}
          />
          <span className="campaign-details-category">
            {campaign.category}
          </span>
        </div>

        <div className="campaign-details-content">
          <p className="campaign-details-eyebrow">MAKE A DIFFERENCE</p>
          <h1>{campaign.title}</h1>
          <p className="campaign-details-description">
            {campaign.description}
          </p>

          <div className="campaign-details-progress">
            <div className="campaign-details-progress-labels">
              <strong>₹{raised.toLocaleString("en-IN")} raised</strong>
              <span>Goal ₹{goal.toLocaleString("en-IN")}</span>
            </div>

            <div className="campaign-details-progress-track">
              <div
                className="campaign-details-progress-fill"
                style={{ width: progress + "%" }}
              />
            </div>

            <div className="campaign-details-stats">
              <span>{Math.round(progress)}% funded</span>
              <span>₹{remaining.toLocaleString("en-IN")} to go</span>
              <span>{campaign.donorCount || 0} supporters</span>
            </div>
          </div>

          {campaign.organization?.name && (
            <p className="campaign-details-organization">
              Organized by <strong>{campaign.organization.name}</strong>
            </p>
          )}

          {error && !showModal && (
            <p className="campaign-details-error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="campaign-details-success" role="status">
              {success}
            </p>
          )}

          <button
            className="campaign-donate-button"
            onClick={() => {
              setError("");
              setSuccess("");
              setShowModal(true);
            }}
            disabled={campaign.status !== "active" || remaining <= 0}
          >
            {campaign.status === "active" && remaining > 0
              ? "Donate Now ♥"
              : "Campaign Completed"}
          </button>
        </div>
      </section>

      {showModal && (
        <div
          className="donation-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget && !donating) {
              setShowModal(false);
              setError("");
            }
          }}
        >
          <section
            className="donation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="donation-modal-title"
          >
            <button
              className="donation-modal-close"
              type="button"
              onClick={() => {
                setShowModal(false);
                setError("");
              }}
              disabled={donating}
              aria-label="Close donation dialog"
            >
              ×
            </button>

            <p className="campaign-details-eyebrow">
              YOUR KINDNESS MATTERS
            </p>
            <h2 id="donation-modal-title">Support this campaign</h2>
            <p className="donation-modal-campaign">{campaign.title}</p>

            <form onSubmit={handleDonation}>
              <label htmlFor="donation-amount">Donation amount (₹)</label>
              <input
                id="donation-amount"
                type="number"
                min="1"
                max={remaining}
                step="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />

              <div className="donation-quick-amounts">
                {[100, 500, 1000, 5000]
                  .filter((value) => value <= remaining)
                  .map((value) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setAmount(String(value))}
                      className={Number(amount) === value ? "selected" : ""}
                      disabled={donating}
                    >
                      ₹{value.toLocaleString("en-IN")}
                    </button>
                  ))}
              </div>

              <label htmlFor="donor-name">Your name (optional)</label>
              <input
                id="donor-name"
                type="text"
                maxLength="100"
                value={donorName}
                onChange={(event) => setDonorName(event.target.value)}
                placeholder="Anonymous"
              />

              <label htmlFor="donation-message">Message (optional)</label>
              <textarea
                id="donation-message"
                maxLength="500"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Share a message of support..."
                rows="3"
              />

              {error && (
                <p className="campaign-details-error" role="alert">
                  {error}
                </p>
              )}

              <button
                className="campaign-donate-button"
                type="submit"
                disabled={donating || remaining <= 0}
              >
                {donating
                  ? "Connecting to Razorpay..."
                  : "Continue to Pay ₹" +
                    Number(amount || 0).toLocaleString("en-IN")}
              </button>

              <p className="donation-secure-note">
                Secure checkout powered by Razorpay.
              </p>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}