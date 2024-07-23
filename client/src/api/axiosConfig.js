import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', // Remember to write for production environment.
  withCredentials: true,
});

export default api;
