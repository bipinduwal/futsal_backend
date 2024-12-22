const {check, validationResult} = require('express-validator')

const categoryRules = [
    check('category_name','Category Name is required').notEmpty()
    .isLength({min: 3}).withMessage("CAtegory must be at least 3 character")
]
const productRules = [
    check('product_name','Product Name is required').notEmpty()
            .isLength({min: 3}).withMessage("CAtegory must be at least 3 character"),
    check('product_price', 'productprice is required').notEmpty()
            .isNumeric().withMessage('price must be a number'),
    check('product_description','Description is required').notEmpty()
            .isLength({min:20}).withMessage('description mut be at least 20 character'),
    check('count_in_stock','count in stock is required')
            .isNumeric().withMessage("count must be a number"), 
    check('category','category is required').notEmpty()
]

const userRules = [
    check('username', 'username is required').notEmpty()
        .isLength({min:3}).withMessage("Username must be at least 3 character")
        .not().isIn(['admin', 'test']).withMessage("You cannot choose this as username"),
    check('email','Email is required').notEmpty()
        .isEmail().withMessage("Must be a valid email"),
    check('password','password is required').notEmpty()
    .matches(/[A-Z]/).withMessage("must include capital letters")
    .matches(/[a-z]/).withMessage("must include small letters")
    .matches(/[0-9]/).withMessage("must include numbers")
    .matches(/[!@$#%^&*\(\)\-]/).withMessage("must include at least 1 special character")
    .isLength({min:8}).withMessage("Password must be at least 8 character")
    .isLength({max:30}).withMessage("Password must not exceed 30 character")

]

const amountRules = [
    check('amount', 'amount is required')
        .notEmpty()
        .isNumeric().withMessage('amount must be a number')
        .custom((value) => value >= 100).withMessage('amount must be greater than 100'),
];


//only one validatioin method
const validationMethod  = (req, res, next) => {
    let error =validationResult(req)
    if(!error.isEmpty()){
        return res.status(400).json({error: error.array()[0].msg});
    }
    next()
}

module.exports = {categoryRules,validationMethod, productRules, userRules, amountRules}