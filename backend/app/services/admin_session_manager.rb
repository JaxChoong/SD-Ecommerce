require "singleton"
require "securerandom"

class AdminSessionManager
  include Singleton

  def initialize
    # Back the session state in a global variable so it survives class reloading in development mode
    $admin_active_session ||= { token: nil, expires_at: nil }
  end

  def active_token
    $admin_active_session[:token]
  end

  def active_token=(val)
    $admin_active_session[:token] = val
  end

  def expires_at
    $admin_active_session[:expires_at]
  end

  def expires_at=(val)
    $admin_active_session[:expires_at] = val
  end

  # Starts a new session, returning the token. This automatically clears any previous active token.
  def start_session(username)
    token = SecureRandom.hex(32)
    self.active_token = token
    self.expires_at = 2.hours.from_now
    token
  end

  # Validates the token. Returns true if valid, false if expired or mismatch.
  # Implements sliding expiration on successful verification.
  def validate_session(token)
    return false if token.blank?
    return false if active_token.nil? || active_token != token

    if Time.current > expires_at
      clear_session
      return false
    end

    # Slide expiration window forward on activity
    self.expires_at = 2.hours.from_now
    true
  end

  def clear_session
    self.active_token = nil
    self.expires_at = nil
  end
end
