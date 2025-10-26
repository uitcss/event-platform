import Round from '../models/Round.js';
import mongoose from 'mongoose';

//get all rounds
export const getRounds = async (req, res) => {
  try {
    const rounds = await Round.find().sort('round_id');
    res.status(200).json({message: 'Rounds fetched successfully',rounds});
  } catch (error) {
    console.error('Error fetching rounds:', error);
    res.status(500).json({ message: 'Server error while fetching rounds' });
  }
};

// Create new round
export const createRound = async (req, res) => {
  try {
    const { round_name, time_limit_minutes } = req.body;
    
    if (!round_name || time_limit_minutes === undefined) {
      return res.status(400).json({ message: 'Round name and time limit are required' });
    }

   
    const lastRound = await Round.findOne().sort('-round_id');//The latest round with the highest round_id will be fetched (descending order)
    const nextRoundId = lastRound ? lastRound.round_id + 1 : 1;


    const round = await Round.create({
      round_id: nextRoundId,
      round_name,
      time_limit_minutes,
      is_active: false
    });

    res.status(201).json(round);
  } catch (error) {
    console.error('Error creating round:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error while creating round' });
  }
};

// Activate a round (deactivates all others)
export const activateRound = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;

    // Using updateMany with session
    await Round.updateMany(
      { is_active: true },//find all active rounds
      { $set: { is_active: false } },//update
      { session }//everything succeeds or nothing changes
    );


    const updatedRound = await Round.findByIdAndUpdate(
      id,
      { $set: { is_active: true } },
      { new: true, session }
    ).exec();//immediately execute the query and give promise

    if (!updatedRound) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Round not found' });
    }

    await session.commitTransaction();//confirm transaction
    session.endSession();
    
    res.status(200).json({
      message: 'Round activated successfully',
      round: updatedRound
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error activating round:', error);
    res.status(500).json({ message: 'Server error while activating round' });
  }
};

// Deactivate a round
export const deactivateRound = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;

    const updatedRound = await Round.findByIdAndUpdate(
      id,
      { $set: { is_active: false } },
      { new: true, session }
    ).exec();

    if (!updatedRound) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Round not found' });
    }

    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      message: 'Round deactivated successfully',
      round: updatedRound
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error deactivating round:', error);
    res.status(500).json({ message: 'Server error while deactivating round' });
  }
};

// Update round time limit
// Delete a round
export const deleteRound = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the round exists
    const round = await Round.findById(id);
    if (!round) {
      return res.status(404).json({ message: 'Round not found' });
    }

    // Prevent deletion of active round
    if (round.is_active) {
      return res.status(400).json({ 
        message: 'Cannot delete active round. Please deactivate it first.' 
      });
    }

    await Round.findByIdAndDelete(id);
    res.status(200).json({ 
      message: 'Round deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting round:', error);
    res.status(500).json({ 
      message: 'Server error while deleting round',
      error: error.message 
    });
  }
};

// Update round time limit
export const updateRoundTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { time_limit_minutes } = req.body;

    if (time_limit_minutes === undefined || time_limit_minutes < 0) {
      return res.status(400).json({ message: 'Valid time limit is required' });
    }

    const round = await Round.findByIdAndUpdate(
      id,
      { time_limit_minutes },
      { new: true, runValidators: true }
    ).exec();

    if (!round) {
      return res.status(404).json({ message: 'Round not found' });
    }

    res.status(200).json({
      message: 'Round time limit updated successfully',
      round
    });
  } catch (error) {
    console.error('Error updating round time:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid round ID' });
    }
    res.status(500).json({ message: 'Server error while updating round time' });
  }
};