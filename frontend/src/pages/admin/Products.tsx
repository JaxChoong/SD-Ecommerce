import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Container } from "../../components/layout/container";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useAuth } from "../../context/AuthContext";
import type { Product } from "../../types";
import { Plus, Pencil, Trash2 } from "lucide-react";

const categories = [
  "Shirts",
  "Pants",
  "Shoes",
  "Jackets",
  "Accessories",
  "Dresses",
];

interface DbProduct {
  productid: number | string;
  name: string;
  category: string;
  basePrice: number | string;
  stockQuantity: number | string;
  description?: string;
  image?: string;
  size?: string;
  created_at: string;
}

// Helper to provide nice category-specific clothing images since the ERD has no image column
const getProductImage = (p: { category?: string }) => {
  const cat = (p.category || "").toLowerCase();
  if (cat.includes("shirt") || cat.includes("top") || cat.includes("tee")) {
    return "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&h=200&fit=crop";
  }
  if (
    cat.includes("pant") ||
    cat.includes("jean") ||
    cat.includes("trouser") ||
    cat.includes("bottom")
  ) {
    return "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=200&fit=crop";
  }
  if (
    cat.includes("shoe") ||
    cat.includes("sneaker") ||
    cat.includes("footwear")
  ) {
    return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop";
  }
  if (
    cat.includes("jacket") ||
    cat.includes("coat") ||
    cat.includes("outerwear")
  ) {
    return "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=200&fit=crop";
  }
  return "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200&h=200&fit=crop"; // fallback shirt
};

export default function AdminProducts() {
  const { adminToken } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [prevFilters, setPrevFilters] = useState({
    search: "",
    selectedCategory: "",
    minPrice: "",
    maxPrice: "",
  });

  if (
    prevFilters.search !== search ||
    prevFilters.selectedCategory !== selectedCategory ||
    prevFilters.minPrice !== minPrice ||
    prevFilters.maxPrice !== maxPrice
  ) {
    setPrevFilters({ search, selectedCategory, minPrice, maxPrice });
    setCurrentPage(1);
  }

  const fetchProducts = () => {
    setLoading(true);

    // Construct search and filter query parameters
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (selectedCategory && selectedCategory !== "all")
      params.set("category", selectedCategory);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    const queryString = params.toString() ? `?${params.toString()}` : "";

    fetch(`/api/admin/inventory${queryString}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load products");
        return r.json();
      })
      .then((data) => {
        const mapped: Product[] = (data || []).map((p: DbProduct) => ({
          id: String(p.productid),
          name: p.name,
          slug: p.name.toLowerCase().replace(/\s+/g, "-"),
          description: p.description || "",
          price: Number(p.basePrice),
          stock: Number(p.stockQuantity),
          category: p.category,
          image: p.image || getProductImage(p),
          rating: 0,
          reviewCount: 0,
          createdAt: p.created_at,
        }));
        setProducts(mapped);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedCategory, minPrice, maxPrice, adminToken]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/inventory/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchProducts();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete product";
      alert(msg);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setMinPrice("");
    setMaxPrice("");
  };

  const hasActiveFilters =
    search !== "" ||
    selectedCategory !== "all" ||
    minPrice !== "" ||
    maxPrice !== "";

  const itemsPerPage = 10;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <Container className="py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/admin/products/new">
            <Plus className="h-4 w-4 mr-1" /> New Product
          </Link>
        </Button>
      </div>

      {/* Search and Filters bar */}
      <div className="grid gap-4 sm:grid-cols-4 lg:grid-cols-5 mb-6 bg-surface p-4 rounded-radius border border-border/20">
        <div className="sm:col-span-2 lg:col-span-2">
          <Input
            placeholder="Search name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min RM"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="flex-1"
          />
          <Input
            type="number"
            placeholder="Max RM"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="flex-1"
          />
        </div>
        <div className="flex items-center justify-end sm:col-span-4 lg:col-span-1">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground w-full lg:w-auto"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">No products found.</p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Price</th>
                  <th className="pb-3 font-medium">Stock</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((p) => (
                  <tr key={p.id} className="border-b border-border">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-radius bg-surface overflow-hidden shrink-0">
                          <img
                            src={p.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {p.category}
                    </td>
                    <td className="py-3 pr-4">RM{p.price.toFixed(2)}</td>
                    <td className="py-3 pr-4">{p.stock}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/products/${p.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 className="h-4 w-4 text-error" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {paginatedProducts.map((p) => (
              <div
                key={p.id}
                className="bg-surface rounded-radius p-3 flex gap-3"
              >
                <div className="h-16 w-16 rounded-radius bg-background overflow-hidden shrink-0">
                  <img
                    src={p.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.category} • {p.stock} in stock
                  </p>
                  <p className="text-sm font-medium mt-1">
                    RM{p.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 w-8 p-0"
                  >
                    <Link to={`/admin/products/${p.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(p.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-error" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/30 pt-4 mt-6">
              <span className="text-sm text-muted-foreground text-center sm:text-left">
                Showing{" "}
                {Math.min(
                  products.length,
                  (currentPage - 1) * itemsPerPage + 1,
                )}{" "}
                to {Math.min(products.length, currentPage * itemsPerPage)} of{" "}
                {products.length} products
              </span>
              <div className="flex items-center justify-center gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm font-medium whitespace-nowrap">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Container>
  );
}
