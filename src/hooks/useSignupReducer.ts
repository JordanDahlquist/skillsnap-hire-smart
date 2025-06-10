
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
  jobTitle: "",
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
  switch (action.type) {
    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: { ...state.formData, ...action.payload }
      };
    case 'SET_STEP_VALIDATION':
      const newValidation = [...state.stepValidation];
      newValidation[action.payload.stepIndex] = action.payload.isValid;
      return {
        ...state,
        stepValidation: newValidation
      };
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload
      };
    case 'RESET_FORM':
      return initialState;
    default:
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
