
import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>

      <div className="container py-5">
        <div className="row g-4">

          {/* Brand */}
          <div className="col-lg-4 col-md-6">
            <Link to="/" className={styles.logo}>
              Campus<span>Bite</span>
            </Link>

            <p className={styles.description}>
              Your favorite campus food, just a few clicks away.
              Order online, skip the queue, and enjoy your time.
            </p>

            <div className={styles.social}>
              <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6">
            <h5>Quick Links</h5>

            <ul className={styles.links}>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/profile">My Profile</Link></li>
              <li><a href="/#universities">Universities</a></li>
              <li><a href="/#how-it-works">How It Works</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-lg-3 col-md-6">
            <h5>Our Services</h5>

            <ul className={styles.links}>
              <li>Online Food Ordering</li>
              <li>Campus Restaurants</li>
              <li>Fast Pickup</li>
              <li>Order Tracking</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-lg-3 col-md-6">
            <h5>Contact Us</h5>

            <ul className={styles.contact}>
              <li>📧 support@campusbite.com</li>
              <li>📍 Egypt</li>
              <li>🕒 Available 24/7</li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Footer */}
      <div className={styles.bottom}>
        <div className="container d-flex flex-wrap justify-content-between align-items-center gap-2">
          <p className="mb-0">
            © 2026 CampusBite. All Rights Reserved.
          </p>

          <p className="mb-0">
            Made with ❤️ for university students
          </p>
        </div>
      </div>

    </footer>
  );
}
