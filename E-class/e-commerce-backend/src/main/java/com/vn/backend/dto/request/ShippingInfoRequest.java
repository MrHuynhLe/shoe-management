package com.vn.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ShippingInfoRequest {
    @NotBlank(message = "Tên người nhận không được để trống")
    private String customerName;
    @NotBlank(message = "Số điện thoại không được để trống")
    private String phone;
    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;
    private String note;
    private String province;
    private String district;
    private String ward;
    private Integer provinceId;
    private Integer districtId;
    private String wardCode;
    private String provinceName;
    private String districtName;
    private String wardName;
    private Integer shippingFee;
}
