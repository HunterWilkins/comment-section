var express = require("express");
var exphbs = require("express-handlebars");
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

// app.engine(
//     "handlebars",
//     exphbs({
//       defaultLayout: "main"
//     })
//   );
//   app.set("view engine", "handlebars");
//changed from commentSection to commentSect to make a new database
mongoose.connect("mongodb://localhost/commentSect", {useNewUrlParser:true});

// Routes = = = = = = = = = = = = = = = = = = = = = = = = = = = =



app.get("/scrape", function(req, res){
    axios.get("https://www.gameinformer.com/").then(function(response){
        var $ = cheerio.load(response.data);
        $(".article-summary").each(function(i, element){
            var result = {};
            result.title = $(this).children("h2.page-title").text();
        
            result.link = "https://www.gameinformer.com" + $(this).children("h2.page-title").children("a").attr("href");
                
            result.summary = $(this).children(".promo-summary").text();
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

app.get("/delete", function(req, res){
    db.articles.remove({});
    db.articles.find({}).then(function(dbArticle){
        res.json(dbArticle);
    })
});

app.listen(PORT, function(){
    console.log("App running on port: " + PORT + "!!!!!!");
});