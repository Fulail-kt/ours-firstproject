const bcrypt = require("bcryptjs");
const product = require("../models/products");
const user = require("../models/user");
const admin = require("../models/admin")
const Coupons = require('../models/coupon')
const categoryModel = require("../models/category");
const subcategoryModel = require("../models/subcategory");
const order = require("../models/order");
const { Parser } = require('json2csv')
const Banner=require('../models/banner')



const banner= async(req,res)=>{
  try{
    const banners=await Banner.find({})
    res.render("admin/banner",{banners})
  }catch(e){
    console.log(e.message)
  }
}

const add_banner = async (req, res) => {
  try {
    const { title, offer } = req.body;
    const image = req.file.filename; // Use req.file.filename to get the filename

    const newBanner = new Banner({
      title,
      offer,
      image,
    });

    await newBanner.save();

    res.status(200).send('Banner added successfully');
  } catch (error) {
    res.status(500).send('Error adding banner');
  }
};


const editbanner = async (req, res) => {
  const bannerId = req.params.id;

  try {
    // Find the banner by ID
    const bannerExist = await Banner.findById(bannerId);

    if (!bannerExist) {
      return res.status(404).send("Banner not found");
    }

    // Create an object with updated values
    const updateBanner = {
      title: req.body.title,
      offer: req.body.offer,
    };

    // Check if there is a file uploaded
    if (req.file && req.file.length > 0) {
      updateBanner.image = req.file.filename;
    } else {
      updateBanner.image = bannerExist.image;
    }

    // Update the banner in the database
    await Banner.findByIdAndUpdate(bannerId, updateBanner);

    res.redirect("/admin/banner");
  } catch (err) {
    // Handle any errors here
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};


const detetebanner = async (req,res)=>{

  try{

    const bannerId=req.params.id

    const banner=await Banner.findById(bannerId)
  
    if (!banner) {
      return res.status(404).send("Banner not found");
    }
  
    banner.isDeleted = !banner.isDeleted; // Toggle the deleted field
  
    await banner.save(); // Save the updated productData
  
    res.redirect("/admin/banner");

  }catch (error) {
  console.error(error);
  res.status(500).send("Error occurred while deleting products");
}
}


const admindashboard = async (req, res) => {
  try {
    if (req.session.adminId) {



      const monthSales = await order.aggregate([
        {
          $match: {
            status: "delivered"
          }
        },
        {
          $unwind: "$products"
        },
        {
          $project: {
            year: { $year: "$orderDate" },
            month: { $month: "$orderDate" },
            monthlySales: {
              $multiply: ["$products.price", "$products.quantity"]
            }
          }
        },
        {
          $group: {
            _id: {
              year: "$year",
              month: "$month"
            },
            monthlySales: { $sum: "$monthlySales" }
          }
        },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month",
            monthlySales: 1
          }
        },
        {
          $sort: {
            year: 1,
            month: 1
          }
        }
      ]);


      console.log(monthSales);


      const totalSalesAmount = monthSales.reduce((total, sale) => total + sale.monthlySales, 0);
      const orderCount = await order.countDocuments({ status: "delivered" });
      const productCount = await product.countDocuments({ deleted: "false" });
      console.log(monthSales);
      // console.log('Total Sales Amount:', totalSalesAmount);

      const allUsers = await user.find({})



      const blockedUserCount = allUsers.filter(user => user.isBlocked).length;
      const nonBlockedUserCount = allUsers.filter(user => !user.isBlocked).length;

      res.render("admin/dashboard", {
        malecategory: false,
        femalecategory: false,
        monthSales,
        totalSalesAmount,
        orderCount,
        productCount,
        blockedUserCount,
        nonBlockedUserCount // Pass these counts to the template
      });
    } else {
      res.redirect("/admin");
    }
  } catch (e) {
    console.log(e.message);
  }
};

