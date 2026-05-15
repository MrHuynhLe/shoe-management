import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  List,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  CreditCardOutlined,
  EditOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import { orderService } from "@/services/order.service";
import { useAuth } from "@/services/AuthContext";
import { discountService } from "@/services/discount.service";
import { checkoutService, CheckoutQuoteResponse } from "@/services/checkout.service";
import { userService } from "@/services/userService";
import { couponService } from "@/services/coupon.service";
import {
  GhnDistrict,
  GhnProvince,
  GhnWard,
  getDistricts,
  getProvinces,
  getWards,
} from "@/services/ghnShippingService";
import { resolveImageUrl } from "@/utils/utils";

const { Title, Text } = Typography;

interface Address {
  fullName: string;
  phone: string;
  provinceId?: number;
  districtId?: number;
  wardCode?: string;
  provinceName?: string;
  districtName?: string;
  wardName?: string;
  province?: string;
  district?: string;
  ward?: string;
  address: string;
  note?: string;
}

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { isAuthenticated, user } = useAuth();

  const { items = [] } = location.state || {};
  const totalQuantity = useMemo(
    () =>
      items.reduce(
        (sum: number, item: any) => sum + Number(item.quantity || 0),
        0,
      ),
    [items],
  );

  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quote, setQuote] = useState<CheckoutQuoteResponse | null>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  const [appliedVoucherInfo, setAppliedVoucherInfo] = useState<any>(null);
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);

  const [shippingError, setShippingError] = useState("");

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [selectingAddressIndex, setSelectingAddressIndex] = useState<number | null>(null);
  const [defaultAddressKey, setDefaultAddressKey] = useState<string>("");
  const hasAppliedDefaultAddressRef = useRef(false);

  const [provinces, setProvinces] = useState<GhnProvince[]>([]);
  const [districts, setDistricts] = useState<GhnDistrict[]>([]);
  const [wards, setWards] = useState<GhnWard[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const selectedProvinceId = Form.useWatch("provinceId", form);
  const selectedDistrictId = Form.useWatch("districtId", form);
  const selectedWardCode = Form.useWatch("wardCode", form);
  const selectedAddress = Form.useWatch("address", form);
  const selectedProvinceName = Form.useWatch("provinceName", form);
  const selectedDistrictName = Form.useWatch("districtName", form);
  const selectedWardName = Form.useWatch("wardName", form);

  const quoteItems = quote?.items || [];
  const subtotalBeforeVoucher = Number(quote?.subtotalBeforeVoucher || 0);
  const discount = Number(quote?.voucherDiscountAmount || 0);
  const shippingFee = Number(quote?.shippingFee || 0);
  const total = Number(quote?.finalTotal || 0);
  const isShippingLoading = quoteLoading;
  const defaultAddressStorageKey = useMemo(
    () => `checkout_default_address_${user?.userId || "guest"}`,
    [user?.userId],
  );

  const formatMoney = (value?: number | string) =>
    `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} ₫`;

  const buildVoucherLabel = (v: any) => {
    const discountText =
      v.discountType === "PERCENTAGE"
        ? `Giảm ${v.discountValue}%${
            v.maxDiscountAmount
              ? `, tối đa ${formatMoney(v.maxDiscountAmount)}`
              : ""
          }`
        : `Giảm ${formatMoney(v.discountValue)}`;

    const minOrderText =
      v.minOrderValue != null
        ? `, đơn tối thiểu ${formatMoney(v.minOrderValue)}`
        : "";

    const remainingText =
      v.remainingUsage != null
        ? `, còn ${v.remainingUsage} lượt`
        : v.usageLimit != null
          ? `, tổng ${v.usageLimit} lượt`
          : "";

    return `${v.code || v.name} - ${discountText}${minOrderText}${remainingText}`;
  };

  const buildQuotePayload = (nextVoucherCode: string | null = appliedVoucher) => {
    const values = form.getFieldsValue([
      "customerName",
      "phone",
      "address",
      "province",
      "district",
      "ward",
      "provinceId",
      "districtId",
      "wardCode",
      "provinceName",
      "districtName",
      "wardName",
      "note",
    ]);

    const hasShippingInfo =
      values.address && values.provinceName && values.districtName;

    return {
      items: items.map((item: any) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      voucherCode: nextVoucherCode || undefined,
      shippingInfo: hasShippingInfo
        ? {
            customerName: values.customerName || "Khach hang",
            phone: values.phone || "0000000000",
            address: values.address,
            province: values.provinceName,
            district: values.districtName,
            ward: values.wardName,
            provinceId: values.provinceId,
            districtId: values.districtId,
            wardCode: values.wardCode,
            provinceName: values.provinceName,
            districtName: values.districtName,
            wardName: values.wardName,
            note: values.note,
          }
        : undefined,
    };
  };

  const fetchQuote = async (
    nextVoucherCode: string | null = appliedVoucher,
    options: { silent?: boolean } = {},
  ) => {
    if (!items.length) {
      setQuote(null);
      return null;
    }

    try {
      setQuoteLoading(true);
      setShippingError("");
      const response = await checkoutService.quote(buildQuotePayload(nextVoucherCode));
      setQuote(response.data);
      return response.data;
    } catch (error: any) {
      setQuote(null);
      const errorMessage =
        error?.response?.data?.message ||
        "Khong the tinh lai tong tien don hang.";
      if (!options.silent) {
        message.error(errorMessage);
      }
      setShippingError(errorMessage);
      throw error;
    } finally {
      setQuoteLoading(false);
    }
  };

  const normalizeLocationName = (value?: string) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\u0111/g, "d")
      .replace(/\u0110/g, "D")
      .toLowerCase()
      .replace(/\b(tinh|thanh pho|tp|quan|huyen|thi xa|phuong|xa|thi tran)\b/g, "")
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const namesMatch = (source?: string, target?: string) => {
    const left = normalizeLocationName(source);
    const right = normalizeLocationName(target);

    return Boolean(
      left && right && (left === right || left.includes(right) || right.includes(left)),
    );
  };

  const getAddressKey = (address: Address) =>
    [
      address.fullName,
      address.phone,
      address.address,
      address.provinceName || address.province,
      address.districtName || address.district,
      address.wardName || address.ward,
    ]
      .map((value) => normalizeLocationName(value))
      .join("|");

  const handleSetDefaultAddress = async (address: Address, index: number) => {
    const key = getAddressKey(address);
    localStorage.setItem(defaultAddressStorageKey, key);
    setDefaultAddressKey(key);

    await handleAddressSelect(address, { index });
    message.success("Đã đặt địa chỉ mặc định.");
  };

  const resolveSavedAddress = async (address: Address) => {
    const provinceName = address.provinceName || address.province;
    const districtName = address.districtName || address.district;
    const wardName = address.wardName || address.ward;

    const provinceOptions = provinces.length > 0 ? provinces : await getProvinces();
    if (provinces.length === 0) {
      setProvinces(provinceOptions);
    }

    const province =
      provinceOptions.find((item) => item.ProvinceID === address.provinceId) ||
      provinceOptions.find((item) => namesMatch(item.ProvinceName, provinceName));

    const provinceId = address.provinceId || province?.ProvinceID;
    if (!provinceId) {
      throw new Error("Không tìm thấy tỉnh/thành phố GHN cho địa chỉ đã lưu.");
    }

    const districtOptions = await getDistricts(Number(provinceId));
    setDistricts(districtOptions);

    const district =
      districtOptions.find((item) => item.DistrictID === address.districtId) ||
      districtOptions.find((item) => namesMatch(item.DistrictName, districtName));

    const districtId = address.districtId || district?.DistrictID;
    if (!districtId) {
      throw new Error("Không tìm thấy quận/huyện GHN cho địa chỉ đã lưu.");
    }

    const wardOptions = await getWards(Number(districtId));
    setWards(wardOptions);

    const ward =
      wardOptions.find((item) => item.WardCode === address.wardCode) ||
      wardOptions.find((item) => namesMatch(item.WardName, wardName));

    const wardCode = address.wardCode || ward?.WardCode;
    if (!wardCode) {
      throw new Error("Không tìm thấy phường/xã GHN cho địa chỉ đã lưu.");
    }

    return {
      provinceId,
      districtId,
      wardCode,
      provinceName: province?.ProvinceName || provinceName,
      districtName: district?.DistrictName || districtName,
      wardName: ward?.WardName || wardName,
    };
  };

  const loadUserAddresses = async () => {
    if (!isAuthenticated || addresses.length > 0) return;

    try {
      const response = await orderService.getUserShippingAddresses();
      const savedAddresses = response.data || [];
      setAddresses(savedAddresses);

      if (
        savedAddresses.length > 0 &&
        !hasAppliedDefaultAddressRef.current &&
        !form.getFieldValue("address")
      ) {
        const savedDefaultKey =
          localStorage.getItem(defaultAddressStorageKey) || defaultAddressKey;
        const defaultAddress =
          savedAddresses.find(
            (address: Address) => getAddressKey(address) === savedDefaultKey,
          ) || savedAddresses[0];

        if (savedDefaultKey) {
          setDefaultAddressKey(savedDefaultKey);
        }

        hasAppliedDefaultAddressRef.current = true;
        await handleAddressSelect(defaultAddress, {
          closeModal: false,
          showError: false,
        });
      }
    } catch (error) {
      console.error("Không thể tải danh sách địa chỉ:", error);
    }
  };

  useEffect(() => {
    setDefaultAddressKey(localStorage.getItem(defaultAddressStorageKey) || "");
    hasAppliedDefaultAddressRef.current = false;
  }, [defaultAddressStorageKey]);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        let coupons: any[] = [];
        let promotions: any[] = [];

        if (isAuthenticated) {
          const couponsRes = await couponService.getMyCoupons();
          coupons =
            couponsRes.data?.map((coupon: any) => ({
              ...coupon,
              type: "COUPON",
            })) || [];
        }

        const promotionRes = await discountService.getPublicPromotions();
        const promotionList = promotionRes?.data?.content || promotionRes?.data || [];
        promotions =
          promotionList.map((promotion: any) => ({
            ...promotion,
            type: "PROMOTION",
          })) || [];

        setAvailableVouchers([...coupons, ...promotions]);
      } catch (error) {
        console.error("Không thể tải danh sách voucher:", error);
        setAvailableVouchers([]);
      }
    };

    fetchVouchers();
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoadingProvinces(true);
        setProvinces(await getProvinces());
      } catch (error) {
        message.error("Không thể tải danh sách tỉnh/thành phố từ GHN.");
      } finally {
        setLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    loadUserAddresses();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!selectedProvinceId) {
      setDistricts([]);
      return;
    }

    const fetchDistricts = async () => {
      try {
        setLoadingDistricts(true);
        setDistricts(await getDistricts(Number(selectedProvinceId)));
      } catch (error) {
        message.error("Không thể tải danh sách quận/huyện từ GHN.");
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, [selectedProvinceId]);

  useEffect(() => {
    if (!selectedDistrictId) {
      setWards([]);
      return;
    }

    const fetchWards = async () => {
      try {
        setLoadingWards(true);
        setWards(await getWards(Number(selectedDistrictId)));
      } catch (error) {
        message.error("Không thể tải danh sách phường/xã từ GHN.");
      } finally {
        setLoadingWards(false);
      }
    };

    fetchWards();
  }, [selectedDistrictId]);

  useEffect(() => {
    const calculateFeeFromQuote = async () => {
      if (items.length === 0) {
        setQuote(null);
        setShippingError("");
        return;
      }

      try {
        setQuoteLoading(true);
        setShippingError("");

        const response = await checkoutService.quote(buildQuotePayload(appliedVoucher));
        setQuote(response.data);
      } catch (error) {
        setQuote(null);
        setShippingError("Không thể tính phí vận chuyển");
      } finally {
        setQuoteLoading(false);
      }
    };

    calculateFeeFromQuote();
  }, [
    items.length,
    totalQuantity,
    appliedVoucher,
    selectedProvinceId,
    selectedDistrictId,
    selectedWardCode,
    selectedAddress,
    selectedProvinceName,
    selectedDistrictName,
    selectedWardName,
  ]);

  useEffect(() => {
    if (isAuthenticated) {
      userService
        .getProfile()
        .then((response) => {
          const profile = response.data;
          if (profile) {
            form.setFieldsValue({
              customerName: form.getFieldValue("customerName") || profile.fullName,
              phone: form.getFieldValue("phone") || profile.phone,
            });
          }
        })
        .catch((error) =>
          console.error("Không thể tải thông tin người dùng:", error),
        );
    }
  }, [isAuthenticated, form]);

  const handleAddressSelect = async (
    address: Address,
    options: { closeModal?: boolean; showError?: boolean; index?: number } = {},
  ) => {
    const { closeModal = true, showError = true, index = null } = options;

    try {
      setSelectingAddressIndex(index);
      const resolvedAddress = await resolveSavedAddress(address);

      form.setFieldsValue({
        customerName: address.fullName,
        phone: address.phone,
        provinceId: resolvedAddress.provinceId,
        districtId: resolvedAddress.districtId,
        wardCode: resolvedAddress.wardCode,
        provinceName: resolvedAddress.provinceName,
        districtName: resolvedAddress.districtName,
        wardName: resolvedAddress.wardName,
        address: address.address,
        note: address.note,
      });

      setQuote(null);
      setShippingError("");

      if (closeModal) {
        setIsAddressModalVisible(false);
      }
    } catch (error: any) {
      console.error("Không thể chọn địa chỉ đã lưu:", error);
      if (showError) {
        message.error(
          error?.message ||
            "Không thể dùng địa chỉ đã lưu này. Vui lòng chọn lại tỉnh/huyện/xã.",
        );
      }
    } finally {
      setSelectingAddressIndex(null);
    }
  };

  const handleProvinceChange = (_value: number, option: any) => {
    form.setFieldsValue({
      provinceName: option?.label,
      districtId: undefined,
      districtName: undefined,
      wardCode: undefined,
      wardName: undefined,
    });
    setQuote(null);
    setShippingError("");
  };

  const handleDistrictChange = (_value: number, option: any) => {
    form.setFieldsValue({
      districtName: option?.label,
      wardCode: undefined,
      wardName: undefined,
    });
    setQuote(null);
    setShippingError("");
  };

  const handleWardChange = (_value: string, option: any) => {
    form.setFieldsValue({
      wardName: option?.label,
    });
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode) {
      message.warning("Vui lòng nhập mã giảm giá.");
      return;
    }

    try {
      const quoteData = await fetchQuote(voucherCode);
      setAppliedVoucher(voucherCode);
      setAppliedVoucherInfo(
        availableVouchers.find((voucher) => voucher.code === voucherCode) ||
          quoteData,
      );
      const successMessage = null;

      message.success(
        successMessage || `Áp dụng mã "${voucherCode}" thành công!`,
      );
    } catch (error: any) {
      message.error(
        error.response?.data?.message ||
          "Mã giảm giá không hợp lệ hoặc đã xảy ra lỗi.",
      );
    }
  };

  const handlePlaceOrder = async (values: any) => {
    if (!quote) {
      message.warning("Vui long doi he thong tinh lai tong tien don hang.");
      return;
    }

    if (!shippingFee || shippingError || isShippingLoading) {
      message.warning("Vui lòng chọn đủ địa chỉ để tính phí vận chuyển.");
      return;
    }

    const orderData = {
      shippingInfo: {
        customerName: values.customerName,
        phone: values.phone,
        address: values.address,
        province: values.provinceName,
        district: values.districtName,
        ward: values.wardName,
        provinceId: values.provinceId,
        districtId: values.districtId,
        wardCode: values.wardCode,
        provinceName: values.provinceName,
        districtName: values.districtName,
        wardName: values.wardName,
        note: values.note,
      },
      shouldUpdateProfile: values.saveAddress,
      paymentMethodCode: values.paymentMethod,
      items: quoteItems.map((item: any) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      voucherCode: appliedVoucher,
    };

    if (values.paymentMethod === "VNPAY") {
      await submitOrderAndRedirectVnpay(orderData);
      return;
    }

    await submitOrder(orderData);
  };

  const submitOrder = async (orderData: any) => {
    setLoading(true);
    try {
      await orderService.placeOrder(orderData);

      setAppliedVoucher(null);
      setAppliedVoucherInfo(null);
      setVoucherCode("");
      setQuote(null);

      message.success("Đặt hàng thành công!");
      navigate("/cart?tab=pending");
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại.",
      );
      console.error("Failed to place order:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitOrderAndRedirectVnpay = async (orderData: any) => {
    setLoading(true);
    try {
      const placeOrderResponse = await orderService.placeOrder(orderData);
      const createdOrder = placeOrderResponse.data;

      const vnpayResponse = await orderService.createOnlineVnpayPayment(
        createdOrder.id,
      );

      const paymentUrl = vnpayResponse.data.paymentUrl;
      if (!paymentUrl) {
        throw new Error("Không tạo được link thanh toán VNPAY");
      }

      window.location.href = paymentUrl;
    } catch (error: any) {
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Không thể khởi tạo thanh toán VNPAY.",
      );
      console.error("Failed to create VNPAY payment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
        padding: 24,
      }}
    >
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/cart")}
        style={{ marginBottom: 24 }}
      >
        Quay lại giỏ hàng
      </Button>

      <Title level={2} style={{ marginBottom: 24 }}>
        Thanh toán
      </Title>

      <Form form={form} layout="vertical" onFinish={handlePlaceOrder}>
        <Row gutter={[32, 32]}>
          <Col xs={24} lg={14}>
            <Card
              title="1. Thông tin giao hàng"
              bordered={false}
              style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              extra={isShippingLoading && <Spin size="small" />}
            >
              <Form.Item
                name="customerName"
                label="Họ và tên người nhận"
                rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                ]}
              >
                <Input placeholder="Ví dụ: 0123456789" />
              </Form.Item>


              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="provinceId"
                    label="Tỉnh/Thành phố"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn tỉnh/thành phố!",
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      loading={loadingProvinces}
                      placeholder="Chọn tỉnh/thành phố"
                      optionFilterProp="label"
                      options={provinces.map((province) => ({
                        value: province.ProvinceID,
                        label: province.ProvinceName,
                      }))}
                      onChange={handleProvinceChange}
                    />
                  </Form.Item>
                  <Form.Item name="provinceName" hidden>
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="districtId"
                    label="Quận/Huyện"
                    rules={[
                      { required: true, message: "Vui lòng chọn quận/huyện!" },
                    ]}
                  >
                    <Select
                      showSearch
                      loading={loadingDistricts}
                      disabled={!selectedProvinceId}
                      placeholder="Chọn quận/huyện"
                      optionFilterProp="label"
                      options={districts.map((district) => ({
                        value: district.DistrictID,
                        label: district.DistrictName,
                      }))}
                      onChange={handleDistrictChange}
                    />
                  </Form.Item>
                  <Form.Item name="districtName" hidden>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="wardCode"
                    label="Phường/Xã"
                    rules={[
                      { required: true, message: "Vui lòng chọn phường/xã!" },
                    ]}
                  >
                    <Select
                      showSearch
                      loading={loadingWards}
                      disabled={!selectedDistrictId}
                      placeholder="Chọn phường/xã"
                      optionFilterProp="label"
                      options={wards.map((ward) => ({
                        value: ward.WardCode,
                        label: ward.WardName,
                      }))}
                      onChange={handleWardChange}
                    />
                  </Form.Item>
                  <Form.Item name="wardName" hidden>
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="address"
                    label="Địa chỉ chi tiết"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập địa chỉ chi tiết!",
                      },
                    ]}
                  >
                    <Input placeholder="Số nhà, tên đường" />
                  </Form.Item>
                </Col>
              </Row>

              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => {
                  loadUserAddresses();
                  setIsAddressModalVisible(true);
                }}
                style={{ padding: 0, marginBottom: 16 }}
              >
                Chọn địa chỉ đã lưu
              </Button>

              <Form.Item name="note" label="Ghi chú cho đơn hàng">
                <Input.TextArea
                  rows={2}
                  placeholder="Ghi chú thêm cho người bán hoặc shipper"
                />
              </Form.Item>

              <Form.Item name="saveAddress" valuePropName="checked">
                <Checkbox>Lưu thông tin này cho lần mua sắm tiếp theo</Checkbox>
              </Form.Item>
            </Card>

            <Card
              title="Địa chỉ giao hàng"
              bordered={false}
              style={{
                marginTop: 24,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              {(() => {
                const values = form.getFieldsValue([
                  "customerName",
                  "phone",
                  "provinceName",
                  "districtName",
                  "wardName",
                  "address",
                ]);

                const hasCompleteAddress =
                  values.customerName &&
                  values.phone &&
                  values.provinceName &&
                  values.districtName &&
                  values.wardName &&
                  values.address;

                if (!hasCompleteAddress) {
                  return (
                    <Text type="secondary">
                      Vui lòng nhập đầy đủ thông tin giao hàng.
                    </Text>
                  );
                }

                return (
                  <div style={{ lineHeight: 1.8 }}>
                    <div>
                      <Text strong>Người nhận: </Text>
                      <Text>{values.customerName}</Text>
                    </div>
                    <div>
                      <Text strong>Số điện thoại: </Text>
                      <Text>{values.phone}</Text>
                    </div>
                    <div>
                      <Text strong>Địa chỉ: </Text>
                      <Text>
                        {values.address}, {values.wardName},{" "}
                        {values.districtName}, {values.provinceName}
                      </Text>
                    </div>
                  </div>
                );
              })()}
            </Card>

            <Card
              title="2. Mã giảm giá"
              bordered={false}
              style={{
                marginTop: 24,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <Space.Compact style={{ width: "100%" }}>
                <Select
                  showSearch
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Chọn hoặc nhập mã giảm giá"
                  value={voucherCode || undefined}
                  onSelect={(value) => setVoucherCode(value)}
                  onSearch={(value) => setVoucherCode(value)}
                  onChange={(value) => {
                    setVoucherCode(value || "");
                    if (!value) {
                      setAppliedVoucher(null);
                      setAppliedVoucherInfo(null);
                    }
                  }}
                  filterOption={(input, option) =>
                    String(option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={availableVouchers.map((voucher) => ({
                    label: buildVoucherLabel(voucher),
                    value: voucher.code,
                  }))}
                  notFoundContent={
                    isAuthenticated
                      ? "Bạn không có mã giảm giá nào"
                      : "Đăng nhập để xem mã giảm giá của bạn"
                  }
                />

                <Button
                  type="primary"
                  onClick={handleApplyVoucher}
                  disabled={!!appliedVoucher || !voucherCode}
                >
                  Áp dụng
                </Button>
              </Space.Compact>

              {appliedVoucher && (
                <div style={{ marginTop: 12 }}>
                  <Text type="success">
                    Đã áp dụng mã: <strong>{appliedVoucher}</strong>
                  </Text>
                  {appliedVoucherInfo && (
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">
                        {buildVoucherLabel(appliedVoucherInfo)}
                      </Text>
                    </div>
                  )}
                </div>
              )}
            </Card>

            <Card
              title="3. Phương thức thanh toán"
              bordered={false}
              style={{
                marginTop: 24,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <Form.Item
                name="paymentMethod"
                initialValue="CASH"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn phương thức thanh toán!",
                  },
                ]}
              >
                <Radio.Group style={{ width: "100%" }}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Radio
                      value="CASH"
                      style={{
                        border: "1px solid #d9d9d9",
                        borderRadius: 8,
                        padding: 16,
                        width: "100%",
                      }}
                    >
                      <TruckOutlined style={{ marginRight: 8 }} />
                      Thanh toán khi nhận hàng (COD)
                    </Radio>

                    <Radio
                      value="VNPAY"
                      style={{
                        border: "1px solid #d9d9d9",
                        borderRadius: 8,
                        padding: 16,
                        width: "100%",
                      }}
                    >
                      <CreditCardOutlined style={{ marginRight: 8 }} />
                      Thanh toán online qua VNPAY
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card
              title={`Đơn hàng (${quoteItems.length || items.length} sản phẩm)`}
              bordered={false}
              style={{
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                position: "sticky",
                top: 24,
              }}
            >
              <Spin spinning={loading || quoteLoading}>
                <List
                  itemLayout="horizontal"
                  dataSource={quoteItems}
                  renderItem={(item: any) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            shape="square"
                            size={64}
                            src={resolveImageUrl(item.imageUrl)}
                          />
                        }
                        title={
                          <Text>
                            {item.productName}
                            {item.variantCode ? ` - ${item.variantCode}` : ""}
                          </Text>
                        }
                        description={
                          <Row justify="space-between" gutter={[12, 8]}>
                            <Col flex="auto">
                              <Space direction="vertical" size={2}>
                                <Text type="secondary">SL: {item.quantity}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {[item.size, item.color, item.material]
                                    .filter(Boolean)
                                    .join(" / ")}
                                </Text>
                              </Space>
                            </Col>
                            <Col>
                              <Space direction="vertical" size={0} align="end">
                                <Text strong style={{ color: item.promotionId ? "#c81d1d" : undefined }}>
                                  {formatMoney(item.lineTotal)}
                                </Text>
                                {item.promotionId && item.originalPrice > item.unitPrice && (
                                  <Text delete type="secondary" style={{ fontSize: 12 }}>
                                    {formatMoney(item.originalPrice * item.quantity)}
                                  </Text>
                                )}
                              </Space>
                            </Col>
                          </Row>
                        }
                      />
                    </List.Item>
                  )}
                />

                <Divider />

                <Row justify="space-between" style={{ marginBottom: 12 }}>
                  <Text>Tạm tính sau khuyến mãi sản phẩm</Text>
                  <Text strong>{formatMoney(subtotalBeforeVoucher)}</Text>
                </Row>

                <Row justify="space-between" style={{ marginBottom: 12 }}>
                  <Text>Phí vận chuyển</Text>
                  <Text strong>
                    {isShippingLoading
                      ? "Đang tính phí vận chuyển..."
                      : shippingError || formatMoney(shippingFee)}
                  </Text>
                </Row>

                {discount > 0 && (
                  <Row justify="space-between" style={{ marginBottom: 12 }}>
                    <Text type="success">Giảm giá voucher</Text>
                    <Text strong type="success">
                      - {formatMoney(discount)}
                    </Text>
                  </Row>
                )}

                {appliedVoucher && (
                  <Row justify="space-between" style={{ marginBottom: 12 }}>
                    <Text>Mã đã dùng</Text>
                    <Tag color="green">{appliedVoucher}</Tag>
                  </Row>
                )}

                <Divider />

                <Row justify="space-between">
                  <Title level={4} style={{ margin: 0 }}>
                    Tổng cộng
                  </Title>
                  <Title level={4} style={{ color: "#c81d1d", margin: 0 }}>
                    {formatMoney(total)}
                  </Title>
                </Row>

                <Popconfirm
                  title="Xác nhận đặt hàng?"
                  description="Vui lòng kiểm tra lại thông tin giao hàng và sản phẩm trước khi xác nhận."
                  onConfirm={() => form.submit()}
                  okText="Xác nhận"
                  cancelText="Xem lại"
                >
                  <Button
                    type="primary"
                    danger
                    block
                    size="large"
                    loading={loading}
                    disabled={isShippingLoading || !!shippingError || shippingFee <= 0}
                    style={{ marginTop: 24 }}
                  >
                    {loading ? "Đang xử lý..." : "Hoàn tất đặt hàng"}
                  </Button>
                </Popconfirm>
              </Spin>
            </Card>
          </Col>
        </Row>
      </Form>

      <Modal
        title="Chọn địa chỉ giao hàng"
        open={isAddressModalVisible}
        onCancel={() => setIsAddressModalVisible(false)}
        footer={null}
        width={640}
      >
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            onClick={() => {
              form.setFieldsValue({
                provinceId: undefined,
                provinceName: undefined,
                districtId: undefined,
                districtName: undefined,
                wardCode: undefined,
                wardName: undefined,
                address: undefined,
                note: undefined,
              });
              setDistricts([]);
              setWards([]);
              setQuote(null);
              setShippingError("");
              setIsAddressModalVisible(false);
            }}
          >
            Nhập địa chỉ mới
          </Button>
        </div>

        {addresses.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center" }}>
            <Text type="secondary">Không có địa chỉ đã lưu</Text>
          </div>
        ) : (
          <List
            dataSource={addresses}
            renderItem={(address, index) => (
              <List.Item
                actions={[
                  getAddressKey(address) === defaultAddressKey ? (
                    <Tag key="default" color="blue">
                      Mặc định
                    </Tag>
                  ) : (
                    <Button
                      key="set-default"
                      type="link"
                      loading={selectingAddressIndex === index}
                      onClick={() => handleSetDefaultAddress(address, index)}
                    >
                      Đặt mặc định
                    </Button>
                  ),
                  <Button
                    key="select"
                    type="link"
                    loading={selectingAddressIndex === index}
                    onClick={() => handleAddressSelect(address, { index })}
                  >
                    Chọn
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={`${address.fullName} - ${address.phone}`}
                  description={`${address.address}, ${
                    address.wardName || address.ward || ""
                  }, ${address.districtName || address.district || ""}, ${
                    address.provinceName || address.province || ""
                  }`}
                />
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
};

export default CheckoutPage;
