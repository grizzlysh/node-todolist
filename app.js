const express    = require('express');
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');
const _          = require('lodash');
const date       = require(__dirname + "/date.js");

const app = express();

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema = {
    name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your todolist"
});

const item2 = new Item({
    name: "Hit the + button, to add a new list"
});

const item3 = new Item({
    name: "<-- check this delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
}

const List = mongoose.model("List", listSchema);

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res){
    // let day = date.getDay();
    Item.find(function (err, result) {
        if (err) {
            console.log(err);
        }
        else{
            if (result.length === 0){
                Item.insertMany(defaultItems, function(err) {
                    if (err) {
                        console.log(err);
                    }
                    else{
                        console.log("Successfully saved default items to DB.");
                    }
                })
                res.redirect("/");
            }
            else {
                res.render('list', {
                    listTitle: "Today",
                    newListItem: result
                });
            }
        }
    })
});

app.post('/', function (req, res) {
    const newITem  = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: newITem
    });

    if(listName === "Today"){

        item.save();
        res.redirect("/"); 
    }
    else{
        List.findOne({name: listName}, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
        // items.push(item);
        
    }
});

app.post('/delete', function (req, res) {
    const checkedID = req.body.checkedItem;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedID, function (err) {
            if (!err) {
                console.log("Successfully deleted the item.");
                res.redirect("/");
            }
        });
    }
    else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedID}}}, function (err, foundList) {
            if (!err) {
                console.log("Successfully deleted the item.");
                res.redirect("/"+listName);
            }
        });
        // items.push(item);
        
    }
});

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function (err, foundList) {
        if (!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
            
                list.save();

                res.redirect("/"+customListName);
            }
            else{
                res.render('list', {
                    listTitle: foundList.name,
                    newListItem: foundList.items
                });

            }
        }
    });
});

app.get("/work", function (req, res) {
    res.render('list', {
        listTitle: "Work List",
        newListItem: workItems
    })
})

app.post("/work", function (req, res) {
    const item = req.body.newItem;

    workItems.push(item);

    res.redirect("/work");
})

app.get("/about", function (req, res) {
    res.render("about");
    
})

app.listen(3000, function () {
    console.log("Server started on port 3000")
})