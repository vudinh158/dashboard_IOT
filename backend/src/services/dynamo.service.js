import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "ap-southeast-1" });
const ddb = DynamoDBDocumentClient.from(client);
const TABLE = process.env.TABLE_NAME || "SensorReadings";

// Ví dụ: trả latest mỗi device (tuỳ schema của bạn, tạm dùng Scan để test)
export async function listDevicesLatest() {
  try {
    // TODO: nếu bạn có GSI cho latest, chuyển sang Query để tối ưu
    const resp = await ddb.send(new ScanCommand({
      TableName: TABLE,
      Limit: 200
    }));
    return resp.Items || [];
  } catch (err) {
    console.error("[DDB] listDevicesLatest error:", err.name, err.message, { table: TABLE });
    throw err;
  }
}

export async function getLatestReading(deviceId) {
  try {
    // TODO: thay bằng Query theo PK/SK của bạn
    const resp = await ddb.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "deviceId = :id",
      ExpressionAttributeValues: { ":id": deviceId },
      ScanIndexForward: false,
      Limit: 1
    }));
    return (resp.Items || [])[0];
  } catch (err) {
    console.error("[DDB] getLatestReading error:", err.name, err.message, { deviceId });
    throw err;
  }
}

export async function listReadings(deviceId, limit = 50) {
  try {
    const resp = await ddb.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "deviceId = :id",
      ExpressionAttributeValues: { ":id": deviceId },
      ScanIndexForward: false,
      Limit: limit
    }));
    return resp.Items || [];
  } catch (err) {
    console.error("[DDB] listReadings error:", err.name, err.message, { deviceId, limit });
    throw err;
  }
}

export async function ingest(payload) {
  try {
    const item = {
      ...payload,
      ts: payload.ts || new Date().toISOString()
    };
    await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
    return item;
  } catch (err) {
    console.error("[DDB] ingest error:", err.name, err.message);
    throw err;
  }
}
