import { axiosClient } from "./axiosClient";
import type {
  ProductReviewResponse,
  ReviewItem,
  ReviewRequest,
} from "@/features/review/review.model";
import type { PageResponse } from "@/features/product/product.model";

export const reviewService = {
  getProductReviews: (productId: number) => {
    return axiosClient.get<ProductReviewResponse>(`/v1/products/${productId}/reviews`);
  },

  createReviewByOrderItem: (orderItemId: number, data: ReviewRequest) => {
    return axiosClient.post<ReviewItem>(`/v1/order-items/${orderItemId}/reviews`, data);
  },

  getAdminReviews: (page = 0, size = 10) => {
    return axiosClient.get<PageResponse<ReviewItem>>("/v1/admin/reviews", {
      params: { page, size },
    });
  },

  deleteReview: (reviewId: number) => {
    return axiosClient.delete<void>(`/v1/admin/reviews/${reviewId}`);
  },
};
