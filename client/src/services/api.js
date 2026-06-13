const BASE_URL = 'http://localhost:3001/api';

async function request(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {},
    credentials: 'include',
  };

  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.error || 'API Request Failed');
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

export default {
  get: (endpoint) => request(endpoint),
  post: (endpoint, body) => request(endpoint, 'POST', body),
  delete: (endpoint) => request(endpoint, 'DELETE'),
};
