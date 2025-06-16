import React, { useState } from 'react';
import PricingModal from './PricingModal';

const TestPricingModal: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-8">
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Test Pricing Modal
      </button>
      
      <PricingModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </div>
  );
};

export default TestPricingModal; 