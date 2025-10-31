import { uploadImage } from "../services/uploadImage.js";
export const createExperiences = async (req, res, next) => {
  const { title, description, price, preferedPaymentMethod,location } = req.body;
  try {
    if (!req.files || req.files.length === 0) {
      return next(new ErrorHandler(400, "At least one image is required"));
    }

    const uploadedImages = await Promise.all(
      req.files.map((file) => uploadImage(file, "experiences"))
    );

    const imageUrls = uploadedImages.map((img) => img.secure_url);

    const experience = await prisma.package.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        thumbnailImages: imageUrls,
        preferedPaymentMethod,
        location
      },
    });
    res.status(201).json({ id: experience.id, imageUrls });
  } catch (error) {
    console.error("Error creating experience:", error);
    return next(new ErrorHandler(500, "Internal Server Error"));
  }
};

export const deleteExperience = async (req, res, next) => {
  const { id } = req.params;
  try{
    await prisma.package.delete({
        where:{
            id: parseInt(id)
        }
    })
  } catch (error) {
    console.error("Error deleting experience:", error);
    return next(new ErrorHandler(500, "Internal Server Error"));
  }
}
