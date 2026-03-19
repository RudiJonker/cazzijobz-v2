import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/auth/SplashScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import TermsScreen from '../screens/auth/TermsScreen';
import CompleteProfileScreen from '../screens/auth/CompleteProfileScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerifyResetCodeScreen from '../screens/auth/VerifyResetCodeScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import { AUTH_SCREENS } from './NavigationConstants';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={AUTH_SCREENS.SPLASH}           component={SplashScreen} />
      <Stack.Screen name={AUTH_SCREENS.WELCOME}          component={WelcomeScreen} />
      <Stack.Screen name={AUTH_SCREENS.LOGIN}            component={LoginScreen} />
      <Stack.Screen name={AUTH_SCREENS.SIGNUP}           component={SignUpScreen} />
      <Stack.Screen name={AUTH_SCREENS.TERMS}            component={TermsScreen} />
      <Stack.Screen name={AUTH_SCREENS.COMPLETE_PROFILE} component={CompleteProfileScreen} />
      <Stack.Screen name={AUTH_SCREENS.FORGOT_PASSWORD}  component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyResetCode"               component={VerifyResetCodeScreen} />
      <Stack.Screen name="ResetPassword"                 component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}