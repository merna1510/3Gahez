import api from './api';

export async function fetchUniversities() {
  const response = await api.get('/universities');
  return response.data.data.universities;
}

export async function fetchUniversity(id) {
  const response = await api.get(`/universities/${id}`);
  return response.data.data.university;
}
