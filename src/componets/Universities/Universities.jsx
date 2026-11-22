import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchUniversities } from '../../services/universities';
import { getApiError } from '../../services/api';
import styles from './Universities.module.css';

export default function Universities() {
  const [universities, setUniversities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetchUniversities()
      .then((data) => { if (active) setUniversities(data); })
      .catch((err) => { if (active) setError(getApiError(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => universities.filter((university) =>
    `${university.name} ${university.city}`.toLowerCase().includes(search.trim().toLowerCase())
  ), [universities, search]);

  return (
    <main className={`container py-5 ${styles.page}`}>
      <div className="text-center mb-4">
        <span className="badge text-bg-light mb-2">Find Your Campus</span>
        <h1 className="fw-bold">Choose Your University</h1>
        <p className="text-secondary">Explore your campus and discover nearby food places.</p>
      </div>
      <div className="mx-auto mb-4" style={{ maxWidth: 560 }}>
        <input className="form-control form-control-lg" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by university or city..." aria-label="Search universities" />
      </div>
      {loading && <p className="text-center text-secondary">Loading universities...</p>}
      {error && <div className="alert alert-warning text-center">{error}<div className="small mt-1">Check that the backend is running and that universities have been added to the database.</div></div>}
      {!loading && !error && filtered.length === 0 && <p className="text-center text-secondary">No universities found.</p>}
      <div className="row g-4">
        {filtered.map((university) => (
          <div className="col-12 col-sm-6 col-lg-4" key={university._id}>
            <article className={`card h-100 border-0 shadow-sm ${styles.card}`}>
              <div className={styles.logoWrap}>
                {university.logo ? <img src={university.logo} alt={`${university.name} logo`} className={styles.logo} /> : <span>{university.name?.slice(0, 2).toUpperCase()}</span>}
              </div>
              <div className="card-body d-flex flex-column">
                <h2 className="h5 fw-bold">{university.name}</h2>
                <p className="text-secondary mb-3">📍 {university.city}</p>
                <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                  <span className="small text-secondary">🍽️ {university.placesCount || 0} Places</span>
                  <Link to={`/universities/${university._id}`} className="btn btn-outline-primary btn-sm">Explore →</Link>
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>
    </main>
  );
}
