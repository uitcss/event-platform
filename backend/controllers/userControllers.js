import mongoose from 'mongoose';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';


const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


const getUsersByRound = asyncHandler(async (req, res) => {
  try {
    const { roundId } = req.params;
    
    // Check if roundId is a number (round_id) or ObjectId (_id)
    const isNumericRoundId = !isNaN(roundId);
    
    let query = {};
    
    if (isNumericRoundId) {
      // If it's a number, use it directly as round_id
      query = { current_round: parseInt(roundId, 10) };
    } else if (mongoose.Types.ObjectId.isValid(roundId)) {
      // If it's a valid ObjectId, look up the round first
      const Round = mongoose.model('Round');
      const round = await Round.findById(roundId);
      
      if (!round) {
        return res.status(404).json({ message: 'Round not found' });
      }
      
      query = { current_round: round.round_id };
    } else {
      return res.status(400).json({ message: 'Invalid round ID format' });
    }
    
    // Find users with the matching current_round
    const users = await User.find(query).select('-password');
    
    // Always return an array, even if empty
    res.json(users || []);
  } catch (error) {
    console.error('Error fetching users by round:', error);
    res.status(500).json({ 
      message: 'Error fetching users',
      error: error.message 
    });
  }
});


const getUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


const promoteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (user) {
      user.current_round += 1;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        current_round: updatedUser.current_round,
        is_active: updatedUser.is_active
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error promoting user:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


const deactivateUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (user) {
      user.is_active = false;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        current_round: updatedUser.current_round,
        is_active: updatedUser.is_active
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

const depromoteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (user) {
      if (user.current_round > 1) {
        user.current_round -= 1;
        const updatedUser = await user.save();
        res.json({
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          current_round: updatedUser.current_round,
          is_active: updatedUser.is_active
        });
      } else {
        res.status(400).json({ message: 'User is already in the first round' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error depromoting user:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

const activateUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (user) {
      user.is_active = true;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        current_round: updatedUser.current_round,
        is_active: updatedUser.is_active
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export {
  getAllUsers,
  getUsersByRound,
  getUserById,
  promoteUser,
  deactivateUser,
  depromoteUser,
  activateUser
};
