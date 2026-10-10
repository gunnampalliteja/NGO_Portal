import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";

const campaigns = [
  {
    title: "Clean Water for Every Family",
    category: "Clean Water",
    raised: 78450,
    goal: 100000,
    image:
      "https://images.unsplash.com/photo-1538300342682-cf57afb97285?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Education Changes Everything",
    category: "Education",
    raised: 62300,
    goal: 80000,
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Meals for Growing Children",
    category: "Food",
    raised: 45200,
    goal: 60000,
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
  },
];

const stats = [
  { number: 12500, label: "Lives Impacted", suffix: "+" },
  { number: 84, label: "Active Campaigns", suffix: "" },
  { number: 32, label: "Partner NGOs", suffix: "+" },
  { number: 98, label: "Funds Delivered", suffix: "%" },
];

function Counter({ number, suffix }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1800;
    const step = Math.max(1, Math.floor(number / 60));

    const timer = setInterval(() => {
      start += step;

      if (start >= number) {
        setValue(number);
        clearInterval(timer);
      } else {
        setValue(start);
      }
    }, duration / 60);

    return () => clearInterval(timer);
  }, [number]);

  return (
    <>
      {value.toLocaleString()}
      {suffix}
    </>
  );
}

function FloatingOrb({ className }) {
  return (
    <motion.div
      className={`floating-orb ${className}`}
      animate={{
        y: [0, -25, 0],
        x: [0, 12, 0],
        scale: [1, 1.08, 1],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export default function PremiumHome() {
  const navigate = useNavigate();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, {
    stiffness: 120,
    damping: 25,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 120,
    damping: 25,
  });

  useEffect(() => {
    const move = (event) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };

    window.addEventListener("mousemove", move);

    return () => window.removeEventListener("mousemove", move);
  }, [mouseX, mouseY]);

  return (
    <main className="premium-page">
      {/* CURSOR LIGHT */}
      <motion.div
        className="cursor-light"
        style={{
          left: smoothX,
          top: smoothY,
        }}
      />

      {/* NAVBAR */}
      <header className="navbar">
        <div className="nav-inner">
          <div className="logo">
            <div className="logo-mark">✦</div>
            <span>Kindora</span>
          </div>

          <nav className="nav-links">
            <a href="#home">Home</a>
            <a href="#campaigns">Campaigns</a>
            <a href="#impact">Our Impact</a>
            <a href="#about">About</a>
          </nav>

          <button
  className="nav-button"
  onClick={() => navigate("/register")}
>
  Donate Now
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-grid" />

        <FloatingOrb className="orb-one" />
        <FloatingOrb className="orb-two" />
        <FloatingOrb className="orb-three" />

        <div className="hero-content">
          <motion.div
            className="eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="pulse-dot" />
            Together, we create change
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 45 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
          >
            Small actions.
            <br />
            <span>Massive impact.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Connect with trusted NGOs, support meaningful campaigns,
            and turn your contribution into real-world change.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
          >
            <a href="#campaigns" className="primary-button">
              Explore Campaigns
              <span>↗</span>
            </a>

            <button className="secondary-button">
              <span className="play-icon">▶</span>
              See our impact
            </button>
          </motion.div>

          <motion.div
            className="hero-trust"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="avatar-stack">
              <span>👩</span>
              <span>👨</span>
              <span>🧑</span>
              <span>👩</span>
            </div>

            <div>
              <strong>12,500+</strong>
              <small>people already making a difference</small>
            </div>
          </motion.div>
        </div>

        {/* HERO VISUAL */}
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.8, x: 60 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{
            duration: 1.2,
            delay: 0.25,
            ease: "easeOut",
          }}
        >
          <div className="hero-image-card">
            <img
              src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=85"
              alt="Children receiving support"
            />

            <div className="image-gradient" />

            <div className="floating-impact-card">
              <div className="impact-icon">♥</div>
              <div>
                <strong>₹7.8L+</strong>
                <span>raised this month</span>
              </div>
            </div>

            <div className="floating-location-card">
              <span>●</span>
              24 communities reached
            </div>
          </div>
        </motion.div>

        <div className="scroll-indicator">
          <span>SCROLL TO EXPLORE</span>
          <div />
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section" id="impact">
        <div className="section-container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div
                className="stat"
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: index * 0.1 }}
              >
                <strong>
                  <Counter
                    number={stat.number}
                    suffix={stat.suffix}
                  />
                </strong>

                <span>{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CAMPAIGNS */}
      <section className="campaign-section" id="campaigns">
        <div className="section-container">
          <motion.div
            className="section-heading"
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <span className="section-label">MAKE AN IMPACT</span>
              <h2>Causes worth<br />showing up for.</h2>
            </div>

            <p>
              Every campaign on our platform represents a real
              opportunity to make someone's life better.
            </p>
          </motion.div>

          <div className="campaign-grid">
            {campaigns.map((campaign, index) => {
              const percentage = Math.round(
                (campaign.raised / campaign.goal) * 100
              );

              return (
                <motion.article
                  className="campaign-card"
                  key={campaign.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.12 }}
                  whileHover={{
                    y: -12,
                    rotateX: 2,
                    rotateY: -2,
                  }}
                >
                  <div className="campaign-image">
                    <img
                      src={campaign.image}
                      alt={campaign.title}
                    />

                    <span className="category">
                      {campaign.category}
                    </span>

                    <button className="heart-button">♡</button>
                  </div>

                  <div className="campaign-content">
                    <h3>{campaign.title}</h3>

                    <div className="progress-info">
                      <strong>
                        ₹{campaign.raised.toLocaleString()}
                      </strong>

                      <span>{percentage}%</span>
                    </div>

                    <div className="progress-bar">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{
                          width: `${percentage}%`,
                        }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 1.2,
                          delay: 0.3,
                        }}
                      />
                    </div>

                    <div className="campaign-bottom">
                      <span>
                        Goal ₹{campaign.goal.toLocaleString()}
                      </span>

                      <button onClick={() => navigate("/register")}>
  Support →
</button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

          <div className="center-button">
            <button
  className="outline-button"
  onClick={() => navigate("/campaigns")}
>
  View all campaigns →
</button>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="why-section" id="about">
        <div className="section-container">
          <motion.div
            className="why-content"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-label">WHY KINDORA</span>

            <h2>
              Giving should feel
              <span> meaningful.</span>
            </h2>

            <p>
              We bring donors and verified NGOs together through
              technology designed around transparency, trust and
              measurable impact.
            </p>

            <div className="feature-list">
              <div>
                <span>✓</span>
                <p>
                  <strong>Verified organizations</strong>
                  <small>Every NGO goes through our verification process.</small>
                </p>
              </div>

              <div>
                <span>✓</span>
                <p>
                  <strong>Transparent donations</strong>
                  <small>See exactly where your contribution goes.</small>
                </p>
              </div>

              <div>
                <span>✓</span>
                <p>
                  <strong>Real measurable impact</strong>
                  <small>Track the difference your donation creates.</small>
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="why-visual"
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="why-circle">
              <div className="circle-inner">
                <span>♥</span>
                <strong>1</strong>
                <small>donation</small>
              </div>
            </div>

            <div className="orbit orbit-one">
              <span>💧</span>
            </div>

            <div className="orbit orbit-two">
              <span>📚</span>
            </div>

            <div className="orbit orbit-three">
              <span>🍲</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="cta-glow" />

        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="cta-box"
          >
            <span className="section-label">YOUR TURN</span>

            <h2>
              Someone out there
              <br />
              needs <span>your help.</span>
            </h2>

            <p>
              You don't need to change the whole world.
              Start by changing one person's world.
            </p>

            <button
  className="primary-button large"
  onClick={() => navigate("/register")}
>
  Start making an impact
  <span>↗</span>
</button>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="logo">
            <div className="logo-mark">✦</div>
            <span>Kindora</span>
          </div>

          <p>Technology that turns kindness into impact.</p>

          <span>© 2026 Kindora</span>
        </div>
      </footer>
    </main>
  );
}