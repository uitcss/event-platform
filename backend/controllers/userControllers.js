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
    const users = await User.find({ current_round: roundId }).select('-password');
    
    if (users && users.length > 0) {
      res.json(users);
    } else {
      res.status(404).json({ message: 'No users found in this round' });
    }
  } catch (error) {
    console.error('Error fetching users by round:', error);
    res.status(500).json({ message: 'Server Error' });
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
