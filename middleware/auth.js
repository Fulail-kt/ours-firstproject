const User = require("../models/user")



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




  module.exports={
    isLoggedIn,isAdminLoggedIn,loggedout,otpsession,isBlocked
  }