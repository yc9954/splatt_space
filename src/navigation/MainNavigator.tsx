import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import FeedScreen from '../screens/FeedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CameraScreen from '../screens/CameraScreen';

export type MainTabParamList = {
  Feed: undefined;
  Camera: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}>
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <Icon
              name="home"
              size={24}
              color={focused ? '#4A90E2' : '#9CA3AF'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          tabBarIcon: () => (
            <View style={styles.cameraButtonContainer}>
              <LinearGradient
                colors={['#4A90E2', '#FF6B35']}
                style={styles.cameraButton}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}>
                <Icon name="camera" size={28} color="#FFFFFF" />
              </LinearGradient>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <Icon
              name="user"
              size={24}
              color={focused ? '#4A90E2' : '#9CA3AF'}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cameraButtonContainer: {
    marginTop: -30,
  },
  cameraButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
