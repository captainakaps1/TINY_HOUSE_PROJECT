import cloudinary from "cloudinary"


export const Cloudinary = {
    upload : async (image: string) => {
        const result = cloudinary.v2.uploader.upload(image, {
            api_key: process.env.CLOUDINARY_KEY,
            api_secret: process.env.CLOUDINARY_SECRET,
            cloud_name: process.env.CLOUDINARY_NAME,
            folder: "TH_Assets/",
        })

        return (await result).secure_url
    }
}