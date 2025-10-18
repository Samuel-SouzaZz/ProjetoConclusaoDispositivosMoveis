import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

interface BottomNavigationProps {
  activeRoute: "Dashboard" | "Discussions" | "Ranking" | "Exercises" | "Settings";
}

export default function BottomNavigation({ activeRoute }: BottomNavigationProps) {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={[styles.navItem, activeRoute === "Discussions" && styles.navItemActive]}
        onPress={() => navigation.navigate("Discussions")}
      >
        <Ionicons
          name="list"
          size={24}
          color={activeRoute === "Discussions" ? "#4A90E2" : "#666"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeRoute === "Ranking" && styles.navItemActive]}
        onPress={() => navigation.navigate("Ranking")}
      >
        <Ionicons
          name="trophy"
          size={24}
          color={activeRoute === "Ranking" ? "#4A90E2" : "#666"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeRoute === "Dashboard" && styles.navItemActive]}
        onPress={() => navigation.navigate("Dashboard")}
      >
        <Ionicons
          name="home"
          size={24}
          color={activeRoute === "Dashboard" ? "#4A90E2" : "#666"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeRoute === "Exercises" && styles.navItemActive]}
        onPress={() => navigation.navigate("Exercises")}
      >
        <Ionicons
          name="code-slash"
          size={24}
          color={activeRoute === "Exercises" ? "#4A90E2" : "#666"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeRoute === "Settings" && styles.navItemActive]}
        onPress={() => navigation.navigate("Settings")}
      >
        <Ionicons
          name="settings"
          size={24}
          color={activeRoute === "Settings" ? "#4A90E2" : "#666"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    padding: 10,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: "#E3F2FD",
  },
});

