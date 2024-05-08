const md5 = require("md5");
const Account = require("../../models/account.model");
const Role = require("../../models/role.model");

const systemConfig = require("../../config/system");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");

// [GET] /admin/accounts
module.exports.index = async (req, res) => {
  const filterStatus = filterStatusHelper(req.query);

  let find = {
    deleted: false,
  };

  if(req.query.status){
    find.status = req.query.status;
  }

  const objectSearch = searchHelper(req.query);

  if(objectSearch.regex){
    find.fullName = objectSearch.regex;
  }

  const countProducts = await Account.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 4
    },
    req.query,
    countProducts
  );


  const records = await Account.find(find).select("-password -token").limit(objectPagination.limitItems).skip(objectPagination.skip);
  for (const record of records) {
    const role = await Role.findOne({
      _id: record.role_id,
      deleted: false
    });
    record.role = role;
  }

  res.render("admin/pages/accounts/index", {
    pageTitle: "Danh sách tài khoản",
    records: records,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination
  });
};

// [PATCH] /admin/accounts/change-status/:status/:id
module.exports.changeStatus = async (req,res) => {
  const status = req.params.status;
  const id = req.params.id;
  
  await Account.updateOne({ _id: id}, {status: status});
  req.flash("success","Cập nhật trạng thái thành công!");
  res.redirect("back");
}

// [PATCH] /admin/accounts/change-multi
module.exports.changeMulti = async (req,res) => {
  const type = req.body.type;
  const ids = req.body.ids.split(", ");
  switch (type) {
    case "active":
      await Account.updateMany( {_id: { $in: ids} }, { status: "active" });
      req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
      break;
    case "inactive":
      await Account.updateMany( {_id: { $in: ids} }, { status: "inactive" });
      req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
      break;
    case "delete-all":
      await Account.updateMany( {_id: { $in: ids} }, { 
        deleted: true,
        deletedAt: new Date(),
       });
       req.flash("success", `Đã xóa thành công ${ids.length} sản phẩm!`);
      break;
    default:
      break;
  }
  res.redirect("back");
}


// [DELETE] /admin/products/delete/:id
module.exports.deleteItem = async (req,res) => {
  const id = req.params.id;

  await Account.updateOne({ _id: id }, { 
    deleted: true,
    deletedAt: new Date()
  });
  req.flash("success", `Đã xóa thành công sản phẩm!`);
  res.redirect("back");
}

// [GET] /admin/accounts/create
module.exports.create = async (req, res) => {
  const roles = await Role.find({
    deleted: false
  });

  res.render("admin/pages/accounts/create", {
    pageTitle: "Tạo mới tài khoản",
    roles: roles
  });
};

// [POST] /admin/accounts/create
module.exports.createPost = async (req, res) => {
  const emailExist = await Account.findOne({
    email: req.body.email,
    deleted: false
  });

  if(emailExist) {
    req.flash("error", `Email ${req.body.email} đã tồn tại`);
    res.redirect("back");
  } else {
    req.body.password = md5(req.body.password);

    const record = new Account(req.body);
    await record.save();

    res.redirect(`${systemConfig.prefixAdmin}/accounts`);
  }
};

// [GET] /admin/accounts/edit/:id
module.exports.edit = async (req, res) => {
    let find = {
      _id: req.params.id,
      deleted: false,
    };
  
    try {
      const data = await Account.findOne(find);
  
      const roles = await Role.find({
        deleted: false,
      });
  
      res.render("admin/pages/accounts/edit", {
        pageTitle: "Chỉnh sửa tài khoản",
        data: data,
        roles: roles,
      });
    } catch (error) {
      res.redirect(`/${systemConfig.prefixAdmin}/accounts`);
    }
  };
  
  // [PATCH] /admin/accounts/edit/:id
  module.exports.editPatch = async (req, res) => {
    const id = req.params.id;
  
    const emailExist = await Account.findOne({
      _id: { $ne: id },
      email: req.body.email,
      deleted: false
    });
  
    if(emailExist) {
      req.flash("error", `Email ${req.body.email} đã tồn tại`);
    } else {
      if(req.body.password) {
        req.body.password = md5(req.body.password);
      } else {
        delete req.body.password;
      }
  
      await Account.updateOne({ _id: id }, req.body);
  
      req.flash("success", "Cập nhật tài khoản thành công!");
    }
  
    res.redirect("back");
  };

  // [GET] /admin/accounts/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id
    };    

    const user = await Account.findOne(find);

    const role = await Role.findOne({
      _id: user.role_id,
      deleted: false
    });

    user.role = role;

    res.render("admin/pages/accounts/detail", {
      pageTitle: user.fullName,
      user: user
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/accounts`);
  }
};