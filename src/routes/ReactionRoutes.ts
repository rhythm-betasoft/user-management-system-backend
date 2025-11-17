import { Router } from "express";
import { ReactionController } from "../controllers/ReactionController";

const router = Router();
const reactioncontroller = new ReactionController();

router.post("/reaction", reactioncontroller.addOrToggle);
router.get("/reaction/:announcementId", reactioncontroller.listForAnnouncement);

export default router;