package com.dev.backend.security;

import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    // key = token, value = thời điểm token hết hạn (sau đó không cần giữ nữa)
    private final Map<String, Date> blacklist = new ConcurrentHashMap<>();

    public void add(String token, Date expiration) {
        blacklist.put(token, expiration);
    }

    public boolean isBlacklisted(String token) {
        Date exp = blacklist.get(token);
        if (exp == null) return false;
        if (exp.before(new Date())) {   // token đã hết hạn -> dọn luôn
            blacklist.remove(token);
            return false;
        }
        return true;
    }
}