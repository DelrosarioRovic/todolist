const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

mongoose.set('strictQuery', false);


mongoose.connect('mongodb+srv://Akocrovic123:Akocrovic123@mydb.jfyc7mf.mongodb.net/todolistDB',{ useNewUrlParser: true});
const itemsSchema = {
    name: String
};
const Item = mongoose.model("Item", itemsSchema);

const defaultItem = [
  new Item({ name: "Buy food" }),
  new Item({ name: "Cook food" }),
  new Item({ name: "Eat food" })
];

  let deleteItem = [];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



  

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.get("/", function(req, res) {
  Item.find({}, (error, results) => {
    // if no item then insert the default item
  if(results.length === 0) {
    // insert item
    Item.insertMany(defaultItem, function(err){
      if (err) {
        console.log(err);
      }
      else {
        console.log("Successfully saved all");
      }
    });
    res.redirect("/");
  } else {
    res.render("list", {listTitle: "Today", newListItems:results});
  }

});
  
});

app.get("/about", function(req, res){
    res.render("about");
});

app.get("/:composed", function(req, res){
  
  const getUrl = req.params.composed;
  List.findOne({name: getUrl}, function(err, foundList) {
    if (!err) {
      if(!foundList) {
        
        const list = new List({
          name: getUrl,
          items: defaultItem
        });
        list.save(); 
        res.redirect("/" + getUrl);
      } 
      else {
        res.render("list", {listTitle: foundList.name, newListItems:foundList.items})
      }
    }
  })
  // 
});

app.post("/storedelete", function(req, res){
  let readyToDelete = req.body.itemValue;
  deleteItem.push(readyToDelete);
  console.log(deleteItem);

});

app.post("/delete", function(req, res){
  // delete all items
  const listTitle = req.body.list;
  if (listTitle === "Today") {
    for (let index = 0; index < deleteItem.length; index++) {
      var dlte = deleteItem[index];
      Item.deleteOne({ _id: dlte }, function (error) {
        if (error) {
          console.error(error);
        } else {
          console.log('Successfully deleted the item.');
        }
      });
    }
    res.redirect("/");
    
    deleteItem = [];
  } else {
    
  List.findOne({name : listTitle}, function (err, foundList) {
    
    for (let index = 0; index < deleteItem.length; index++) {
      var dlte = deleteItem[index];
      foundList.items.remove({ _id: dlte });
    }
    foundList.save();
    res.redirect("/"+ listTitle);
    
    deleteItem = [];
  });

}

});

app.post("/", function(req, res){
  const item = req.body.newItem;

 const listTitle = req.body.list;

    const newItem = new Item ({
      name : item
    })
    if (listTitle === "Today") {
      newItem.save();
      res.redirect("/");
    } 
    else {
      List.findOne({name : listTitle}, function (err, foundList) {
        console.log(foundList);
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/" + listTitle); 
      });
    }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
    console.log("The Server is running successfully");
})
