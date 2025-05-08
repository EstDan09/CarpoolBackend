const mongoose = require("mongoose");

const TripSchema = mongoose.Schema(
    {
        startpoint: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Place",
            required: true,
        },
        endpoint: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Place",
            required: true,
        },
        departure: {
            type: Date,
            required: true,
        },
        arrival: {
            type: Date,
            required: true,
        },
        stops: [
            {
                place: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Place",
                    required: true,
                },
                status: {
                    type: String,
                    enum: ["pending", "accepted", "denied"],
                    default: "pending",
                },
            }
        ],
        passengers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        costPerPerson: {
            type: Number,
            required: true
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Trip", TripSchema);
