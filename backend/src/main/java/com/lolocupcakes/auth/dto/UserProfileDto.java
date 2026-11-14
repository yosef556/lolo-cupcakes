package com.lolocupcakes.auth.dto;

import com.lolocupcakes.orders.dto.OrderResponseDto;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class UserProfileDto {
    private UUID id;
    private String fullName;
    private String email;
    private String phone;
    private String status;
    private String address;
    private Instant createdAt;
    private List<OrderResponseDto> recentOrders;
    private boolean isAdmin;
    private String avatarUrl;

    public UserProfileDto() {}

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

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public List<OrderResponseDto> getRecentOrders() { return recentOrders; }
    public void setRecentOrders(List<OrderResponseDto> recentOrders) { this.recentOrders = recentOrders; }

    public boolean getIsAdmin() { return isAdmin; }
    public void setIsAdmin(boolean isAdmin) { this.isAdmin = isAdmin; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}
