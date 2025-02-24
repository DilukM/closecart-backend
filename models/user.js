import mongu from "mongoose";
const { Schema, models, model } = mongu;

import jwtokn from "jsonwebtoken";
const { sign } = jwtokn;

import bycrpt from "bcryptjs";
const { genSalt, hash, compare } = bycrpt;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  shop: {
    type: Schema.ObjectId,
    ref: "Shop",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await compare(enteredPassword, this.password);
};

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return sign(
    { id: this._id, email: this.email, shopId: this.shop },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

export default models.User || model("User", UserSchema);
