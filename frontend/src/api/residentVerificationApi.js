import axios from 'axios';

const API = 'http://localhost:5000/api/resident-verification';

//export const searchUser = (keyword) => axios.get(`${API}/search-user?keyword=${keyword}`);
export const searchUser = async (req, res) => {
  try {
    const { query } = req.query;
    const user = await User.findOne({
      $or: [{ name: query }, { email: query }] // Adjust 'name' to match your User model
    }).select('name email phone _id'); // Ensure these fields are selected
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getApartments = () => axios.get(`${API}/apartments`);
export const submitVerification = (data) => axios.post(`${API}/verify`, data);
