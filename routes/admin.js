
const admin=require('../controller/admincontroller')
const auth=require('../middleware/auth')


const express = require('express');
const router = express.Router();


const multer = require('multer');
const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: function (req, file, cb) {

    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null,uniqueSuffix );
  }
});
const upload = multer({ storage: storage });


router.get('/banner', auth.isAdminLoggedIn, admin.banner)
router.post("/add_banner",upload.single('image'),admin.add_banner)
router.post("edit_banner/:id",admin.editbanner)
router.post('/unlist-banner/:id',admin.detetebanner)

router.get('/',admin.adminlogin)
router.get('/login',auth.isAdminLoggedIn,admin.adminlogin)
router.post('/login',admin.adminpost)




router.get('/dashboard',admin.admindashboard)
router.get('/products',auth.isAdminLoggedIn, admin.products);
router.post('/addproduct',auth.isAdminLoggedIn, upload.array('images', 5),admin.addproduct )
router.post('/deleteproduct/:id', admin.deleteproduct)
router.post('/editproduct/:id', upload.array('images', 5),admin.editproduct);




router.get('/adminsales',auth.isAdminLoggedIn,admin.adminSales)
router.post('/adminsales/download',auth.isAdminLoggedIn,admin.salesReportDownload)

router.get('/customers',auth.isAdminLoggedIn,admin.LoadCustomers)
router.get('/orders',auth.isAdminLoggedIn,admin.LoadOrder)
router.get('/deleteorder/:id',auth.isAdminLoggedIn,admin.order_delete)
router.get('/adminlogout',admin.adminlogout)

router.post("/update-status/:id", admin.orderStatus);


router.post('/updaterole/:id',admin.updateroles);
router.post('/updatestatus/:id',admin.updateStatus)
router.post("/addcategories",admin.addcategories);

router.get('/deleteuser/:id',admin.deleteUser)
router.get('/updateuser/:id',admin.updateUser)

router.get("/coupons",auth.isAdminLoggedIn,admin.getAllCoupons)
router.post("/create-coupon",auth.isAdminLoggedIn,admin.createCoupon)
router.post("/update-coupon/:id",auth.isAdminLoggedIn,admin.updateCoupons)
router.post("/unlist-coupon/:id",auth.isAdminLoggedIn,admin.unListCoupons)


module.exports = router;
