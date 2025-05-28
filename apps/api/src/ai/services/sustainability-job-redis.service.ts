import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export type SustainabilityJobStatus = "pending" | "done" | "error";

export interface SustainabilityJob {
  id: string;
  status: SustainabilityJobStatus;
  result?: any;
  error?: string;
  createdAt: number;
}

const JOB_TTL_SECONDS = 60 * 60; // 1 hora

export class SustainabilityJobRedisService {
  static async createJob(): Promise<SustainabilityJob> {
    const id =
      Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
    const job: SustainabilityJob = {
      id,
      status: "pending",
      createdAt: Date.now(),
    };
    await redis.hmset(`sustainability-job:${id}`, {
      status: job.status,
      createdAt: job.createdAt.toString(),
    });
    await redis.expire(`sustainability-job:${id}`, JOB_TTL_SECONDS);
    return job;
  }

  static async setJobResult(id: string, result: any) {
    await redis.hmset(`sustainability-job:${id}`, {
      status: "done",
      result: JSON.stringify(result),
    });
    await redis.expire(`sustainability-job:${id}`, JOB_TTL_SECONDS);
  }

  static async setJobError(id: string, error: string) {
    await redis.hmset(`sustainability-job:${id}`, {
      status: "error",
      error,
    });
    await redis.expire(`sustainability-job:${id}`, JOB_TTL_SECONDS);
  }

  static async getJob(id: string): Promise<SustainabilityJob | undefined> {
    const data = await redis.hgetall(`sustainability-job:${id}`);
    if (!data || !data.status) return undefined;
    return {
      id,
      status: data.status as SustainabilityJobStatus,
      result: data.result ? JSON.parse(data.result) : undefined,
      error: data.error,
      createdAt: data.createdAt ? parseInt(data.createdAt) : Date.now(),
    };
  }
}
