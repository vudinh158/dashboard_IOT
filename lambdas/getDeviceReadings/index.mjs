// Lambda: query SensorReadings for a device (with range and limit)
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const TABLE_READINGS = process.env.TABLE_READINGS;

export const handler = async (event) => {
  try {
    const qp = event?.queryStringParameters || {};
    const id = event?.pathParameters?.id || qp?.id;
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: "id required" }) };

    const limit = Math.min(Number(qp?.limit ?? 50), 500);
    const from = qp?.from; // ISO
    const to = qp?.to;     // ISO
    let KeyConditionExpression = "#d = :id";
    let ExpressionAttributeNames = { "#d": "deviceId" };
    let ExpressionAttributeValues = { ":id": id };

    if (from && to) {
      KeyConditionExpression += " AND #ts BETWEEN :from AND :to";
      ExpressionAttributeNames["#ts"] = "ts";
      ExpressionAttributeValues[":from"] = from;
      ExpressionAttributeValues[":to"] = to;
    }

    const resp = await ddb.send(new QueryCommand({
      TableName: TABLE_READINGS,
      KeyConditionExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      Limit: limit,
      ScanIndexForward: false, // newest first
    }));

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(resp.Items ?? []),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal error" }) };
  }
};
