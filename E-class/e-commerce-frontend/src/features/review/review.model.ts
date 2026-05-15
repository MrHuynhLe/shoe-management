export interface ReviewItem {
  reviewId: number;
  productId: number;
  productName?: string;
  userId: number;
  fullName: string;
  rating: number;
  comment: string | null;
  status?: boolean;
  createdAt: string;
}

export interface ProductReviewResponse {
  avgRating: number;
  totalReviews: number;
  ratingDistribution?: {
    oneStar: number;
    twoStar: number;
    threeStar: number;
    fourStar: number;
    fiveStar: number;
  };
  items: ReviewItem[];
}

export interface ReviewRequest {
  rating: number;
  comment: string;
}
