import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { Auth } from "aws-amplify";

export async function getGoogleMapsApiKey():Promise<string>{
    const credentials = await Auth.currentCredentials(); 
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
          VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
        })
      );
    } catch (error) {
      // For a list of exceptions thrown, see
      // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
      throw error;
    }
    
    return response.SecretString;
}