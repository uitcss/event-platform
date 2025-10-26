import express from "express";
import {
  setEventSetting,
  getEventSetting,
  getAllEventSettings,
  deleteEventSetting
} from "../controllers/eventSettingController.js";
import authMiddleware from "../middleware/adminAuthMiddleware.js";

const eventSettingRoute = express.Router();

eventSettingRoute.use(authMiddleware);

eventSettingRoute.post("/set", setEventSetting);          // Set or update a setting
eventSettingRoute.get("/get", getEventSetting);      // Get setting by key
eventSettingRoute.get("/all", getAllEventSettings);      // Get all settings

// Delete a setting by key
eventSettingRoute.delete("/delete", deleteEventSetting);

export default eventSettingRoute;