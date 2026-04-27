import axios from "axios";
import { refreshTokenService } from '../service/auth.service.js'
import { logout } from '../features/auth/authSlice.js'
import store from '../stores/store.js'

const axiosInstance = axios.create({
	baseURL: import.meta.mode === "development" ? "http://localhost:5000/api" : "/api",
	withCredentials: true, // send cookies to the server with request
});

//shared promise to prevent multiple refresh call
let refreshPromise = null

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
				refreshPromise = refreshTokenService();
				await refreshPromise;
				refreshPromise = null;

				//retry original request
				return axiosInstance(originalRequest)

			} catch (refreshError) {
				refreshPromise = null;

				store.dispatch(logout())

				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error)
	}
);

export default axiosInstance;