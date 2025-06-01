import axios from 'axios';

const BASE_URL = ""; //removing this URL "http://127.0.0.1:8000"

export const fetchData = async (endpoint) => {
  const res = await axios.get(`${BASE_URL}/${endpoint}`);
  return res.data;
};