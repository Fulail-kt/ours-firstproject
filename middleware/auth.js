const User = require("../models/user")
const Product = require('../models/products');
const Orders=require("../models/order")

const isLoggedIn = (req, res, next) => {
    if (req.session.userId) {
      next(); // If user is logged in, continue to the next route
    } else {
      req.flash('error', 'You are not logged in');
      res.redirect('/'); // Redirect to the login page only if the user is not logged in
    }
  };

  const isBlocked = async (req, res, next) => {
    const userId = req.session.userId;
  
    try {
      const user = await User.findById(userId);
  
      if (!user.isBlocked) {
        next();
      } else {
        req.session.destroy((err) => {
          if (err) {
            console.error("Error destroying session:", err);
          }
          res.redirect("/login");
        });
      }
    } catch (error) {
      console.error("Error checking user:", error);
      res.status(500).send('Error checking user.');
    }
  };


  

  const isAdminLoggedIn=(req,res,next)=>{
    if(req.session.adminId){
      next()
    }else{
    req.flash('error', 'You are not logged in');
    res.redirect('/admin')
  }}
  


  const otpsession=(req,res,next)=>{
    if(req.session.forOtp){
      next()
    }else{
      res.redirect('/signup')
    }
  }

  const loggedout=(req,res,next)=>{
    if(req.session.userId){
      res.redirect('/')
    }else{
      
      next()
    }
  }


  const cartCheck= async (req,res,next)=>{

    const userId=req.session.userId;
    const user= await User.findById(userId)

    if(user.cart.length > 0){
      next()
    }else{
      res.redirect('/')
    }
  }


   // Assuming you have a Product model

const productSearch = async (req, res, next) => {
  try {
    const searchTerm = req.query.searchTerm;

    // Use regex to perform a case-insensitive search on the product name
    const searchResults = await Product.find({
      $or: [
        { title: { $regex: new RegExp(searchTerm, 'i') } },
        { category: { $regex: new RegExp(searchTerm, 'i') } }
      ]
    });
    

    req.searchResults = searchResults;
    next(); // Move on to the next middleware or route
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// const orderSearch = async (req, res, next) => {
//   try {
//     const searchTerm = req.query.searchTerm;
//     const userId = req.session.userId; // Assuming `userId` is stored in the session

//     // Use regex to perform a case-insensitive search on the order number
//     const searchResults = await Orders.find({
//       _id: userId, // Assuming `_id` is the field you want to match against `userId`
//       orderNumber: { $regex: new RegExp(searchTerm, 'i') }
//     });


//     req.searchResults = searchResults;
//     next(); // Move on to the next middleware or route
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };




// const orderSearch = async (req, res, next) => {
//   try {
//     const searchTerm = req.query.searchTerm;
//     const userId = req.session.userId; // Assuming `userId` is stored in the session

//     const searchResults = await Orders.find({
//       _id: userId, // Assuming `_id` is the field you want to match against `userId`
//       orderNumber: { $regex: new RegExp(searchTerm, 'i') }
//     });

//     req.searchResults = searchResults;
//     next(); // Move on to the next middleware or route
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

const orderSearch = async (req, res, next) => {
  try {
    const searchTerm = req.query.searchTerm;
    const userId = req.session.userId; // Assuming `userId` is stored in the session

    if (searchTerm) { // Only perform search if a searchTerm is provided
      const searchResults = await Orders.find({
        customer: userId,
        orderNumber: { $regex: new RegExp(searchTerm, 'i') }
      });

      req.searchResults = searchResults;
    }

    next(); // Move on to the next middleware or route
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};










// const orderSearch = async (req, res, next) => {
//   try {
//     const searchTerm = req.query.searchTerm;
//     const userId = req.session.userId; 

//     console.log("Search Term:", searchTerm); 

   
//     const searchResults = await Orders.find({
//       _id: userId, 
//       orderNumber: { $regex: new RegExp(searchTerm, 'i') }
//     });

//     console.log("Query:", {
//       _id: userId,
//       orderNumber: { $regex: new RegExp(searchTerm, 'i') }
//     }); 
//     console.log("User ID:", userId); 

//     console.log("Search Results:", searchResults); 

//     req.searchResults = searchResults;
//     next(); 
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

  


  module.exports={
    isLoggedIn,isAdminLoggedIn,loggedout,otpsession,isBlocked,cartCheck,productSearch ,orderSearch
  }