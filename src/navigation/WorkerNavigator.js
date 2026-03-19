import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BrowseScreen from '../screens/worker/BrowseScreen';
import JobDetailScreen from '../screens/worker/JobDetailScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import { WORKER_SCREENS, SHARED_SCREENS } from './NavigationConstants';

const Stack = createNativeStackNavigator();

export default function WorkerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={WORKER_SCREENS.BROWSE}     component={BrowseScreen} />
      <Stack.Screen name={WORKER_SCREENS.JOB_DETAIL} component={JobDetailScreen} />
      <Stack.Screen name={SHARED_SCREENS.PROFILE}    component={ProfileScreen} />
    </Stack.Navigator>
  );
}