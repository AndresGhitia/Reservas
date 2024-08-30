import express from "express"
import { addRubro,listRubro,removeRubro } from "../controllers/rubroController.js"
import multer from "multer"

const rubroRouter = express.Router()

// Image Storage Engine

const storage = multer.diskStorage({
    destination:"uploads",
    filename:(req,file,cb) =>{
        return cb(null,`${Date.now(file.originalname)}`)
    }
})

const upload = multer({storage:storage})

rubroRouter.post("/add",upload.single("image"),addRubro)
rubroRouter.get("/list",listRubro)
rubroRouter.post("/remove",removeRubro)






export default rubroRouter