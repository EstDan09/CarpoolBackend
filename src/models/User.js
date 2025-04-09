const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    identificationTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IdentificationType",
      required: true,
    },
    identificationNumber: {
      type: Number,
      required: false,
    },
    birthDate: {
      type: Date,
      required: true
    },
    genre: {
      type: String,
      enum: ["male", "female", "other"],
      required: false,
    },
    photoKey: {
      type: String,
      required: false,
    },
    photoUrl: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      enum: ["admin", "user"],
      required: true,
    },
    role: {
      type: String,
      enum: ["driver", "passenger"],
      required: true,
    },
    vehicles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
