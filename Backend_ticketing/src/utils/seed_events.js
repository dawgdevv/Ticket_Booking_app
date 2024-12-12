import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "../models/events.model.js";

dotenv.config();

const Events = [
	{
		name: "Jaipur Literature Festival",
		date: new Date("2025-01-25"),
		location: "Jaipur, Rajasthan, India",
		description:
			"An annual literary extravaganza bringing together authors, thinkers, and readers from around the world.",
		price: 500, // Price in rupees
		image:
			"https://indiaholidaymall.com/images/blog/Jaipur-Literature-Festival.jpg",
	},
	{
		name: "Rajasthan International Folk Festival",
		date: new Date("2025-10-01"),
		location: "Mehrangarh Fort, Jaipur, Rajasthan, India",
		description:
			"A celebration of Rajasthani and global folk music in the stunning backdrop of Mehrangarh Fort.",
		price: 1000, // Price in rupees
		image:
			"https://www.travel-rajasthan.com/images/experiance-in-rajsthan/fairs-festivals/rajasthan-international-folk-festival.jpg",
	},
	{
		name: "Jaipur Tech Expo",
		date: new Date("2025-03-15"),
		location:
			"Jaipur Exhibition and Convention Center, Jaipur, Rajasthan, India",
		description:
			"A tech event showcasing the latest innovations in software, hardware, and emerging technologies.",
		price: 1500, // Price in rupees
		image:
			"https://www.motownindia.com/images/Auto-Industry/Ground-breaking-innovations-unveiled-as-TrafficInfraTech-Expo-opens-its-doors-Motown-India-Bureau-2-3511.jpg",
	},
	{
		name: "Pink City Food Carnival",
		date: new Date("2025-04-05"),
		location: "Central Park, Jaipur, Rajasthan, India",
		description:
			"A culinary festival celebrating diverse food cultures with top chefs and local cuisine.",
		price: 200, // Price in rupees
		image:
			"https://static.tripzilla.in/media/55293/conversions/9536682d-94e3-4e08-9e9b-3175a5231c6f-w768.webp",
	},
	{
		name: "Jaipur Art and Craft Fair",
		date: new Date("2025-07-20"),
		location: "Jawahar Kala Kendra, Jaipur, Rajasthan, India",
		description:
			"An art fair promoting traditional Rajasthani crafts and modern art, with exhibitions and live art demos.",
		price: 300, // Price in rupees
		image:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmKPS56f9w-54FjJw-mMlKxI3h_gP1xBQgAA&s",
	},
	{
		name: "Desert Rock Music Fest",
		date: new Date("2025-11-18"),
		location: "Jaipur Polo Grounds, Jaipur, Rajasthan, India",
		description:
			"A rock music festival featuring live performances by popular bands and indie musicians from India.",
		price: 800, // Price in rupees
		image: "https://festup.in/wp-content/uploads/2024/01/image-174.png",
	},
	{
		name: "Jaipur International Film Festival",
		date: new Date("2025-02-01"),
		location: "Inox Crystal Palm, Jaipur, Rajasthan, India",
		description:
			"A film festival showcasing cinema from around the world, with screenings, panel discussions, and workshops.",
		price: 1200, // Price in rupees
		image: "https://www.jiffindia.org/documents/HOME-3.jpg",
	},
];

const seedEvents = async () => {
	try {
		await mongoose.connect(
			"mongodb+srv://nishantraj:nishant24@cluster0.0p0yq.mongodb.net/auth_db?retryWrites=true&w=majority",
			{}
		);

		await Event.deleteMany();
		await Event.insertMany(Events);

		console.log("Events seeded successfully");
		process.exit();
	} catch (error) {
		console.error("Error seeding events", error);
		process.exit(1);
	}
};

seedEvents();
