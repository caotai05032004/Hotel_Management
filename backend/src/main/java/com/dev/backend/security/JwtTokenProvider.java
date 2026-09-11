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
 * Sinh va xac thuc JWT. Viet theo API jjwt 0.12.x
 * (0.11.x dung setSubject / parserBuilder / signWith(key, alg) — da bo).
 */
@Component
@Slf4j
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long accessTokenMs;
    private final long refreshTokenMs;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String jwtSecret,
            @Value("${app.jwt.expiration-ms}") long accessTokenMs,
            @Value("${app.jwt.refresh-expiration-ms}") long refreshTokenMs) {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "app.jwt.secret phai dai toi thieu 32 byte cho thuat toan HS256.");
        }
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        this.accessTokenMs = accessTokenMs;
        this.refreshTokenMs = refreshTokenMs;
    }

    /** Claim lay tu chinh nguoi dung dang dang nhap, khong hardcode. */
    public String generateAccessToken(CustomUserDetails user) {
        List<String> roles = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        Date now = new Date();
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("uid", user.getId())
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + accessTokenMs))
                .signWith(secretKey)
                .compact();
    }

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

    public String getEmailFromJWT(String token) {
        return parseClaims(token).getSubject();
    }

    public String getUserIdFromJWT(String token) {
        return parseClaims(token).get("uid", String.class);
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

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
}
