const express = require("express");
const {protect} = require("../Middleware/authMiddle")
const {accessChat,fetchChat,createGroupChat,renameGroup,AddinGroup,removeFromGroup} = require("../controllers/chatControllers")
const router = express.Router();

router.route('/').post(protect, accessChat);
router.route('/').get(protect, fetchChat);
router.route('/group').post(protect, createGroupChat);
router.route('/rename').put(protect, renameGroup);
router.route('/groupremove').put(protect,removeFromGroup);
router.route('/groupadd').put(protect, AddinGroup);

module.exports = router;




