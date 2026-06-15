require_relative "boot"

require "rails/all"

# Load .env file in development and test environments
if Rails.env.development? || Rails.env.test?
  env_file = File.expand_path("../../.env", __FILE__)
  if File.exist?(env_file)
    File.foreach(env_file) do |line|
      next if line.strip.empty? || line.strip.start_with?("#")
      key, value = line.strip.split("=", 2)
      if key && value
        # Strip surrounding quotes if present
        value = value.gsub(/\A['"]|['"]\z/, '')
        ENV[key] = value
      end
    end
  end
end

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Backend
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 8.1

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.
    config.api_only = true
  end
end