const adminpost = async (req, res) => {
  try {
    // console.log(req.body)
    let password = req.body.password;
    const admindata = await admin.findOne({ email: req.body.email });

    if (admindata) {
      // console.log(admindata.password);
      let adminpassword = await bcrypt.compare(password, admindata.password);

      let isAdmin = admindata.isAdmin;

      if (adminpassword) {
        if (isAdmin) {
          req.session.adminId = admindata._id;

          res.redirect("/admin/dashboard");
        } else {
          req.flash("error", "Please check the password This is for admin.");
          return res.redirect("/admin/login");
        }
      } else {
        req.flash("error", "Please check your password");
        res.redirect("/admin/login");
      }
    } else {
      req.flash("error", "This is for admin. please do user login");
      return res.redirect("/admin/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const adminlogin = (req, res) => {
  if (req.session.adminId) {
    return res.redirect("/admin/dashboard");
  }
  const logoutMessage = req.session.logoutMessage;
  delete req.session.logoutMessage;
  res.render("admin/adminlogin", { messag: req.flash(), logoutMessage });
};


const products = async (req, res) => {
  try {
    const productData = await product.find({}).sort({ _id: -1 });
    const malecategory = await categoryModel.findOne({ gender: "M" }).populate("subcategories")
    const femalecategory = await categoryModel
      .findOne({ gender: "F" })
      .populate("subcategories");

    res.render("admin/products", {
      products: productData,
      malecategory,
      femalecategory,
      users: false,
      alertMessage: req.flash(),
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
};

const addproduct = async (req, res) => {
  try {
    console.log(req.body);
    const { title, color, gender, category, size, price, stock, description } =
      req.body;
    const images = req.files.map((file) => file.filename);

    const newProduct = new product({
      title,
      color,
      gender,
      category,
      size,
      price,
      stock,
      images,
      description,
    });

    await newProduct.save();
    console.log("Product saved:", newProduct);
    res.redirect("/admin/products");
  } catch (error) {
    console.error("Error saving product:", error.message);
    res.status(500).send("An error occurred while saving the product.");
  }
};

const deleteproduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = await product.findById(productId);

    if (!productData) {
      return res.status(404).send("Product not found");
    }

    productData.deleted = !productData.deleted; // Toggle the deleted field

    await productData.save(); // Save the updated productData

    res.redirect("/admin/products");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred while deleting products");
  }
};




const editproduct = async (req, res) => {
  const productId = req.params.id;

  // Get the existing product data first
  const existingProduct = await product.findById(productId);

  const updatedProductData = {
    title: req.body.title,
    price: req.body.price,
    color: req.body.color,
    stock: req.body.stock,
    size: req.body.size,
    gender: req.body.gender,
    category: req.body.category,
    description: req.body.description,
  };

  // Check if new images were uploaded
  if (req.files && req.files.length > 0) {
    updatedProductData.images = req.files.map((file) => file.filename);
  } else {
    // No new images uploaded, retain the existing images
    updatedProductData.images = existingProduct.images;
  }

  if (existingProduct && existingProduct.images && existingProduct.images.length > 0) {
    for (let i = 0; i < existingProduct.images.length; i++) {
      const deleteFlag = req.body[`deleteImage_${i}`];
      if (deleteFlag === '1') {
        // Delete the image from the server (implement this logic)
        // Remove the image from the images array
        existingProduct.images.splice(i, 1);
      }
    }
  }

  try {
    const updatedProduct = await product.findOneAndUpdate(
      { _id: productId },
      { $set: updatedProductData },
      { new: true }
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.redirect("/admin/products");
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Error updating product" });
  }
};


const LoadCustomers = async (req, res) => {
  try {
    let userdata = await user.find({});
    res.render("admin/customers", {
      users: userdata,
      malecategory: false,
      femalecategory: false,
    });
  } catch (e) {
    console.log(e.message);
  }
};

const LoadOrder = async (req, res) => {
  try {

    const requested = await order.find({ status: "return request" })
    const orders = await order
      .find({})
      .sort({ orderDate: -1 })
      .populate([
        {
          path: "products.product", // Specify the path to the nested product reference
        },
        {
          path: "customer",
          model: "user", // Specify the name of the User model
          select: "name",
        },
      ]);
    res.render("admin/orders", {
      orders,
      malecategory: false,
      femalecategory: false, requested,
    });
  } catch (e) {
    console.log(e.message);
  }
}

const adminlogout = async (req, res) => {
  const logoutMessage = 'You have been successfully logged out.'; // Message to be sent
  req.session.logoutMessage = logoutMessage; // Store the message in the session

  req.session.destroy((err) => {
    if (err) {
      console.log(err.message);
    }
    res.redirect("/admin/login");
  });
};

const addcategories = async (req, res) => {
  const { gender, newsubcategory } = req.body;

  try {
    let category = await categoryModel.findOne({ gender: gender });

    if (!category) {
      category = new categoryModel({
        gender: gender,
        subcategories: [],
      });
    }

    const newSubcategoryName = newsubcategory.toUpperCase();

    const existingSubcategory = await subcategoryModel.findOne({
      name: newSubcategoryName,
    });

    if (existingSubcategory) {
      req.flash("error", "Subcategory already exists.");
      return res.status(400).redirect("/admin/products");
    }

    const subcategory = new subcategoryModel({
      name: newSubcategoryName,
    });

    await subcategory.save();

    category.subcategories.push(subcategory._id);
    await category.save();

    res.redirect("/admin/products");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving subcategory");
  }
};

const updateStatus = async (req, res) => {
  try {
    const userId = req.params.id;

    const userdata = await user.findById(userId);

    if (userdata) {
      userdata.isBlocked = !userdata.isBlocked;

      await userdata.save();

      res.redirect("/admin/customers");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while blocking user");
  }
};

const updateroles = async (req, res) => {
  try {
    const userId = req.params.id;
    const userdata = await user.findById(userId);

    if (!userdata) {
      return res.status(404).send("User not found");
    }

    userdata.isAdmin = !userdata.isAdmin;

    await userdata.save();

    res.redirect("/admin/customers");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred while updating roles");
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params._id;
    console.log();

    await user.findOneAndDelete({ userId });

    res.redirect("/admin/customers");
  } catch (error) {
    console.error(error);
  }
};


const order_delete = async (req, res) => {

  try {
    const orders = await order.findOneAndDelete({ _id: req.params.id })
    res.redirect('/admin/orders')
  } catch (e) {
    console.log(e.message)
  }


}


const createCoupon = async (req, res) => {
  try {
    const coupon = {
      code: req.body.code,
      type: req.body.type,
      expiry: req.body.expiry,
      discount: req.body.discount,
      min: req.body.min
    }

    console.log(req.body)

    const exist = await Coupons.findOne({ code: req.body.code })

    // Assuming you're using a database model named 'Coupon' and the appropriate method for creating a document

    if (exist) {
      res.send("already exist in the code")
      res.redirect('/admin/coupons')
    } else {
      const newCoupon = await Coupons.create(coupon);

      // Send a success response to the client
      res.json(newCoupon);
    }
  } catch (e) {
    console.error(e.message); // Log the error
    res.status(500).json({ error: 'An error occurred while creating the coupon.' });
  }
};

const getAllCoupons = async (req, res) => {
  try {

    const coupons = await Coupons.find();
    res.render('admin/coupons', { coupons, users: false })
  } catch (error) {
    throw new Error(error)
  }
}


const updateCoupons = async (req, res) => {
  const { id } = req.params;

  try {
    const updatecoupon = await Coupons.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatecoupon);
  } catch (error) {

    console.error(error.message);
  }
}


const unListCoupons = async (req, res) => {
  const couponId = req.params.id;


  const coupon = await Coupons.findById(couponId);

  console.log(coupon)

  if (!coupon) {
    return res.status(404).send("coupon not found");
  }

  coupon.isDeleted = !coupon.isDeleted;

  await coupon.save();

  res.redirect("/admin/coupons");
};




const orderStatus = async (req, res) => {
  const orderId = req.params.id;
  const userId = req.session.userId;
  const newStatus = req.body.newValue;
  console.log(newStatus)

  try {
    // Find the order by orderId and update the status
    const userData = await user.findById(userId)
    const orderData = await order.findById(orderId)

    const totalAmount = orderData.totalAmount;

    const updatedOrder = await order.findByIdAndUpdate(
      orderId,
      { $set: { status: newStatus } },
      { new: true }
    );

    if (newStatus === "returned") {
      await user.updateOne(
        { _id: userData._id },
        { $inc: { "wallet.balance": totalAmount },
          $push: { "wallet.transactions": orderData._id.toString() } }
      );
    } else if (newStatus === "cancelled" && orderData.payment === "ONLINE") {
      await user.updateOne(
        { _id: userData._id },
        { $inc: { "wallet.balance": totalAmount },
          $push: { "wallet.transactions": orderData._id.toString() } }
      );
    }
    
    const productsToUpdate = orderData.products;

    // Update the stock for each product in the productsToUpdate array
    for (const productData of productsToUpdate) {
      const productId = productData.product;
      const quantity = productData.quantity;

      // Find the product in the products collection
      const products = await product.findOne({_id:productId});

      if (products) {
        // Increment the stock by the canceled quantity
        products.stock += quantity;
        await products.save();
      }
    }
    

    if (!updatedOrder) {
      return res.status(404).send("Order not found.");
    }

    // Respond with success
    res.redirect('/admin/orders')
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).send("An error occurred while updating order status.");
  }
}



const adminSales = async (req, res) => {

  const from = req.query.from
  const to = req.query.to
  let selectedStatus = ''
  let salesReport

  try {


     
      salesReport = await order.aggregate([

        { $unwind: "$products" },
        { $match: { "status": "delivered" } },
        {
          $lookup: {
            from: "products",
            localField: "products.product",
            foreignField: "_id",
            as: "products_details"
          }
        },
        { $unwind: "$products_details" },
        {
          $project: {
            order_id: "$orderNumber",
            products_details: "$products_details",
            qty: "$products.quantity",
            total_amount: "$products.price",
            order_date: "$orderDate",
            payment_method: "$payment",

          }
        },
        { $sort: { "order_id": -1 } }
      ])
    

    console.log(salesReport)


    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
    
      salesReport = salesReport.filter((prd) => {
        const orderDate = new Date(prd.order_date);
        return orderDate >= fromDate && orderDate <= new Date(toDate.getTime() + 24 * 60 * 60 * 1000);
      });
      console.log(salesReport)
    }

    res.render("admin/adminsales", { salesReport, selectedStatus })

  } catch (e) {

  }
};


const salesReportDownload = async (req, res) => {

  console.log("sales report")
  try {
    const data = req.body
    let file = [];
    for (let i = 0; i < data.date.length; i++) {
      const row = {
        date: data.date[i],
        order_id: data.order_id[i],
        product: data.product[i],
        qty: data.qty[i],
        payment: data.payment[i],
        amount: data.amount[i]
      };
      file.push(row);
    }
    const json2csv = new Parser()
    const csv = json2csv.parse(file)

    res.attachment(`report-${Date.now()}.csv`)
    res.status(200).send(csv)
  } catch (error) {
    console.log(error.message);
    res.send(500)
  }


}



const updateUser = async (req, res) => { };

module.exports = {

  adminpost, admindashboard, adminSales, salesReportDownload,add_banner,banner,editbanner,detetebanner,

  adminlogin, adminlogout,

  products, addproduct, addcategories, deleteproduct, editproduct,

  LoadOrder, order_delete, orderStatus,

  LoadCustomers, updateroles, deleteUser, updateUser, updateStatus,

  createCoupon, getAllCoupons, updateCoupons, unListCoupons
};
