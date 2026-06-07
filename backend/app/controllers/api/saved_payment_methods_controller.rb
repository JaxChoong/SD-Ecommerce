module Api
  class SavedPaymentMethodsController < ApplicationController
    def index
      records = SavedPaymentMethod.recent
      render json: records.map { |r| SavedPaymentMethod.serialize(r) }
    end

    def create
      attrs = {
        brand:      params[:brand].to_s,
        last4:      params[:last4].to_s,
        expiry:     params[:expiry].to_s,
        holder:     params[:holder].to_s,
        is_default: ActiveModel::Type::Boolean.new.cast(params[:is_default]) || SavedPaymentMethod.count.zero?,
      }

      # If this new card is marked default, unset all others first
      if attrs[:is_default]
        SavedPaymentMethod.update_all(is_default: false)
      end

      record = SavedPaymentMethod.new(attrs)

      if record.save
        render json: SavedPaymentMethod.serialize(record), status: :created
      else
        render json: { success: false, errors: record.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      record = SavedPaymentMethod.find_by(id: params[:id])
      return render(json: { error: "Not found" }, status: :not_found) unless record

      was_default = record.is_default
      record.destroy

      # If we just removed the default, promote the most recent remaining card
      if was_default
        next_default = SavedPaymentMethod.recent.first
        next_default&.update_column(:is_default, true)
      end

      head :no_content
    end

    def default
      record = SavedPaymentMethod.find_by(id: params[:id])
      return render(json: { error: "Not found" }, status: :not_found) unless record

      SavedPaymentMethod.where.not(id: record.id).update_all(is_default: false)
      record.update_column(:is_default, true)

      render json: SavedPaymentMethod.serialize(record)
    end
  end
end
