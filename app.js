//jshint esversion:6

const express= require("express");
const bodyParser= require("body-parser");
const mongoose=require("mongoose");
const lodash=require("lodash");

const app= express();

mongoose.connect("mongodb://127.0.0.1:27017/itemDB");

app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


// let todos=["Do Meditation","Exercise","Write some Code"];
// let workitems=[];
//const foundItem=[];

const itemSchema=mongoose.Schema({
  itemName:String
});

const Item=mongoose.model("item",itemSchema);

const item1 =new Item({
  itemName:"Welcome to-do list!"
});

const item2 =new Item({
  itemName:"Press + to add new item"
});
const item3 =new Item({
  itemName:"<-- Press this to delete item!"
});

  
const defaultItem=[item1,item2,item3];

const listSchema=mongoose.Schema({
  name:String,
  items:[itemSchema]
});

const List=mongoose.model("list",listSchema);

app.get("/",function(req,res){
 
  Item.find({}).then(foundItem=>{
   
    if(foundItem.length==0)
   {  
    Item.insertMany(defaultItem).then(()=>{
      
    });
    res.redirect("/");
   }
   else
   {
    res.render("list",{titleName:"Today" , items:foundItem});
     
   }

  });
   
});

app.post("/",(req,res)=> {
    
  const todo=req.body.add;
  const listName=req.body.button;

  
  const item=new Item({
    itemName:todo
  })

  if(listName=="Today")
  {
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName}).then(foundItem=>{
      foundItem.items.push(item);
      foundItem.save();

      res.redirect("/"+listName);
    }).catch(err=>{
      console.error(err);
    });
  }

});

app.post("/delete",function(req,res){
  
  const itemChecked=req.body.check;
  const listName=req.body.listName; 

  if(listName=="Today")
  {
    Item.findByIdAndDelete(itemChecked).then(()=>{
      res.redirect("/");
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull: {items:{_id:itemChecked}}})
    .then(foundItem=>{
      if(foundItem)
      {
        res.redirect("/"+listName);
      }
    }).catch(err=>{
      console.error(err);
    });
  }

  
})

app.get("/:anyName",(req,res)=>{

  const nameFetch=lodash.capitalize(req.params.anyName);
  
  
  List.findOne({name:nameFetch})
  .then(foundItem=>{
       
     if(!foundItem){
      //Dont Exist
      const lists=new List({
         name:nameFetch,
         items:defaultItem
     });
       lists.save();
       res.redirect("/"+nameFetch);
      }
    else{
      //exist
      res.render("list",{titleName:foundItem.name,items:foundItem.items});
    }

  })
  .catch((err)=>{
    console.error(err);
  });
   

});


app.listen(3000,() => {
    console.log("Server is On!!!");
});