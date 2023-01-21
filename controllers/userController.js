import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js'

export const login = async (req, res) => {
    const {email, password} = req.body;
    console.log('email ' + email)
    try {
      console.log('email ' + email)
        const existingUser = await User.findOne({ email });
        if(!existingUser)  console.log('doesnt exist')
        if(!existingUser) return res.status(404).json({ message: "User doesn't exist"});
    
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

        if(!isPasswordCorrect) return res.status(400).json({message: "Invalid credentials."});

        const token = jwt.sign({ email: existingUser.email, id: existingUser._id}, 'test', {expiresIn: "1h"});
        console.log('existingUser' + existingUser)
        res.status(200).json({ result: existingUser, token })
    } catch (error) {
        res.status(500).json({ message: "something went wrong"})
    }
}

export const signup = async (req, res) => {
  const {email, password, confirmPwd, username, firstname, lastname} = req.body;

  try {
    const existingUser = await User.findOne({ email });
    
    if(existingUser) return res.status(400).json({ message: "User already exist"});

   
   if(password !== confirmPwd)  return res.status(400).json({ message: "passwords don't match"});
   
   const hashedPassword = await bcrypt.hash(password, 12);

   const result = await User.create({ email, password: hashedPassword,  username, name: `${firstname} ${lastname}`});

   const token = jwt.sign({ email: result.email, id: result._id}, 'test', {expiresIn: "1h"});

   res.status(200).json({ result: result, token });

} catch (error) {
    res.status(500).json({ message: "something went wrong"})
  }
}

