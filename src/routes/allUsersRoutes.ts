import {Router} from "express"
import allUsersController from "../controllers/allUsersController"
import {authMiddleware} from '../middlewares/authMiddleware'
const router=Router();
const alluserscontroller=new allUsersController()
router.get("/list",alluserscontroller.getAllUsers)
router.delete("/delete/:id", alluserscontroller.deleteUser); 
router.put("/:id/pin", alluserscontroller.togglePin);
router.get("/religion-counts", alluserscontroller.getReligionCounts);
router.put("/update/:id",alluserscontroller.editUser)
router.patch("/update/role",authMiddleware,alluserscontroller.assignRole)
export default router   