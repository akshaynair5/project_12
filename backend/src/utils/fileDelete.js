import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const deleteFromCloudinary = async (fileUrl,type) => {
    try {

        const parts = fileUrl.split('/');
        const fileName = parts.pop().split('.')[0]; 
        const publicId = parts.length > 1 ? `${parts.pop()}/${fileName}` : fileName;

        const res = await cloudinary.uploader.destroy(publicId, {
            resource_type: `${type}` 
        });

        return res; 
    } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        return null;
    }
}

export default deleteFromCloudinary;
