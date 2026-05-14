package com.vn.backend.dto.response;

import lombok.Data;

@Data
public class OrderShippingAddressResponse {
    private String fullName;
    private String phone;
    private String address;
    private String province;
    private String district;
    private String ward;
    private Integer provinceId;
    private Integer districtId;
    private String wardCode;
    private String provinceName;
    private String districtName;
    private String wardName;
    private String note;
}
