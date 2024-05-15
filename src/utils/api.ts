import { apiUrl } from '../config';

function api<T>(url: string, options): Promise<T> {
  return fetch(url, { headers: authHeader(false), ...options }).then(
    (response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json() as Promise<T>;
    }
  );
}

function get<T>(url, options?) {
  return api<T>(apiUrl + url, options);
}
function post<T>(url, data, options?, isNotJson?: boolean) {
  return api<T>(apiUrl + url, {
    ...options,
    method: 'POST',
    body: isNotJson ? data : JSON.stringify(data)
  });
}
function patch<T>(url, data, options?) {
  return api<T>(apiUrl + url, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}
function deletes<T>(url, options?) {
  return api<T>(apiUrl + url, { ...options, method: 'DELETE' });
}
export function authHeader(publicRoute) {
  // return authorization header with jwt token
  let accessToken = localStorage.getItem('accessToken');

  if (!publicRoute && accessToken) {
    return {
      Authorization: 'Bearer ' + accessToken,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
  } else {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
  }
}
export default { get, patch, post, deletes };
