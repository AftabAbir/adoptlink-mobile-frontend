import axios from "../axiosConfig";

export const logoutUser = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  try {
    await axios.put(`/api/users/${user.id}/offline`);
  } catch (err) {
    console.error("Failed to mark user offline");
  }

  localStorage.removeItem("user");
};
