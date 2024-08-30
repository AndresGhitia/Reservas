import mongoose from "mongoose";

export const connectDB = async() => {
    await mongoose.connect('mongodb+srv://proyectobookit:123qwe@cluster0.za8vg.mongodb.net/bookit').then(()=>console.log("DB Connected"))
}