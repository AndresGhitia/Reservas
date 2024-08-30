import mongoose from "mongoose";

const rubroSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true }
});


const rubroModel = mongoose.models.rubro || mongoose.model("rubro",rubroSchema)

export default rubroModel;