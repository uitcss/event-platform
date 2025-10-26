import EventSetting from "../models/EventSettings.js";



export const setEventSetting = async (req, res) => {
  try {
    const { setting_key, setting_value } = req.body;

    if (!setting_key || setting_value === undefined) {
      return res.status(400).json({ message: "Both setting_key and setting_value are required" });
    }

    // Update if exists, else create
    const setting = await EventSetting.findOneAndUpdate(
      { setting_key },
      { setting_value, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "Setting saved successfully", setting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a setting by key
export const getEventSetting = async (req, res) => {
  try {
    const { key } = req.body;
    const setting = await EventSetting.findOne({ setting_key: key });

    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }

    res.status(200).json(setting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all settings
export const getAllEventSettings = async (req, res) => {
  try {
    const settings = await EventSetting.find();
    res.status(200).json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a setting by key
export const deleteEventSetting = async (req, res) => {
  try {
    const { key } = req.body;
    
    if (!key) {
      return res.status(400).json({ message: "Setting key is required" });
    }

    const result = await EventSetting.deleteOne({ setting_key: key });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Setting not found" });
    }

    res.status(200).json({ message: "Setting deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
