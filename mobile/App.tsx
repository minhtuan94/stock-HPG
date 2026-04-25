import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { NewsScreen } from "./src/screens/NewsScreen";
import { FinancialsScreen } from "./src/screens/FinancialsScreen";
import { AnalysisScreen } from "./src/screens/AnalysisScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { palette } from "./src/theme/palette";

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.background,
    card: palette.surface,
    text: palette.textPrimary,
    border: palette.border,
    primary: palette.primary,
  },
};

export default function App() {
  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: palette.surface },
          headerTintColor: palette.textPrimary,
          tabBarStyle: {
            backgroundColor: palette.surface,
            borderTopColor: palette.border,
          },
          tabBarActiveTintColor: palette.primary,
          tabBarInactiveTintColor: palette.textMuted,
          tabBarIcon: ({ color, size }) => {
            const icons: Record<string, keyof typeof MaterialIcons.glyphMap> = {
              Dashboard: "dashboard",
              News: "article",
              Financials: "show-chart",
              Analysis: "analytics",
              Settings: "settings",
            };
            return <MaterialIcons name={icons[route.name]} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="News" component={NewsScreen} />
        <Tab.Screen name="Financials" component={FinancialsScreen} />
        <Tab.Screen name="Analysis" component={AnalysisScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
