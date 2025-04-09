const mongoose = require("mongoose");

const LogSchema = mongoose.Schema (
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        action: {
            type: String
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Log", LogSchema);
