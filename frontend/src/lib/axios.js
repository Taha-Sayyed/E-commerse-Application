import axios from "axios";

const axiosInstance = axios.create({
	baseURL: import.meta.mode === "development" ? "http://localhost:5000/api" : "/api",
	withCredentials: true, // send cookies to the server with request
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