const mongoose = require("mongoose");

const InstitutionSchema = mongoose.Schema(
    {
        nombre: {
            type: String
        },
        oficinas: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Office",
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Institution", InstitutionSchema);