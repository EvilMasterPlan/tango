import axios from "axios";
import { useState, useEffect } from "react";

export const getUrl = (path) => {
	const baseURL = import.meta.env.DEV 
		? '/api'
		: 'https://www.overmind.wiki/api';
	
	const fullURL = `${baseURL}/${path}`;
	return fullURL;
};

export const makeGetRequest = async (url) => {
	const response = await axios.get(url);
	return response.data;
};

export const makePostRequest = async (url, body = {}) => {
	const response = await axios.post(url, body);
	return response.data;
};

/**
 * Custom hook for API calls with loading, error, and data states
 * @param {Function} apiCall - The async function to call
 * @param {Array} dependencies - Dependencies array for useEffect
 * @returns {Object} - { isLoading, error, data, refetch }
 */
export const useApiCall = (apiCall, dependencies = []) => {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [data, setData] = useState(null);

	const executeCall = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const result = await apiCall();
			setData(result);
		} catch (err) {
			setError(err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		executeCall();
	}, dependencies);

	// Manual refetch function
	const refetch = () => {
		executeCall();
	};

	return { isLoading, error, data, refetch };
};