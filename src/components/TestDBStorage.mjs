import { API, graphqlOperation, Storage } from "aws-amplify";
import { createUser } from "../../graphql/queries";

for (i = 0; i < 100; i++) {
  let userData = {
    email_address: "someTestUsersEmail@school.email.com",
    postal_code: "k5bw9m",
    province: "BC",
    email_notice: true,
    sms_notice: false,
  };
  await API.graphql(graphqlOperation(createUser, userData));
}
