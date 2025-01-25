import express from 'express';
import { 
    joinAuction, 
    placeBid, 
    getAuctionItems,
    endAuction
} from '../controllers/auctionjoincontroller.js';
import { authenticateUser } from "../middlewares/auth.js";

const router = express.Router();

router.post("/auction/:id/join", authenticateUser, joinAuction);
router.post("/auction/:id/bid", authenticateUser, placeBid);
router.post("/auction/:id/end", authenticateUser, endAuction);
router.get("/auctionitems", authenticateUser, getAuctionItems);

export default router;