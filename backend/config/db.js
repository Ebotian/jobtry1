import mongoose from "mongoose";

const mongoURI =
	process.env.MONGODB_URI || "mongodb://localhost:27017/news_crawler";

mongoose
	.connect(mongoURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("MongoDB connected"))
	.catch((err) => {
		console.error("MongoDB connection error:", err);
		process.exit(1);
	});

export default mongoose;
