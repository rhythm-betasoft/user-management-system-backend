import {Router} from 'express'
import {PermissionController} from '../controllers/permissionController'
const router=Router();
const permissioncontroller=new PermissionController()
router.post('/add',permissioncontroller.createPermission)
router.get('/list',permissioncontroller.getPermissionlist)
router.put('/update',permissioncontroller.updateUserPermission)
export default router;