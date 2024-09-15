import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { Button } from "react-native-paper";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons"; // Importing icons
import { useSignInViewModel } from "../ModelView/signinView";

const Separator = ({ text }) => (
  <View style={styles.separatorContainer}>
    <View style={styles.separatorLine} />
    <Text style={styles.separatorText}>{text}</Text>
    <View style={styles.separatorLine} />
  </View>
);

const LoginForm = () => {
  const { email, setEmail, password, setPassword, handleSignIn } =
    useSignInViewModel();
  const [googleButtonStyle, setGoogleButtonStyle] = useState({
    backgroundColor: "white",
    borderColor: "black",
    textColor: "black",
  });

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Login</Text>
      </View>
      <View style={styles.formContainer}>
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
          <FontAwesome name="lock" size={24} color="black" style={styles.icon} />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            style={styles.input}
            secureTextEntry
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSignIn}
          style={styles.button}
          labelStyle={{ color: "white" }}
        >
          Login
        </Button>

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
  input: {
    flex: 1,
    height: 40,
  },
  button: {
    marginVertical: 10,
    borderRadius: 20,
    padding: 5,
    backgroundColor: "#242424",
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
});

export default LoginForm;
