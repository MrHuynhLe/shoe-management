package com.vn.backend.exception;


public class ConflictException extends RuntimeException {
    public ConflictException(String msg) { super(msg); }
}