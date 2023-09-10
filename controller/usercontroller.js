const Product = require("../models/products");
const User = require("../models/user");
const Order = require('../models/order')
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const UserOtp = require("../models/userOtp");
const shortid = require('shortid');
const Coupon=require("../models/coupon")
const categoryModel=require('../models/category')
const mongoose = require('mongoose');
const Coupons = require('../models/coupon')
require('dotenv').config();

const Razorpay = require("razorpay");


const guest = async (req, res) => {
  let productdata = await Product.find({});
  const malecategory = await categoryModel
  .findOne({ gender: "M" })
  .populate("subcategories");

const femalecategory = await categoryModel
  .findOne({ gender: "F" })
  .populate("subcategories");


  return res.render("user/home", {
    product: productdata,
    user: false,
    message: req.flash(),
    cartitems: [],
    malecategory,
    femalecategory
  });
};

const loginGet = (req, res) => {
  try {
    if (req.session.userId) {
      return res.redirect("/");
    }
    res.render("user/login", { message: req.flash() });
  } catch (e) {
    console.log(e.message);
  }
};

const loginPost = async (req, res) => {
  try {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(req.body.email)) {
      req.flash("error", "Please check the Email ");
      return res.redirect("/");
    }

    if (req.body.password.length < 6) {
      req.flash("error", "Password at least 6 characters");
      return res.redirect("/");
    }

    let email = req.body.email;
    let password = req.body.password;
    let userdata = await User.findOne({ email: email });

    if (userdata) {
      let haspassword = await bcrypt.compare(password, userdata.password);

      if (haspassword) {
        if (!userdata.isBlocked) {
          req.session.userId = userdata._id;

          return res.redirect("/");
        } else {
          req.flash("error", "Admin blocked you. Please contact admin");
          return res.redirect("/login");
        }
      } else {
        req.flash("error", "Incorrect password");
        return res.redirect("/login");
      }
    } else {
      req.flash("error", "Invalid email and password");
      return res.redirect("/login");
    }
  } catch (e) {
    console.log(e.message);
  }
};

const signupGet = (req, res) => {
  res.render("user/signup", { message: req.flash() });
};

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true,
});




// Generate OTP

function generateOTP() {
  return Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
}

// Function to send OTP email

const sendOTPEmail = async (toEmail, otp) => {
  try { 
  const email=toEmail
  const mailOptions = {
    from: "mfkt07@gmail.com",
    to: email,
    subject: "OTP Verification",
    html: `<P>verify your email to signup. Your OTP is: ${otp}<p>`,
  };


 
  transporter.sendMail(mailOptions, (err) => {

              if (err) {
                  console.log("Error occured");
                  console.log(err);
                  // res.send(500)
              }
              else {
                  console.log('code is sent');
              }}
  )
    console.log(`OTP email sent to ${email}`);


  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Error sending OTP email");
  }
};




// verify otp page

const verify = (req, res) => {
  const email = req.session.email;

  res.render("user/verify-otp", { email, message: req.flash() }); // Pass userId to the view
};

const confirmOtp = async (req, res) => {
  try {
    console.log(req.session.email);
    const { email, otp } = req.body;
    const otpRecord = await UserOtp.findOne({ email });
    console.log(otpRecord);
    if (!otpRecord) {
      req.flash("error", "Otp not exist");
      return res.redirect("/verify-otp");
    }

    const now = new Date();
    if (now > otpRecord.expiresAt) {
      req.flash("error", "Otp expired");
      return res.redirect("/verify-otp");
    }

    const isOTPValid = await bcrypt.compare(otp, otpRecord.otp);

    if (isOTPValid) {
      console.log(req.session.name);
      // Mark user as verified in the User collection
      let user = new User({
        name: req.session.name,
        password: req.session.password,
        email: req.session.email,
        phone: req.session.phone,
      });

      await user.save();

      req.session.userId = user._id;
      res.redirect("/");
    } else {
      req.flash("error", "Invalid code passed. Check your inbox");
      res.redirect("/user/verify-otp");
    }
  } catch (error) {
    console.log(error.message);
    res.send("An error occurred while verifying the OTP.");
  }
};




