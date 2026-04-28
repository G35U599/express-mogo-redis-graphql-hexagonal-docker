import mongoose from "mongoose";

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error("La variable de entorno MONGO_URI es obligatoria");
}

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("📦 MongoDB conectado");
  } catch (error) {
    console.error("Error conectando a MongoDB", error);
  }
};

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

export const UserModel = mongoose.model("User", userSchema);
