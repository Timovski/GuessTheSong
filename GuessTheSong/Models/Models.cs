using System.Text.Json.Serialization;

namespace GuessTheSong.Models
{
    public class DataModel
    {
        public DataModel(string clientId, string redirectUri, string authUri, string playUri)
        {
            ClientId = clientId;
            RedirectUri = redirectUri;
            AuthUri = authUri;
            PlayUri = playUri;
        }

        public string ClientId { get; set; }
        public string RedirectUri { get; set; }
        public string AuthUri { get; set; }
        public string PlayUri { get; set; }
        public string? AccessToken { get; set; }
    }

    public class LogModel
    {
        public int Code { get; set; }
    }

    public class AccessTokenModel
    {
        [JsonPropertyName("access_token")]
        public string? AccessToken { get; set; }

        [JsonPropertyName("token_type")]
        public string? TokenType { get; set; }

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }

        [JsonPropertyName("refresh_token")]
        public string? RefreshToken { get; set; }

        [JsonPropertyName("scope")]
        public string? Scope { get; set; }
    }
}