const signupPost = async (req, res) => {
  try {
    req.session.forOtp = "true";

    const { email, password, name, phone } = req.body;

    console.log("Checking existing email for:", email);
    const exist = await User.findOne({ email });
   

    if (exist) {
      req.flash("error", "Already Email exist");
      return res.redirect("/signup");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    req.session.email = email;
    req.session.password = hashedPassword;
    req.session.name = name;
    req.session.phone = phone;

    // Generate OTP

    // console.log("eamil          ",email)
    const otp = await generateOTP().toString();

    // // Send OTP via email
    // console.log("otp   ",otp +"email", email)
    await sendOTPEmail(email, otp);

    await UserOtp.deleteMany({ email });

    const hashOtp = await bcrypt.hash(otp, 10);
    // console.log(otp);
    // // Store OTP and expiration time in the database
    const expiresAt = Date.now() + 15 * 60 * 1000; // OTP expires in 15 minutes
    await UserOtp.create({
      email: email,
      otp: hashOtp,
      createdAt: Date.now(),
      expiresAt,
    });
    

    res.redirect("/verify-otp"); // Redirect to OTP verification page
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).send("An error occurred while signing up");
  }
};

const homeGet = async (req, res) => {
  try {

    const user = await User.findOne({ _id: req.session.userId }).populate('cart');

    let product = await Product.find({ deleted: false })
    let newProduct=await Product.find({ deleted: false }).sort({_id:-1})
    const malecategory = await categoryModel
    .findOne({ gender: "M" })
    .populate("subcategories");

  const femalecategory = await categoryModel
    .findOne({ gender: "F" })
    .populate("subcategories");


    if (user) {
      const  cartitems = await User.aggregate([
        { $match: { _id: user._id } },
        {$unwind:"$cart"},
        {
          $lookup: {
            from: 'products',
            localField: 'cart.product',
            foreignField: '_id',
            as: 'cartitems'
          }
        },
        {
          $unwind: "$cartitems"
        },
        {
          $project: {
            _id: 1,
            email: 1,
            "cartitems.title": 1,
            "cartitems.color": "$cart.color",
            "cartitems.price": 1,
            "cartitems.size": "$cart.size",
            "cartitems.stock": 1,
            "cartitems.images": 1,
            "cartitems._id": 1,
            "cartitems.quantity": "$cart.quantity" // Include product quantity in cart
          }
        }
      ]);
      return res.render("user/home", { user, product,newProduct, cartitems,femalecategory,malecategory });
    } else {

      return res.render("user/home", {
        product,
        user: false,
        message: req.flash(),
        cartitems: [],
        newProduct,
        malecategory,femalecategory
      });
    }
  } catch (e) {
    console.log(e.message);
  }
};


const allProducts = async (req, res) => {
  try {

    const user = await User.findOne({ _id: req.session.userId }).populate('cart');

    let product = await Product.find({ deleted: false });

    const malecategory = await categoryModel
      .findOne({ gender: "M" })
      .populate("subcategories");

    const femalecategory = await categoryModel
      .findOne({ gender: "F" })
      .populate("subcategories");


    if (user) {
      const  cartitems = await User.aggregate([
        { $match: { _id: user._id } },
        {$unwind:"$cart"},
        {
          $lookup: {
            from: 'products',
            localField: 'cart.product',
            foreignField: '_id',
            as: 'cartitems'
          }
        },
        {
          $unwind: "$cartitems"
        },
        {
          $project: {
            _id: 1,
            email: 1,
            "cartitems.title": 1,
            "cartitems.color": "$cart.color",
            "cartitems.price": 1,
            "cartitems.size": "$cart.size",
            "cartitems.stock": 1,
            "cartitems.images": 1,
            "cartitems._id": 1,
            "cartitems.quantity": "$cart.quantity" // Include product quantity in cart
          }
        }
      ]);
      return res.render("user/allproducts", { user, product, cartitems,malecategory,femalecategory });
    } else {

      return res.render("user/allproducts", {
        product,
        user: false,
        message: req.flash(),
        cartitems: [],
        malecategory,femalecategory
      });
    }
  } catch (e) {
    console.log(e.message);
  }
};



