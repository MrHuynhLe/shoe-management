package com.vn.backend.common;


import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiError> handleApp(AppException ex, HttpServletRequest req) {
        return ResponseEntity.status(ex.getStatus()).body(
                new ApiError(OffsetDateTime.now(), ex.getStatus().value(), ex.getStatus().getReasonPhrase(),
                        ex.getMessage(), req.getRequestURI(), null)
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
        }

        HttpStatus st = HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(st).body(
                new ApiError(OffsetDateTime.now(), st.value(), st.getReasonPhrase(),
                        "Validation failed", req.getRequestURI(), fieldErrors)
        );
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleDenied(AccessDeniedException ex, HttpServletRequest req) {
        HttpStatus st = HttpStatus.FORBIDDEN;
        return ResponseEntity.status(st).body(
                new ApiError(OffsetDateTime.now(), st.value(), st.getReasonPhrase(),
                        "Access Denied", req.getRequestURI(), null)
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleOther(Exception ex, HttpServletRequest req) {
        HttpStatus st = HttpStatus.INTERNAL_SERVER_ERROR;
        return ResponseEntity.status(st).body(
                new ApiError(OffsetDateTime.now(), st.value(), st.getReasonPhrase(),
                        ex.getMessage(), req.getRequestURI(), null)
        );
    }
}