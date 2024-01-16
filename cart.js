var con= require('./connect');// handling https request
var express = require('express');
var app= express();

const body_parser = require('express-session');
app.use(body_parser.json());
app.use(express.static('public'));

app.set('view engine','ejs');

app.get('/',function(req,res){
    con.connect(function(error){
        if(error) console.log(error);

        var sql= "select * from product";

        con.query(sql,function(error,result){
            if(error) console.log(error);
            res.render( __dirname+"/cartProduct",{product:result});
        });
    });
});

app.get('/cartView',function(req,res){
    con.connect(function(error){
        if(error) console.log(error);

        var sql= "select * from product";

        con.query(sql,function(error,result){
            if(error) console.log(error);
            res.render( __dirname+"/cartView",{product:result});
        });
    });
});

app.listen(9000);//setting port of our website
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});