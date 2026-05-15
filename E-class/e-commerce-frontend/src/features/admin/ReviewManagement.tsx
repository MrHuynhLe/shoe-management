import { useEffect, useState } from "react";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { Button, Popconfirm, Rate, Space, Table, Tag, Typography, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { reviewService } from "@/services/review.service";
import type { ReviewItem } from "@/features/review/review.model";

const { Paragraph } = Typography;

const formatDate = (value?: string) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN");
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return maybeError.response?.data?.message || maybeError.message || fallback;
};

export default function ReviewManagement() {
  const [data, setData] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);

  const load = async (nextPage = page, nextSize = size) => {
    setLoading(true);
    try {
      const response = await reviewService.getAdminReviews(nextPage, nextSize);
      setData(response.data.content);
      setTotal(response.data.totalElements);
      setPage(response.data.page);
      setSize(response.data.size);
    } catch (error) {
      message.error(getErrorMessage(error, "Không thể tải danh sách đánh giá"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(0, size);
  }, []);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const nextPage = Math.max((pagination.current ?? 1) - 1, 0);
    const nextSize = pagination.pageSize ?? size;
    load(nextPage, nextSize);
  };

  const hideReview = async (reviewId: number) => {
    try {
      await reviewService.deleteReview(reviewId);
      message.success("Đã ẩn đánh giá");
      await load(page, size);
    } catch (error) {
      message.error(getErrorMessage(error, "Không thể ẩn đánh giá"));
    }
  };

  const columns: ColumnsType<ReviewItem> = [
    {
      title: "STT",
      width: 70,
      render: (_value, _row, index) => page * size + index + 1,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      ellipsis: true,
      render: (value?: string) => value || "Không rõ sản phẩm",
    },
    {
      title: "Người đánh giá",
      dataIndex: "fullName",
      width: 180,
    },
    {
      title: "Rating",
      dataIndex: "rating",
      width: 160,
      render: (value: number) => <Rate disabled value={value} style={{ fontSize: 14 }} />,
    },
    {
      title: "Comment",
      dataIndex: "comment",
      render: (value?: string | null) => (
        <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
          {value || "Không có nhận xét"}
        </Paragraph>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      width: 170,
      render: formatDate,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 120,
      render: (value?: boolean) =>
        value ? <Tag color="green">Hiển thị</Tag> : <Tag>Đã ẩn</Tag>,
    },
    {
      title: "Hành động",
      width: 130,
      render: (_value, row) => (
        <Space>
          <Popconfirm
            title="Ẩn đánh giá này?"
            okText="Ẩn"
            cancelText="Hủy"
            onConfirm={() => hideReview(row.reviewId)}
            disabled={row.status === false}
          >
            <Button danger icon={<DeleteOutlined />} disabled={row.status === false}>
              Ẩn
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table<ReviewItem>
      rowKey="reviewId"
      loading={loading}
      columns={columns}
      dataSource={data}
      scroll={{ x: 1000 }}
      pagination={{
        current: page + 1,
        pageSize: size,
        total,
        showSizeChanger: true,
      }}
      onChange={handleTableChange}
    />
  );
}
