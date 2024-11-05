const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");

//for method overriding
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
//for setting views for ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: 'Roybhavan@789'
});

let getRandomUser = () => {
    return [
        faker.string.uuid(),
        faker.internet.username(), // before version 9.1.0, use userName()
        faker.internet.email(),
        faker.internet.password(),
    ];
};


// let q= "INSERT INTO user(id,username,email,password) VALUES ?";
// // let users =[
// //     ["123b","123_newuserb","abcb@gmail.com","abcb"],
// //     ["123c","123_newuserc","abcc@gmail.com","abcc"]];
// let data=[];
// for(let i=1;i<=100;i++){
//     data.push(getRandomUser());
// }


//HOME ROUTE
app.get("/", (req, res) => {
    let q = `SELECT COUNT(*) FROM user`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let count = result[0]["COUNT(*)"];
            res.render("home.ejs", { count });
            // console.log(result.length);
            // console.log(result[0]);
            // console.log(result[1]);
        });
    } catch (err) {
        console.log(err);
        res.send("some error in DB");
    }
});

//Show Route
app.get("/user", (req, res) => {
    let q = `SELECT * FROM user`;
    try {
        connection.query(q, (err, users) => {
            if (err) throw err;
            //console.log(result);
            //res.send(result);
            // console.log(result.length);
            // console.log(result[0]);
            // console.log(result[1]);
            res.render("showusers.ejs", { users });
        });
    } catch (err) {
        console.log(err);
        res.send("some error in DB");
    }
});

//Edit Route
app.get("/user/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            res.render("edit.ejs", { user });
            // console.log(result.length);
            // console.log(result[0]);
            // console.log(result[1]);
        });
    } catch (err) {
        console.log(err);
        res.send("some error in DB");
    }
});

//Update (DB) Route
app.patch("/user/:id", (req, res) => {
    let { id } = req.params;
    let { password: formPass, username: newUsername } = req.body;
    let q = `SELECT * FROM user WHERE id='${id}'`;

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            if (formPass != user.password) {
                res.send("WRONG password");
            } else {
                let q2 = `UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
                connection.query(q2, (err, result) => {
                    if (err) throw err;
                    res.redirect("/user");
                });
            }
            // console.log(result.length);
            // console.log(result[0]);
            // console.log(result[1]);
        });
    } catch (err) {
        console.log(err);
        res.send("some error in DB");
    }
});

app.get("/user/new", (req, res) => {
    res.render("new.ejs");
});

app.post("/user", (req, res) => {
    let id = faker.string.uuid();
    let { email: formEmail, username: formUser, password: formPass } = req.body;
    let q3 = `INSERT INTO user (id,username,email,password) VALUES ('${id}','${formUser}','${formEmail}','${formPass}')`;
    let q4 = `SELECT * FROM user WHERE username='${formUser}' OR email='${formEmail}'`;

    try {
        connection.query(q4, (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                res.send("Same data already exists")
            } else {
                connection.query(q3, (err, result) => {
                    if (err) throw err;
                    let user = result;
                    console.log(result);
                    res.redirect("/user");

                });
            }
        });
        // connection.query(q3,(err,result)=>{
        //     if (err) throw err;
        //     let user= result;
        //     console.log(result);
        //     res.redirect("/user");
    } catch (err) {
        console.log(err);
        res.send("some error in DB");
    }
});

app.get("/user/:id/delete", (req, res) => {
    let {id}=req.params;
    let q7=`SELECT * FROM user WHERE id='${id}'`;
    try{
        connection.query(q7,(err,result)=>{
            if (err) throw err;
            let user=result[0];
            res.render("delete.ejs",{user});
        });
    }catch (err){
        console.log(err);
        res.send("some error in DB");
    }
});

app.delete("/user/:id", (req, res) => {
    let { id } = req.params;
    let q5 = `DELETE From user WHERE id='${id}'`;
    let q6 = `SELECT * FROM user WHERE id='${id}'`;
    let { email: formEmail, password: formPass } = req.body;
    try {
        connection.query(q6, (err, result) => {
            if (err) throw err;
            console.log(id);
            console.log(result);
            let user=result[0];
            if (formEmail != user.email && formPass != user.password) {
                res.send("Email or password is not correct")
            } else {
                connection.query(q5, (err, result) => {
                    if(err) throw err;
                    console.log(result);
                    res.redirect("/user");
                });
            }
        });
    } catch (err) {
        console.log(err);
        res.send("some error in DB");
    }

});

app.listen("8080", () => {
    console.log("server is listening to port 8080");
});

// try{
//     connection.query(q,[data],(err,result)=>{
//         if(err) throw err;
//         console.log(result);
//         // console.log(result.length);
//         // console.log(result[0]);
//         // console.log(result[1]);
//     });
// }catch (err){
//     console.log(err);
// }

// connection.end();