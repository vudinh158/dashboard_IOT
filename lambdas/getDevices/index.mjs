// Lambda: list devices from DeviceLatest (scan - demo)
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const TABLE_LATEST = process.env.TABLE_LATEST;

export const handler = async () => {
  try {
    let items = [];
    let ExclusiveStartKey = undefined;
    do {
      const resp = await ddb.send(new ScanCommand({
        TableName: TABLE_LATEST,
        ProjectionExpression: "deviceId, lastTs, lastEpoch, temperature, humidity, updatedAt",
        ExclusiveStartKey
      }));
      items = items.concat(resp.Items ?? []);
      ExclusiveStartKey = resp.LastEvaluatedKey;
    } while (ExclusiveStartKey);

    items.sort((a,b) => String(a.deviceId).localeCompare(String(b.deviceId)));
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(items),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal error" }) };
  }
};
