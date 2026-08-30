import "@typespec/rest";
import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Rest;
using TypeSpec.Http;
using TypeSpec.OpenAPI;

// ----- Общие модели -----
model Money {
  amount: int32;
}
model ApiError {
  code: string;
  message: string;
  details?: unknown;
}
model ErrorResponse {
  error: ApiError;
}

// ----- Пользователь -----
model User {
  id: int32;
  email: string;
  createdAt: string;
  updatedAt: string;
}
model RegisterRequest {
  email: string;
  password: string;
}
model LoginRequest {
  email: string;
  password: string;
}
model LoginResponse {
  token: string;
  user: User;
}

// ----- Каталог -----
model Category {
  id: int32;
  name: string;
  slug: string;
}
model Product {
  id: int32;
  name: string;
  slug: string;
  description?: string;
  price: Money;
  imageUrl?: string;
  available: boolean;
  category: Category;
}
model ProductListParams {
  @query category?: string;
  @query minPrice?: int32;
  @query maxPrice?: int32;
  @query available?: boolean;
  @query search?: string;
  @query page?: int32;
  @query limit?: int32;
}
model ProductListResponse {
  items: Product[];
  total: int32;
  page: int32;
  limit: int32;
  totalPages: int32;
}

// ----- Промо-блоки -----
model PromoBlock {
  id: int32;
  title: string;
  text: string;
  product: Product;
}

// ----- Заказы -----
model OrderItem {
  productId: int32;
  quantity: int32;
  name: string;
  price: Money;
}
model Order {
  id: int32;
  userId: int32;
  items: OrderItem[];
  total: int32;
  status: string;
  deliveryMethod: string;
  recipientName: string;
  phone: string;
  address?: string;
  createdAt: string;
}
model CreateOrderRequest {
    items: {
    productId: int32;
    quantity: int32;
  }[];
  deliveryMethod: "delivery" | "pickup";
  recipientName: string;
  phone: string;
  address?: string;
}
model CreateOrderResponse {
  order: Order;
}

// ----- Сервис -----
@service({
  title: "PC Store API",
  version: "1.0.0",
})
namespace Api {
  @route("/api/auth")
  namespace Auth {
    @post @route("/register") op register(@body body: RegisterRequest): User | ErrorResponse;
    @post @route("/login") op login(@body body: LoginRequest): LoginResponse | ErrorResponse;
    @post @route("/logout") op logout(): { message: string } | ErrorResponse;
    @get @route("/me") op getMe(): User | ErrorResponse;
  }

  @route("/api/catalog")
  namespace Catalog {
    @get @route("/categories") op getCategories(): Category[] | ErrorResponse;
    @get @route("/products") op getProducts(@query params: ProductListParams): ProductListResponse | ErrorResponse;
    @get @route("/products/{slug}") op getProductBySlug(@path slug: string): Product | ErrorResponse;
    @post @route("/products/batch") op getProductsByIds(@body ids: int32[]): Product[] | ErrorResponse;
  }

  @route("/api/promo")
  namespace Promo {
    @get op getPromoBlocks(): PromoBlock[] | ErrorResponse;
  }

  @route("/api/orders")
  namespace Orders {
    @post op createOrder(@body body: CreateOrderRequest): CreateOrderResponse | ErrorResponse;
    @get op getMyOrders(): Order[] | ErrorResponse;
    @get @route("/{id}") op getOrderById(@path id: int32): Order | ErrorResponse;
  }
}