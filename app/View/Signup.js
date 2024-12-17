import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Button } from "react-native-paper";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useSignupViewModel } from "../ModelView/signupView";
import locationData from "../../assets/locations.json";

const SignupForm = () => {
  const {
    name,
    setName,
    email,
    setEmail,
    location,
    setLocation,
    password,
    setPassword,
    handleSignUp,
  } = useSignupViewModel();

  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLocationInput = (text) => {
    setLocation(text);
    if (text.trim() !== "") {
      const results = locationData.filter((item) =>
        item.Name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredLocations(results);
      setShowDropdown(results.length > 0);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSignUpPress = async () => {
    setLoading(true);
    try {
      await handleSignUp();
    } catch (error) {
      console.error("Signup failed:", error);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>SIGNUP</Text>
      </View>
      <View style={styles.formContainer}>
        <View style={styles.inputWrapper}>
          <MaterialIcons name="account-circle" size={24} style={styles.icon} />
          <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
        </View>
        <View style={styles.inputWrapper}>
          <MaterialIcons name="location-on" size={24} style={styles.icon} />
          <TextInput
            placeholder="Enter Location"
            value={location}
            onChangeText={handleLocationInput}
            style={styles.input}
          />
          {showDropdown && (
            <FlatList
              data={filteredLocations}
              keyExtractor={(item, index) => index.toString()}
              style={styles.dropdown}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setLocation(item.Name);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownText}>{item.Name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
        <View style={styles.inputWrapper}>
          <MaterialIcons name="email" size={24} style={styles.icon} />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
          />
        </View>
        <View style={styles.inputWrapper}>
          <FontAwesome name="lock" size={24} style={styles.icon} />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="black" style={styles.loading} />
        ) : (
          <Button
            mode="contained"
            onPress={handleSignUpPress}
            style={styles.button}
            labelStyle={{ color: "white" }}
          >
            SIGNUP
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  
  },
  header: {
    alignItems: "center",
    marginVertical: 20,
    marginTop: 50,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "black",
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
    color: "black",
  },
  input: {
    flex: 1,
    height: 40,
  },
  dropdown: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    maxHeight: 150,
    marginTop: 5,
  },
  dropdownItem: {
    padding: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  dropdownText: {
    fontSize: 16,
    color: "black",
  },
  button: {
    backgroundColor: "black",
    marginVertical: 20,
  },
  loading: {
    marginVertical: 20,
  },
});

export default SignupForm;
