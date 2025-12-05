package com.restaurant.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import com.restaurant.config.AppConfig;
import com.restaurant.models.User;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class JWTUtil {
    private static final AppConfig config = AppConfig.getInstance();
    private static final Key key = Keys.hmacShaKeyFor(config.getJwtSecret().getBytes());

    public static String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId());
        claims.put("username", user.getUsername());
        claims.put("email", user.getEmail());
        claims.put("role", user.getRole().getRoleName());
        claims.put("branchId", user.getBranchId());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + config.getJwtExpiration()))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public static Claims validateToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            return null;
        }
    }

    public static boolean isTokenValid(String token) {
        Claims claims = validateToken(token);
        if (claims == null) return false;
        
        Date expiration = claims.getExpiration();
        return expiration.after(new Date());
    }

    public static String getUsernameFromToken(String token) {
        Claims claims = validateToken(token);
        return claims != null ? claims.getSubject() : null;
    }

    public static Integer getUserIdFromToken(String token) {
        Claims claims = validateToken(token);
        return claims != null ? (Integer) claims.get("userId") : null;
    }

    public static String getRoleFromToken(String token) {
        Claims claims = validateToken(token);
        return claims != null ? (String) claims.get("role") : null;
    }
}
