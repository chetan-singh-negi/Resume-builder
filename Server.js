const express = require('express')
const bodyParser = require('body-parser')
const { MongoClient, ServerApiVersion } = require('mongodb')

const app = express()
const port = 5000

const multer  =   require('multer');


const url = "mongodb+srv://instantCV:X4NVGi3etLJIwuBR@cluster0.nftey.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// parse application/json


const checkForValidString = (value, options) => {

    const {
        minAllowedLength = 1,
        maxAllowedLength = 1,
        fieldName = ""
    } = options;

    if((value && typeof value === "string" && value?.length > 0) && value?.length >= minAllowedLength && value?.length <= maxAllowedLength){
        return [true, {}];  
    }
    else{
        return [false, {
            error: `${fieldName} field should be a non empty string with min: ${minAllowedLength} & max: ${maxAllowedLength} characters.`
        }];
    }
};

const checkForValidEmail = (value) => {
    const pattern = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    try{
        const emailRegex = new RegExp(pattern);
        if(emailRegex.test(value)){
            return [true, {}];
        }
        else{
            return [false, {
                error: "Email field is not a valid email address."
            }]
        }
    }
    catch(error){
        return [false, {
            error: "The pattern used to check is not a valid regular expression."
        }]
    }
}

client.connect(err => {
  if (err) {
    console.log("err", err);

    throw err
  };

const dbo = client.db('instantCV');

var storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, './public/images/uploads'); // set the destination
    },
    filename: function(req, file, callback){
        callback(null, Date.now() + '.jpg'); // set the file name and extension
    }
});
var upload = multer({storage: storage});


app.use(bodyParser.json())
app.use('/static', express.static(`${__dirname}/public`));

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/home/index.html`);
})

app.get('/createCV', (req, res) => {
    res.sendFile(`${__dirname}/cvForm/form.html`);
})

app.get('/template1', (req,res) =>{
    res.sendFile(`${__dirname}/temp1/temp1.html`);
})

app.get('/template3', (req,res) =>{
    res.sendFile(`${__dirname}/temp2/temp2.html`);
})
app.get('/template2', (req,res) =>{
    res.sendFile(`${__dirname}/temp3/temp3.html`);
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})

app.post('/upload', upload.single('profileImage'), (req, res) => {
    res.status(200);
    res.result(req.file.path)
})



app.post('/createResume', upload.single('profileImage'), (req, res) => {

    console.log(req.body, "req.body");
    console.log(req.file, "req.file");
    const {
        name,
        role,
        phone,
        email,
        address,
        profile,
        educations,
        certifications,
        companies,
        skillsset
    } = req.body;

    // const [isValidName, nameFailure] = checkForValidString(name, {
    //     minAllowedLength: 3,
    //     maxAllowedLength: 30,
    //     fieldName: "name"
    // });

    // if(!isValidName){
    //     res.status(400);
    //     return res.json({
    //         error: nameFailure.error
    //     });
    // }

    // const [isValidAddress, addressFailure] = checkForValidString(address, {
    //     minAllowedLength: 5,
    //     maxAllowedLength: 50,
    //     fieldName: "address"
    // })

    // if(!isValidAddress){
    //     res.status(400);
    //     return res.json({
    //         error: addressFailure.error
    //     });
    // }
    const collection = dbo.collection('userInfo');

     collection.insertOne({
        name : name,
        role : role,
        mobile_no:phone,
        email:email,
        address: address,
        skills: skillsset,
        certifications:certifications,
        profile:profile,
        work_experience:companies,
        education:educations,
        profileImage: req.file.path
    },function(err, result){
      if (err){
      res.status(500).send(err) 
      }
    // console.log("1 document inserted", result.acknowledged , result.insertedId);
    res.status(201).send(result)

    })
     })

     app.post('/registerUser', (req, res) => {
         const{email,password
         } = req.body;
         const collection = dbo.collection('users');
 console.log(req.body, "body");
     collection.insertOne({
        email: email,
        password: password
    },function(err, result){
      if (err){
      res.status(500).send(err) 
      }
    console.log("1 document inserted", result.acknowledged , result.insertedId);
    res.status(201).send(result)

    })

     })

     app.post('/login', (req, res) => {
         const{email,password} = req.body;
        const collection = dbo.collection('users');
        collection.findOne({
           email:email,
       },function(err, result){
         if (err){
         res.status(500).send(err) 
         }
   
       if(result !== null && result.password===password){
        console.log("1 document inserted", result);
       res.status(200).send(result)
       }
       else{
        console.log("error");
           res.status(500).send("user or password incorrect")
       }
       })

     })

     app.get('/getUserCVDetails', (req, res) => {
        const{email} = req.query;
        console.log(email, "email");
        const collection = dbo.collection('userInfo');

        collection.findOne({
           email:email,
       },function(err, result){
         if (err){
         res.status(500).send(err) 
         }
       console.log("1 document inserted", result);
      res.status(200).send(result)
       })

     })

})