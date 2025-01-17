using Amazon.SecretsManager.Model;
using Amazon.SecretsManager;

namespace Portfolio.Models
{
    public class SecretsService
    {
        private readonly IAmazonSecretsManager _secretsManager;

        public SecretsService(IAmazonSecretsManager secretsManager)
        {
            _secretsManager = secretsManager;
        }

        public async Task<string> GetConnectionString()
        {
            var response = await _secretsManager.GetSecretValueAsync(new GetSecretValueRequest
            {
                SecretId = "your-secret-name"
            });

            return response.SecretString;
        }
    }
}
