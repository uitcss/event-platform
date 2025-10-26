import express from 'express';
import Admin from '../models/Admin.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const AdminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: admin._id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // token expires in 1 day
        );

        // 5. Return token
        return res.status(200).json({ message: 'Login successful', token: token});
    } catch (error) {
        console.error(error);
        return   res.status(500).json({ message: 'Server error' });
    }
};

const SetAdmin = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const admin = await Admin.findOne({ email });
        if (admin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        if(!name || !email || !password){
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newAdmin = await Admin.create({
            name,
            email,
            password: hashedPassword
        });
        return res.status(201).json({ message: 'Admin created successfully', data: newAdmin });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error while adding admin' });

    }
}

export { AdminLogin, SetAdmin };