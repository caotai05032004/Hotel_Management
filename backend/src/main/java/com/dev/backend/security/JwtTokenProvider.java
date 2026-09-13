package com.dev.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  XƯỞNG SẢN XUẤT VÀ KIỂM ĐỊNH JWT
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Một JWT gồm 3 phần ngăn bởi dấu chấm:  header.payload.signature
 *   header    : {"alg":"HS256"}
 *   payload   : {"sub":"a@b.com","uid":"uuid...","roles":["ROLE_GUEST"],
 *                "iat":1789...,"exp":1789...}
 *   signature : HMAC-SHA256(header + "." + payload, secretKey)
 *
 * Header và payload chỉ được Base64Url ENCODE, KHÔNG mã hoá → ai cũng đọc được.
 * → TUYỆT ĐỐI không đặt mật khẩu hay dữ liệu nhạy cảm vào claim.
 * Chữ ký mới là thứ bảo đảm nội dung không bị sửa: đổi 1 ký tự trong payload
 * là chữ ký không khớp → validateToken() trả false.
 *
 * Khi nào được gọi?
 *   - SINH token : AuthServiceImpl.register() và .login()  (BƯỚC 5 của luồng đăng nhập)
 *   - KIỂM token : JwtAuthenticationFilter, mỗi request có header Authorization
 *   - ĐỌC claim  : getEmailFromJWT (filter), getExpirationFromJWT (logout)
 *
 * Viet theo API jjwt 0.12.x
 * (0.11.x dung setSubject / parserBuilder / signWith(key, alg) — da bo).
 */
@Component
@Slf4j
public class JwtTokenProvider {

    private final SecretKey secretKey;     // khoá bí mật dùng chung cho ký và kiểm tra (HS256 đối xứng)
    private final long accessTokenMs;      // 86.400.000 ms  = 24 giờ
    private final long refreshTokenMs;     // 604.800.000 ms = 7 ngày

    /**
     * Constructor injection: 3 giá trị đọc từ application.yml (mục app.jwt.*).
     * Dùng ${JWT_SECRET:mặc-định} nên khi deploy có thể ghi đè bằng biến môi trường.
     */
    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String jwtSecret,
            @Value("${app.jwt.expiration-ms}") long accessTokenMs,
            @Value("${app.jwt.refresh-expiration-ms}") long refreshTokenMs) {

        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);

        // HS256 bắt buộc khoá tối thiểu 256 bit = 32 byte. Ngắn hơn thì jjwt ném lỗi
        // lúc ký, nên chặn ngay từ lúc khởi động cho dễ phát hiện.
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "app.jwt.secret phai dai toi thieu 32 byte cho thuat toan HS256.");
        }
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        this.accessTokenMs = accessTokenMs;
        this.refreshTokenMs = refreshTokenMs;
    }

    /**
     * SINH ACCESS TOKEN — token chính, FE gắn vào mọi request.
     * Claim lay tu chinh nguoi dung dang dang nhap, khong hardcode.
     *
     *   subject "sub"  = email  → JwtAuthenticationFilter dùng để tra DB
     *   claim  "uid"   = id     → frontend giải mã lấy id gọi /api/user/user/{id}
     *   claim  "roles" = quyền  → hiện chưa dùng để phân quyền (filter vẫn tra DB),
     *                             nhưng giữ sẵn nếu muốn bỏ query mỗi request
     */
    public String generateAccessToken(CustomUserDetails user) {
        List<String> roles = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        Date now = new Date();
        return Jwts.builder()
                .subject(user.getUsername())                              // "sub"
                .claim("uid", user.getId())
                .claim("roles", roles)
                .issuedAt(now)                                            // "iat"
                .expiration(new Date(now.getTime() + accessTokenMs))      // "exp"
                .signWith(secretKey)                                      // ký HS256
                .compact();                                               // → chuỗi 3 phần
    }

    /**
     * SINH REFRESH TOKEN — sống lâu hơn, dùng để xin access token mới.
     * ⚠ Hiện dự án CHƯA có endpoint /api/auth/refresh, FE chỉ lưu vào localStorage.
     * Claim "typ":"refresh" để sau này phân biệt, tránh dùng refresh token gọi API thường.
     */
    public String generateRefreshToken(CustomUserDetails user) {
        Date now = new Date();
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("uid", user.getId())
                .claim("typ", "refresh")
                .issuedAt(now)
                .expiration(new Date(now.getTime() + refreshTokenMs))
                .signWith(secretKey)
                .compact();
    }

    /** Lấy email từ claim "sub". JwtAuthenticationFilter gọi ở mỗi request. */
    public String getEmailFromJWT(String token) {
        return parseClaims(token).getSubject();
    }

    /** Lấy id người dùng từ claim "uid". */
    public String getUserIdFromJWT(String token) {
        return parseClaims(token).get("uid", String.class);
    }

    /**
     * Giải mã payload. verifyWith(secretKey) đồng thời KIỂM TRA CHỮ KÝ —
     * sai chữ ký hay hết hạn đều ném exception ngay tại đây.
     */
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Kiểm tra token còn dùng được không. Trả boolean thay vì ném lỗi để
     * JwtAuthenticationFilter viết được if(...) gọn gàng.
     * Mỗi loại lỗi log ở mức khác nhau:
     *   - SignatureException  → có người giả mạo token  (WARN)
     *   - ExpiredJwtException → chuyện bình thường, token 24h hết hạn (DEBUG)
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (SignatureException e) {
            log.warn("Chu ky JWT khong hop le");
        } catch (MalformedJwtException e) {
            log.warn("JWT khong dung dinh dang");
        } catch (ExpiredJwtException e) {
            log.debug("JWT da het han");
        } catch (UnsupportedJwtException e) {
            log.warn("JWT khong duoc ho tro");
        } catch (IllegalArgumentException | JwtException e) {
            log.warn("JWT rong hoac khong doc duoc");
        }
        return false;
    }

    /**
     * Lấy thời điểm hết hạn. AuthServiceImpl.logout() dùng để biết
     * cần giữ token trong blacklist đến bao giờ.
     */
    public Date getExpirationFromJWT(String token) {
        return parseClaims(token).getExpiration();
    }
}
