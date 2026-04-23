import React from 'react';
import { Users } from 'lucide-react';
import FMCLayout from '@/components/layout/FMCLayout';
import PatientsListScreen from '../shared/PatientsListScreen';

const FMCPatientsListScreen = () => {
  return (
    <FMCLayout>
      <PatientsListScreen 
        facility="fmc" 
        facilityName="Federal Medical Centre" 
        themeColor="red" 
      />
    </FMCLayout>
  );
};

export default FMCPatientsListScreen;