const getAllproductsQuery=async (req, res) => {
  try {
    // Initialize an empty query object
    const query = {};

    // Check if a gender filter is applied
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Check if a priceSort filter is applied
    let sortOption = {};

    if (req.query.new) {
      // Sort by _id in descending order
      sortOption = { _id: -1 };
    } else if (req.query.priceSort) {
      if (req.query.priceSort === 'asc') {
        sortOption = { price: 1 };
      } else if (req.query.priceSort === 'desc') {
        sortOption = { price: -1 };
      }
    }

    // Query the database with filters and sort options
    const products = await Product.find(query).sort(sortOption);

    // Load male and female categories
    const malecategory = await categoryModel.findOne({ gender: "M" }).populate("subcategories");
    const femalecategory = await categoryModel.findOne({ gender: "F" }).populate("subcategories");

    // Load user's cart items if available
    const user = await User.findOne({ _id: req.session.userId }).populate('cart');
    const cartitems = user ? await User.aggregate([{ $match: { _id: user._id } },
              { $unwind: "$cart" },
              {
                $lookup: {
                  from: 'products',
                  localField: 'cart.product',
                  foreignField: '_id',
                  as: 'cartitems'
                }
              },
              {
                $unwind: "$cartitems"
              },
              {
                $project: {
                  _id: 1,
                  email: 1,
                  "cartitems.title": 1,
                  "cartitems.color": 1,
                  "cartitems.price": 1,
                  "cartitems.size": 1,
                  "cartitems.stock": 1,
                  "cartitems.images": 1,
                  "cartitems._id": 1,
                  "cartitems.quantity": "$cart.quantity" // Include product quantity in cart
                }
              }]) : [];

    // Render the view with the filtered and sorted products
    res.render("user/allproducts", { user, product: products, cartitems, malecategory, femalecategory });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching products');
  }
}

const productView = async (req, res) => {
  let user = await User.findOne({ _id: req.session.userId });
  const productID = req.params.id;
  let product = await Product.findOne({ _id: productID });
  let isCart = false;
  let isWish=false;
  let cartitems;

  if (user) {
    user.cart.forEach(item => {
      if (item.product == productID) {
        isCart = true;
      }


    });



    user.wishlist.forEach(item=>{
      if(item.product==productID){
        isWish=true;
      }
    })

    cartitems = await User.aggregate([
      { $match: { _id: user._id } },
      {$unwind:"$cart"},
      {
        $lookup: {
          from: 'products',
          localField: 'cart.product',
          foreignField: '_id',
          as: 'cartitems'
        }
      },
      {
        $unwind: "$cartitems"
      },
      {
        $project: {
          _id: 1,
          email: 1,
          "cartitems.title": 1,
          "cartitems.color": "$cart.color",
          "cartitems.price": 1,
          "cartitems.size": "$cart.size",
          "cartitems.stock": 1,
          "cartitems.images": 1,
          "cartitems._id": 1,
          "cartitems.quantity": "$cart.quantity" // Include product quantity in cart
        }
      }
    ]);
  }

  res.render('user/productview', { user, product, isCart,isWish, cartitems: cartitems || [] });
};





const add_to_cart = async (req, res) => {

  const productId = req.params.id;
  const size=req.body.size;
  const color=req.body.color
  const price=req.body.price;
  const totalPrice=price
  

  // console.log("sixe          ",req.body)

  const userId = req.session.userId;

  try {
    const user = await User.findOne({ _id: userId });

    if (user && user.cart) {

      user.cart.push({
        product: productId,
        quantity: 1,
        size:size,
        color:color,
        price:price,
        total:totalPrice
      });


    } else {

      user.cart = [{
        product: productId,
        quantity: 1,
      }];
    }

    await user.save();

    res.redirect('/productview');
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).send('An error occurred while adding the product to the cart');
  }
};


