import axios from 'axios';

const API_URL = 'http://localhost:5000'; 

export const fetchComments = async (youtubeLink) => {
  try {
    const response = await axios.post(`${API_URL}/comments`, { youtubeLink });
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};
