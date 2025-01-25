import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const events = [
	{
		name: "Jaipur Literature Festival",
		date: new Date("2025-01-25"),
		location: "Jaipur, Rajasthan, India",
		description:
			"An annual literary extravaganza bringing together authors, thinkers, and readers from around the world.",
		price: 500,
		image:
			"https://indiaholidaymall.com/images/blog/Jaipur-Literature-Festival.jpg",
	},
	{
		name: "Rajasthan International Folk Festival",
		date: new Date("2025-10-01"),
		location: "Mehrangarh Fort, Jaipur, Rajasthan, India",
		description:
			"A celebration of Rajasthani and global folk music in the stunning backdrop of Mehrangarh Fort.",
		price: 1000,
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
		price: 1500,
		image:
			"https://www.motownindia.com/images/Auto-Industry/Ground-breaking-innovations-unveiled-as-TrafficInfraTech-Expo-opens-its-doors-Motown-India-Bureau-2-3511.jpg",
	},
	{
		name: "Pink City Food Carnival",
		date: new Date("2025-04-05"),
		location: "Central Park, Jaipur, Rajasthan, India",
		description:
			"A culinary festival celebrating diverse food cultures with top chefs and local cuisine.",
		price: 200,
		image:
			"https://static.tripzilla.in/media/55293/conversions/9536682d-94e3-4e08-9e9b-3175a5231c6f-w768.webp",
	},
	{
		name: "Jaipur Art and Craft Fair",
		date: new Date("2025-07-20"),
		location: "Jawahar Kala Kendra, Jaipur, Rajasthan, India",
		description:
			"An art fair promoting traditional Rajasthani crafts and modern art, with exhibitions and live art demos.",
		price: 300,
		image:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmKPS56f9w-54FjJw-mMlKxI3h_gP1xBQgAA&s",
	},
	{
		name: "Desert Rock Music Fest",
		date: new Date("2025-11-18"),
		location: "Jaipur Polo Grounds, Jaipur, Rajasthan, India",
		description:
			"A rock music festival featuring live performances by popular bands and indie musicians from India.",
		price: 800,
		image: "https://festup.in/wp-content/uploads/2024/01/image-174.png",
	},
	{
		name: "Jaipur International Film Festival",
		date: new Date("2025-02-01"),
		location: "Inox Crystal Palm, Jaipur, Rajasthan, India",
		description:
			"A film festival showcasing cinema from around the world, with screenings, panel discussions, and workshops.",
		price: 1200,
		image: "https://www.jiffindia.org/documents/HOME-3.jpg",
	},
	{
		name: "Bangalore EDM Carnival",
		date: new Date("2025-03-30"),
		location: "Lalbagh Gardens, Bangalore, India",
		description:
			"Get wasted while vibing to the world's sickest DJs dropping bass so heavy it'll rearrange your brain cells.",
		price: 2000,
		image:
			"https://res.cloudinary.com/https-highape-com/image/upload/q_auto:eco,f_auto,h_380/v1729717589/cfii4oeggv03sshaxdpj.png",
	},
	{
		name: "Chennai Reggae Bash",
		date: new Date("2025-05-15"),
		location: "Elliot's Beach, Chennai, India",
		description:
			"Feel the beat, smoke the vibe, and party under the stars at India’s ultimate reggae beach festival.",
		price: 1200,
		image: "https://i.ytimg.com/vi/J_xcycjomuA/maxresdefault.jpg",
	},
	{
		name: "Mumbai Neon Party Cruise",
		date: new Date("2025-08-22"),
		location: "Gateway of India, Mumbai, India",
		description:
			"A lit AF neon-themed cruise party with DJs, booze, and a view to die for. Come dressed to glow!",
		price: 5000,
		image:
			"https://www.travelandtourworld.com/wp-content/uploads/2023/12/luxurious-cruise-1.jpg",
	},
	{
		name: "Pune Psytrance Madness",
		date: new Date("2025-09-09"),
		location: "Near Mulshi Lake, Pune, India",
		description:
			"An outdoor psytrance rave in the heart of nature. Lose your mind to insane visuals and trippy beats.",
		price: 1800,
		image:
			"https://i0.wp.com/picjumbo.com/wp-content/uploads/party-dj-in-dance-music-club-free-photo.jpg?w=2210&quality=70",
	},
	{
		name: "K-Pop Universe India",
		date: new Date("2025-07-03"),
		location: "Indira Gandhi Indoor Stadium, Delhi, India",
		description:
			"A K-Pop fan's dream event with live performances, cosplay contests, and dance-off battles. Annyeonghaseyo!",
		price: 3500,
		image:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIJkrJkI7FlKe5wo_YG3QRDw07zVoD6cQgIA&s",
	},
	{
		name: "Kerala Carnival of Color",
		date: new Date("2025-12-20"),
		location: "Alleppey Backwaters, Kerala, India",
		description:
			"A vibrant festival where the backwaters explode with colors, music, and street parades.",
		price: 1500,
		image:
			"https://miro.medium.com/v2/resize:fit:1200/1*F0GkpLiuaxwntEM9APAHDw.jpeg",
	},
	{
		name: "Travis Scott's Desert Rager",
		date: new Date("2025-11-10"),
		location: "Thar Desert, Rajasthan, India",
		description:
			"Rage in the sands with Cactus Jack himself. Mind-blowing visuals, explosive beats, and an unforgettable night.",
		price: 8000,
		image:
			"https://i0.wp.com/ballerstatus.com/wp-content/uploads/2024/11/01.jpg?fit=2000%2C1200&ssl=1",
	},
	{
		name: "Nagaland Hornbill Festival",
		date: new Date("2025-12-01"),
		location: "Kisama Heritage Village, Nagaland, India",
		description:
			"Experience Nagaland's incredible tribal culture, music, and dance at the festival of festivals.",
		price: 1000,
		image:
			"https://th-i.thgim.com/public/incoming/m2l1u9/article67557173.ece/alternates/LANDSCAPE_1200/10_SM_naga_tribe.jpg",
	},
	{
		name: "Goa Carnival of Chaos",
		date: new Date("2025-02-10"),
		location: "Panaji, Goa, India",
		description:
			"Parades, masks, parties, and mayhem. Celebrate Goa like a local at this old-school carnival.",
		price: 1000,
		image:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRP8wEdbKlUEoWUbAPPKDUZCz_uB3Dk4a5Qrg&s",
	},
	{
		name: "Hyderabad Comic Con",
		date: new Date("2025-09-25"),
		location: "Hitex Exhibition Center, Hyderabad, India",
		description:
			"Geek out at the biggest comic convention in India with celebrity guests, exclusive merch, and epic cosplay.",
		price: 1500,
		image:
			"https://hyderabadmail.com/wp-content/uploads/2024/11/Untitled-design-2024-11-07T161841.568.jpg",
	},
	{
		name: "Delhi Salsa Congress",
		date: new Date("2025-08-14"),
		location: "The Leela Ambience, Delhi, India",
		description:
			"Feel the heat with international salsa dancers, workshops, and sizzling performances that'll set the floor on fire.",
		price: 3000,
		image:
			"https://imgstaticcontent.lbb.in/lbbnew/wp-content/uploads/2018/01/09213208/TheSwingers1-600x400.jpg",
	},
	{
		name: "Sunburn Goa",
		date: new Date("2025-12-29"),
		location: "Vagator Beach, Goa, India",
		description:
			"Asia's biggest EDM festival. Lose yourself in world-class beats, beach vibes, and unforgettable experiences.",
		price: 4500,
		image:
			"https://sundaysforever-bucket.s3.ap-south-1.amazonaws.com/1700637033164.webp",
	},
	{
		name: "Spiti Valley Adventure Festival",
		date: new Date("2025-08-20"),
		location: "Spiti Valley, Himachal Pradesh, India",
		description:
			"A rugged adventure fest in the high-altitude deserts of Spiti. Think trekking, rock climbing, and bonfire parties under the stars.",
		price: 2500,
		image:
			"https://www.bikatadventures.com/images/Gallery/IMG1000X548/img-spiti-ice-climbing-festival6310-Bikat-Adventures.jpg",
	},
	{
		name: "Kolkata Jazz Festival",
		date: new Date("2025-11-05"),
		location: "Rabindra Sadan, Kolkata, India",
		description:
			"Smooth tunes, world-class artists, and a classy crowd. Perfect for a jazzy evening in the cultural heart of India.",
		price: 1200,
		image:
			"https://mediaindia.eu/wp-content/uploads/2017/12/20171208_204455-1-1200x675.jpg",
	},
	{
		name: "Manali Winter Rave",
		date: new Date("2025-12-15"),
		location: "Solang Valley, Manali, Himachal Pradesh, India",
		description:
			"Snow, beats, and fire vibes at this exclusive winter rave in the snowy paradise of Manali.",
		price: 3000,
		image:
			"https://i0.wp.com/walkingwanderer.com/wp-content/uploads/2017/03/manali-manualaya.jpg?resize=960%2C453",
	},
	{
		name: "Varanasi Spiritual Music Festival",
		date: new Date("2025-02-22"),
		location: "Dashashwamedh Ghat, Varanasi, India",
		description:
			"Immerse yourself in soulful Indian classical music right by the Ganges. An ethereal experience like no other.",
		price: 800,
		image:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSatc2_2fU6RkArThtI37UaNJ5UjJTdiyFlyA&s",
	},
	{
		name: "Mumbai Night Run Festival",
		date: new Date("2025-06-10"),
		location: "Marine Drive, Mumbai, India",
		description:
			"A glow-in-the-dark marathon paired with live music, dance zones, and energy bars. Run, party, repeat!",
		price: 700,
		image: "https://www.goldmedalindia.com/img/about/events/GSC2.jpg",
	},
	{
		name: "Ziro Music Festival",
		date: new Date("2025-09-21"),
		location: "Ziro Valley, Arunachal Pradesh, India",
		description:
			"India’s coolest indie music festival held in the picturesque Ziro Valley. Music, nature, and pure vibes.",
		price: 2000,
		image: "https://arunachalobserver.org/wp-content/uploads/2024/06/ZFM.jpg",
	},
	{
		name: "Jaipur Hot Air Balloon Festival",
		date: new Date("2025-10-15"),
		location: "Amber Fort, Jaipur, Rajasthan, India",
		description:
			"Fly high over the Pink City during this stunning balloon fest, paired with food stalls and live performances.",
		price: 3500,
		image:
			"https://i.natgeofe.com/n/afed8e9e-e199-4f29-a4a2-846ea2ebe432/albuquerque-balloon-festival-new-mexico.jpg",
	},
	{
		name: "Bangalore Oktoberfest",
		date: new Date("2025-10-05"),
		location: "UB City, Bangalore, India",
		description:
			"Beer, bratwurst, and Bavarian vibes right here in India. Get ready to chug like never before!",
		price: 1000,
		image:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIskUetNDXfpd0tEsQ3RvcjIgCkkcH4z92-w&s",
	},
	{
		name: "Andaman Underwater Festival",
		date: new Date("2025-11-25"),
		location: "Havelock Island, Andaman & Nicobar Islands, India",
		description:
			"Snorkeling, scuba diving, and epic underwater parties. The ocean comes alive at this tropical paradise.",
		price: 4000,
		image:
			"https://utsav.gov.in/public/uploads/event_picture_image/event_834/16614285781208334019.jpg",
	},
	{
		name: "Pushkar Camel Fair Rave",
		date: new Date("2025-11-12"),
		location: "Pushkar, Rajasthan, India",
		description:
			"A crazy twist on the traditional camel fair: desert raves, bonfire parties, and art installations.",
		price: 1500,
		image:
			"https://www.tripsavvy.com/thmb/--xKuF4KkxW9r6hi4sj-Ap7zkuM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-109686750-59d5e29faad52b0010d4ca6f.jpg",
	},
	{
		name: "Delhi Urban Art Week",
		date: new Date("2025-04-18"),
		location: "Connaught Place, Delhi, India",
		description:
			"Street art, graffiti battles, and live murals. Celebrate the artistic pulse of Delhi’s streets.",
		price: 500,
		image:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9lfSfLuypioeEe6PePq0Tgp4H02pYsH9wrg&s",
	},
];

function getEventDetails(eventName = "") {
	const event = events.find((e) =>
		e.name.toLowerCase().includes(eventName.toLowerCase())
	);
	return event ? event : { message: "Event not found" };
}

export const getEventInfo = async (query) => {
	try {
		const prompt = `You are a helpful event assistant. Please help with the following query about events: ${query}
    
Available events:
${events.map((event) => `- ${event.name}: ${event.description}`).join("\n")}

If asked about specific event details, I'll provide them.`;

		const result = await model.generateContent(prompt);
		const response = result.response.text();

		// Check if response mentions any event name
		const eventMentioned = events.some((event) =>
			query.toLowerCase().includes(event.name.toLowerCase())
		);

		if (eventMentioned) {
			const event = events.find((event) =>
				query.toLowerCase().includes(event.name.toLowerCase())
			);

			if (event) {
				return {
					answer: response,
					eventDetails: event,
				};
			}
		}

		return {
			answer: response,
			eventDetails: null,
		};
	} catch (error) {
		console.error("Error in getEventInfo:", error);
		throw error;
	}
};
