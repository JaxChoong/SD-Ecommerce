# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_06_07_100006) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "admins", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "password_digest", null: false
    t.datetime "updated_at", null: false
    t.string "username", null: false
    t.index ["username"], name: "index_admins_on_username", unique: true
  end

  create_table "cart_items", primary_key: "cartitemid", force: :cascade do |t|
    t.bigint "cart_id", null: false
    t.datetime "created_at", null: false
    t.bigint "product_id", null: false
    t.integer "quantity", null: false
    t.decimal "unitPrice", precision: 10, scale: 2, null: false
    t.datetime "updated_at", null: false
    t.index ["cart_id"], name: "index_cart_items_on_cart_id"
    t.index ["product_id"], name: "index_cart_items_on_product_id"
  end

  create_table "customers", primary_key: "customerid", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "name", null: false
    t.string "phone", null: false
    t.text "shoppingAddress", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_customers_on_email"
    t.index ["phone"], name: "index_customers_on_phone"
  end

  create_table "order_items", primary_key: "orderitemid", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "order_id", null: false
    t.bigint "product_id", null: false
    t.integer "quantity", null: false
    t.decimal "unitPrice", precision: 10, scale: 2, null: false
    t.datetime "updated_at", null: false
    t.index ["order_id"], name: "index_order_items_on_order_id"
    t.index ["product_id"], name: "index_order_items_on_product_id"
  end

  create_table "order_promotions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.decimal "discountApplied", precision: 10, scale: 2, null: false
    t.bigint "order_id", null: false
    t.bigint "promotion_id", null: false
    t.datetime "updated_at", null: false
    t.index ["order_id", "promotion_id"], name: "index_order_promotions_on_order_and_promotion", unique: true
    t.index ["order_id"], name: "index_order_promotions_on_order_id"
    t.index ["promotion_id"], name: "index_order_promotions_on_promotion_id"
  end

  create_table "orders", primary_key: "orderid", force: :cascade do |t|
    t.datetime "createdAt", null: false
    t.datetime "created_at", null: false
    t.bigint "customer_id", null: false
    t.decimal "finalTotal", precision: 10, scale: 2, null: false
    t.string "paymentMethod", null: false
    t.string "status", default: "pending", null: false
    t.datetime "updated_at", null: false
    t.index ["customer_id"], name: "index_orders_on_customer_id"
  end

  create_table "payments", primary_key: "paymentid", force: :cascade do |t|
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.datetime "created_at", null: false
    t.string "method", null: false
    t.bigint "order_id", null: false
    t.datetime "processedAt", null: false
    t.string "status", null: false
    t.string "transactionId"
    t.datetime "updated_at", null: false
    t.index ["order_id"], name: "index_payments_on_order_id"
  end

  create_table "products", primary_key: "productid", force: :cascade do |t|
    t.decimal "basePrice", precision: 10, scale: 2, null: false
    t.string "category", null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.string "image"
    t.string "name", null: false
    t.string "size", null: false
    t.integer "stockQuantity", default: 0, null: false
    t.datetime "updated_at", null: false
  end

  create_table "promotions", primary_key: "promotionid", force: :cascade do |t|
    t.boolean "IsActive", default: true, null: false
    t.string "category", default: "all"
    t.datetime "created_at", null: false
    t.string "discountTarget", default: "base_price", null: false
    t.decimal "discountValue", precision: 10, scale: 2, null: false
    t.datetime "endDate", null: false
    t.string "name", null: false
    t.string "promoCode", null: false
    t.datetime "startDate", null: false
    t.string "type", null: false
    t.datetime "updated_at", null: false
    t.integer "usageCount", default: 0, null: false
    t.integer "usageLimit"
  end

  create_table "shopping_carts", primary_key: "cartid", force: :cascade do |t|
    t.datetime "createdAt", null: false
    t.datetime "created_at", null: false
    t.bigint "customer_id", null: false
    t.string "status", default: "ordered", null: false
    t.datetime "updated_at", null: false
    t.index ["customer_id"], name: "index_shopping_carts_on_customer_id"
  end

  add_foreign_key "cart_items", "products", primary_key: "productid"
  add_foreign_key "cart_items", "shopping_carts", column: "cart_id", primary_key: "cartid"
  add_foreign_key "order_items", "orders", primary_key: "orderid"
  add_foreign_key "order_items", "products", primary_key: "productid"
  add_foreign_key "order_promotions", "orders", primary_key: "orderid"
  add_foreign_key "order_promotions", "promotions", primary_key: "promotionid"
  add_foreign_key "orders", "customers", primary_key: "customerid"
  add_foreign_key "payments", "orders", primary_key: "orderid"
  add_foreign_key "shopping_carts", "customers", primary_key: "customerid"
end
