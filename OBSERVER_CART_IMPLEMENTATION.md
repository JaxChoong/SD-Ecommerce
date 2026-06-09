# Cart System Observer Pattern Implementation

## 1. Files To Create

No new implementation files were required because the Rails project already contained the Observer Pattern structure from the previous Software Design assignment.

Created for handover/documentation:

- `OBSERVER_CART_IMPLEMENTATION.md`

## 2. Files To Modify

- `backend/app/services/order_notifications/order_processor.rb`
- `backend/app/services/order_notifications/notification_service.rb`
- `backend/app/controllers/carts_controller.rb`
- `backend/test/services/order_processor_test.rb`
- `frontend/vite.config.ts`
- `frontend/src/context/CartContext.tsx`
- `frontend/src/App.tsx`
- `frontend/src/types/index.ts`
- `frontend/src/pages/ProductDetail.tsx`
- `frontend/src/components/product/product-card.tsx`
- `frontend/src/components/cart/cart-item.tsx`

Checkout and payment modules were not modified.

## 3. Full Code Summary

The original Observer Pattern names were preserved exactly:

- `IOrderSubject`
- `IOrderObserver`
- `OrderProcessor`
- `NotificationService`
- `attachObserver()`
- `detachObserver()`
- `notifyObservers()`
- `update(...)`

### `OrderProcessor`

The cart mutation methods now set a cart event before notifying observers:

```ruby
def addItem(product, size, quantity)
  @last_event = :item_added
  # cart add logic...
  notifyObservers
  self
end

def removeItem(cart_item_id)
  @last_event = :item_removed
  # cart remove logic...
  notifyObservers
  self
end

def updateQuantity(cart_item_id, quantity)
  @last_event = :quantity_updated
  # quantity update logic...
  notifyObservers
  self
end

def clearCart
  @last_event = :cart_cleared
  # clear cart logic...
  notifyObservers
  self
end
```

The required presentation breakpoint comments were added inside `notifyObservers()`:

```ruby
def notifyObservers
  # OBSERVER PATTERN BREAKPOINT
  # Place debugger here during presentation.
  # Cart state changed -> notifyObservers() is executed.
  @observers.each { |observer| observer.update(self) }
end
```

The cart JSON response now includes:

```ruby
notificationMessage: @notification_message
```

### `NotificationService`

`NotificationService.update(...)` now prepares cart UI messages after every cart state change:

```ruby
def update(orderProcessor)
  refresh_stock_warnings(orderProcessor)
  apply_coupon(orderProcessor)
  recalculate_totals(orderProcessor)
  prepare_user_notification(orderProcessor)
  log_cart_update(orderProcessor)
end
```

The notification messages are:

```ruby
def prepare_user_notification(orderProcessor)
  orderProcessor.notification_message = case orderProcessor.last_event
                                        when :item_added
                                          "Item added to cart."
                                        when :item_removed
                                          "Item removed from cart."
                                        when :quantity_updated
                                          "Cart quantity updated."
                                        when :cart_cleared
                                          "Cart cleared."
                                        else
                                          nil
                                        end
end
```

### `CartsController`

The cart controller builds an `OrderProcessor`, attaches `NotificationService`, and calls the preserved cart methods:

```ruby
cart = OrderNotifications::OrderProcessor.new(
  items: params[:items] || params.dig(:cart, :items) || [],
  coupon_code: params[:coupon_code] || params[:couponCode] || params.dig(:cart, :couponCode)
)

cart.attachObserver(OrderNotifications::NotificationService.new)
```

Each endpoint returns `cart.to_h`, including subtotal, stock warnings, and `notificationMessage`.

### React Cart Context

`frontend/src/context/CartContext.tsx` now sends cart actions to Rails:

- `addItem()` -> `POST /api/cart/items`
- `removeItem()` -> `DELETE /api/cart/items/:id`
- `updateQuantity()` -> `PATCH /api/cart/items/:id`
- `clearCart()` -> `DELETE /api/cart`

The returned cart snapshot replaces the React cart state and is persisted to LocalStorage for 24 hours using:

```ts
const CART_STORAGE_TTL_MS = 24 * 60 * 60 * 1000
```

When Rails returns `notificationMessage`, the UI displays it using the existing toast system.

## 4. Testing Steps

### Frontend Build

Run:

```bash
cd frontend
npm run build
```

Expected result:

```text
✓ built
```

### Backend Syntax Check

Run:

```bash
ruby -c backend/app/services/order_notifications/order_processor.rb
ruby -c backend/app/services/order_notifications/notification_service.rb
ruby -c backend/app/controllers/carts_controller.rb
```

Expected result:

```text
Syntax OK
```

### Rails Observer Tests

Run after installing the project Ruby/Bundler version:

```bash
cd backend
bin/rails test test/services/order_processor_test.rb
```

Current local blocker:

- The machine is using system Ruby 2.6.
- The project lockfile expects Bundler 4.0.7.
- Rails tests do not start until the correct Ruby/Bundler environment is installed.

### Manual Browser Test

1. Start Rails backend on port `3000`.
2. Start Vite frontend.
3. Open the product listing.
4. Click `Add to Cart`.
5. Confirm toast says `Item added to cart.`
6. Open cart page.
7. Update quantity.
8. Confirm toast says `Cart quantity updated.`
9. Remove item.
10. Confirm toast says `Item removed from cart.`
11. Clear cart through checkout flow or cart method.
12. Confirm cart data is saved under `ezshop_cart` in LocalStorage and expires after 24 hours.

## 5. Presentation Explanation

The cart system keeps the original Observer Pattern class names from the previous Software Design document.

`OrderProcessor` is still the Subject because it extends `IOrderSubject`. The React UI does not directly calculate the final cart response after a mutation. Instead, it sends cart actions to Rails. Rails creates an `OrderProcessor`, attaches `NotificationService` using `attachObserver()`, and then calls one of the cart methods:

- `addItem()`
- `removeItem()`
- `updateQuantity()`
- `clearCart()`

Inside each cart method, the cart state changes first. Immediately after that, `OrderProcessor.notifyObservers()` is executed. This is the demonstration point for the Observer Pattern.

During the presentation, place a debugger inside:

```ruby
def notifyObservers
  # OBSERVER PATTERN BREAKPOINT
  # Place debugger here during presentation.
  # Cart state changed -> notifyObservers() is executed.
  @observers.each { |observer| observer.update(self) }
end
```

When execution reaches this method, explain:

1. `OrderProcessor` does not directly show notifications.
2. `OrderProcessor` only knows it has observers.
3. It loops through observers and calls `update(...)`.
4. `NotificationService` receives the update.
5. `NotificationService.update(...)` validates stock, recalculates subtotal, and prepares the UI notification message.
6. The controller returns the updated cart response to React.
7. React displays the message in a toast and stores the cart in LocalStorage for 24 hours.

This keeps the original assignment architecture:

```text
IOrderSubject
▲
│
OrderProcessor
│
notifyObservers(...)
▼
IOrderObserver
▲
│
NotificationService
```

The Observer Pattern is now adapted for cart UI notifications instead of email notification after payment.
