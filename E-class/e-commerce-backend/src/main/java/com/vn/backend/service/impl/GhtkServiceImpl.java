package com.vn.backend.service.impl;

import com.vn.backend.dto.ghtk.GhtkFeeRequest;
import com.vn.backend.service.GhtkService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GhtkServiceImpl implements GhtkService {

    private final RestTemplate restTemplate;

    @Value("${ghtk.token}")
    private String ghtkToken;

    @Value("${ghtk.pick-province}")
    private String pickProvince;

    @Value("${ghtk.pick-district}")
    private String pickDistrict;

    @Override
    public BigDecimal calculateShippingFee(GhtkFeeRequest request) {
        String url = "https://services.giaohangtietkiem.vn/services/shipment/fee";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghtkToken);
        headers.set("Content-Type", "application/json");

        Map<String, Object> body = new HashMap<>();
        body.put("pick_province", pickProvince);
        body.put("pick_district", pickDistrict);
        body.put("province", request.getProvince());
        body.put("district", request.getDistrict());
        body.put("weight", request.getWeight());
        body.put("value", request.getValue().intValue());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("fee")) {
                Map<String, Object> fee = (Map<String, Object>) responseBody.get("fee");
                return BigDecimal.valueOf(((Number) fee.get("fee")).doubleValue());
            }
        } catch (Exception e) {
            BigDecimal baseFee = BigDecimal.valueOf(30000);
            BigDecimal weightFee = BigDecimal.valueOf(request.getWeight()).multiply(BigDecimal.valueOf(100));
            BigDecimal valueFee = request.getValue().multiply(BigDecimal.valueOf(0.001));
            return baseFee.add(weightFee).add(valueFee);
        }

        return BigDecimal.valueOf(30000);
    }
}