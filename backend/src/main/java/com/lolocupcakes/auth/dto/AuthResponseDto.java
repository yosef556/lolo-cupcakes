package com.lolocupcakes.auth.dto;

public class AuthResponseDto {
    private String token;
    private UserSummaryDto user;
    private String message;

    public AuthResponseDto() {}

    public AuthResponseDto(String token, UserSummaryDto user, String message) {
        this.token = token;
        this.user = user;
        this.message = message;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public UserSummaryDto getUser() { return user; }
    public void setUser(UserSummaryDto user) { this.user = user; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
