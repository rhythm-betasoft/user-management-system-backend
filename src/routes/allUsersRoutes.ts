import {Router} from "express"
import allUsersController from "../controllers/allUsersController"
const router=Router();
const alluserscontroller=new allUsersController()
router.get("/list",alluserscontroller.getAllUsers)
router.delete("/delete/:id", alluserscontroller.deleteUser); 
router.put("/:id/pin", alluserscontroller.togglePin);
router.get("/religion-counts", alluserscontroller.getReligionCounts);
router.put("/update/:id",alluserscontroller.editUser)
export default router   