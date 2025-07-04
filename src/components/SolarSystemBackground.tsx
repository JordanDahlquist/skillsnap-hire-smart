
import React from 'react';

export const SolarSystemBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Pure solid background based on theme */}
      <div className="absolute inset-0 bg-background" />
    </div>
  );
};
