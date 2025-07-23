
import { useReducer, useCallback } from 'react';
import { SignUpFormData } from '@/pages/SignUp';

type SignupAction = 
  | { type: 'UPDATE_FORM_DATA'; payload: Partial<SignUpFormData> }
  | { type: 'SET_STEP_VALIDATION'; payload: { stepIndex: number; isValid: boolean } }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'RESET_FORM' };

interface SignupState {
  formData: SignUpFormData;
  stepValidation: boolean[];
  currentStep: number;
}

const initialFormData: SignUpFormData = {
  fullName: "",
  email: "",
  password: "",
  companyName: "",
  companySize: "",
  industry: "",
  hiringGoals: [],
  hiresPerMonth: "",
  currentTools: [],
  biggestChallenges: []
};

const initialState: SignupState = {
  formData: initialFormData,
  stepValidation: [false, false, false, false],
  currentStep: 0
};

function signupReducer(state: SignupState, action: SignupAction): SignupState {
  try {
    console.log('Signup reducer action:', action.type, 'payload' in action ? action.payload : 'no payload');
    
    switch (action.type) {
      case 'UPDATE_FORM_DATA':
        const newFormData = { ...state.formData, ...action.payload };
        console.log('Updated form data:', newFormData);
        return {
          ...state,
          formData: newFormData
        };
      case 'SET_STEP_VALIDATION':
        const newValidation = [...state.stepValidation];
        newValidation[action.payload.stepIndex] = action.payload.isValid;
        console.log(`Step ${action.payload.stepIndex} validation:`, action.payload.isValid);
        return {
          ...state,
          stepValidation: newValidation
        };
      case 'SET_CURRENT_STEP':
        console.log(`Moving to step ${action.payload}`);
        return {
          ...state,
          currentStep: action.payload
        };
      case 'RESET_FORM':
        console.log('Resetting form to initial state');
        return initialState;
      default:
        console.warn('Unknown action type:', (action as any).type);
        return state;
    }
  } catch (error) {
    console.error('Error in signup reducer:', error);
    // Return current state to prevent crashes
    return state;
  }
}

export const useSignupReducer = () => {
  const [state, dispatch] = useReducer(signupReducer, initialState);

  const updateFormData = useCallback((updates: Partial<SignUpFormData>) => {
    dispatch({ type: 'UPDATE_FORM_DATA', payload: updates });
  }, []);

  const updateStepValidation = useCallback((stepIndex: number, isValid: boolean) => {
    dispatch({ type: 'SET_STEP_VALIDATION', payload: { stepIndex, isValid } });
  }, []);

  const setCurrentStep = useCallback((step: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  return {
    ...state,
    updateFormData,
    updateStepValidation,
    setCurrentStep,
    resetForm
  };
};
