import { RedisClientType, createClient } from "redis";

export const REDIS_CHANNEL = "pubusb"

export class RedisClient {
    private redisClient: RedisClientType

    constructor() {
        this.redisClient = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        })
        this.redisClient.connect()
    }

    async publish(channel: string, message: any) {
        await this.redisClient.publish(channel, JSON.stringify(message))
    }

    async consume(channel: string, callback: (message: string) => void) {
        await this.redisClient.subscribe(channel, callback)
    }
}
