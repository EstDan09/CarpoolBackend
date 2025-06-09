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
      },
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
          enum: ["Pendiente", "Aprobado", "Rechazado", "Cancelado"],
          default: "Pendiente",
        },
      },
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
    costPerPerson: {
      type: Number,
      required: function () {
        return this.paymethod !== "Gratuito";
      },
      min: 0,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

TripSchema.virtual("totalCollected").get(function () {
  if (!this.passengers || !Array.isArray(this.passengers)) return 0;

  const approvedCount = this.passengers.filter(p => p.status === "Aprobado").length;
  return approvedCount * (this.costPerPerson || 0);
});

module.exports = mongoose.model("Trip", TripSchema);
