import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "da55goplw",
  api_key: process.env.CLOUDINARY_API_KEY || "711133234327316",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "m3UQNKEd-zcfjyUsZF4zeaKUxW0",
});

export { cloudinary };
