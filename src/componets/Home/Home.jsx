import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchUniversities } from "../../services/universities";
import styles from "./Home.module.css";

const steps = [
  {
    icon: "🏫",
    title: "Choose University",
    text: "Select your university to find available restaurants."
  },
  {
    icon: "🍔",
    title: "Choose Your Food",
    text: "Explore menus and add your favorite meals to the cart."
  },
  {
    icon: "📱",
    title: "Place Your Order",
    text: "Confirm your order and choose your pickup time."
  },
  {
    icon: "🚀",
    title: "Pick It Up",
    text: "Get notified when your food is ready for pickup."
  }
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    fetchUniversities().then(setUniversities).catch(() => setUniversities([]));
  }, []);

  const filtered = universities.filter((u) =>
    `${u.name} ${u.city}`.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <>
      <section className={`${styles.hero} py-5`}>
        <div className="container py-lg-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span className={styles.tag}>Food Ordering Made Easy</span>

              <h1 className="display-4 fw-bold my-3">
                Skip The Queue.
                <br />
                <span className={styles.green}>Enjoy Your Time.</span>
              </h1>

              <p className="text-secondary fs-5 mb-4">
                Order your favorite food from your university campus.
                Save your time and pick up your order when it's ready.
              </p>

              <a
                href="#universities"
                className={`btn btn-lg fw-bold ${styles.btnAccent}`}
              >
                Explore Universities →
              </a>
            </div>

            <div className="col-lg-5 d-flex justify-content-lg-end">
              <div className={`card border-0 shadow text-center p-4 ${styles.heroCard}`}>
                <div className={styles.foodIcon}>🍔</div>
                <h3 className={`h5 mt-2 ${styles.green}`}>
                  Your Food, Your Time!
                </h3>
                <p className="text-secondary">
                  Order now and avoid waiting in long queues.
                </p>
                <div className={`rounded py-2 small ${styles.ready}`}>
                  ✓ Ready for pickup
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`container py-5 ${styles.anchor}`} id="universities">
        <span className={styles.tag}>Find Your Campus</span>

        <h2 className="fw-bold mt-2">Choose Your University</h2>

        <p className="text-secondary">
          Find your university and explore its restaurants.
        </p>

        <div className="input-group my-4" style={{ maxWidth: 500 }}>
          <span className="input-group-text bg-white">🔍</span>

          <input
            type="text"
            className="form-control"
            placeholder="Search for your university..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="row g-4">
          {filtered.length > 0 ? (
            filtered.map((u) => (
              <div className="col-12 col-sm-6 col-lg-3" key={u._id}>
                <div className={`card h-100 border-0 shadow-sm p-3 ${styles.uniCard}`}>
                  <div className={`${styles.logo} d-flex align-items-center justify-content-center fw-bold fs-5`}>
                    {u.logo || u.name.slice(0, 2).toUpperCase()}
                  </div>

                  <h3 className="h5 mt-3">{u.name}</h3>

                  <p className="text-secondary small mb-3">
                    📍 {u.city}
                  </p>

                  <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-auto small">
                    <span>🍽️ {u.placesCount || 0} Places</span>

                    <Link
                      to={`/universities/${u._id}`}
                      className={`fw-bold ${styles.green}`}
                    >
                      Explore →
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12"><p className="text-secondary">No universities available yet. <Link to="/universities">Open university directory</Link></p></div>
          )}
        </div>
      </section>

      <section className={`bg-white py-5 text-center ${styles.anchor}`} id="how-it-works">
        <div className="container">
          <span className={styles.tag}>Simple Steps</span>

          <h2 className="fw-bold mt-2 mb-4">How 3Gahez Works</h2>

          <div className="row g-4">
            {steps.map((s) => (
              <div className="col-6 col-lg-3" key={s.title}>
                <div className={`${styles.step} rounded-3 p-4 h-100`}>
                  <div className={styles.stepIcon}>{s.icon}</div>

                  <h3 className={`h5 my-2 ${styles.green}`}>
                    {s.title}
                  </h3>

                  <p className="text-secondary small mb-0">
                    {s.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}