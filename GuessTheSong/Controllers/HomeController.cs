using GuessTheSong.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;

namespace GuessTheSong.Controllers
{
    public class HomeController : Controller
    {
        private readonly IConfiguration _configuration;

        public HomeController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public IActionResult Index([FromQuery(Name = "code")] string code)
        {
            var spotifyClientId = _configuration["AppSettings:SpotifyClientId"];
            var spotifyClientSecret = _configuration["AppSettings:SpotifyClientSecret"];
            var redirectUri = _configuration["AppSettings:RedirectUri"];
            var tokenRequestUri = _configuration["AppSettings:TokenRequestUri"];
            var authUri = _configuration["AppSettings:AuthUri"];
            var playUri = _configuration["AppSettings:PlayUri"];

            var dataModel = new DataModel(spotifyClientId, redirectUri, authUri, playUri);

            if (string.IsNullOrWhiteSpace(code))
                return View(dataModel);

            var escapedRedirectUri = Uri.EscapeDataString(redirectUri);
            var grantType = "authorization_code";

            var form = "code=" + code + "&redirect_uri=" + escapedRedirectUri + "&grant_type=" + grantType;

            var spotifyClientData = spotifyClientId + ":" + spotifyClientSecret;
            var authorization = Convert.ToBase64String(Encoding.UTF8.GetBytes(spotifyClientData));

            var client = new HttpClient();

            var webRequest = new HttpRequestMessage(HttpMethod.Post, tokenRequestUri)
            {
                Content = new StringContent(form, Encoding.UTF8, "application/x-www-form-urlencoded")
            };

            webRequest.Headers.Add("Authorization", "Basic " + authorization);

            var response = client.Send(webRequest);
            if (!response.IsSuccessStatusCode)
                return RedirectToAction("Error");

            using var streamReader = new StreamReader(response.Content.ReadAsStream());
            var result = streamReader.ReadToEnd();

            var accessTokenModel = JsonSerializer.Deserialize<AccessTokenModel>(result);
            if (accessTokenModel == null)
                return View(dataModel);

            dataModel.AccessToken = accessTokenModel.AccessToken;

            return View(dataModel);
        }

        public IActionResult Error()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Log([FromBody] LogModel logModel)
        {
            return Json(null);
        }
    }
}