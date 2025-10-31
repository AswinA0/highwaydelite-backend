import { createClient } from "redis";

let redisClient;
let isConnecting = false;
let isConnected = false;

const getRedisClient = async () => {
  if (isConnected && redisClient) {
    return redisClient;
  }

  if (isConnecting) {
    // Wait for connection to complete
    while (isConnecting) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return redisClient;
  }

  isConnecting = true;

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) return new Error("Max retries reached");
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on("error", (err) => console.error("Redis Client Error", err));

    await redisClient.connect();
    isConnected = true;
    isConnecting = false;

    return redisClient;
  } catch (error) {
    isConnecting = false;
    console.error("Failed to connect to Redis:", error);
    throw error;
  }
};

export default getRedisClient;
