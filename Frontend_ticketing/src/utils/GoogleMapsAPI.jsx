import axios from "axios";

/**
 * Fetch Indian cities using OpenStreetMap Nominatim API.
 * @returns {Promise<{ name: string, state: string }[]>} A promise that resolves to an array of cities.
 */
export async function getIndianCities() {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?country=India&format=json`
    );

    const cities = response.data.map((result) => {
      return { 
        name: result.address.city || result.address.town || result.address.village, 
        state: result.address.state || "Unknown" 
      };
    });


    return cities;
  } catch (error) {
    console.error("Error fetching Indian cities:", error);
    return [];
  }
}
