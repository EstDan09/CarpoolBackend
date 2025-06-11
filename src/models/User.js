const mongoose = require("mongoose"),
  bcrypt = require('bcryptjs'),
  SALT_WORK_FACTOR = 10;

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    firstSurname: {
      type: String,
      required: true,
      trim: true,
    },
    secondSurname: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: Number,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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
      type: String,
      enum: ["Cedula", "DIMEX", "Pasaporte"],
      required: false,
    },
    identificationNumber: {
      type: Number,
      required: false,
      unique: true,
    },
    birthDate: {
      type: Date,
      required: true
    },
    genre: {
      type: String,
      enum: ["Masculino", "Femenino", "Otro"],
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
      enum: ["Administrador", "Usuario", "Inactivo - Admin", "Inactivo - User"],
      required: true,
    },
    role: {
      type: String,
      enum: ["Conductor", "Pasajero"],
      required: true,
    },
    vehicles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
      },
    ],
    notifications: [
      {
        title: { type: String, required: true },
        subtitle: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', function(next) {
  var user = this;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function(err, hash) {
          if (err) return next(err);
          user.password = hash;
          next();
      });
  });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
      if (err) return cb(err);
      cb(null, isMatch);
  });
};

module.exports = mongoose.model("User", UserSchema);
