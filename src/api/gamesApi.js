import axios from "axios";

const gamesApi = axios.create({
  baseURL: " https://free-to-play-games-database.p.rapidapi.com/api",
});

export default gamesApi;