const add_to_wishlist = async (req,res)=>{
  const productId = req.params.id;

  const userId = req.session.userId;

  try {
    const user = await User.findOne({ _id: userId });

    if (user && user.wishlist) {

      user.wishlist.push({
        product: productId,
       
      });


    } else {

      user.wishlist = [{
        product: productId,
        
      }];
    }

    await user.save();

   res.redirect('/productview');

  }catch(e){
    console.log(e.message)
  }
}



const update_quantity = async (req, res) => {
  const { productId, action } = req.body;

  try {
    const user = await User.findOne({ _id: req.session.userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cartItem = user.cart.find(item => item.product.toString() === productId);

    if (!cartItem) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    if (action === 'increase') {
      cartItem.quantity++;
    } else if (action === 'decrease' && cartItem.quantity > 1) {
      cartItem.quantity--;
    } else if (action === 'decrease' && cartItem.quantity === 1) {
      // If quantity is 1, you might want to remove the item from the cart
      user.cart = user.cart.filter(item => item.product.toString() !== productId);
    }

    // Assuming price is a property of cartItem and represents the price of one item
    cartItem.total = cartItem.price * cartItem.quantity;

    await user.save();

  
    const quantity = cartItem.quantity;
    const total = cartItem.total;

    // Send updated cart item as JSON response
    res.status(200).json({ success: true, quantity, total });
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ error: 'Error updating quantity' });
  }
};




const remove_from_wishlist = async (req, res) => {
  const productId = req.params.id;
  const userId = req.session.userId;

  try {
    const user = await User.findOne({ _id: userId });

    if (user && user.wishlist) {
      // Remove the item from the cart based on productId
      user.wishlist = user.wishlist.filter(cartItem => cartItem.product.toString() !== productId);
      await user.save();
    }

    res.redirect('/wishlist'); // Redirect back to the product view page
  } catch (error) {
    console.error('Error removing product from cart:', error);
    res.status(500).send('An error occurred while removing the product from the cart');
  }
};




const add_address = async (req, res) => {

  console.log(req.body)
  const userId = req.session.userId;
  const newAddress = {
    name: req.body.name,
    house: req.body.house,
    post: req.body.postel,
    city: req.body.city,
    state: req.body.state,
    district: req.body.district,
    contact: req.body.contact
  };

  try {
    const user = await User.findById(userId);
    if (user) {
      if (!user.address) {
        user.address = []; // Create the address field if it doesn't exist
      }
      user.address.push(newAddress);
      await user.save();
      res.json({ success: true, message: 'Address added successfully' });
    } else {
      // Handle if user is not found
      res.status(404).send('User not found');
    }
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).send('Server error');
  }
};


const checkout=async(req,res)=>{
  try{

    const userId = req.session.userId
    
    console.log(userId)

    const user= await User.findById(userId)

    if(user){
     const coupons= await Coupon.find({})
    
      const cartitems = await User.aggregate([
        { $match: { _id: user._id } },
        { $unwind: "$cart" },
        {
          $lookup: {
            from: 'products',
            localField: 'cart.product',
            foreignField: '_id',
            as: 'cartitems'
          }
        },
        {
          $unwind: "$cartitems"
        },
        {
          $project: {
            _id: 1,
            email: 1,
            "cartitems.title": 1,
            "cartitems.color": "$cart.color",
            "cartitems.price": 1,
            "cartitems.size": "$cart.size",
            "cartitems.stock": 1,
            "cartitems.images": 1,
            "cartitems._id": 1,
            "cartitems.quantity": "$cart.quantity" // Include product quantity in cart
          }
        }
      ]);

      res.render('user/checkout',{user,cartitems,coupons})

    }

  }catch(e){
    console.log(e.message)
  }
}

const razorpay = new Razorpay({
  key_id:process.env.KEY_ID,
  key_secret:process.env.KEY_SECRET
});


