package com.lolocupcakes.auth.dto;

import java.util.UUID;

public class UserSummaryDto {
    private UUID id;
    private String fullName;
    private String email;
    private String phone;
    private String status;
    private boolean isAdmin;
    private String avatarUrl;

    public UserSummaryDto() {}

    public UserSummaryDto(UUID id, String fullName, String email, String phone, String status, boolean isAdmin) {
        this(id, fullName, email, phone, status, isAdmin, null);
    }

    public UserSummaryDto(UUID id, String fullName, String email, String phone, String status, boolean isAdmin, String avatarUrl) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.status = status;
        this.isAdmin = isAdmin;
        this.avatarUrl = avatarUrl;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean getIsAdmin() { return isAdmin; }
    public void setIsAdmin(boolean isAdmin) { this.isAdmin = isAdmin; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}
