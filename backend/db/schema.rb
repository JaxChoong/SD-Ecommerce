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

ActiveRecord::Schema[8.1].define(version: 2026_06_05_134701) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "admins", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "password_digest", null: false
    t.datetime "updated_at", null: false
    t.string "username", null: false
    t.index ["username"], name: "index_admins_on_username", unique: true
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
end
