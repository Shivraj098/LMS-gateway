import mongoose from "mongoose";

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

class DatabaseConnection {
  constructor() {
    this.retryCount = 0;
    this.isConnected = false;

    mongoose.set("strictQuery", true);

    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
      this.isConnected = true;
      this.retryCount = 0; // Reset retry count on successful connection
    });
    mongoose.connection.on("error", () => {
      console.log("MongoDB connection ERROR");
      this.isConnected = false;
    });
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      this.isConnected = false;
      this.handleDisconnection();
    });

    process.on("SIGTERM", this.handleAppTermination.bind(this));
  }

  async connect() {
    try {
      if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined in environment variables");
      }
      const connectionOptions = {
        maxPoolSize: 10, // Adjust pool size as needed
        serverSelectionTimeoutMS: 5000, // 5 seconds
        socketTimeoutMS: 45000, // 45 seconds
        family: 4, // Use IPv4
      };

      if (process.env.NODE_ENV === "development") {
        mongoose.set("debug", true);
      }
      await mongoose.connect(process.env.MONGO_URI, connectionOptions);
      this.retryCount = 0; // Reset retry count on successful connection
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      await this.handleConnectionError();
    }
  }

  async handleConnectionError() {
    if (this.retryCount < MAX_RETRIES) {
      this.retryCount++;
      console.log(
        `Retrying MongoDB connection (${this.retryCount}/${MAX_RETRIES})...`,
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return this.connect();
    } else {
      console.error("Max retries reached. Could not connect to MongoDB.");
      process.exit(1);
    }
  }

  async handleDisconnection() {
    if (!this.isConnected && this.retryCount < MAX_RETRIES) {
      this.retryCount++;
      
      console.log("Attempting to reconnect to MongoDB...");
      await this.connect();
    }
  } // Handle isconnection

  async handleAppTermination() {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
      process.exit(1);
    }
  }
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }
}

const dbConnection = new DatabaseConnection();

export default dbConnection.connect.bind(dbConnection);
export const getConnectionStatus =
  dbConnection.getConnectionStatus.bind(dbConnection);
