import rubroModel from "../models/rubroModel.js";
import fs from 'fs'


// add rubro item

const addRubro = async (req, res) => {

    let image_filename = `${req.file.filename}`

    const rubro = new rubroModel({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: image_filename
    })
    try {
        await rubro.save();
        res.json({ success: true, message: "Rubro Añadido" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error" })
    }
}

// all rubro list
const listRubro = async (req, res) => {
    try {
        const rubros = await rubroModel.find({})
        res.json({ success: true, data: rubros })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error" })
    }
}

// remove rubro item

const removeRubro = async (req, res) => {
    try {
        const rubro = await rubroModel.findById(req.body.id)
        fs.unlink(`uploads/${rubro.image}`, () => { })

        await rubroModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Rubro Removed"})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:"Error"})

    }
}

export { addRubro, listRubro, removeRubro }