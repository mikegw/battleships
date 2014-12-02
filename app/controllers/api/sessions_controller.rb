class Api::SessionsController < ApplicationController

  def create
    user = User.find_by_credentials(
      params[:email],
      params[:password]
    )

    if user
      sign_in(user)
      render json: @user
    else
      render json: ["Invalid Email/Password combo"]
    end

  end

  def destroy
    sign_out
    render json: ["Signed Out!"]
  end

end
