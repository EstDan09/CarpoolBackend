const mongoose = require("mongoose"),
  bcrypt = require('bcryptjs'),
  SALT_WORK_FACTOR = 10;

const UserSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    secondName: {
      type: String,
      required: false,
      trim: true,
    },
    firstLastname: {
      type: String,
      required: true,
      trim: true,
    },
    secondLastname: {
      type: String,
      required: false,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "IdentificationType",
      required: true,
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

UserSchema.pre('save', function(next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) return next(err);

      // hash the password using our new salt
      bcrypt.hash(user.password, salt, function(err, hash) {
          if (err) return next(err);
          // override the cleartext password with the hashed one
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
