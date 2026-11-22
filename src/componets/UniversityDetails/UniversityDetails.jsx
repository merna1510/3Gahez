import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchUniversity } from '../../services/universities';
import { getApiError } from '../../services/api';
import styles from './UniversityDetails.module.css';

export default function UniversityDetails() {
  const { id } = useParams();
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchUniversity(id)
      .then((data) => { if (active) setUniversity(data); })
      .catch((err) => { if (active) setError(getApiError(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <p className="text-center py-5">Loading university...</p>;
  if (error) return <main className="container py-5"><div className="alert alert-danger">{error}</div><Link to="/universities">← Back to universities</Link></main>;
  if (!university) return null;

  return (
    <main className={`container py-5 ${styles.page}`}>
      <Link to="/universities" className="text-decoration-none">← All Universities</Link>
      <section className={`card border-0 shadow-sm p-4 p-md-5 mt-3 ${styles.hero}`}>
        <div className="d-flex flex-column flex-md-row align-items-md-center gap-4">
          <div className={styles.logoWrap}>{university.logo ? <img src={university.logo} alt={`${university.name} logo`} /> : <span>{university.name.slice(0, 2).toUpperCase()}</span>}</div>
          <div>
            <h1 className="fw-bold">{university.name}</h1>
            <p className="text-secondary mb-2">📍 {university.location || university.city}</p>
            <p className="mb-0">{university.description || 'Discover food and drinks available around your campus.'}</p>
          </div>
        </div>
      </section>

      <div className="d-flex justify-content-between align-items-end mt-5 mb-3">
        <div><h2 className="h3 fw-bold mb-1">Campus Places</h2><p className="text-secondary mb-0">Cafeterias and restaurants at this university.</p></div>
        <span className="badge text-bg-light">{university.placesCount || 0} Places</span>
      </div>
      {university.places?.length ? <div className="row g-3">
        {university.places.map((place) => <div className="col-12 col-sm-6 col-lg-4" key={place._id}>
          <article className="card border-0 shadow-sm h-100 overflow-hidden">
            {place.image ? <img src={place.image} alt={place.name} className={styles.placeImage} /> : <div className={styles.placePlaceholder}>🍽️</div>}
            <div className="card-body">
              <h3 className="h5 fw-bold">{place.name}</h3>
              <p className="text-secondary small mb-2">{place.type || 'Campus place'} · ⭐ {place.rating || 'New'}</p>
              <p className="small mb-0">{place.isOpen ? '🟢 Open' : '🔴 Closed'}{place.avgPrepTime ? ` · ${place.avgPrepTime} min preparation` : ''}</p>
            </div>
          </article>
        </div>)}
      </div> : <div className="alert alert-light border">No cafeterias or restaurants have been added for this university yet. They will appear here when the places team adds them.</div>}
    </main>
  );
}
