import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/employer/DashboardScreen';
import PostJobScreen from '../screens/employer/PostJobScreen';
import EditJobScreen from '../screens/employer/EditJobScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import { EMPLOYER_SCREENS, SHARED_SCREENS } from './NavigationConstants';

const Stack = createNativeStackNavigator();

export default function EmployerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={EMPLOYER_SCREENS.DASHBOARD} component={DashboardScreen} />
      <Stack.Screen name={EMPLOYER_SCREENS.POST_JOB}  component={PostJobScreen} />
      <Stack.Screen name={EMPLOYER_SCREENS.EDIT_JOB}  component={EditJobScreen} />
      <Stack.Screen name={SHARED_SCREENS.PROFILE}     component={ProfileScreen} />
    </Stack.Navigator>
  );
}