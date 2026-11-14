package com.lolocupcakes.auth.service;

import com.lolocupcakes.admin.dto.CustomerAdminDto;
import com.lolocupcakes.auth.dto.*;
import com.lolocupcakes.auth.model.Customer;
import java.math.BigDecimal;
import com.lolocupcakes.auth.model.User;
import com.lolocupcakes.auth.repository.CustomerRepository;
import com.lolocupcakes.auth.repository.UserRepository;
import com.lolocupcakes.common.BusinessException;
import com.lolocupcakes.common.ErrorCode;
import com.lolocupcakes.orders.dto.OrderResponseDto;
import com.lolocupcakes.orders.model.Order;
import com.lolocupcakes.orders.repository.OrderRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    // Fast in-memory token store: Token -> UserId
    private final Map<String, UUID> activeSessions = new ConcurrentHashMap<>();

    public AuthService(
        UserRepository userRepository,
        CustomerRepository customerRepository,
        OrderRepository orderRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponseDto register(RegisterRequest req) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        String cleanPhone = req.getPhone().trim().replaceAll("[^0-9+]", "");

        if (userRepository.existsByEmail(cleanEmail)) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول");
        }

        if (userRepository.existsByPhone(cleanPhone)) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "رقم الهاتف مسجل بالفعل في النظام");
        }

        String hashed = passwordEncoder.encode(req.getPassword());

        User user = new User(cleanEmail, hashed, cleanPhone, req.getFullName().trim());
        User savedUser = userRepository.save(user);

        // Create associated Customer record
        Customer customer = new Customer(savedUser.getId(), savedUser.getFullName(), cleanPhone, cleanEmail);
        if (req.getAddress() != null && !req.getAddress().isBlank()) {
            customer.setNotes(req.getAddress().trim());
        }
        customerRepository.save(customer);

        String token = generateToken(savedUser.getId());
        UserSummaryDto summary = new UserSummaryDto(
            savedUser.getId(),
            savedUser.getFullName(),
            savedUser.getEmail(),
            savedUser.getPhone(),
            savedUser.getStatus(),
            checkIsAdmin(savedUser),
            savedUser.getAvatarUrl()
        );

        return new AuthResponseDto(token, summary, "تم إنشاء الحساب بنجاح! أهلاً بك في لولو كب كيك 🌸");
    }

    public AuthResponseDto login(LoginRequest req) {
        String iden = req.getIdentifier().trim();
        Optional<User> userOpt;

        if (iden.contains("@")) {
            userOpt = userRepository.findByEmail(iden.toLowerCase());
        } else {
            String cleanPhone = iden.replaceAll("[^0-9+]", "");
            userOpt = userRepository.findByPhone(cleanPhone);
        }

        if (userOpt.isEmpty()) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS, "بيانات الدخول غير صحيحة، يرجى التأكد من البريد أو الهاتف");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS, "كلمة المرور غير صحيحة");
        }

        String token = generateToken(user.getId());
        UserSummaryDto summary = new UserSummaryDto(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            user.getStatus(),
            checkIsAdmin(user),
            user.getAvatarUrl()
        );

        return new AuthResponseDto(token, summary, "تم تسجيل الدخول بنجاح! مرحباً بعودتك ✨");
    }

    private boolean checkIsAdmin(User user) {
        if (user == null || user.getEmail() == null) return false;
        String e = user.getEmail().toLowerCase();
        return e.equals("admin@lolocupcakes.com") || e.startsWith("admin@") || e.contains("+admin@");
    }

    @Transactional(readOnly = true)
    public UserProfileDto getProfile(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "المستخدم غير موجود"));

        Optional<Customer> customerOpt = customerRepository.findByUserId(userId);
        String address = customerOpt.map(Customer::getNotes).orElse("");

        List<Order> orders = new ArrayList<>();
        if (user.getPhone() != null && !user.getPhone().isBlank()) {
            orders = orderRepository.findByCustomerPhoneOrderByCreatedAtDesc(user.getPhone());
        }

        List<OrderResponseDto> orderDtos = orders.stream()
            .map(OrderResponseDto::fromEntity)
            .toList();

        UserProfileDto profile = new UserProfileDto();
        profile.setId(user.getId());
        profile.setFullName(user.getFullName());
        profile.setEmail(user.getEmail());
        profile.setPhone(user.getPhone());
        profile.setStatus(user.getStatus());
        profile.setAddress(address);
        profile.setCreatedAt(user.getCreatedAt());
        profile.setRecentOrders(orderDtos);
        profile.setIsAdmin(checkIsAdmin(user));
        profile.setAvatarUrl(user.getAvatarUrl());

        return profile;
    }

    public UserProfileDto updateProfile(UUID userId, UpdateProfileRequest req) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "المستخدم غير موجود"));

        if (req.getFullName() != null && !req.getFullName().isBlank()) {
            user.setFullName(req.getFullName().trim());
        }

        if (req.getPhone() != null && !req.getPhone().isBlank()) {
            String cleanPhone = req.getPhone().trim().replaceAll("[^0-9+]", "");
            if (!cleanPhone.equals(user.getPhone())) {
                if (userRepository.existsByPhone(cleanPhone)) {
                    throw new BusinessException(ErrorCode.VALIDATION_FAILED, "رقم الهاتف الجديد مستخدم بالفعل");
                }
                user.setPhone(cleanPhone);
            }
        }

        if (req.getAvatarUrl() != null) {
            user.setAvatarUrl(req.getAvatarUrl().trim());
        }

        User updatedUser = userRepository.save(user);

        // Update customer notes for address
        Optional<Customer> customerOpt = customerRepository.findByUserId(userId);
        Customer customer = customerOpt.orElseGet(() -> new Customer(userId, updatedUser.getFullName(), updatedUser.getPhone(), updatedUser.getEmail()));
        customer.setFullName(updatedUser.getFullName());
        customer.setPhone(updatedUser.getPhone());
        if (req.getAddress() != null) {
            customer.setNotes(req.getAddress().trim());
        }
        customerRepository.save(customer);

        return getProfile(userId);
    }

    public void resetPassword(String identifier, String newPassword) {
        if (identifier == null || identifier.isBlank() || newPassword == null || newPassword.isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "يرجى إدخال البريد أو رقم الهاتف وكلمة المرور الجديدة");
        }
        String clean = identifier.trim();
        Optional<User> userOpt;
        if (clean.contains("@")) {
            userOpt = userRepository.findByEmail(clean.toLowerCase());
        } else {
            userOpt = userRepository.findByPhone(clean.replaceAll("[^0-9+]", ""));
        }
        if (userOpt.isEmpty()) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "لا يوجد حساب مسجل بهذا البريد أو الهاتف");
        }
        User user = userOpt.get();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getOrdersByPhone(String phone) {
        String cleanPhone = phone.trim().replaceAll("[^0-9+]", "");
        return orderRepository.findByCustomerPhoneOrderByCreatedAtDesc(cleanPhone).stream()
            .map(OrderResponseDto::fromEntity)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<CustomerAdminDto> getAllCustomersForAdmin() {
        List<User> users = userRepository.findAll();
        List<CustomerAdminDto> result = new ArrayList<>();
        for (User u : users) {
            String addr = customerRepository.findByUserId(u.getId()).map(Customer::getNotes).orElse("");
            List<Order> userOrders = (u.getPhone() != null && !u.getPhone().isBlank())
                ? orderRepository.findByCustomerPhoneOrderByCreatedAtDesc(u.getPhone())
                : Collections.emptyList();
            BigDecimal totalSpent = userOrders.stream()
                .filter(o -> !o.getOrderStatus().name().equals("CANCELLED") && !o.getOrderStatus().name().equals("REJECTED"))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            result.add(new CustomerAdminDto(
                u.getId(),
                u.getFullName(),
                u.getEmail(),
                u.getPhone(),
                u.getStatus(),
                checkIsAdmin(u),
                u.getAvatarUrl(),
                addr,
                u.getCreatedAt(),
                userOrders.size(),
                totalSpent
            ));
        }
        return result;
    }

    public UUID getUserIdFromToken(String token) {
        if (token == null || token.isBlank()) return null;
        String cleanToken = token.replace("Bearer ", "").trim();
        return activeSessions.get(cleanToken);
    }

    private String generateToken(UUID userId) {
        String token = "lolo_tok_" + UUID.randomUUID().toString().replace("-", "") + "_" + System.currentTimeMillis();
        activeSessions.put(token, userId);
        return token;
    }
}
