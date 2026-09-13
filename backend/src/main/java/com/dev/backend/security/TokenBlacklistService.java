package com.dev.backend.security;

import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  DANH SÁCH ĐEN TOKEN — phục vụ chức năng ĐĂNG XUẤT
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Vấn đề: JWT là "stateless", một khi đã ký thì server không thể thu hồi —
 * token vẫn hợp lệ cho tới lúc hết hạn (86.400.000 ms = 24 giờ).
 * Bấm "Đăng xuất" mà chỉ xoá token ở localStorage thì ai copy được token cũ
 * vẫn dùng tiếp được.
 *
 * Giải pháp ở đây: giữ một danh sách token đã logout trong BỘ NHỚ.
 *   - AuthServiceImpl.logout()      → add(token, thời điểm hết hạn)
 *   - JwtAuthenticationFilter       → isBlacklisted(token) trước khi cấp quyền
 *
 * ⚠ Hạn chế cần biết:
 *   - Lưu trong RAM → restart server là mất sạch, token cũ sống lại.
 *   - Chạy nhiều instance (load balancer) thì mỗi instance một danh sách riêng.
 *   → Hệ thống thật nên chuyển sang Redis với TTL bằng đúng hạn của token.
 */
@Service
public class TokenBlacklistService {

    // ConcurrentHashMap vì nhiều request chạy song song cùng đọc/ghi.
    // key = token, value = thời điểm token hết hạn (sau đó không cần giữ nữa)
    private final Map<String, Date> blacklist = new ConcurrentHashMap<>();

    /** Gọi khi người dùng đăng xuất. expiration lấy từ claim "exp" của chính token đó. */
    public void add(String token, Date expiration) {
        blacklist.put(token, expiration);
    }

    /** JwtAuthenticationFilter gọi ở mỗi request có mang token. */
    public boolean isBlacklisted(String token) {
        Date exp = blacklist.get(token);
        if (exp == null) return false;          // chưa từng logout → hợp lệ

        if (exp.before(new Date())) {   // token đã hết hạn -> dọn luôn
            // Tự dọn rác: token hết hạn rồi thì validateToken() cũng đã chặn,
            // giữ trong map chỉ tốn bộ nhớ.
            blacklist.remove(token);
            return false;
        }
        return true;                            // đã logout và vẫn còn hạn → CHẶN
    }
}
