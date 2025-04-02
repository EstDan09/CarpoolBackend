const mongoose = require("mongoose");

const ParameterSchema = mongoose.Schema(
  {
    parameterName: {
      type: String,
      required: true,
      trim: true,
    },
    parameterList: { 
      type: [String],
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Parameter", ParameterSchema);