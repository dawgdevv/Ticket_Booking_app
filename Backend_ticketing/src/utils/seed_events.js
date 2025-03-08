import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "../models/events.model.js";

dotenv.config();
const Events = [
	{
		name: "Joji: Nectar World Tour",
		date: new Date("2025-03-20"),
		location: "Madison Square Garden, New York, USA",
		description:
			"The soulful genius Joji performs his iconic tracks from the 'Nectar' album live for a global audience.",
		price: 2500, // Price in local currency
		image: "https://images2.alphacoders.com/109/1098560.jpg",
	},
	{
		name: "Travis Scott: UTOPIA Carnival",
		date: new Date("2025-04-15"),
		location: "NRG Stadium, Houston, Texas, USA",
		description:
			"A high-energy carnival headlined by Travis Scott featuring wild stage setups, rides, and the UTOPIA album live.",
		price: 4000,
		image: "https://wallpaperaccess.com/full/2110678.jpg",
	},
	{
		name: "Kanye West: Yeezus Resurrection",
		date: new Date("2025-05-10"),
		location: "O2 Arena, London, UK",
		description:
			"The man, the myth, the controversy—Kanye West performs his greatest hits with visuals to blow your mind.",
		price: 5000,
		image:
			"https://wallpapers.com/images/hd/kanye-west-ye-2560-x-1440-yrktxaqotpzswru6.jpg",
	},
	{
		name: "Tomorrowland 2025",
		date: new Date("2025-07-18"),
		location: "Boom, Belgium",
		description:
			"The ultimate electronic dance music festival featuring Tiësto, Martin Garrix, Armin van Buuren, and more.",
		price: 6000,
		image:
			"https://wallpapers.com/images/high/tomorrowland-the-circus-rwvlx7esm8punaxr.webp",
	},
	{
		name: "Sabrina Carpenter World Tour",
		date: new Date("2025-09-15"),
		location: "Los Angeles, United States",
		description:
			"Join Sabrina Carpenter on her sensational world tour, featuring captivating performances and her greatest hits.",
		price: 1200,
		image:
			"https://media1.houstonpress.com/hou/imager/new-headline/u/magnum/19232954/img_9556.jpg?cb=1730101156",
	},
	{
		name: "Comedy Roast Night with Kevin Hart",
		date: new Date("2025-08-01"),
		location: "The Wiltern, Los Angeles, USA",
		description:
			"A gut-busting comedy show where Kevin Hart roasts everyone and everything in his hilarious signature style.",
		price: 1500,
		image:
			"https://wallpapers.com/images/hd/stand-up-comedian-kevin-hart-0324eqnid6gi4k3j.jpg",
	},
	{
		name: "Desert Mirage Rave Festival",
		date: new Date("2025-09-10"),
		location: "Black Rock Desert, Nevada, USA",
		description:
			"An insane rave party featuring Alesso, Skrillex, and Diplo in the middle of the desert. Glow sticks mandatory.",
		price: 3500,
		image: "https://static.spin.com/files/120608-edc.png",
	},
	{
		name: "Billie Eilish World Tour",
		date: new Date("2025-10-10"),
		location: "New York City, United States",
		description:
			"Immerse yourself in the hauntingly beautiful music of Billie Eilish as she takes you on a journey with her world tour.",
		price: 1800,
		image:
			"https://spectrumculture.com/wp-content/uploads/2022/03/UTK4R40Q.jpeg",
	},
	{
		name: "Burning Man Festival",
		date: new Date("2025-08-25"),
		location: "Black Rock City, Nevada, USA",
		description:
			"A mind-bending week of radical self-expression, art installations, and EDM under the stars.",
		price: 7000,
		image:
			"https://pohcdn.com/guide/sites/default/files/styles/node__blog_post__bp_banner__blog_post_banner/public/2022-08/burningmantaschen.jpeg",
	},
	{
		name: "Mike Tyson vs Jake Paul: The Ultimate Showdown",
		date: new Date("2025-12-05"),
		location: "Las Vegas, United States",
		description:
			"Witness history in the making as boxing legend Mike Tyson faces off against internet sensation Jake Paul in a clash of generations.",
		price: 5000,
		image:
			"https://www.hollywoodreporter.com/wp-content/uploads/2024/06/GettyImages-2152814911.jpg",
	},
	{
		name: "Post Malone: Beerbongs & Bentleys Tour",
		date: new Date("2025-09-05"),
		location: "Rogers Arena, Vancouver, Canada",
		description:
			"Posty performs hits like 'Rockstar' and 'Circles' while shotgunning beers with the crowd. Vibes: immaculate.",
		price: 3200,
		image:
			"https://www.udiscovermusic.com/wp-content/uploads/2020/08/Post-Malone-GettyImages-1210482021-1000x600.jpg",
	},
	{
		name: "The Weeknd: After Hours Til Dawn",
		date: new Date("2025-06-18"),
		location: "MetLife Stadium, New Jersey, USA",
		description:
			"The Weeknd takes you on a journey through his hauntingly beautiful discography with jaw-dropping visuals.",
		price: 4500,
		image:
			"https://images.squarespace-cdn.com/content/v1/5f0f5bfe2654745635bfd2f2/60f5a6ea-4f23-4474-922c-e55ca9070314/WKND+Jason+Ardizzone-West+AR8A3443.jpg",
	},
	{
		name: "Dua Lipa World Tour",
		date: new Date("2025-08-20"),
		location: "London, United Kingdom",
		description:
			"Experience the electrifying performances of Dua Lipa as she lights up the stage on her world tour.",
		price: 1500,
		image:
			"https://phantom-marca.unidadeditorial.es/ba8a0ba63d3ae4b0538aa93fb00080a5/crop/0x0/2044x1363/resize/828/f/jpg/assets/multimedia/imagenes/2024/06/30/17197723157256.jpg",
	},
	{
		name: "Harry Styles: Love On Tour",
		date: new Date("2025-05-25"),
		location: "Wembley Stadium, London, UK",
		description:
			"Harry Styles serenades you with his angelic voice, funky outfits, and iconic stage presence.",
		price: 3800,
		image: "https://i.ytimg.com/vi/Fulf3ZWnE4Q/maxresdefault.jpg",
	},
	{
		name: "NVIDIA Mega Event 2025",
		date: new Date("2025-06-20"),
		location: "San Francisco, United States",
		description:
			"Join NVIDIA's groundbreaking mega event to explore the future of AI, gaming, and cutting-edge technologies.",
		price: 2500,
		image:
			"https://www.nvidia.com/content/dam/en-zz/en_sg/ai-conference/ai-conference-fb-og.jpg",
	},
	{
		name: "Boiler Room Rave Night",
		date: new Date("2025-04-30"),
		location: "Berlin, Germany",
		description:
			"Experience underground techno in its purest form as Boiler Room hosts the wildest rave of the year.",
		price: 2500,
		image:
			"https://cdn.sanity.io/images/pge26oqu/production/250a2cff1d34bd8c6d93699beb3483e003d7f19f-1920x1280.jpg?bg=000000&w=960&h=540&fit=fill",
	},
	{
		name: "J. Cole: Dreamville Festival",
		date: new Date("2025-09-22"),
		location: "Dorothea Dix Park, Raleigh, North Carolina, USA",
		description:
			"J. Cole brings out the entire Dreamville crew and some surprise guests to light up the stage.",
		price: 3000,
		image:
			"https://www.okayplayer.com/media-library/drake-and-j-cole-for-dreamville-festival-2023.jpg?id=33626608&width=1245&height=700&quality=90&coordinates=0%2C57%2C0%2C69",
	},
	{
		name: "Red Bull Rampage",
		date: new Date("2025-10-20"),
		location: "Virgin, Utah, USA",
		description:
			"Watch adrenaline junkies pull off death-defying tricks in the ultimate freeride mountain biking event.",
		price: 1500,
		image: "https://cdn.mos.cms.futurecdn.net/8F5VmmTMHxZYQMPgiKCYdJ.jpg",
	},
	{
		name: "Comedy Festival: Dave Chappelle & Friends",
		date: new Date("2025-06-10"),
		location: "Radio City Music Hall, New York, USA",
		description:
			"Dave Chappelle hosts a star-studded night of side-splitting comedy featuring his A-list comedian pals.",
		price: 2500,
		image:
			"https://img.resized.co/hotpress/eyJkYXRhIjoie1widXJsXCI6XCJodHRwczpcXFwvXFxcL21lZGlhLmhvdHByZXNzLmNvbVxcXC91cGxvYWRzXFxcLzIwMjJcXFwvMDVcXFwvMDQwOTIwMDFcXFwvU2NyZWVuLVNob3QtMjAyMi0wNS0wNC1hdC0wOS4xOS40MS5wbmdcIixcIndpZHRoXCI6XCI5NjhcIixcImhlaWdodFwiOlwiXCIsXCJkZWZhdWx0XCI6XCJodHRwczpcXFwvXFxcL3d3dy5ob3RwcmVzcy5jb21cXFwvaVxcXC9uby1pbWFnZS5wbmc_dj05XCIsXCJvcHRpb25zXCI6W119IiwiaGFzaCI6ImUyNGEyZmFkMzZmNjg2M2NjYzZjMDk1YWEyYjI2MmYxZTA5ODRmYzkifQ==/screen-shot-2022-05-04-at-09-19-41.png",
	},
	{
		name: "Ultra Music Festival",
		date: new Date("2025-03-22"),
		location: "Bayfront Park, Miami, USA",
		description:
			"A massive EDM extravaganza with sets by Marshmello, Deadmau5, and The Chainsmokers.",
		price: 5000,
		image: "https://umfworldwide.com/wp-content/uploads/2024/06/stage-2.png",
	},
];

const seedEvents = async () => {
	try {
		await mongoose.connect(
			"mongodb+srv://nishantraj:nishant24@cluster0.0p0yq.mongodb.net/test_db?retryWrites=true&w=majority",
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