const confirm_order = async (req, res) => {
  try {
    const address = req.body.selectedAddress;
    const selectedPaymentOption = req.body.selectedPaymentOption;
    const userId = req.session.userId;
    const productId = req.body.productId;
    const quantity = req.body.qty;
    const price = req.body.price;
    const discount = req.body.discountinput;

    console.log(req.body);

    let totalAmount = parseFloat(req.body.totalamount);
    const couponCode = req.body.coupon;

    const coupon = await Coupon.findOne({ code: couponCode });
    const couponId = coupon ? coupon._id : null;

   

    const addressdata = await User.findOne({ _id: userId }, { address: { $elemMatch: { _id: address } } });

    const addressObjects = addressdata.address.map(address => ({
      name: address.name,
      house: address.house,
      post: address.post,
      city: address.city,
      state: address.state,
      district: address.district,
      contact: address.contact
    }));

    const product = await Product.findById(productId);

    let products = [];

    if (selectedPaymentOption === "COD") {
      if (Array.isArray(productId)) {
        productId.forEach((product, index) => {
          products.push({
            product: new mongoose.Types.ObjectId(product),
            quantity: parseInt(quantity[index]),
            price: parseInt(price[index])
          });
        });
      } else {
        products.push({
          product: new mongoose.Types.ObjectId(productId),
          quantity: parseInt(quantity),
          price: parseInt(price)
        });
      }

      const orderNumber = shortid.generate();
      const order = new Order({
        orderNumber,
        products,
        customer: userId,
        totalAmount,
        status: 'pending',
        payment: selectedPaymentOption,
        address: addressObjects,
        orderId: orderNumber,
        discount: discount
      });

      await order.save();

      await User.findByIdAndUpdate(userId, {
        $pull: { cart: { product: { $in: products.map(item => item.product) } } }
      });

      if (product && product.stock >= quantity) {
        product.stock -= quantity;
        await product.save();
      }

      const userdata = await User.findOneAndUpdate(
        { _id: userId },
        { $push: { usedCoupons: couponId } },
        { new: true }
      );

      req.session.ordered = true;
      res.json({ codSuccess: true });
    } else if (selectedPaymentOption === "ONLINE") {
      const amount = totalAmount;

      if (amount > 0) {
        const userId = req.session.userId;
        const user = await User.findById(userId);

        req.session.orderlist = req.body;

        const randomOrderID = Math.floor(Math.random() * 1000000).toString();
        const options = {
          amount: amount * 100,
          currency: "INR",
          receipt: randomOrderID,
        };

        razorpay.orders.create(options, (err) => {
          if (!err) {
            res.status(200).send({
              razorSuccess: true,
              msg: "order created",
              amount: amount * 100,
              key_id: "rzp_test_BWSV0bS6jQoy1z",
              name: addressdata.address[0].name,
              contact: addressdata.address[0].contact,
              email: user.email,
            });
          } else {
            console.error("Razorpay Error:", err);
            res.status(400).send({ razorSuccess: false, msg: "Error creating order with Razorpay" });
          }
        });
      }
    } else {
      // Handle other payment options or scenarios
      res.status(404).send("Invalid payment option");
    }
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).send("An error occurred while saving the order.");
  }
};



const verifyPayment= async (req,res)=>{
  try{
  

 

    const userId=req.session.userId
    const user=await User.find({userId})

    let orderData= req.session.orderlist
    const productId=orderData.productId
    const quantity = orderData.qty;
    const selectedPaymentOption=orderData.selectedPaymentOption;
    const address=orderData.selectedAddress;
    const discount=orderData.discountinput;
  const price=orderData.price;

  const couponCode = orderData.coupon;

    const coupon = await Coupon.findOne({ code: couponCode });
    const couponId = coupon ? coupon._id : null;

  

    console.log(orderData)
    let totalAmount = parseFloat(orderData.totalamount);

const addressdata = await User.findOne({_id:userId},{address: { $elemMatch:{_id:address}}  } )
    const addressObjects = [];
  
    addressdata.address.forEach((address) => {
      const addressObject = {
        name: address.name,
        house: address.house,
        post: address.post,
        city: address.city,
        state: address.state,
        district: address.district,
        contact: address.contact
      };
    
      addressObjects.push(addressObject);
    });
    const product=await Product.findById(productId)
let products=[];

    if (Array.isArray(productId)) {
      // Handling multiple products
      productId.forEach((product, index) => {
        products.push({
          product: new mongoose.Types.ObjectId(product),
          quantity: parseInt(quantity[index]),
          price:parseInt(price[index])
        });
      });
    }else{
      // Handling a single product
      products.push({
        product: new mongoose.Types.ObjectId(productId),
        quantity: parseInt(quantity),
        price:parseInt(price)
      });
  
    }
      const orderNumber = shortid.generate();
      const order = new Order({
        orderNumber,
        products,
        customer: userId,
        totalAmount,
        status: 'pending',
        payment: selectedPaymentOption,
        address:addressObjects,
        orderId:orderNumber,
        discount:discount
      });
  
      await order.save();
  
      await User.findByIdAndUpdate(userId, {
        $pull: { cart: { product: { $in: products.map(item => item.product) } } }
      })

      if (product && product.stock >= quantity) {
        // Subtract the ordered quantity from the product's stock
        product.stock -= quantity;
  
        // Save the updated product back to the database
        await product.save();
      }

      const userdata = await User.findOneAndUpdate(
        { _id: userId },
        { $push: { usedCoupons: couponId } },
        { new: true }
      );
  
res.status(200).json({success:true})

  }catch(e){
    console.error(e.message)
  }
}



