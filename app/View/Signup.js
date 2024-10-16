import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { Button } from "react-native-paper";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons"; // Importing icons
import { useSignupViewModel } from "../ModelView/signupView";

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

  const [loading, setLoading] = useState(false); // State for loading
  const [googleButtonStyle, setGoogleButtonStyle] = useState({
    backgroundColor: "white",
    borderColor: "black",
    textColor: "black",
  });

  const Separator = ({ text }) => (
    <View style={styles.separatorContainer}>
      <View style={styles.separatorLine} />
      <Text style={styles.separatorText}>{text}</Text>
      <View style={styles.separatorLine} />
    </View>
  );

  const handleGoogleButtonPressIn = () => {
    setGoogleButtonStyle({
      backgroundColor: "black",
      borderColor: "white",
      textColor: "white",
    });
  };

  const handleGoogleButtonPressOut = () => {
    setGoogleButtonStyle({
      backgroundColor: "white",
      borderColor: "black",
      textColor: "black",
    });
  };

  const handleSignUpPress = async () => {
    setLoading(true); // Set loading to true when starting signup

    try {
      await handleSignUp();
    } catch (error) {
      console.error("Signup failed", error);
    }

    setLoading(false); // Set loading to false after signup completes
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>SIGNUP</Text>
      </View>
      <View style={styles.formContainer}>
        <View style={styles.inputWrapper}>
          <MaterialIcons
            name="account-circle"
            size={24}
            color="black"
            style={styles.icon}
          />
          <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={(text) => setName(text)}
            style={styles.input}
          />
        </View>

        <View style={styles.inputWrapper}>
          <MaterialIcons
            name="location-on"
            size={24}
            color="black"
            style={styles.icon}
          />
          <TextInput
            placeholder="Location"
            value={location}
            onChangeText={(text) => setLocation(text)}
            style={styles.input}
          />
        </View>

        <View style={styles.inputWrapper}>
          <MaterialIcons
            name="email"
            size={24}
            color="black"
            style={styles.icon}
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            style={styles.input}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputWrapper}>
          <FontAwesome
            name="lock"
            size={24}
            color="black"
            style={styles.icon}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            style={styles.input}
            secureTextEntry
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#000000" style={styles.loading} />
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
      <Separator text="OR" />

      <Button
        mode="outlined"
        onPress={() => console.log("Google Sign Up pressed")}
        onPressIn={handleGoogleButtonPressIn}
        onPressOut={handleGoogleButtonPressOut}
        style={[
          styles.button,
          {
            backgroundColor: googleButtonStyle.backgroundColor,
            borderColor: googleButtonStyle.borderColor,
          },
        ]}
        labelStyle={{ color: googleButtonStyle.textColor }}
      >
        Sign in with Google
      </Button>
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
    padding: 20,
    marginTop: 50,
  },
  headerText: {
    fontSize: 30,
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
    borderColor: "#000000",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  icon: {
    paddingRight: 10,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "black",
  },
  separatorText: {
    marginHorizontal: 10,
    color: "black",
    fontWeight: "bold",
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  button: {
    marginVertical: 20,
    backgroundColor: "#000000",
  },
  loading: {
    marginVertical: 20,
  },
});

export default SignupForm;
