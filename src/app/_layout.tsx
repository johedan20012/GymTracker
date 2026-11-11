import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { DATABASE_NAME, initializeDatabase } from '@/db/database';

export default function RootLayout() {
  const scheme = useColorScheme();

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={initializeDatabase}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="maquina/[id]" options={{ title: '' }} />
          <Stack.Screen
            name="maquina/nueva"
            options={{ title: 'Nueva máquina / ejercicio', presentation: 'modal' }}
          />
          <Stack.Screen
            name="maquina/editar"
            options={{ title: 'Editar', presentation: 'modal' }}
          />
          <Stack.Screen name="dia/[fecha]" options={{ title: 'Día' }} />
          <Stack.Screen
            name="dia/agregar"
            options={{ title: 'Agregar ejercicio', presentation: 'modal' }}
          />
        </Stack>
      </SQLiteProvider>
    </ThemeProvider>
  );
}
