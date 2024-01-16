var con= require('./connect');// handling https request
var express = require('express');
var app= express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.set('view engine', 'ejs');

app.use(express.static(__dirname)); //for css

app.get('/',function(req, res){
    res.sendFile(__dirname+'/adminLogin.html');
});

app.get('/adminPage',function(req, res){
    res.sendFile(__dirname+'/adminPage.html');
});

app.get('/adminPage/productInsert',function(req, res){
    res.sendFile(__dirname+'/productInsert.html');
});

app.post('/adminPage/productInsert',function(req, res){
    var Id = req.body.Id;
    var Name = req.body.Name;
    var Price = req.body.Price;
    var Quantity = req.body.Quantity;
    var Comment = req.body.Comment;
    var Directory = req.body.Directory;
    con.connect(function(error){
        if(error) throw error;

        var sql="INSERT INTO product(itemId,itemName,itemPrice,itemQuantity,itemComment,itemDir) VALUES ('"+Id+"','"+Name+"','"+Price+"','"+Quantity+"','"+Comment+"','"+Directory+"')";

        con.query(sql, function(error, result){
                if(error) throw error;
                console.log('Product insertion succesful!!!')
        });
        
    });

});

app.post('/',function(req, res){
    var adminName = req.body.adminName;
    var password = req.body.password;
    console.log(adminName);
    if (adminName==='BipinRana' && password==='1'){
        res.redirect('/adminPage');
    }
    else{
        res.send("failure") ;
    }
});

app.get('/adminPage/viewCustomer', (req, res) => {
    const query = "SELECT * FROM customer";

    con.query(query, (error, result) => {
        if (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
            return;
        }
        res.render(__dirname + "/viewCustomer", { customer: result });
    });
});

app.post('/viewCustomer', (req, res) => {
    let sortMethod = req.body.Sort === '0' ? 'CustomerName' : 'CustomerID';

    const query = `SELECT * FROM customer ORDER BY ${sortMethod}`;

    con.query(query, (error, result) => {
        if (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
            return;
        }
        res.render(__dirname + "/viewCustomer", { customer: result });
    });
});




app.listen(8000);//setting port of our website
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});