class Administrator < ApplicationRecord
  self.table_name = 'admins'

  has_secure_password

  validates :username, presence: true, uniqueness: true
end
