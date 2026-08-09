import "@typespec/rest";
import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Rest;
using TypeSpec.Http;
using TypeSpec.OpenAPI;

// ---------- Общие модели ----------
model Money { amount: int32; }
model ApiError { code: string; message: string; details?: unknown; }
model ErrorResponse { error: ApiError; }

// ---------- Пользователь ----------
model User { id: int32; email: string; createdAt: string; updatedAt: string; }
model RegisterRequest { email: string; password: string; }
model LoginRequest { email: string; password: string; }
model LoginResponse { token: string; user: User; }

// ---------- Каталог ----------
model Category { id: int32; name: string; slug: string; }
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

// ---------- Операции ----------
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
}