const myorders = async (req, res) => {
  let userId = req.session.userId;
  let user = await User.findOne({ _id: userId });

  if (user) {
    const cartitems = await User.aggregate([
      { $match: { _id: user._id } },
      { $unwind: "$cart" },
      {
        $lookup: {
          from: 'products',
          localField: 'cart.product',
          foreignField: '_id',
          as: 'cartitems'
        }
      },
      {
        $unwind: "$cartitems"
      },
      {
        $project: {
          _id: 1,
          email: 1,
          "cartitems.title": 1,
          "cartitems.color": 1,
          "cartitems.price": 1,
          "cartitems.size": 1,
          "cartitems.stock": 1,
          "cartitems.images": 1,
          "cartitems._id": 1,
          "cartitems.quantity": "$cart.quantity" 
        }
      }
    ]);



    
    const orders = await Order.aggregate([
      {
        $match: { customer: new mongoose.Types.ObjectId(userId) }
      },
      {
        $sort: { orderDate: -1 }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'products.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'address',
          foreignField: '_id',
          as: 'addressDetails'
        }
      }
    ]);

    

    
    

    res.render('user/myorders', { user, cartitems, orders:orders||[] });
  }
}

const cancelOrder=async (req,res)=>{

 

  try{
    const order=req.params.id;
    const userData=req.session.userId;

    const updatedOrder = await Order.findByIdAndUpdate(
      order,
      { status: 'cancelled' },
      { new: true } // This option returns the updated order
    );

    if (!updatedOrder) {
      // If the order with the given ID doesn't exist
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({ success: true })
  } catch (error) {
      console.log(error.message);
      const statusCode = error.status || 500;
      res.send(statusCode, error.message)
  }

}

const apply_coupon=async (req, res) => {
  const { couponCode, total, prevtotal } = req.body;



  try {
    // Check if the coupon code exists in the database
    const user=await User.findOne({_id:req.session.userId})
    const coupon = await Coupons.findOne({ code: couponCode });


    if (coupon) {
      // Check if the coupon has expired
      const currentDate = new Date();
      if (currentDate > coupon.expiry) {
        res.json({ success: false, message: 'Coupon has expired' });
        return;
      }


      // const minAmount = parseInt(coupon.min)
    

      if (coupon.min <= prevtotal) {


        if (user.usedCoupons.includes(coupon._id)) {
          res.json({ success: false, message: 'Coupon already used by this user' });
          return;
        }


        let discount = coupon.discount;
        let discountedPrice;

        if (coupon.type === "OFF") {
          const discounted = prevtotal * (discount / 100);
          discountedPrice = Math.floor(prevtotal - discounted);
          discount=coupon.discount+"%"
        } else if (coupon.type === "FLAT") {
          discountedPrice = prevtotal - discount;
        }

        // Respond with the discounted price
        res.json({ success: true, discountedPrice, message: 'Coupon added',discount });

      }
      else {
        res.json({ success: false, message: 'Coupon limit exceeded' });
      }

      // Calculate the discount based on the coupon type

    } else {
      // Coupon code is not found in the database
      res.json({ success: false, message: 'Invalid coupon code' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}


const invoice=async (req, res) => {
  try {
    const userId = req.session.userId;
    const orderId = req.params.id;
    req.session.orderId = orderId

    const user = await User.findOne({ _id: userId })
    const orders = await Order.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(orderId)
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'products.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      }
    ]);

    if (orders.length === 0) {
      // Handle the case where the order is not found
      return res.status(404).send('Order not found');
    }

    // Extract the first order from the array
    const order = orders[0];

    res.render("user/invoice", { order, user });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error(error);
    res.status(500).send('Internal server error');
  }
}







const wishlist = async (req, res) => {

  let user = await User.findOne({ _id: req.session.userId });
 let isCart=false;


  if (user) {

    


    const  cartitems = await User.aggregate([
      { $match: { _id: user._id } },
      {$unwind:"$cart"},
      {
        $lookup: {
          from: 'products',
          localField: 'cart.product',
          foreignField: '_id',
          as: 'cartitems'
        }
      },
      {
        $unwind: "$cartitems"
      },
      {
        $project: {
          _id: 1,
          email: 1,
          "cartitems.title": 1,
          "cartitems.color": 1,
          "cartitems.price": 1,
          "cartitems.size": 1,
          "cartitems.stock": 1,
          "cartitems.images": 1,
          "cartitems._id": 1,
          "cartitems.quantity": "$cart.quantity" // Include product quantity in cart
        }
      }
    ]);

  
    const wishlist = await User.findOne({ _id: user._id })
    .populate({
      path: 'wishlist.product',
      model: 'products',
      select: 'title color price size stock images', // Specify the fields you want to populate
    })
    .lean();

    const cartProductIds = user.cart.map(cartItem => cartItem.product);

    wishlist.wishlist.forEach(item => {
      if (cartProductIds.includes(item.product._id)) {
        // The specific product in the wishlist is in the cart
        item.isCart = true;
      }
    });



   


    res.render('user/wishlist', { user, cartitems,wishlist,isCart })
  }


}


const myaccount = async (req, res) => {
  let user = await User.findOne({ _id: req.session.userId });


  if (user) {
    const  cartitems = await User.aggregate([
      { $match: { _id: user._id } },
      {$unwind:"$cart"},
      {
        $lookup: {
          from: 'products',
          localField: 'cart.product',
          foreignField: '_id',
          as: 'cartitems'
        }
      },
      {
        $unwind: "$cartitems"
      },
      {
        $project: {
          _id: 1,
          email: 1,
          "cartitems.title": 1,
          "cartitems.color": 1,
          "cartitems.price": 1,
          "cartitems.size": 1,
          "cartitems.stock": 1,
          "cartitems.images": 1,
          "cartitems._id": 1,
          "cartitems.quantity": "$cart.quantity" // Include product quantity in cart
        }
      }
    ]);


    const wishlist = await User.findOne({ _id: user._id })
    .populate({
      path: 'wishlist.product',
      model: 'products',
      select: 'title color price size stock images', // Specify the fields you want to populate
    })
    .lean();

    res.render('user/myaccount', { user, cartitems,wishlist })
  }
}



const edit_address = async (req, res) => {
  const addressId = req.query.Id
  const { name, contact, house, city, district, state, post } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { 'address._id': addressId },
      {
        $set: {
          'address.$.name': name,
          'address.$.contact': contact,
          'address.$.house': house,
          'address.$.city': city,
          'address.$.district': district,
          'address.$.state': state,
          'address.$.post': post,
        },
      },
      { new: true }
    );

    // Handle success response
    res.redirect('/myaccount'); // Redirect to a suitable page
  } catch (error) {
    // Handle error
    console.error('Error updating address:', error);
    res.status(500).send('Error updating address');
  }
}

const update_profile= async (req, res) => {
  try {
      // Assuming you have a unique identifier for the user, replace 'userId' with that identifier
      const userId = req.session.userId;

    
      const updatedUserData = {
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
         
      };

      console.log(updatedUserData)

      // Update user data (excluding password) in the database
      await User.findByIdAndUpdate(userId, updatedUserData);

      if (req.body.password!=="******") {
          // Hash the new password
          const hashPassword = await bcrypt.hash(req.body.password, 5);
          
          // Update the hashed password separately
          await User.findByIdAndUpdate(userId, { password: hashPassword });
      }
      res.redirect('/myaccount');
  } catch (error) {
      console.error(error);
      res.status(500).send('Error updating user data');
  }
}

const getresetpassword = async (req, res) => {
  const token = req.query.token;
  try {
    // Find user by token and check token expiration
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

   

    if (!user) {
      return res.status(400).send('Invalid or expired token');
      
    }

    // Render password reset page
    res.send(`
      <html>
      <body>
        <div style="display:flex; justify-content:center; align-items:center; width:100%;height:100vh; ">
            <form action="/newpassword" method="POST" style="border:1px solid gray; padding:2rem; background-color:grey; border-radius:8px">
            
              <input type="hidden" name="token" value="${token}">
              <label>New Password: <input type="password" name="newPassword" required></label>
              <button style="background-color:dark; border-radius:5px" type="submit">Reset Password</button>
            </form>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');

  }
}


const postResetPassword = async (req, res) => {
  const userEmail = req.body.email;

  console.log(userEmail);

  try {
    // Find user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).send('User not found');
    }

    console.log(user)

    // Generate a unique token
    const token = crypto.randomBytes(8).toString('hex');

    const resetPasswordToken= token;
    const resetPasswordExpires= Date.now() + 100000;
    const result = await User.updateOne(
      { email: userEmail },
      {
        $set: {
          resetPasswordToken,
          resetPasswordExpires
        }
      },
      { upsert: true } // Create user if not exists
    );

  



    // Send password reset email
    const mailOptions = {
      from: "mfkt07@gmail.com",
      to: userEmail,
      subject: 'Password Reset Request',
      text: `Click the following link to reset your password: http://localhost:8888/reset-password?token=${token}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send('Error sending email');
      } else {
        console.log('Email sent: ' + info.response);
        res.status(200).send(`
        <html>
        <body>
          <div style="display:flex; justify-content:center; align-items:center; width:100%;height:100vh; ">
          <div style="border:1px solid gray; padding:1rem;border-radius:8px; display:flex; justify-content:center;">
         <h3>Email succesfully sent to ${userEmail} <br> please check your Email</h3>
          </div>
          </div>
        </body>
        </html>
      `);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
}



const newPassword=async (req, res) => {
  const token = req.body.token;
  const newPassword = req.body.newPassword;
  
  try {
    // Find user by token and check token expiration
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).send('Invalid or expired token');
    }

    // Update user's password
    const hashPassword = await bcrypt.hash(newPassword, 5);
    user.password = hashPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    
    req.flash('success', 'Password updated successfully');
    res.redirect('/login'); // Redirect to login page
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred. Please try again.');
    res.redirect('/login'); // Redirect to login page with an error message
  }
}



const return_Request= async(req,res)=>{

  const userId = req.session.userId;

  try{

    
      const orderId = req.params.id
            const user= await User.findById(userId)
            

            const order = await Order.findByIdAndUpdate(
              orderId,
              { $set: { status: 'return request' } },
              { new: true }
            );


            res.status(200).json({success})

  }catch(e){

    console.log(e.message)
  }




}




const logoutGet = (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
  });
  res.redirect("/");
};

module.exports = {
  loginGet,
  loginPost,
  signupGet,
  signupPost,
  homeGet,
  logoutGet,
  verify,
  confirmOtp,
  guest,
 wishlist,
  myaccount,
  add_to_cart,
  productView, allProducts,getAllproductsQuery,add_address,
  
  
  checkout,
  myorders,verifyPayment,confirm_order,invoice,cancelOrder,return_Request,apply_coupon,
  update_quantity,
  add_to_wishlist,
  remove_from_wishlist,
  edit_address,
 update_profile,
 getresetpassword,postResetPassword,newPassword

};
