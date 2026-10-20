import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { fetchAuthSession } from "aws-amplify/auth";

export async function getGoogleMapsApiKey():Promise<string>{
    const session = await fetchAuthSession();
    const credentials = session.credentials;
    if (!credentials) {
        throw new Error("No IAM credentials in auth session");
    }
    const secret_name = "google-maps-api-key";
  
    const client = new SecretsManagerClient({
      region: "us-east-1",
      credentials
    });
    
    let response:any;
    
    try {
      response = await client.send(
        new GetSecretValueCommand({
          SecretId: secret_name,
          VersionStage: "AWSCURRENT",
        })
      );
    } catch (error) {
      throw error;
    }
    
    return response.SecretString;
}
