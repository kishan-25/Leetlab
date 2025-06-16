import bcrypt from "bcryptjs";
import {db} from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    //1. destructuring of data from body
    //2. validate data
    //3. check if user aready exists or not
    //4. save the data

    const {email, password, name} = req.body;

    try{
        const existingUser = await db.user.findUnique({
           where:{
                email
           }
        })

        if(existingUser){
            return res.status(400).json({
                 error : "User already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.user.create({
            data:{
                email,
                password:hashedPassword,
                name, 
                role:UserRole.USER
            }
        })

        const token = jwt.sign({id: newUser.id}, process.env.JWT_SECRET, {
            expiresIn: "7d"
        })

        res.cookie("jwt", token, {
            httpOnly: true,
            samSite: "strict",
            secure: process.env.NODE_ENV !== "development", // means production or testing
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        })

        res.status(200).json({
            message: "User created successfully",
            user:{
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                image: newUser.image
            }
        })
    }catch (error){
        console.error("Error creating user:", error);
        res.status(500).json({
            error: "Error creating user"
        })
    }
} 

export const login = async (req, res) => {
    //1. destructure the data
    //2. validate the data
    //3. check for existence 

    const {email, password} = req.body;

    try{
        const user = await db.user.findUnique({
            where:{
                email
            }
        })

        if(!user){
            return res.status(401).json({
                error: "User not found"
            })
        }

        const isMatch = await bcrypt.compare(password , user.password);

        if(!isMatch){
            return res.status(401).json({
                error: "Invalid credentials"
            })
        }

        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {
            expiresIn: "7d"
        })

        res.cookie("jwt", token, {
            httpOnly: true,
            samSite: "strict",
            secure: process.env.NODE_ENV !== "development", // means production or testing
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        })

        res.status(200).json({
            success: true,
            message: "User logged successfully",
            user:{
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                image: user.image
            }
        })
    }catch(error){
        console.error("Error logging in user:", error);
        res.status(500).json({
            error: "Error in loggin user"
        })
    }
}

export const logout = async (req, res) => {
    try{
        res.clearCookie("jwt" , {
            httpOnly: true,
            samSite: "strict",
            secure: process.env.NODE_ENV !== "development"
        })

        res.status(204).json({ // status code 204 for no content dikhane ke liye
            success: true,
            message: "User logged out successfully"
        })
    }catch(error){
        console.error("Error loggout user:", error);
        res.status(500).json({
            error: "Error in loggout user"
        })
    }
}

export const check = async (req, res) => {
    try{
        res.status(200).json({
            success: true,
            message: "User authenticated successfully"
        })
    }catch(error){
        console.error("Error checking user:", error);
        res.status(500).json({
            error: "Error checking user"
        })
    }
}