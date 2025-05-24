import mongoose from "mongoose";

const connectToDatabase = async () =>{
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("kết nói database thành công");
    } catch (error) {
        console.log(error)
    }
}

export default connectToDatabase;
    