import axios from 'axios';

const API_URL = 'http://localhost:5002/api/chat';

export const sendMessage = async (message) => {
  const response = await axios.post(API_URL, { message });
  return response.data;
};
