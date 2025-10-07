// Lambda: get latest for a device from DeviceLatest
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const TABLE_LATEST = process.env.TABLE_LATEST;

export const handler = async (event) => {
  try {
    const id = event?.pathParameters?.id || event?.queryStringParameters?.id;
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: "id required" }) };

    const resp = await ddb.send(new GetCommand({
      TableName: TABLE_LATEST,
      Key: { deviceId: id },
    }));
    if (!resp.Item) return { statusCode: 404, body: JSON.stringify({ error: "Not found" }) };
    return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify(resp.Item) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal error" }) };
  }
};
