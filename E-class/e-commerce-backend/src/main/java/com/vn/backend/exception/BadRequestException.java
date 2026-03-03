package com.vn.backend.exception;
public class BadRequestException extends RuntimeException {
    public BadRequestException(String msg) { super(msg); }
}