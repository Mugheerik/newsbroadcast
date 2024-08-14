import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { Stack } from "expo-router";
import { useSignInViewModel } from '../ModelView/signinView';

const Separator = ({ text }) => (
  <View style={styles.separatorContainer}>
    <View style={styles.separatorLine} />
    <Text style={styles.separatorText}>{text}</Text>
    <View style={styles.separatorLine} />
  </View>
);

const LoginForm = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    handleSignIn,
  } = useSignInViewModel(); 
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
        <TextInput
          label="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          left={
            <TextInput.Icon
              icon="email"
              rippleColor={"#000000"}
              color={"#000000"}
            />
          }
          mode="outlined"
          style={styles.input}
          theme={{
            colors: {
              primary: "#000000",
            },
          }}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          left={
            <TextInput.Icon
              icon="lock"
              rippleColor={"#000000"}
              color={"#000000"}
            />
          } // Adjust color and size here
          mode="outlined"
          secureTextEntry
          style={styles.input}
          theme={{ colors: { primary: "black" } }}
        />

        <Button
          mode="contained"
          onPress={handleSignIn}
          style={styles.button}
          labelStyle={{ color: "white" }}
        >
          Login
        </Button>
        <Separator text="OR " />
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
          Sign up with Google
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
  input: {
    marginVertical: 10,
    backgroundColor: "white",
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
