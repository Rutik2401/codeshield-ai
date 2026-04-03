package com.codeshield.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data @Builder @AllArgsConstructor
public class AuthResponse {
    private String token;
    private String refreshToken;
    private UserInfo user;

    @Data @Builder @AllArgsConstructor
    public static class UserInfo {
        private String id;
        private String name;
        private String email;
        private String avatar;
    }
}
