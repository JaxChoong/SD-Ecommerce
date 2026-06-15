import { useState, useEffect } from "react";
import { Container } from "../../components/layout/container";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Clock, Mail, MapPin, Phone, User } from "lucide-react";
import { PricingSummary } from "../../components/common/pricing-summary";
import { useAuth } from "../../context/AuthContext";
import { normalizeOrders } from "../../lib/api";
import type { OrderRecord } from "../../types";

export default function AdminPurchases() {
  const { adminToken } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [prevFilters, setPrevFilters] = useState({ startDate: "", endDate: "" });

  if (prevFilters.startDate !== startDate || prevFilters.endDate !== endDate) {
    setPrevFilters({ startDate, endDate });
    setCurrentPage(1);
  }

  const fetchOrders = () => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/orders", {
      headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined,
    })
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.error || `Failed to load orders (${r.status})`);
        }
        return r.json();
      })
      .then((data) => {
        const sorted = normalizeOrders(data).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setOrders(sorted);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load orders"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (startDate) {
      const startMs = new Date(startDate).getTime();
      if (new Date(order.createdAt).getTime() < startMs) return false;
    }
    if (endDate) {
      const endMs = new Date(endDate).getTime();
      if (new Date(order.createdAt).getTime() > endMs) return false;
    }
    return true;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <Container className="py-6 sm:py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-semibold">Recent Orders</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 mb-6 bg-surface p-4 rounded-radius border border-border/20 items-end">
        <div className="space-y-1">
          <Label htmlFor="start-date" className="text-xs font-semibold">
            Start Date & Time
          </Label>
          <Input
            id="start-date"
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="end-date" className="text-xs font-semibold">
            End Date & Time
          </Label>
          <Input
            id="end-date"
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(startDate || endDate) && (
            <Button
              variant="outline"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="w-full sm:w-auto"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading recent purchases...</p>
      ) : error ? (
        <p className="text-error">{error}</p>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground">No customer purchases found.</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-muted-foreground">
          No orders match the selected date range.
        </p>
      ) : (
        <div className="space-y-6">
          <div className="space-y-6">
            {paginatedOrders.map((order) => {
              const pm = order.paymentMethod;
              const paymentType =
                typeof pm === "object" && pm !== null && "type" in pm
                  ? pm.type
                  : pm || (order.payment?.method) || "credit_card";

              const displayPaymentType = (() => {
                const typeStr = String(paymentType).toLowerCase();
                if (typeStr === 'ewallet') return 'E-Wallet';
                if (typeStr === 'online_banking') return 'Online Banking';
                if (typeStr === 'credit_card' || typeStr === 'card') return 'Credit Card';
                return typeStr.replace('_', ' ');
              })();

              const itemsSubtotal = order.items.reduce(
                (s, i) => s + i.subtotal,
                0,
              );

              const appliedPromos = order.orderPromotions || [];
              const discountAmount = appliedPromos
                .filter((p) => p.discountTarget === "base_price")
                .reduce((sum, p) => sum + p.discountApplied, 0);
              const shippingDiscountAmount = appliedPromos
                .filter((p) => p.discountTarget === "shipping")
                .reduce((sum, p) => sum + p.discountApplied, 0);

              const baseShipping = itemsSubtotal >= 100 ? 0 : (itemsSubtotal > 0 ? 10 : 0);
              const shippingFee = Math.max(0, baseShipping - shippingDiscountAmount);
              const couponCodesStr = appliedPromos.map((p) => p.code).join(", ");

              return (
                <Card
                  key={order.orderId}
                  className="border border-border/40 overflow-hidden shadow-sm"
                >
                  <div className="bg-surface/50 border-b border-border/40 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground font-mono">
                        Order ID: {order.orderId}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        Txn: {order.payment?.transactionId || "—"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-sm">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          order.status === "paid"
                            ? "bg-success/10 text-success"
                            : order.status === "pending"
                              ? "bg-warning/10 text-warning"
                              : "bg-error/10 text-error"
                        }`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                      <p className="font-semibold text-base">
                        RM{order.finalTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <CardContent className="p-4 sm:p-6 grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-3 min-w-0">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Items
                      </h3>
                      <div className="divide-y divide-border/30">
                        {order.items.map((item) => (
                          <div
                            key={item.orderItemId}
                            className="flex gap-3 py-3 first:pt-0 last:pb-0"
                          >
                            <div className="h-12 w-12 rounded bg-surface overflow-hidden shrink-0">
                              <img
                                src={item.productImage}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm line-clamp-2 break-words leading-snug">
                                {item.productName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity}{item.size ? ` • Size: ${item.size}` : ''} • RM{item.unitPrice.toFixed(2)} each
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-semibold">
                                RM{item.subtotal.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-border/30 pt-3 flex flex-col items-end gap-1.5 text-sm w-full">
                        {appliedPromos.length > 0 && (
                          <div className="w-full max-w-xs space-y-1 text-xs text-muted-foreground border-b border-border/20 pb-2 mb-2">
                            <p className="font-semibold text-foreground text-left">Applied Coupons:</p>
                            {appliedPromos.map((promo, idx) => (
                              <div key={idx} className="flex justify-between text-success">
                                <span>{promo.code} ({promo.discountTarget === "shipping" ? "Shipping" : "Discount"})</span>
                                <span>-RM{promo.discountApplied.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <PricingSummary
                          subtotal={itemsSubtotal}
                          discount={discountAmount}
                          shippingDiscount={shippingDiscountAmount}
                          shipping={shippingFee}
                          total={order.finalTotal}
                          couponCode={couponCodesStr}
                          totalLabel="Total Paid"
                          className="w-full max-w-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 border-t md:border-t-0 md:border-l border-border/30 pt-4 md:pt-0 md:pl-6 min-w-0">
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          Customer
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="font-medium">{order.customer.name}</span>
                          </div>
                          <div className="flex items-center gap-2 min-w-0">
                            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="truncate">{order.customer.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span>{order.customer.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-border/20">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Shipping Address
                        </h3>
                        <div className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="whitespace-pre-line">
                            {order.customer.shoppingAddress}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/20">
                        <p className="text-xs text-muted-foreground">
                          Payment Method:{" "}
                          <span className="font-medium text-foreground">
                            {displayPaymentType}
                          </span>
                        </p>
                        {order.payment && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Payment Status:{" "}
                            <span className="font-medium text-foreground capitalize">
                              {order.payment.status}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/30 pt-4 mt-6">
              <span className="text-sm text-muted-foreground text-center sm:text-left">
                Showing{" "}
                {Math.min(
                  filteredOrders.length,
                  (currentPage - 1) * itemsPerPage + 1,
                )}{" "}
                to {Math.min(filteredOrders.length, currentPage * itemsPerPage)} of{" "}
                {filteredOrders.length} orders
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
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
