package com.codeshield.controller;

import com.codeshield.dto.AuthResponse;
import com.codeshield.entity.User;
import com.codeshield.repository.UserRepository;
import com.codeshield.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth/oauth2")
@RequiredArgsConstructor
public class OAuth2Controller {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper;

    @Value("${app.google.client-id:}")
    private String clientId;

    @Value("${app.google.client-secret:}")
    private String clientSecret;

    @Value("${app.cors.allowed-origins}")
    private String frontendUrl;

    @GetMapping("/google/url")
    public ResponseEntity<Map<String, String>> getGoogleAuthUrl() {
        String redirectUri = frontendUrl + "/oauth-callback";
        String url = "https://accounts.google.com/o/oauth2/v2/auth"
                + "?client_id=" + clientId
                + "&redirect_uri=" + redirectUri
                + "&response_type=code"
                + "&scope=openid%20email%20profile"
                + "&access_type=offline"
                + "&prompt=consent";
        return ResponseEntity.ok(Map.of("url", url));
    }

    @PostMapping("/google/callback")
    public ResponseEntity<AuthResponse> handleGoogleCallback(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        String redirectUri = frontendUrl + "/oauth-callback";

        try {
            // Exchange code for tokens
            WebClient webClient = WebClient.create();

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("code", code);
            params.add("client_id", clientId);
            params.add("client_secret", clientSecret);
            params.add("redirect_uri", redirectUri);
            params.add("grant_type", "authorization_code");

            String tokenResponse = webClient.post()
                    .uri("https://oauth2.googleapis.com/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .bodyValue(params)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode tokenJson = objectMapper.readTree(tokenResponse);
            String accessToken = tokenJson.get("access_token").asText();

            // Get user info
            String userInfoResponse = webClient.get()
                    .uri("https://www.googleapis.com/oauth2/v2/userinfo")
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode userInfo = objectMapper.readTree(userInfoResponse);
            String email = userInfo.get("email").asText();
            String name = userInfo.get("name").asText();
            String googleId = userInfo.get("id").asText();

            // Find or create user
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = User.builder()
                        .email(email)
                        .name(name)
                        .avatar(name.substring(0, 1).toUpperCase())
                        .provider(User.Provider.GOOGLE)
                        .providerId(googleId)
                        .build();
                return userRepository.save(newUser);
            });

            // Issue JWT
            AuthResponse response = AuthResponse.builder()
                    .token(jwtService.generateToken(user))
                    .refreshToken(jwtService.generateRefreshToken(user))
                    .user(AuthResponse.UserInfo.builder()
                            .id(user.getId().toString())
                            .name(user.getName())
                            .email(user.getEmail())
                            .avatar(user.getAvatar())
                            .build())
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new RuntimeException("Google OAuth failed: " + e.getMessage(), e);
        }
    }
}
