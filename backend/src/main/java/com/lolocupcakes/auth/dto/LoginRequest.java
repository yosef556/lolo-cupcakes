package com.lolocupcakes.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = "البريد الإلكتروني أو رقم الهاتف مطلوب")
    private String identifier; // can be email or phone

    @NotBlank(message = "كلمة المرور مطلوبة")
    private String password;

    public LoginRequest() {}

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
