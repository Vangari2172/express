import mongoose from "mongoose"

const connectDB = async () => {
  try {
    // For SRV connection strings, the database name should be part of the options,
    // or specified in the URI before the query string.
    // A reliable way is to use the `dbName` option.
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
    })

    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    )
    console.log(
      `Successfully connected to database: '${connectionInstance.connection.name}'`
    )
  } catch (error) {
    console.error("MONGODB connection error", error)
    process.exit(1)
  }
}

export default connectDB
