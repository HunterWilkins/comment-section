var express = require("express");
var mongoose = require("mongoose");

var PORT = 3000;
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var app = express();

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect("mongodb://localhost/commentSection", {useNewUrlParser:true});

// app.engine("handlebars", exphbs({ defaultLayout: "main" }));
// app.set("view engine", "handlebars");

// Routes = = = = = = = = = = = = = = = = = = = = = = = = = = = =
app.get("/scrape", function(req, res){
    axios.get("https://therighttriggerreviews.blogspot.com/").then(function(response){
        var $ = cheerio.load(response.data);
        $("ul>li").each(function(i, element){
            var result = {};

            result.title=$(this)
            .children("a").text();

            result.link=$(this)
            .children("a").attr("href");
            
            db.Article.create(result)
            .then(function(dbArticle){
                console.log(dbArticle);
            })
            .catch(function(err){
                console.log(err);
            });
        
        });

        
        res.send("The Relevant Info has been Scraped.");
    }); 
});

//= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

app.get("/articles", function(req, res){
    db.Article.find({})
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

app.get("/articles/:id", function(req,res){
    db.Article.findOne({ _id: req.params.id})
    .populate("comment")
    .then(function(dbArticle){
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err);
    })
});

app.post("/articles/:id", function(req,res){
    db.Comment.create(req.body)
    .then(function(dbComment){
        return db.Article.findOneAndUpdate({_id:req.params.id}, {comment:dbComment._id}, {new:true});
    })
    .then(function(dbArticle){
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err);
    });
});

app.listen(PORT, function(){
    console.log("App running on port: " + PORT + "!!!!!!");
});