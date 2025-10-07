import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const TABLE_READINGS = process.env.TABLE_READINGS;
const TABLE_LATEST = process.env.TABLE_LATEST;

function parseBody(event) {
  try {
    if (event?.body) {
      return typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    }
    return event;
  } catch (e) {
    console.error("Invalid JSON body", e);
    throw { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }
}

export const handler = async (event) => {
  try {
    const body = parseBody(event);
    const deviceId = body?.deviceId;
    if (!deviceId) {
      return { statusCode: 400, body: JSON.stringify({ error: "deviceId is required" }) };
    }
    const now = new Date();
    const tsIso = body?.ts ?? now.toISOString();
    const tsEpoch = body?.tsEpoch ?? Math.floor(now.getTime() / 1000);
    const temperature = Number(body?.temperature);
    const humidity = Number(body?.humidity);
    const extra = body?.extra ?? {};

    // 1) Append to SensorReadings
    await ddb.send(new PutCommand({
      TableName: TABLE_READINGS,
      Item: {
        deviceId,
        ts: tsIso,
        tsEpoch,
        temperature,
        humidity,
        ...extra,
      }
    }));

    // 2) Upsert into DeviceLatest (only if newer)
    await ddb.send(new UpdateCommand({
      TableName: TABLE_LATEST,
      Key: { deviceId },
      UpdateExpression: "SET lastTs = :iso, lastEpoch = :epoch, temperature = :t, humidity = :h, updatedAt = :u",
      ConditionExpression: "attribute_not_exists(lastEpoch) OR :epoch > lastEpoch",
      ExpressionAttributeValues: {
        ":iso": tsIso,
        ":epoch": tsEpoch,
        ":t": temperature,
        ":h": humidity,
        ":u": new Date().toISOString()
      }
    }));

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    if (err?.name === "ConditionalCheckFailedException") {
      return { statusCode: 200, body: JSON.stringify({ ok: true, ignored: "older reading" }) };
    }
    console.error(err);
    const status = err?.statusCode ?? 500;
    return { statusCode: status, body: JSON.stringify({ error: err?.message ?? "Internal error" }) };
  }
};