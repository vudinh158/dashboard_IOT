import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ap-southeast-1";
const TABLE = process.env.TABLE_NAME || "SensorReadings";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
const docClient = DynamoDBDocumentClient.from(ddb);
export async function putReading(item) {
  await ddb.send(
    new PutCommand({
      TableName: TABLE,
      Item: item,
    })
  );
}

// Lấy readings mới nhất của 1 device
export async function getLatestReading(deviceId) {
  console.log('TABLE:', process.env.TABLE_NAME);
console.log('REGION:', process.env.AWS_REGION);
console.log('Has creds?', !!process.env.AWS_ACCESS_KEY_ID);

  const out = await ddb.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "deviceId = :d",
      ExpressionAttributeValues: { ":d": deviceId },
      ScanIndexForward: false, // newest first
      Limit: 1,
    })
  );
  return out.Items?.[0];
}

// Lấy list readings cho 1 device
export async function getReadings(deviceId, limit = 50) {
  const out = await ddb.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "deviceId = :d",
      ExpressionAttributeValues: { ":d": deviceId },
      ScanIndexForward: false,
      Limit: limit,
    })
  );
  return out.Items || [];
}

// Lấy danh sách device kèm bản ghi mới nhất
// Cách đơn giản: Scan tất cả rồi giảm (OK cho demo; production nên có GSI LastUpdated)
export async function listDevicesLatest() {
  const out = await ddb.send(new ScanCommand({ TableName: TABLE, Limit: 2000 }));
  const lastMap = {};
  for (const it of out.Items || []) {
    if (!lastMap[it.deviceId] || Number(it.ts) > Number(lastMap[it.deviceId].ts)) {
      lastMap[it.deviceId] = it;
    }
  }
  return Object.values(lastMap).sort((a, b) => Number(b.ts) - Number(a.ts));
}
