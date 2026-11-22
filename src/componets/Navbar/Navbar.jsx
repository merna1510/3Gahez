import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { clearSession } from '../../services/auth';
import styles from './Navbar.module.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogged, setIsLogged] = useState(Boolean(localStorage.getItem('userToken')));

  useEffect(() => {
    const syncAuth = () => setIsLogged(Boolean(localStorage.getItem('userToken')));
    window.addEventListener('auth-changed', syncAuth);
    window.addEventListener('storage', syncAuth);
    return () => {
      window.removeEventListener('auth-changed', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  const handleLogout = () => {
    clearSession();
    setIsLogged(false);
    navigate('/login');
  };

  const active = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className={`navbar navbar-expand-lg bg-white shadow-sm ${styles.navbar}`}>
      <div className="container">
        <Link className={`navbar-brand fw-bold ${styles.brand}`} to="/">3Gahez علي الجاهز</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
            <li className="nav-item"><Link className={`nav-link ${active('/')}`} to="/">Home</Link></li>
            <li className="nav-item"><Link className={`nav-link ${active('/universities')}`} to="/universities">Universities</Link></li>
            <li className="nav-item"><a className="nav-link" href="/#how-it-works">How It Works</a></li>
            {isLogged ? <>
              <li className="nav-item"><Link className={`nav-link ${active('/profile')}`} to="/profile">Profile</Link></li>
              <li className="nav-item"><button className="btn btn-outline-danger btn-sm px-3" onClick={handleLogout}>Logout</button></li>
            </> : <>
              <li className="nav-item"><Link className={`nav-link ${active('/login')}`} to="/login">Login</Link></li>
              <li className="nav-item"><Link className="btn btn-primary btn-sm px-3 text-white" to="/register">Register</Link></li>
            </>}
          </ul>
        </div>
      </div>
    </nav>
  );
}
