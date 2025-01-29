const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB povezan: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Greška pri povezivanju sa MongoDB: ${error.message}`);
    process.exit(1); // Zaustavi aplikaciju ako ne može da se poveže
  }
};

module.exports = connectDB;
