import express from "express";
import 'dotenv/config';
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/', protectRoute ,async (req,res)=>{
   try {
    const {title,caption,image,rating} = req.body;
    if(!title || !caption || !image || !rating){
        return res.status(400).json({message:"All fields are mandatory."})
    }

   const uploadRes =  await cloudinary.uploader.upload(image);
   const imageUrl = uploadRes.secure_url

   const book = new Book({
    title,
    caption,
    rating,
    image:imageUrl,
    user:req.user._id
   })

   await book.save();
   res.status(201).json(book);
   } catch (error) {
    console.log("Error adding book",error)
    res.status(500).json({message:"Internal server error"});
   }
})

router.get('/', protectRoute ,async (req,res)=>{
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page-1)*limit;


        const books = await Book.find().sort({createdAt:-1})
        .skip(skip)
        .limit(limit)
        .populate("user","username profileimage")

        const total = await Book.countDocuments();
        res.send({
            books,
            currentPage:page,
            total,
            totalPages:Math.ceil(total/limit)
        });
    } catch (error) {
        console.log("Error in getting books",error);
        res.status(500).json({message:"Internal server error"});
    }
})

router.get('/user',protectRoute,async (req,res)=>{
    try {
        const books = (await Book.find({user:req.user._id})).sort({createdAt:-1}) ;
        res.json(books);
    } catch (error) {
         console.log("Error in getting books",error);
        res.status(500).json({message:"Internal server error"}); 
    }
})

router.get('/:id', protectRoute ,async (req,res)=>{
  try {
    const book = await Book.findById(req.params.id);
    if(!book) return res.status(400).json({message:"Book not found"});
    
    if(book.user.toString() !== req.user._id.toString()){
      return res.status(400).json({message:"Unauthorized User."});  
    }

    if(book.image && book.image.includes('cloudinary')){
        try {
            const publicId = book.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.log("Error deleting book image",error);
        }
    }

    await book.deleteOne();
    return res.status(201).json({message:"Book deleted successfully"}); 
  } catch (error) {
    console.log("Error in deleting book",error);
    res.status(500).json({message:"Internal server error"});
  }
})

export default router