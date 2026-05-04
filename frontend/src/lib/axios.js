import axios from "axios";

const axiosInstance = axios.create({
	baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api",
	withCredentials: true, // send cookies to the server with request
});

// Fetch CSRF token and store it
let csrfToken = null;

export const initCsrf = async () => {
  try {
    const { data } = await axiosInstance.get('/auth/csrf-token');
    csrfToken = data.csrfToken;
  } catch (error) {
    console.error("Failed to initialize CSRF token", error);
  }
};

// Attach token to every mutating request automatically
axiosInstance.interceptors.request.use((config) => {
  const mutating = ['post', 'put', 'patch', 'delete'];
  if (csrfToken && mutating.includes(config.method)) {
    config.headers['x-csrf-token'] = csrfToken;
  }
  return config;
});

//shared promise to prevent multiple refresh call
let refreshPromise = null
let isLoggingOut = false

axiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		//check 401 & avoid infinite loop
		if (
			error.response?.status === 401 &&
			!originalRequest._retry &&
			!originalRequest.url.includes("/auth/refresh-token")
		) {
			originalRequest._retry = true;
			try {
				// if refresh already happening → wait
				if (refreshPromise) {
					await refreshPromise;
					return axiosInstance(originalRequest)
				}

				// start refresh
				refreshPromise = axiosInstance.post("/auth/refresh-token");
				await refreshPromise;
				refreshPromise = null;

				//retry original request
				return axiosInstance(originalRequest)

			} catch (refreshError) {
				refreshPromise = null;

				if (!isLoggingOut) {
					isLoggingOut = true;
					const { logout } = await import('../features/auth/authSlice.js');
					const store = (await import('../stores/store.js')).default;
					store.dispatch(logout()).finally(() => { isLoggingOut = false; });
				}

				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error)
	}
);

export default axiosInstance;