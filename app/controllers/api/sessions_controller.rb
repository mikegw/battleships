class Api::SessionsController < ApplicationController

  def create
    user = User.find_by_credentials(
      params[:user][:email],
      params[:user][:password]
    )

    if user
      sign_in(user)
      render json: user
    else
      render json: {errors: "Invalid Email/Password combo"}, status: :forbidden
    end

  end

  def destroy
    sign_out
    render json: ["Signed Out!"]
  end

end
