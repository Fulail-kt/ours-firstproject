const express = require('express');
const router = express.Router();
const userController = require('../controller/usercontroller');
const auth = require('../middleware/auth');
const User = require('../models/user'); // Assuming you have a User model
const googleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');





passport.use(new googleStrategy({
  clientID:process.env.CLIENT_ID,
  clientSecret:process.env.CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  console.log(accessToken);
  console.log(refreshToken);
  console.log(profile);
  try {
    // Find or create the user based on the Google profile data
    const user = await User.findOne({ email: profile.emails[0].value });
    if (user) {
      // If user exists, return the user
      done(null, user);
    } else {
      // If user doesn't exist, create a new user
      const newUser = new User({
        email: profile.emails[0].value,
        name: profile.displayName,

      });
      await newUser.save();
      done(null, newUser);
    }
  } catch (error) {
    done(error, false);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id); // Serialize user's id instead of profile
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});

router.get('/auth/google', passport.authenticate("google", {
  scope: ["profile", "email"]
}));

router.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login'
}), async function (req, res) {
  console.log(req.user.email)
  const userEmail = req.user.email; // Assuming email is present in the profile
  const user = await User.findOne({ email: userEmail })
  // Successful authentication, redirect home.
  if (user) {
    req.session.userId = user._id
    res.redirect('/');
  } else {
    res.send("user not found")
  }
});



router.get('/', userController.homeGet);

router.get('/login', userController.loginGet);

router.post('/login', userController.loginPost);

router.get('/signup', auth.loggedout, userController.signupGet);

router.get('/verify-otp', auth.otpsession, userController.verify);

router.post('/confirm', auth.otpsession, userController.confirmOtp);

router.post('/signup', userController.signupPost);

router.get('/wishlist', auth.isLoggedIn, auth.isBlocked, userController.wishlist)

router.post('/add-to-wishlist/:id', auth.isLoggedIn, userController.add_to_wishlist)

router.get('/remove-from-wishlist/:id', auth.isBlocked, userController.remove_from_wishlist)

router.get('/allproducts',auth.productSearch, userController.allProducts)

router.get('/productview/:id', userController.productView)

router.post('/add-to-cart/:id', auth.isLoggedIn, auth.isBlocked, userController.add_to_cart)

router.post('/add-address', auth.isLoggedIn, auth.isBlocked, userController.add_address)

router.get('/myaccount', auth.isLoggedIn, auth.isBlocked, userController.myaccount)

router.get('/myorders', auth.isLoggedIn, auth.isBlocked, auth.orderSearch, userController.myorders)

router.post('/update-profile', auth.isLoggedIn, auth.isBlocked, userController.update_profile);

router.post('/edit-address', userController.edit_address);

router.patch('/delete-address', userController.delete_address)

router.get('/logout', userController.logoutGet)

router.patch('/update-quantity', userController.update_quantity);

router.get('/checkout', auth.isLoggedIn, auth.cartCheck, userController.checkout)

router.post('/confirm-order', userController.confirm_order);

router.patch("/return-request/:id",auth.isLoggedIn, userController.return_Request)

router.post('/verify-payment', userController.verifyPayment)

router.get("/myorders/invoice/:id",auth.isLoggedIn, userController.invoice);

router.post('/apply-coupon',userController.apply_coupon);

router.post("/resend-otp", userController.resend_otp)

router.patch("/cancel-order/:id", userController.cancelOrder)

router.post('/reset-password', userController.postResetPassword);

router.get('/reset-password', userController.getresetpassword);

router.post('/newpassword', userController.newPassword);










module.exports = router;
