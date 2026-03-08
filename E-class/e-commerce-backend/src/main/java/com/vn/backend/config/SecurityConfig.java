package com.vn.backend.config;

import com.vn.backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/v1/auth/**", "/uploads/**", "/image/**").permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/v1/products/**",
                                "/v1/brands",
                                "/v1/categories",
                                "/v1/origins",
                                "/v1/suppliers",
                                "/v1/attributes",
                                "/v1/attributes/*/values",
                                "/v1/colors",
                                "/v1/payment-methods",
                                "/v1/shipping-providers/active",
                                "/v1/promotions/current"
                        ).permitAll()
                        .requestMatchers("/v1/cart/**").hasAnyRole("CUSTOMER", "ADMIN")
                        .requestMatchers("/v1/discounts/validate").hasAnyRole("CUSTOMER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/v1/orders").hasAnyRole("CUSTOMER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/v1/orders/my-orders").hasAnyRole("CUSTOMER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/v1/orders").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/v1/orders/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/v1/users/me").authenticated()
                        .requestMatchers(
                                "/v1/admin/**",
                                "/v1/users/**", "/v1/roles/**",
                                "/v1/products/**", "/v1/variants/**", "/v1/product-images/**",
                                "/v1/brands/**", "/v1/categories/**", "/v1/origins/**", "/v1/suppliers/**",
                                "/v1/attributes/**", "/v1/attribute-values/**", "/v1/colors/**",
                                "/v1/promotions/**", "/v1/coupons/**",
                                "/v1/payments/**", "/v1/payment-methods/**",
                                "/v1/shipments/**", "/v1/shipping-providers/**",
                                "/v1/inventory-transactions/**"
                        ).hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
