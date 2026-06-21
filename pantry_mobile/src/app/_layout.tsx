import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
// @ts-ignore
import { COLORS } from '../../theme';

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();

  // Active state trackers to highlight the current tab
  const isPantryActive = pathname === '/' || pathname === '/index';
  const isProfileActive = pathname === '/profile';

  return (
    <AuthProvider>
      <View style={styles.layoutWrapper}>
        
        {/* Main App Content Viewport */}
        <View style={styles.contentViewport}>
          <Slot />
        </View>

        <View style={styles.tabBar}>
          
          {/* Pantry Link Icon */}
          <TouchableOpacity 
            style={styles.tabButton} 
            onPress={() => router.replace('/')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isPantryActive ? 'restaurant' : 'restaurant-outline'}
              color={isPantryActive ? '#FFFFFF' : '#B2DFDB'}
              size={26}
            />
            <Text style={[styles.tabLabel, isPantryActive && styles.activeTabLabel]}>
              Pantry
            </Text>
          </TouchableOpacity>

          {/* Profile Link Icon */}
          <TouchableOpacity 
            style={styles.tabButton} 
            onPress={() => router.replace('/profile')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isProfileActive ? 'person' : 'person-outline'}
              color={isProfileActive ? '#FFFFFF' : '#B2DFDB'}
              size={26}
            />
            <Text style={[styles.tabLabel, isProfileActive && styles.activeTabLabel]}>
              Profile
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  layoutWrapper: {
    flex: 1,
    backgroundColor: COLORS.backgroundWhite,
  },
  contentViewport: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 76,
    backgroundColor: COLORS.primaryGreen,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 14,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10, 
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#B2DFDB', 
    marginTop: 4,
  },
  activeTabLabel: {
    color: '#FFFFFF', 
    fontWeight: '700',
  },
});