// Chức năng gửi yêu cầu
const listBtnAddFriend = document.querySelectorAll("[btn-add-friend]");
if(listBtnAddFriend.length > 0) {
  listBtnAddFriend.forEach(button => {
    button.addEventListener("click", () => {
      button.closest(".box-user").classList.add("add");

      const userId = button.getAttribute("btn-add-friend");
      // console.log(userId);

      socket.emit("CLIENT_ADD_FRIEND", userId);
    });
  });
}
// Hết Chức năng gửi yêu cầu

// Hết Chức năng gửi yêu cầu


// Chức năng hủy gửi yêu cầu
const listBtnCancelFriend = document.querySelectorAll("[btn-cancel-friend]");
if(listBtnCancelFriend.length > 0) {
  listBtnCancelFriend.forEach(button => {
    button.addEventListener("click", () => {
      button.closest(".box-user").classList.remove("add");

      const userId = button.getAttribute("btn-cancel-friend");
      // console.log(userId);

      socket.emit("CLIENT_CANCEL_FRIEND", userId);
    });
  });
}
// Hết Chức năng hủy gửi yêu cầu

// Hết Chức năng hủy gửi yêu cầu


// Chức năng từ chối kết bạn
const refuseFriend = (button) => {
  button.addEventListener("click", () => {
    button.closest(".box-user").classList.add("refuse");

    const userId = button.getAttribute("btn-refuse-friend");

    socket.emit("CLIENT_REFUSE_FRIEND", userId);
  });
};

const listBtnRefuseFriend = document.querySelectorAll("[btn-refuse-friend]");
if(listBtnRefuseFriend.length > 0) {
  listBtnRefuseFriend.forEach(button => {
    refuseFriend(button);
  });
}
// Hết Chức năng từ chối kết bạn

// Chức năng chấp nhận kết bạn
const acceptFriend = (button) => {
  button.addEventListener("click", () => {
    button.closest(".box-user").classList.add("accepted");

    const userId = button.getAttribute("btn-accept-friend");

    socket.emit("CLIENT_ACCEPT_FRIEND", userId);
  });
}

const listBtnAcceptFriend = document.querySelectorAll("[btn-accept-friend]");
if(listBtnAcceptFriend.length > 0) {
  listBtnAcceptFriend.forEach(button => {
    acceptFriend(button);
  });
}
// Hết Chức năng chấp nhận kết bạn

// SERVER_RETURN_LENGTH_ACCEPT_FRIEND
const badgeUsersAccept = document.querySelector("[badge-users-accept]");
if(badgeUsersAccept) {
  const userId = badgeUsersAccept.getAttribute("badge-users-accept");
  socket.on("SERVER_RETURN_LENGTH_ACCEPT_FRIEND", (data) => {
    if(userId === data.userId) {
      badgeUsersAccept.innerHTML = data.lengthAcceptFriends;
    }
  });
}
// End SERVER_RETURN_LENGTH_ACCEPT_FRIEND


// SERVER_RETURN_INFO_ACCEPT_FRIEND

  socket.on("SERVER_RETURN_INFO_ACCEPT_FRIEND", (data) => {
     // Trang lời mời đã nhận
    const dataUsersAccept = document.querySelector("[data-users-accept]");
    if(dataUsersAccept) {
  const userId = dataUsersAccept.getAttribute("data-users-accept");
    if(userId === data.userId) {
      // Vẽ user ra giao diện
      const div = document.createElement("div");
      div.classList.add("col-6");
      div.setAttribute("user-id", data.infoUserA._id);

      div.innerHTML = `
        <div class="box-user">
          <div class="inner-avatar">
            <img src="/images/avatar.png" alt="${data.infoUserA.fullName}">
          </div>
          <div class="inner-info">
            <div class="inner-name">
            ${data.infoUserA.fullName}
            </div>
            <div class="inner-buttons">
              <button
                class="btn btn-sm btn-primary mr-1"
                btn-accept-friend="${data.infoUserA._id}"
              >
                Chấp nhận
              </button>
              <button
                class="btn btn-sm btn-secondary mr-1"
                btn-refuse-friend="${data.infoUserA._id}"
              >
                Xóa
              </button>
              <button
                class="btn btn-sm btn-secondary mr-1"
                btn-deleted-friend=""
                disabled=""
              >
                Đã xóa
              </button>
              <button
                class="btn btn-sm btn-primary mr-1"
                btn-accepted-friend=""
                disabled=""
              >
                Đã chấp nhận
              </button>
            </div>
          </div>
        </div>
      `;

      dataUsersAccept.appendChild(div);
      // Hết Vẽ user ra giao diện

      // Hủy lời mời kết bạn
      const buttonRefuse = div.querySelector("[btn-refuse-friend]");
      refuseFriend(buttonRefuse);
      // Hết Hủy lời mời kết bạn

      // Chấp nhận lời mời kết bạn
      const buttonAccept = div.querySelector("[btn-accept-friend]");
      acceptFriend(buttonAccept);
      // Hết Chấp nhận lời mời kết bạn
    }
  }
  // Trang Danh sách người dùng
  const dataUsersNotFriend = document.querySelector("[data-users-not-friend]");
  if(dataUsersNotFriend) {
    const userId = dataUsersNotFriend.getAttribute("data-users-not-friend");
    if(userId === data.userId) {
      const boxUserRemove = dataUsersNotFriend.querySelector(`[user-id='${data.infoUserA._id}']`);
      if(boxUserRemove) {
        dataUsersNotFriend.removeChild(boxUserRemove);
      }
    }
  }
});
// End SERVER_RETURN_INFO_ACCEPT_FRIEND

// SERVER_RETURN_USER_ID_CANCEL_FRIEND
socket.on("SERVER_RETURN_USER_ID_CANCEL_FRIEND", (data) => {
  const boxUserRemove = document.querySelector(`[user-id='${data.userIdA}']`);
  if(boxUserRemove) {
    const dataUsersAccept = document.querySelector("[data-users-accept]");
    const userIdB = badgeUsersAccept.getAttribute("badge-users-accept");
    if(userIdB === data.userIdB) {
      dataUsersAccept.removeChild(boxUserRemove);
    }
  }
});
// End SERVER_RETURN_USER_ID_CANCEL_FRIEND

// SERVER_RETURN_USER_STATUS_ONLINE
socket.on("SERVER_RETURN_USER_STATUS_ONLINE", (data) => {
  const dataUsersFriend = document.querySelector("[data-users-friend]");
  if(dataUsersFriend) {
    const boxUser = dataUsersFriend.querySelector(`[user-id="${data.userId}"]`);
    if(boxUser) {
      const boxStatus = boxUser.querySelector("[status]");
      boxStatus.setAttribute("status", data.status);
    }
  }
});
// End SERVER_RETURN_USER_STATUS_ONLINE