const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
// const  tf  = require('@tensorflow/tfjs-node');
const cookieParser = require("cookie-parser");
const cloudinary = require("./cloudinary/cloudinary.js");
// const path = require("path")
const { spawn } = require("child_process");

// const pythonProcess = spawn('python',['model.py'])

// pythonProcess.stdout.on("data", (outs) => {
//   console.log(outs.toString("ascii"))
// })

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors());
app.use(cookieParser());

mongoose.connect("mongodb://127.0.0.1:27017/pd")
.then(()=>console.log("Server connected"))

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => {
      UserModel.findOne({email:email})
      .then((user)=>{
        if(user){
          console.log(user)
          res.json({success:false,gotologin:true});
        }
        else{
          console.log("hi")
          UserModel.create({ name, email, password: hash })
          .then((result) => res.json({success:true,gotologin:true}))
          .catch((err) => res.json({success:false,gotologin:false}));
        }
      })
      .catch((err)=>res.json({success:false,gotologin:false}));
    })
    .catch((err) => console.log(err.message));
});

function authenticateToken(req, res, next) {
  // const token = req.query.token;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.json({ authSuccess: false });
  }

  jwt.verify(token, "ksdfjufeiwr", (err, user) => {
    if (err) {
      return res.json({ authSuccess: false });
    }
    req.user = user;
    next();
  });
}

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  UserModel.findOne({ email: email })
    .then((user) => {
      if (user) {
        bcrypt.compare(password, user.password, (err, response) => {
          if (response) {
            const token = jwt.sign({ email: user.email }, "ksdfjufeiwr", {
              expiresIn: "1d",
            });
            res.json({ success: true, token });
          } else {
            res.json("Password is incorrect");
          }
        });
      } else {
        res.json("No record is found");
      }
    })
    .catch((err) => res.json(err.message));
});

app.get("/profile", authenticateToken, (req, res) => {
  UserModel.findOne({ email: req.user.email })
  .then((user) => {
      if (!user) {
        // User not found
        return res.status(404).json({ authSuccess: false, message: "User not found" });
      }
      // User found, send response with user details
      res.json({ authSuccess: true, email: user.email, name: user.name });
    })
    .catch((err) => {
      // Handle database query error
      console.error("Error finding user:", err);
      res.status(500).json({ authSuccess: false, message: "Internal server error" });
    });
  // res.json({
  //   authSuccess: true,
  //   userDetails: req.user,
  // });
});

app.post("/upload", async (req, res) => {
  console.log(req.body);
});

app.get("/home", authenticateToken, (req, res) => {
  res.json({
    authSuccess: true,
  });
});

app.post("/predict", async (req, res) => {
  try {
    const imageData = req.body;
    // console.log(imageData.image)

    const filePath = "image.jpg";
    const base64Data = imageData.image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");
    console.log("hi");
    fs.writeFile(filePath, imageBuffer, (err) => {
      console.log("34");
      if (err) {
        console.error("Error saving image:", err);
        return;
      }
      console.log("image saved successfully", filePath);
    });

    const pythonProcess = spawn("python", ["check.py", filePath]);
    let value = "";
    let responseSent = false;
    pythonProcess.stdout.on("data", (outs) => {
      value = outs.toString("ascii").split("\n");
      //console.log(value)
      value.forEach((line) => {
        // Remove any leading/trailing whitespace
        line = line.trim();

        // Skip empty lines and lines with progress indicators
        if (line === "" || line.includes("[==============================]")) {
          return;
        }

        // Split the line by spaces
        const parts = line.split(" ");

        // Extract the numerical values from the line
        const numericalValues = parts.filter((part) => {
          return /^-?\d*\.?\d+$/.test(part);
        });

        // Convert and print each numerical value
        // numericalValues.forEach(value => {
        //     console.log(parseFloat(value));
        // });
        console.log(
          parseFloat(numericalValues[0]) > parseFloat(numericalValues[1])
        );
        if (!responseSent) {
          responseSent = true;
          if (parseFloat(numericalValues[0]) > parseFloat(numericalValues[1])) {
            res.json({ prediction: "Healthy",healthy:numericalValues[0],parkinson:numericalValues[1]});
          } else {
            res.json({ prediction: "Parkinson",healthy:numericalValues[0],parkinson:numericalValues[1]});
          }
        }
      });

      console.log("hiiiii");
      // console.log(value);
      // if(!responseSent){
      //   responseSent=true;
      // let label = null;
      // let percentage = null;

      // // Iterate through the array
      // for (let i = 0; i < value.length; i++) {
      //   // Check if the string contains the word "Healthy"
      //   if (data[i].includes("Healthy") || data[i].includes("Parkinson")) {
      //     // Extract percentage using regular expression
      //     const match = data[i].match(/\d+\.\d+/);
      //     if (match) {
      //       percentage = match[0];
      //     }
      //     // Extract label
      //     label = "Healthy";
      //     break;
      //   }
      // }
      // res.json({prediction:percentage})
      // }
    });

    pythonProcess.stderr.on("data", (out) => {
      //console.log(out.toString("ascii"))
    });
    // res.json({prediction:value})
    // res.json({data:{predictions:"NO"}})
    // pythonProcess.stdin.write(JSON,stringify(imageData));
    // pythonProcess.stdin.end();
    // pythonProcess.stdout.on('data',(data)=>{
    //   const prediction = data.toString();
    //   res.json({prediction});
    //   console.log(prediction)
    // })
    // console.log("hi")
  } catch (err) {}
});

app.listen(3002, () => {
  console.log("server is running");
});
