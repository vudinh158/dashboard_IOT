// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// import {
//   DynamoDBDocumentClient,
//   PutCommand,
//   QueryCommand,
//   ScanCommand,
// } from "@aws-sdk/lib-dynamodb";

// const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ap-southeast-1";
// const TABLE = process.env.TABLE_NAME || "SensorReadings";

// const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
// const docClient = DynamoDBDocumentClient.from(ddb);
// export async function putReading(item) {
//   await ddb.send(
//     new PutCommand({
//       TableName: TABLE,
//       Item: item,
//     })
//   );
// }

// // Lấy readings mới nhất của 1 device
// export async function getLatestReading(deviceId) {
//   console.log('TABLE:', process.env.TABLE_NAME);
// console.log('REGION:', process.env.AWS_REGION);
// console.log('Has creds?', !!process.env.AWS_ACCESS_KEY_ID);

//   const out = await ddb.send(
//     new QueryCommand({
//       TableName: TABLE,
//       KeyConditionExpression: "deviceId = :d",
//       ExpressionAttributeValues: { ":d": deviceId },
//       ScanIndexForward: false, // newest first
//       Limit: 1,
//     })
//   );
//   return out.Items?.[0];
// }

// // Lấy list readings cho 1 device
// export async function getReadings(deviceId, limit = 50) {
//   const out = await ddb.send(
//     new QueryCommand({
//       TableName: TABLE,
//       KeyConditionExpression: "deviceId = :d",
//       ExpressionAttributeValues: { ":d": deviceId },
//       ScanIndexForward: false,
//       Limit: limit,
//     })
//   );
//   return out.Items || [];
// }

// // Lấy danh sách device kèm bản ghi mới nhất
// // Cách đơn giản: Scan tất cả rồi giảm (OK cho demo; production nên có GSI LastUpdated)
// export async function listDevicesLatest() {
//   const out = await ddb.send(new ScanCommand({ TableName: TABLE, Limit: 2000 }));
//   const lastMap = {};
//   for (const it of out.Items || []) {
//     if (!lastMap[it.deviceId] || Number(it.ts) > Number(lastMap[it.deviceId].ts)) {
//       lastMap[it.deviceId] = it;
//     }
//   }
//   return Object.values(lastMap).sort((a, b) => Number(b.ts) - Number(a.ts));
// }


import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

// --- BẮT ĐẦU SỬA LỖI ---

// Lấy region từ biến môi trường mà ECS cung cấp.
// Nếu không có, fallback về 'ap-southeast-1'.
const AWS_REGION = process.env.AWS_REGION || "ap-southeast-1";

// Khởi tạo client với region được chỉ định rõ ràng.
// Điều này sẽ giải quyết dứt điểm lỗi timeout.
const client = new DynamoDBClient({ region: AWS_REGION });

// --- KẾT THÚC SỬA LỖI ---

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || "SensorReadings";

// ... (các hàm bên dưới giữ nguyên, không cần thay đổi) ...

export async function putReading(item) {
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
  });
  return docClient.send(command);
}

export async function getLatestReading(deviceId) {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: "deviceId = :id",
    ExpressionAttributeValues: { ":id": deviceId },
    ScanIndexForward: false, // sort descending
    Limit: 1,
  });
  const { Items } = await docClient.send(command);
  return Items?.[0];
}

export async function getReadings(deviceId, limit = 50) {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: "deviceId = :id",
    ExpressionAttributeValues: { ":id": deviceId },
    ScanIndexForward: false,
    Limit: limit,
  });
  const { Items } = await docClient.send(command);
  return Items;
}

export async function listDevicesLatest() {
  // NOTE: This is NOT a scalable way. Use for demo only
  const command = new ScanCommand({
    TableName: TABLE_NAME,
    ProjectionExpression: "deviceId, deviceName, updatedAt",
  });
  const { Items } = await docClient.send(command);
  // a Set will store only unique deviceId
  const uniqueIds = [...new Set(Items.map((item) => item.deviceId))];
  const promises = uniqueIds.map((id) => getLatestReading(id));
  return Promise.all(promises);
}
