import mongoose from "mongoose";

const eventSettingSchema = new mongoose.Schema({
  setting_key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  setting_value: {
    type: mongoose.Schema.Types.Mixed, // can store String, Number, Boolean, Object
    required: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const EventSetting = mongoose.model("EventSetting", eventSettingSchema);
export default EventSetting;
