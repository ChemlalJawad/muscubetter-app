import React from 'react';
import { supabase } from './lib/supabase';

const FitnessApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">MuscuBetter</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Welcome to your fitness journey!</p>
        </div>
      </div>
    </div>
  );
};

export default FitnessApp;