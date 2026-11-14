package com.lolocupcakes.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "الاسم الكامل مطلوب")
    private String fullName;

    @NotBlank(message = "البريد الإلكتروني مطلوب")
    @Email(message = "صيغة البريد الإلكتروني غير صالحة")
    private String email;

    @NotBlank(message = "رقم الهاتف مطلوب")
    private String phone;

    @NotBlank(message = "كلمة المرور مطلوبة")
    @Size(min = 6, message = "كلمة المرور يجب أن لا تقل عن 6 أحرف")
    private String password;

    private String address;

    public RegisterRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}
