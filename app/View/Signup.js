import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {TextInput, Button} from 'react-native-paper';
import { useSignupViewModel } from '../ModelView/signupView';



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

  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>SIGNUP</Text>
      </View>
      <View style={styles.formContainer}>
        <TextInput
          label="Full Name"
          value={name}
          onChangeText={text => setName(text)}
          left={<TextInput.Icon icon="account" />}
          mode="outlined"
          style={styles.input}
          theme={{colors: {primary: '#000000'}}}
        />
        <TextInput
          label="Location"
          value={location}
          onChangeText={text => setLocation(text)}
          left={<TextInput.Icon icon="map-marker" />}
          mode="outlined"
          style={styles.input}
          theme={{colors: {primary: '#000000'}}}
        />
        <TextInput
          label="Email"
          value={email}
          onChangeText={text => setEmail(text)}
          left={<TextInput.Icon icon="email" />}
          mode="outlined"
          style={styles.input}
          theme={{colors: {primary: '#000000'}}}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={text => setPassword(text)}
          left={<TextInput.Icon icon="lock" />}
          mode="outlined"
          secureTextEntry
          style={styles.input}
          theme={{colors: {primary: '#000000'}}}
        />

        <Button
          mode="contained"
          onPress={handleSignUp}
          style={styles.button}
          labelStyle={{color: 'white'}}>
          SIGNUP
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  input: {
    marginVertical: 10,
    backgroundColor: 'white',
  },
  button: {
    marginVertical: 10,
    borderRadius: 20,
    padding: 5,
    backgroundColor: '#242424',
  },
});

export default SignupForm;
