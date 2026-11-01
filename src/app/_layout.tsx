import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider
        settings={{
          icon: (props) => <MaterialCommunityIcons {...props} />,
        }}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="adicionar" />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}