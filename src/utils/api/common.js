import axios from "axios";

export const getUrl = (path) => {
	const baseURL = import.meta.env.DEV 
		? '/api'
		: 'https://www.overmind.wiki/api';
	
	const fullURL = `${baseURL}/${path}`;
	return fullURL;
};

export const makeGetRequest = async (url) => {
	const response = await axios.get(url, { withCredentials: true });
	return response.data;
};

export const makePostRequest = async (url, body = {}) => {
	const response = await axios.post(url, body, { withCredentials: true });
	return response.data;
};