const multer = require('multer')
const fs = require('fs')
const path = require('path')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        let file_destination = 'public/uploads'
        if (!fs.existsSync(file_destination)) {
            fs.mkdirSync(file_destination, { recursive: true }) //recursive  creates the subfolder also
        }

        cb(null, file_destination)
    },
    filename: function (req, file, cb) {
        let extname = path.extname(file.originalname)
        let filename = path.basename(file.originalname,extname) //remove .jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + extname)
    }
})

const upload = multer({ storage: storage,
    limits: { fileSize: 1000000 }, // 1MB
 })


 module.exports = upload