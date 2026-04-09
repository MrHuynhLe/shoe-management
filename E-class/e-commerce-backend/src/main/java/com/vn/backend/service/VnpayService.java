package com.vn.backend.service;

import com.vn.backend.dto.request.pos.PosCheckoutRequest;
import com.vn.backend.dto.response.pos.PosVnpayCreateResponse;
import com.vn.backend.dto.response.pos.PosVnpayReturnResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface VnpayService {

    PosVnpayCreateResponse createPaymentUrl(
            Long orderId,
            PosCheckoutRequest request,
            HttpServletRequest httpServletRequest
    );

    PosVnpayReturnResponse handleReturn(Map<String, String> params);

    String handleIpn(Map<String, String> params);
}