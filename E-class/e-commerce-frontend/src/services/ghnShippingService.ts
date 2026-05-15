import axios from "axios";

const GHN_BASE_URL =
  import.meta.env.VITE_GHN_BASE_URL ||
  "https://dev-online-gateway.ghn.vn/shiip/public-api";

const GHN_TOKEN =
  import.meta.env.VITE_GHN_TOKEN || "dd94ceb1-2e67-11f1-b97a-a2781b0fd428";

const SHOP_ID = Number(import.meta.env.VITE_GHN_SHOP_ID || 0);
const FROM_DISTRICT_ID = Number(import.meta.env.VITE_GHN_FROM_DISTRICT_ID || 0);
const FROM_WARD_CODE = import.meta.env.VITE_GHN_FROM_WARD_CODE || "";

export interface GhnProvince {
  ProvinceID: number;
  ProvinceName: string;
}

export interface GhnDistrict {
  DistrictID: number;
  DistrictName: string;
}

export interface GhnWard {
  WardCode: string;
  WardName: string;
}

export interface CalculateShippingFeeInput {
  toDistrictId: number;
  toWardCode: string;
  totalQuantity: number;
  totalProductAmount: number;
  height?: number;
  length?: number;
  width?: number;
}

const ghnClient = axios.create({
  baseURL: GHN_BASE_URL,
  headers: {
    Token: GHN_TOKEN,
    "Content-Type": "application/json",
  },
});

const assertGhnConfig = () => {
  if (!GHN_TOKEN) {
    throw new Error("Thiếu GHN token.");
  }

  if (!SHOP_ID || !FROM_DISTRICT_ID || !FROM_WARD_CODE) {
    throw new Error(
      "Thiếu SHOP_ID, FROM_DISTRICT_ID hoặc FROM_WARD_CODE cho GHN.",
    );
  }
};

export const getProvinces = async (): Promise<GhnProvince[]> => {
  try {
    const response = await ghnClient.get("/master-data/province");
    return response.data?.data || [];
  } catch (error) {
    console.error("GHN getProvinces error:", error);
    throw error;
  }
};

export const getDistricts = async (
  provinceId: number,
): Promise<GhnDistrict[]> => {
  try {
    const response = await ghnClient.post("/master-data/district", {
      province_id: provinceId,
    });
    return response.data?.data || [];
  } catch (error) {
    console.error("GHN getDistricts error:", error);
    throw error;
  }
};

export const getWards = async (districtId: number): Promise<GhnWard[]> => {
  try {
    const response = await ghnClient.post("/master-data/ward", {
      district_id: districtId,
    });
    return response.data?.data || [];
  } catch (error) {
    console.error("GHN getWards error:", error);
    throw error;
  }
};

export const getAvailableServices = async (
  toDistrictId: number,
): Promise<number> => {
  assertGhnConfig();

  try {
    const response = await ghnClient.post("/v2/shipping-order/available-services", {
      shop_id: SHOP_ID,
      from_district: FROM_DISTRICT_ID,
      to_district: toDistrictId,
    });

    const serviceId = response.data?.data?.[0]?.service_id;

    if (!serviceId) {
      throw new Error("Không tìm thấy dịch vụ vận chuyển GHN phù hợp");
    }

    return serviceId;
  } catch (error) {
    console.error("GHN getAvailableServices error:", error);
    throw error;
  }
};

export const calculateShippingFee = async (
  data: CalculateShippingFeeInput,
): Promise<number> => {
  assertGhnConfig();

  try {
    const serviceId = await getAvailableServices(data.toDistrictId);

    const response = await ghnClient.post(
      "/v2/shipping-order/fee",
      {
        from_district_id: FROM_DISTRICT_ID,
        from_ward_code: FROM_WARD_CODE,
        service_id: serviceId,
        to_district_id: data.toDistrictId,
        to_ward_code: data.toWardCode,
        height: data.height ?? 15,
        length: data.length ?? 35,
        weight: Math.max(data.totalQuantity, 1) * 1000,
        width: data.width ?? 25,
        insurance_value: data.totalProductAmount,
        coupon: null,
      },
      {
        headers: {
          ShopId: String(SHOP_ID),
        },
      },
    );

    const total = response.data?.data?.total;
    if (typeof total !== "number") {
      throw new Error("GHN không trả về phí vận chuyển hợp lệ.");
    }

    return total;
  } catch (error) {
    console.error("GHN calculateShippingFee error:", error);
    throw error;
  }
};
