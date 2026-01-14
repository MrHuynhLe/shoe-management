import { useEffect, useState } from "react";
import { productService } from "@/services/product.service";
import { PageResponse, ProductList } from "./product.model";

const Product = () => {
  const [data, setData] = useState<PageResponse<ProductList>>();
  const [loading, setLoading] = useState(false);
  const IMAGE_BASE_URL = "http://localhost:8080";
  useEffect(() => {
    setLoading(true);
    productService
      .getProducts(0, 12)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Products</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
        {data?.content.map((p) => (
          <div key={p.id}>
            <img
              src={`${IMAGE_BASE_URL}${p.imageUrl}`}
              
              width={150}
              alt={p.name}
            />
            <h4>{p.name}</h4>
            <p>
              {p.minPrice} - {p.maxPrice}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Product;
