import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Card,
  Col,
  Empty,
  List,
  Progress,
  Rate,
  Row,
  Select,
  Skeleton,
  Space,
  Typography,
  message,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { reviewService } from "@/services/review.service";
import type { ProductReviewResponse, ReviewItem } from "./review.model";

const { Text, Title, Paragraph } = Typography;

interface ProductReviewsSectionProps {
  productId: number;
}

const formatDate = (value?: string) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return maybeError.response?.data?.message || maybeError.message || fallback;
};

const getInitial = (name?: string) => {
  const trimmed = name?.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : <UserOutlined />;
};

export default function ProductReviewsSection({
  productId,
}: ProductReviewsSectionProps) {
  const [data, setData] = useState<ProductReviewResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const reviews = useMemo(() => data?.items ?? [], [data]);
  const totalReviews = data?.totalReviews ?? 0;
  const distribution = data?.ratingDistribution;

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewService.getProductReviews(productId);
      setData(response.data);
    } catch (error) {
      message.error(getErrorMessage(error, "Không thể tải đánh giá sản phẩm"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      loadReviews();
    }
  }, [productId]);

  const getRatingCount = (star: number) => {
    if (!distribution) return 0;
    const map: Record<number, number> = {
      1: distribution.oneStar,
      2: distribution.twoStar,
      3: distribution.threeStar,
      4: distribution.fourStar,
      5: distribution.fiveStar,
    };
    return map[star] ?? 0;
  };

  return (
    <Card
      title={<Title level={4} style={{ margin: 0 }}>Đánh giá sản phẩm</Title>}
      className="review-shell"
      style={{ margin: "24px auto 0" }}
      bodyStyle={{ padding: 24 }}
    >
      <Row gutter={[24, 24]} align="stretch">
        <Col xs={24} md={8} className="review-rating-panel">
          <Space direction="vertical" size={14} style={{ width: "100%" }}>
            <div>
              <Text type="secondary">Điểm trung bình</Text>
              <Space align="baseline" style={{ display: "flex" }}>
                <Title level={1} style={{ margin: 0, color: "#faad14" }}>
                  {(data?.avgRating ?? 0).toFixed(1)}
                </Title>
                <Text type="secondary">/ 5</Text>
              </Space>
              <Rate disabled allowHalf value={data?.avgRating ?? 0} />
              <div style={{ marginTop: 6 }}>
                <Text>{totalReviews} đánh giá</Text>
              </div>
            </div>

            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = getRatingCount(star);
                const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                return (
                  <Space key={star} style={{ width: "100%" }} align="center">
                    <Text style={{ width: 44, fontWeight: star === 5 ? 700 : 500 }}>
                      {star} sao
                    </Text>
                    <Progress
                      percent={percent}
                      showInfo={false}
                      strokeColor="#faad14"
                      style={{ flex: 1, minWidth: 120 }}
                    />
                    <Text type="secondary" style={{ width: 28, textAlign: "right" }}>
                      {count}
                    </Text>
                  </Space>
                );
              })}
            </Space>
          </Space>
        </Col>

        <Col xs={24} md={16} className="review-list-panel">
          <Space
            align="center"
            className="review-list-header"
            style={{ justifyContent: "space-between", width: "100%" }}
          >
            <Title level={5} style={{ margin: 0 }}>
              {totalReviews} đánh giá
            </Title>
            <Select
              value="newest"
              style={{ width: 118 }}
              options={[{ value: "newest", label: "Mới nhất" }]}
            />
          </Space>

          <div className="review-list-content">
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : reviews.length === 0 ? (
              <Empty description="Chưa có đánh giá nào" />
            ) : (
              <List
                itemLayout="vertical"
                dataSource={reviews}
                renderItem={(item: ReviewItem) => (
                  <List.Item key={item.reviewId} style={{ paddingTop: 0 }}>
                    <Card size="small" bordered className="review-item-card">
                      <Space align="start" size={12} style={{ width: "100%" }}>
                        <Avatar size={40}>{getInitial(item.fullName)}</Avatar>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Space
                            align="start"
                            style={{ width: "100%", justifyContent: "space-between" }}
                            wrap
                          >
                            <div>
                              <Text strong>{item.fullName}</Text>
                              <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {formatDate(item.createdAt)}
                                </Text>
                              </div>
                            </div>
                            <Rate disabled value={item.rating} style={{ fontSize: 14 }} />
                          </Space>
                          <Paragraph
                            style={{
                              whiteSpace: "pre-wrap",
                              margin: "10px 0 0",
                            }}
                          >
                            {item.comment || "Không có nhận xét"}
                          </Paragraph>
                        </div>
                      </Space>
                    </Card>
                  </List.Item>
                )}
              />
            )}
          </div>
        </Col>
      </Row>
    </Card>
  );
}
