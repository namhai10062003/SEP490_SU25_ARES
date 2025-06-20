import PostPackage from '../models/Postpackage.js';
export const getPackage = async (req, res) => {
    const getpackage = await PostPackage.find()
     res.status(201).json(getpackage)
}
