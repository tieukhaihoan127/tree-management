const ProductCategory = require("../../model/product-category.model");

const systemConfig = require("../../config/system");
const createTreeHelper = require("../../helpers/createTree");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const Product = require("../../model/product.model");
// [GET] /admin/products-category
module.exports.index = async (req, res) => {
    const filterStatus = filterStatusHelper(req.query);

    let find = {
        deleted: false
    };
    if(req.query.status){
        find.status = req.query.status;
    }

    const objectSearch = searchHelper(req.query);

    if(objectSearch.regex){
      find.title = objectSearch.regex;
    }

    const countProducts = await ProductCategory.count(find);
    let objectPagination = paginationHelper(
      {
        currentPage: 1,
        limitItems: 4
      },
      req.query,
      countProducts
    );

  // Sort
  let sort = {};

  if(req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    sort.position = "desc";
  }
  // End Sort

    // const products  = await ProductCategory.find(find).sort(sort).limit(objectPagination.limitItems).skip(objectPagination.skip);
    const products  = await ProductCategory.find(find).sort(sort);
    const newRecords = createTreeHelper.tree(products);

  res.render("admin/pages/products-category/index", {
    pageTitle: "Danh mục sản phẩm",
    records: newRecords,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination
  });
};

// [GET] /admin/products-category/create
module.exports.create = async (req, res) => {
  let find = {
    deleted: false
  };

  const records = await ProductCategory.find(find);

  const newRecords = createTreeHelper.tree(records);

  res.render("admin/pages/products-category/create", {
    pageTitle: "Tạo danh mục sản phẩm",
    records: newRecords 
  });
};

// [POST] /admin/products-category/create
module.exports.createPost = async (req, res) => {
  // const permissions = res.locals.role.permissions;

  // if(permissions.includes("products-category_create")) {
  //   console.log("Có quyền");
  // } else {
  //   res.send("403");
  //   return;
  // }
  if(req.body.position == "") {
    const count = await ProductCategory.count();
    req.body.position = count + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }

  const record = new ProductCategory(req.body);
  await record.save();

  res.redirect(`${systemConfig.prefixAdmin}/products-category`);
};


// [PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req,res) => {
  const status = req.params.status;
  const id = req.params.id;
  console.log(status);
  console.log(id);
  
  await ProductCategory.updateOne({ _id: id}, {status: status});
  req.flash("success","Cập nhật trạng thái thành công!");
  res.redirect("back");
}

// [PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req,res) => {
  const type = req.body.type;
  const ids = req.body.ids.split(", ");
  switch (type) {
    case "active":
      await ProductCategory.updateMany( {_id: { $in: ids} }, { status: "active" });
      req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
      break;
    case "inactive":
      await ProductCategory.updateMany( {_id: { $in: ids} }, { status: "inactive" });
      req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
      break;
    case "delete-all":
      await ProductCategory.updateMany( {_id: { $in: ids} }, { 
        deleted: true,
        deletedAt: new Date(),
       });
       req.flash("success", `Đã xóa thành công ${ids.length} sản phẩm!`);
      break;
    case "change-position":
        for( const item of ids) {
          let [id,position] = item.split("-");
          position = parseInt(position);
          await ProductCategory.updateOne({ _id: id }, { position: position });
          req.flash("success", `Đã đổi vị trí thành công ${ids.length} sản phẩm!`);
        }
        break;
    default:
      break;
  }
  res.redirect("back");
}


// [DELETE] /admin/products/delete/:id
module.exports.deleteItem = async (req,res) => {
  const id = req.params.id;

  await ProductCategory.updateOne({ _id: id }, { 
    deleted: true,
    deletedAt: new Date()
  });
  req.flash("success", `Đã xóa thành công sản phẩm!`);
  res.redirect("back");
}


// // [GET] /admin/products/create
// module.exports.create = async (req,res) => {
//   res.render("admin/pages/products/create", {
//     pageTitle: "Thêm mới sản phẩm",
//   });
// };


// // [POST] /admin/products/create
// module.exports.createPost = async (req,res) => {

//   req.body.price = parseInt(req.body.price);
//   req.body.discountPercentage = parseInt(req.body.discountPercentage);
//   req.body.stock = parseInt(req.body.stock);

//   if(req.body.position == "") {
//     const countProducts = await Product.count();
//     req.body.position = countProducts + 1;
//   }
//   else {
//     req.body.position = parseInt(req.body.position);
//   }


//   const product = new Product(req.body);
//   await product.save();

//   res.redirect(`${systemConfig.prefixAdmin}/products`);
// };

// [GET] /admin/products-category/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;

      const data = await ProductCategory.findOne({
        _id: id,
        deleted: false
      });

      const records = await ProductCategory.find({
        deleted: false
      });

      const newRecords = createTreeHelper.tree(records);
      console.log(newRecords)

      res.render("admin/pages/products-category/edit", {
        pageTitle: "Chỉnh sửa danh mục sản phẩm",
        data: data,
        records: newRecords
      });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
  }
};

// [PATCH] /admin/products-category/edit/:id
module.exports.editPatch = async (req, res) => {
  const id = req.params.id;

  req.body.position = parseInt(req.body.position);

  await ProductCategory.updateOne({ _id: id }, req.body);

  res.redirect("back");
};

// [GET] /admin/products-category/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id
    };

    const product = await ProductCategory.findOne(find);
    
    const records = await ProductCategory.find({
      deleted: false
    });

    const newRecords = createTreeHelper.tree(records);
    console.log(newRecords);


    res.render("admin/pages/products-category/detail", {
      pageTitle: product.title,
      product: product,
      record: newRecords
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  }
};