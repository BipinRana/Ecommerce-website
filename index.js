var con = require('./connect'); // handling https request
var path = require('path');
var express = require('express');
var app = express();

const session = require('express-session');
const body_parser = require('body-parser');

app.use(body_parser.urlencoded({ extended: false }));
app.use(body_parser.json());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'frontend')));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'bipin123', 
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } 
}));
app.get('/', function (req, res) {
    res.render(__dirname + "/frontend/main");
});

app.get('/product', (req, res) => {
    if (req.session.customerDetails) {
        // Use user details from the session
        const customerDetails = req.session.customerDetails;
        console.log('Welcome, '+customerDetails.customerName);
    } else {
        console.log('User details not found. Please log in.');
    }
    
    
    const query = "SELECT * FROM product";

    con.query(query, (error, result) => {
        if (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
            return;
        }
        res.render(__dirname + "/cartProduct", { product: result });
    });
});

app.post('/', function (req, res) {
    var Id = req.body.Id;
    var Name = req.body.Name;
    var Price = req.body.Price;
    var Directory = req.body.Directory;
    var Quantity = req.body.Quantity;

    if (req.session.customerDetails) {
        const customerDetails = req.session.customerDetails;
        var userId = customerDetails.customerIdentity;

        // Check if the product already exists in the cart
        var selectQuery = "SELECT productId FROM cart WHERE productId = ? AND userId=?";
        con.query(selectQuery, [Id, userId], function (error, result) {
            if (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
                return;
            }

            if (result.length > 0) {
                // Product exists in the cart, update quantity
                var updateQuantityQuery = "UPDATE cart SET productQuantity = productQuantity + ? WHERE productId = ? AND userId=?";
                con.query(updateQuantityQuery, [Quantity, Id, userId], function (error, result) {
                    if (error) {
                        console.error(error);
                        res.status(500).send("Internal Server Error");
                        return;
                    }
                    res.send('Product quantity updated in the cart.');
                });
            } else {
                // Product does not exist in the cart, insert a new row
                var insertQuery = "INSERT INTO cart(productId, productName, productQuantity, productPrice, productDir, userId) VALUES (?, ?, ?, ?, ?, ?)";
                con.query(insertQuery, [Id, Name, Quantity, Price, Directory, userId], function (error, result) {
                    if (error) {
                        console.error(error);
                        res.status(500).send("Internal Server Error");
                        return;
                    }
                    res.send('Product added to the cart.');
                });
            }
        });
    } else {
        console.log('User details not found. Please log in.');
    }
});


app.post('/cartView', (req, res) => {
    let sortMethod = req.body.Sort === '0' ? 'productName' : 'productPrice';
    
        let userId;
    if (req.session.customerDetails) {
        const customerDetails = req.session.customerDetails;
        userId=customerDetails.customerIdentity;
        
    } 
    
    else {
        console.log('User details not found. Please log in.');
        res.redirect('/login');
    }

    const query = `SELECT * FROM cart WHERE userId=? ORDER BY ${sortMethod}`;

    con.query(query,userId, (error, result) => {
        if (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
            return;
        }
        res.render(__dirname + "/cartView", { item: result });
    });
});

app.get('/cartView', function (req, res) {
    let userId;

    if (req.session.customerDetails) {
        const customerDetails = req.session.customerDetails;
        userId = customerDetails.customerIdentity;
    } else {
        console.log('User details not found. Please log in.');
        res.redirect('/login');
        return;
    }

    const query = "SELECT * FROM cart WHERE userId=?";

    con.query(query, userId, (error, result) => {
        if (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
            return;
        }
        res.render(__dirname + "/cartView", { item: result });
    });
});

app.get('/purchase', (req, res) => {

    let userId;

    if (req.session.customerDetails) {
        const customerDetails = req.session.customerDetails;
        userId = customerDetails.customerIdentity;
    } else {
        console.log('User details not found. Please log in.');
        res.redirect('/login');
        return;
    }
    
    const query = 'DELETE FROM cart WHERE userId= ?';

    con.query(query,[userId], (error, result) => {
        if (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
            return;
        }
    });

    res.send("success");
    res.redirect('/cartView');
});



app.get('/register', function (req, res) {
     res.sendFile(__dirname+'/register.html');
});

app.post('/register', function (req, res) {
    
    const query = "INSERT INTO customer(customerName, customerGender, customerPassword, customerEmail, customerPhone) VALUES (?, ?, ?, ?, ?)";
    
    userName= req.body.userName;
    email= req.body.email;
    gender= req.body.gender;
    password= req.body.password;
    phone= req.body.phoneNumber;
    
    con.query(query, [userName, gender, password, email, phone], function (error, result) {
        if (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
            return;
        }
    });
});

app.get('/login', function (req, res) {
    res.sendFile(__dirname+'/frontend/login-page.html');
});

app.post('/login', function (req, res) {
    
    const query = "SELECT customerName,customerID FROM customer WHERE customerEmail=? AND customerPassword=? ";

    email= req.body.email;
    password= req.body.password;
    
    
    con.query(query, [ email,password], function (error, result) {
        if (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
            return;
        }
        else if(result.length>0){
            const customerDetails = {
                customerIdentity: result[0].customerID,
                customerName: result[0].customerName,
            };
            req.session.customerDetails = customerDetails;
            console.log('name saved as'+ customerDetails.customerName+ customerDetails.customerIdentity);
            res.redirect('/');
        }
        else{
            
            console.log("You have entered incorrect credentials.");
        }
    });
});

app.post('/delete/:itemId', function (req, res) {
    let userId;

    if (req.session.customerDetails) {
        const customerDetails = req.session.customerDetails;
        userId = customerDetails.customerIdentity;
    } else {
        console.log('User details not found. Please log in.');
        res.redirect('/login');
        return;
    }
    const deleteId = req.params.itemId;
    const query = "DELETE FROM cart WHERE productId= ? and userId=?";
    
    
    con.query(query, [deleteId,userId],function (error, result) {
        if (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
            return;
        }
    });
    console.log("Item deleted Successfully");
    res.redirect('/cartView');
});

app.get('/logout', function (req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
        } else {
            
            res.redirect('/product'); 
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});