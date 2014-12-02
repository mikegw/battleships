class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  helper_method :current_user, :current_list, :signed_in?, :require_signed_in!


  def current_user
    @current_user ||= User.find_by_session_token(session[:session_token])
  end

  def current_list
    @current_list ||= (current_user.lists.first || current_user.lists.create!({title: "New List", access: "PRIVATE"}))
  end

  def signed_in?
    !!current_user
  end

  def sign_in(user)
    session[:session_token] = user.reset_session_token!
    @current_user = user
  end

  def sign_out
    current_user.reset_session_token!
    session[:session_token] = nil
  end

  def require_signed_in!
    redirect_to new_session_url unless signed_in?
  end
end
