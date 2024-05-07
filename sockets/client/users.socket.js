const User = require("../../model/user.model");
const RoomChat = require("../../model/rooms-chat.model");

module.exports = (res) => {
  _io.once('connection', (socket) => {
    // Chức năng gửi yêu cầu
    socket.on("CLIENT_ADD_FRIEND", async (userId) => {
      const myUserId = res.locals.user.id;

      // console.log(myUserId); // Id của A
      // console.log(userId); // Id của B

      // Thêm id của A vào acceptFriends của B
      const existIdAinB = await User.findOne({
        _id: userId,
        acceptFriends: myUserId
      });

      if (!existIdAinB) {
        await User.updateOne({
          _id: userId
        }, {
          $push: { acceptFriends: myUserId }
        });
      }

      // Thêm id của B vào requestFriends của A
      const existIdBinA = await User.findOne({
        _id: myUserId,
        requestFriends: userId
      });

      if (!existIdBinA) {
        await User.updateOne({
          _id: myUserId
        }, {
          $push: { requestFriends: userId }
        });
      }

      // Lấy ra độ dài acceptFriends của B và trả về cho B
      const infoUserB = await User.findOne({
        _id: userId
      });
      const lengthAcceptFriends = infoUserB.acceptFriends.length;

      socket.broadcast.emit("SERVER_RETURN_LENGTH_ACCEPT_FRIEND", {
        userId: userId,
        lengthAcceptFriends: lengthAcceptFriends
      });

      // Lấy info của A trả về cho B
      const infoUserA = await User.findOne({
        _id: myUserId
      }).select("id avatar fullName");

      socket.broadcast.emit("SERVER_RETURN_INFO_ACCEPT_FRIEND", {
        userId: userId,
        infoUserA: infoUserA
      });

      // Lấy Id của A và trả về cho B
      socket.broadcast.emit("SERVER_RETURN_USER_ID_CANCEL_FRIEND", {
        userIdB: userId,
        userIdA: myUserId
      });
    });


    // Chức năng hủy gửi yêu cầu
    socket.on("CLIENT_CANCEL_FRIEND", async (userId) => {
      const myUserId = res.locals.user.id;

      // console.log(myUserId); // Id của A
      // console.log(userId); // Id của B

      // Xóa id của A trong acceptFriends của B
      const existIdAinB = await User.findOne({
        _id: userId,
        acceptFriends: myUserId
      });

      if (existIdAinB) {
        await User.updateOne({
          _id: userId
        }, {
          $pull: { acceptFriends: myUserId }
        });
      }

      // Xóa id của B trong requestFriends của A
      const existIdBinA = await User.findOne({
        _id: myUserId,
        requestFriends: userId
      });

      if (existIdBinA) {
        await User.updateOne({
          _id: myUserId
        }, {
          $pull: { requestFriends: userId }
        });
      }

      // Lấy ra độ dài acceptFriends của B và trả về cho B
      const infoUserB = await User.findOne({
        _id: userId
      });
      const lengthAcceptFriends = infoUserB.acceptFriends.length;

      socket.broadcast.emit("SERVER_RETURN_LENGTH_ACCEPT_FRIEND", {
        userId: userId,
        lengthAcceptFriends: lengthAcceptFriends
      });
    });

    // Chức năng từ chối kết bạn
    socket.on("CLIENT_REFUSE_FRIEND", async (userId) => {
      const myUserId = res.locals.user.id;

      // console.log(myUserId); // Id của B
      // console.log(userId); // Id của A

      // Xóa id của A trong acceptFriends của B
      const existIdAinB = await User.findOne({
        _id: myUserId,
        acceptFriends: userId
      });

      if (existIdAinB) {
        await User.updateOne({
          _id: myUserId
        }, {
          $pull: { acceptFriends: userId }
        });
      }

      // Xóa id của B trong requestFriends của A
      const existIdBinA = await User.findOne({
        _id: userId,
        requestFriends: myUserId
      });

      if (existIdBinA) {
        await User.updateOne({
          _id: userId
        }, {
          $pull: { requestFriends: myUserId }
        });
      }
    });

    // Chức năng chấp nhận kết bạn
    socket.on("CLIENT_ACCEPT_FRIEND", async (userId) => {
      const myUserId = res.locals.user.id;

      // console.log(myUserId); // Id của B
      // console.log(userId); // Id của A


      // Check exist
      const existIdAinB = await User.findOne({
        _id: myUserId,
        acceptFriends: userId
      });

      const existIdBinA = await User.findOne({
        _id: userId,
        requestFriends: myUserId
      });
      // End Check exist

      // Tạo phòng chat chung
      let roomChat;

      if(existIdAinB && existIdBinA) {
        const dataRoom = {
          typeRoom: "friend",
          users: [
            {
              user_id: userId,
              role: "superAdmin"
            },
            {
              user_id: myUserId,
              role: "superAdmin"
            }
          ]
        };

        roomChat = new RoomChat(dataRoom);
        await roomChat.save();
      }
      // Hết Tạo phòng chat chung


      // Thêm {user_id, room_chat_id} của A vào friendList của B
      // Xóa id của A trong acceptFriends của 

      if (existIdAinB) {
        await User.updateOne({
          _id: myUserId
        }, {
          $push: {
            friendList: {
              user_id: userId,
              room_chat_id: roomChat.id
            }
          },
          $pull: { acceptFriends: userId }
        });
      }

      // Thêm {user_id, room_chat_id} của B vào friendList của A
      // Xóa id của B trong requestFriends của A
      if (existIdBinA) {
        await User.updateOne({
          _id: userId
        }, {
          $push: {
            friendList: {
              user_id: myUserId,
              room_chat_id: roomChat.id
            }
          },
          $pull: { requestFriends: myUserId }
        });
      }
    });
  });
}

