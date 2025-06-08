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
                    enum: ["Pendiente", "Aprobado", "Rechazado"],
                    default: "Pendiente",
                },
            }
        ],
        passengers: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                status: {
                    type: String,
                    enum: ["Pendiente", "Aprobado", "Rechazado"],
                    default: "Pendiente",
                },
            }
        ],
        driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        paymethod: {
                    type: String,
                    enum: ["Gratuito", "Sinpe", "Efectivo"],
                    default: "Gratuito",
                },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Trip", TripSchema);

//metodo de pago