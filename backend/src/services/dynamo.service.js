import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  QueryCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});
const ddb = DynamoDBDocumentClient.from(client);

const TABLE = process.env.TABLE_NAME || "SensorReadings";

/**
 * Quét nhẹ bảng chỉ lấy field cần (giảm payload),
 * có thể giới hạn tối đa số bản ghi đọc (default 2000).
 */
export async function scanDevicesProjection(limit = 2000) {
  try {
    const resp = await ddb.send(
      new ScanCommand({
        TableName: TABLE,
        Limit: limit,
        ProjectionExpression:
          "deviceId, temperature, humidity, ts, deviceName, #st",
        ExpressionAttributeNames: { "#st": "status" },
      })
    );
    return resp.Items || [];
  } catch (err) {
    console.error(
      "[DDB] scanDevicesProjection error:",
      err.name,
      err.message,
      { table: TABLE }
    );
    throw err;
  }
}

/**
 * Lấy bản ghi mới nhất của 1 device (yêu cầu table có PK=deviceId, SK=ts khi Query;
 * nếu chưa có GSI phù hợp, tạm thời có thể fallback bằng Scan filter theo deviceId).
 */
export async function getLatestReading(deviceId) {
  try {
    // Thử Query (nếu table của bạn đang model PK=deviceId, SK=ts)
    const resp = await ddb.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: "deviceId = :id",
        ExpressionAttributeValues: { ":id": deviceId },
        ScanIndexForward: false, // sort desc
        Limit: 1,
      })
    );
    if (resp.Items?.length) return resp.Items[0];

    // Fallback (ít dùng): Scan + filter (kém hiệu năng)
    const scan = await ddb.send(
      new ScanCommand({
        TableName: TABLE,
        FilterExpression: "deviceId = :id",
        ExpressionAttributeValues: { ":id": deviceId },
        ProjectionExpression:
          "deviceId, temperature, humidity, ts, deviceName, #st",
        ExpressionAttributeNames: { "#st": "status" },
      })
    );
    if (!scan.Items?.length) return null;
    return scan.Items.sort(
      (a, b) => new Date(b.ts) - new Date(a.ts)
    )[0];
  } catch (err) {
    console.error("[DDB] getLatestReading error:", err.name, err.message, {
      deviceId,
    });
    throw err;
  }
}

/**
 * Danh sách readings của 1 device (mặc định 50 bản ghi mới nhất).
 */
export async function listReadings(deviceId, limit = 50) {
  try {
    const resp = await ddb.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: "deviceId = :id",
        ExpressionAttributeValues: { ":id": deviceId },
        ScanIndexForward: false, // newest first
        Limit: limit,
      })
    );
    return resp.Items || [];
  } catch (err) {
    console.error("[DDB] listReadings error:", err.name, err.message, {
      deviceId,
      limit,
    });
    throw err;
  }
}

/**
 * Ghi 1 reading (Simulator/thiết bị thật). Nếu không có ts thì auto ISO.
 */
export async function ingest(payload) {
  try {
    const item = {
      ...payload,
      ts: payload.ts || new Date().toISOString(),
    };
    await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
    return item;
  } catch (err) {
    console.error("[DDB] ingest error:", err.name, err.message);
    throw err;
  }
}
