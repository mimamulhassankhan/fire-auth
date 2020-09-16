import React, { useState } from 'react';
import './App.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';

firebase.initializeApp(firebaseConfig);

function App() {
  const [user, setUser] = useState({
    isSignedIn : false,
    name: '',
    email: '',
    password: '',
    photo: '',
    error: '',
    success: false
  })
  const provider = new firebase.auth.GoogleAuthProvider();
  const handleSignIn = () => {
    firebase.auth().signInWithPopup(provider)
    .then( res => {
      const {email, photoURL, displayName} = res.user;
      const signedInUser = {
        isSignedIn : true,
        name : displayName,
        email: email,
        photo : photoURL
      }
      setUser(signedInUser);
    })
    .catch(err => {
      console.log(err);
      console.log(err.message);
    });
  }
  const handleSignOut = () => {
    firebase.auth().signOut()
    .then(res => {
      const signedOutUser = {
        isSignedIn : false,
        name: '',
        email: '',
        photo: ''
      }
      setUser(signedOutUser)
    })
    .catch(err => {
      prompt(err.message);
    })
  }
  const handleBlur = (e) => {
    let isFormValid = true;
    if(e.target.name === 'email'){
      isFormValid = /\S+\@\S+\.\S+/.test(e.target.value);
    }
    else if(e.target.name === 'password'){
      isFormValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(e.target.value)
    }
    if(isFormValid){
      const newUserInfo = {...user};
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
    }
    
  }
  const handleSubmit= (e) => {
    if(user.email && user.password){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then(res => {
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.success = true;
        setUser(newUserInfo);
      })
      .catch(err => {
        console.log(err.message);
        const newUserInfo = {...user};
        newUserInfo.error = err.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
      })
    }
    e.preventDefault();
  }
  return (
    <div className="App">
      {
        user.isSignedIn ? <button onClick={handleSignOut}>Sign Out</button> : <button onClick={handleSignIn}>Sign in</button>
      }
      {
        user.isSignedIn && <div>
            <h3>Name: {user.name}</h3>
            <h4>Email : {user.email}</h4>
            <img src={user.photo} alt="user"/>
        </div>
      }
      <h3>Our own Authentication provider:</h3>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Password: {user.password}</p>
      <form onSubmit={handleSubmit}>
        <input onBlur={handleBlur} type="text" name="name" placeholder="Enter Name" />
        <br/>
        <input onBlur={handleBlur} type="text" name="email"  placeholder="Enter Email" required/>
        <br/> 
        <input onBlur={handleBlur} type="password" name="password" placeholder="Enter Password" required/>
        <br/> 
        <input type="submit" value="Submit"/>
      </form>
      <p style={{color: 'red'}}>{user.error}</p>
      {
        user.success && <p style={{color: 'green'}}>Successfully account created.</p>
      }
    </div>
  );
}

export default App;
