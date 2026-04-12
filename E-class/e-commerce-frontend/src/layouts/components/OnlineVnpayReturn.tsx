import { useEffect, useState } from "react";
import { Button, Card, Descriptions, Result, Space, Spin } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { orderService, OnlineVnpayReturnResponse } from "@/services/order.service";

const OnlineVnpayReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<OnlineVnpayReturnResponse | null>(null);

  useEffect(() => {
    const fetchReturn = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const params: Record<string, string> = {};

        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        const response = await orderService.getOnlineVnpayReturnResult(params);
        setResult(response.data);
      } finally {
        setLoading(false);
      }
    };

    fetchReturn();
  }, [location.search]);

  if (loading) {
    return (
      <Card>
        <Spin />
      </Card>
    );
  }

  return (
    <Card>
      <Space direction="vertical" style={{ width: "100%" }} size={16}>
        {result?.success ? (
          <Result
            status="success"
            title="Thanh toán VNPAY thành công"
            subTitle={result?.message}
          />
        ) : (
          <Result
            status="error"
            title="Thanh toán VNPAY thất bại"
            subTitle={result?.message || "Không xác định"}
          />
        )}

        <Descriptions bordered column={1}>
          <Descriptions.Item label="Mã đơn hàng">
            {result?.orderId ?? "-"}
          </Descriptions.Item>

          <Descriptions.Item label="TxnRef">
            {result?.txnRef ?? "-"}
          </Descriptions.Item>

          <Descriptions.Item label="Mã giao dịch VNPAY">
            {result?.transactionNo ?? "-"}
          </Descriptions.Item>

          <Descriptions.Item label="ResponseCode">
            {result?.responseCode ?? "-"}
          </Descriptions.Item>
        </Descriptions>

        <Button type="primary" onClick={() => navigate("/cart?tab=pending")}>
          Quay lại đơn hàng của tôi
        </Button>
      </Space>
    </Card>
  );
};

export default OnlineVnpayReturn;