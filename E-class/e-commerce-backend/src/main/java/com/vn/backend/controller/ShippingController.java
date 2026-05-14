package com.vn.backend.controller;

import com.vn.backend.dto.request.ShippingEstimateRequest;
import com.vn.backend.dto.response.ShippingEstimateResponse;
import com.vn.backend.entity.ProductVariant;
import com.vn.backend.repository.ProductVariantRepository;
import com.vn.backend.service.impl.GHTKLogicHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/v1/shipping")
@RequiredArgsConstructor
public class ShippingController {

    private final GHTKLogicHandler ghtkLogicHandler;
    private final ProductVariantRepository productVariantRepository;

    @PostMapping("/estimate")
    public ResponseEntity<ShippingEstimateResponse> estimateShippingFee(@RequestBody ShippingEstimateRequest request) {
        BigDecimal subTotal = request.getItems().stream()
                .map(item -> {
                    ProductVariant variant = productVariantRepository.findById(item.getVariantId())
                            .orElseThrow(() -> new RuntimeException("Variant not found"));
                    return variant.getSellingPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Integer> quantities = request.getItems().stream()
                .map(ShippingEstimateRequest.ShippingItem::getQuantity)
                .toList();

        BigDecimal shippingFee = ghtkLogicHandler.calculateShippingFee(
                request.getShippingInfo().getProvince(),
                request.getShippingInfo().getDistrict(),
                request.getShippingInfo().getAddress(),
                subTotal,
                quantities
        );

        ShippingEstimateResponse response = new ShippingEstimateResponse();
        response.setShippingFee(shippingFee);

        return ResponseEntity.ok(response);
    }
}
