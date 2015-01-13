Pusher.app_id = ENV["PUSHER_APP_ID"]
Pusher.key = ENV["PUSHER_KEY"]
Pusher.secret = ENV["PUSHER_SECRET"]
Pusher.host = "api.pusherapp.com"
Pusher.url = "http://#{Pusher.key}:#{Pusher.secret}@#{Pusher.host}/apps/#{Pusher.app_id}"
