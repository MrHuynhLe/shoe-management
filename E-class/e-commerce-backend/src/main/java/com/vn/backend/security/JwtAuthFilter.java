package com.vn.backend.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        // DEBUG: xem filter có chạy không
        System.out.println("JwtAuthFilter HIT - path=" + request.getRequestURI()
                + " Authorization=" + request.getHeader("Authorization"));

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        try {
            Claims claims = jwtService.parseToken(token);

            Long userId = Long.valueOf(claims.getSubject());
            String role = claims.get("role", String.class);
            List<?> permsRaw = claims.get("perms", List.class);

            // DEBUG
            System.out.println("====== JWT DEBUG ======");
            System.out.println("UserId: " + userId);
            System.out.println("Role: " + role);
            System.out.println("PermsRaw: " + permsRaw);
            System.out.println("=======================");

            List<GrantedAuthority> authorities = new ArrayList<>();
            if (role != null) authorities.add(new SimpleGrantedAuthority("ROLE_" + role));

            if (permsRaw != null) {
                for (Object p : permsRaw) {
                    authorities.add(new SimpleGrantedAuthority(String.valueOf(p)));
                }
            }

            var auth = new UsernamePasswordAuthenticationToken(userId, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (Exception e) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}