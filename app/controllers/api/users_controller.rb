class Api::UsersController < ApplicationController

  before_filter :require_signed_in!, only: [:show, :index]

  def index
  end

  def show
    @user = User.find(params[:id])
    render json: @user
  end

  def create
    @user = User.new(user_params)
    if @user.save
      sign_in(@user)
      render json: @user
    else
      render json: @user.errors.full_messages
    end
  end


  private

  def user_params
    params.require(:user).permit(:username, :email, :password, :passwordconfirm)
  end

end
