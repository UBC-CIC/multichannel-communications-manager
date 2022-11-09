let AWS = require("aws-sdk");
let postgres = require("postgres");
AWS.config.update({ region: "ca-central-1" });

let secretsManager = new AWS.SecretsManager();

const SM_EXAMPLE_DATABASE_CREDENTIALS = "psotgre-dev";
const URL_RDS_PROXY =
  "ised-postgre-dev.proxy-cl8adcwqdt44.ca-central-1.rds.amazonaws.com";

// let { SM_EXAMPLE_DATABASE_CREDENTIALS, URL_RDS_PROXY } = process.env;

handler({})
  .then()
  .catch((err) => console.log(err));

async function handler(event) {
  let sm = await secretsManager
    .getSecretValue({ SecretId: SM_EXAMPLE_DATABASE_CREDENTIALS })
    .promise();
  let credentials = JSON.parse(sm.SecretString);

  let connectionConfig = {
    host: URL_RDS_PROXY,
    port: credentials.port,
    username: credentials.username,
    password: credentials.password,
    database: credentials.dbname,
    ssl: true,
  };

  let sql = postgres(connectionConfig);
  let payload = {};

  // let parkingColumns = event.info.selectionSetList.filter(
  //   (item) => !item.startsWith("car")
  // );
  let [parking] = await sql`SELECT * FROM Parking WHERE id = PRK01`;

  payload = { ...parking };

  await sql.end({ timeout: 0 });

  console.log(payload);
  return payload;
}

module.exports = { handler };
