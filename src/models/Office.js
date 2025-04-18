const mongoose = require("mongoose");

const OfficeSchema = mongoose.Schema(
    {
        name: {
            type: String
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.module("Office", OfficeSchema);