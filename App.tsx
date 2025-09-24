import 'react-native-get-random-values';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Text, useColorScheme, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EnumRouteNames } from './src/types/enum-route-names';
import HomeScreen from './src/components/HomeScreen/HomeScreen';
import NoteEditorScreen from './src/components/NoteEditorScreen/NoteEditorScreen';
import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider';
import { database } from './src/database';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-native-paper';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import WaitingActionListScreen from './src/components/WaitingActionListScreen/WaitingActionListScreen';
import CompareNoteScreen from './src/components/CompareNoteScreen/CompareNoteScreen';

const Stack = createNativeStackNavigator();
const ConnectionStateContext = createContext<NetInfoState | null>(null)

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [connectionState, setConnectionState] = useState<NetInfoState | null>(null)
  console.log("Dark mode is", isDarkMode ? "enabled" : "disabled");

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      setConnectionState(state)
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <ConnectionStateContext.Provider value={connectionState}>
      <Provider>
        <DatabaseProvider database={database}>
          <NavigationContainer>
            <Stack.Navigator
              id={undefined}
              screenOptions={{
                headerShown: false
              }}
              initialRouteName={EnumRouteNames.HOME}
            >
              <Stack.Screen name={EnumRouteNames.HOME} component={HomeScreen} />
              <Stack.Screen name={EnumRouteNames.NOTE_EDITOR} component={NoteEditorScreen} />
              <Stack.Screen name={EnumRouteNames.WAITING_ACTIONS} component={WaitingActionListScreen} />
              <Stack.Screen name={EnumRouteNames.COMPARE_NOTE_SCREEN} component={CompareNoteScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          <Toast />
        </DatabaseProvider>
      </Provider>
    </ConnectionStateContext.Provider>
  );
}

export const useConnectionState = () => {
  const state = useContext(ConnectionStateContext);
  return state;
}

export default App;
