import React, { useState } from 'react';
import './App.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';

firebase.initializeApp(firebaseConfig);

function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn : false,
    name: '',
    email: '',
    password: '',
    photo: '',
    error: '',
    success: false
  })
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSignIn = () => {
    firebase.auth().signInWithPopup(googleProvider)
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
    if(newUser && user.email && user.password){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then(res => {
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.success = true;
        setUser(newUserInfo);
        updateUserInfo(user.name);
      })
      .catch(err => {
        console.log(err.message);
        const newUserInfo = {...user};
        newUserInfo.error = err.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
      })
    }
    else if(!newUser && user.email && user.password){
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .then(res => {
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.success = true;
        setUser(newUserInfo);
        console.log(res);
      }).catch(err => {
        const newUserInfo = {...user};
        newUserInfo.error = err.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
      })
    }
    e.preventDefault();
  }

  const handleFbLogin = (e) => {
    firebase.auth().signInWithPopup(fbProvider)
    .then(res => {
        console.log(res);
    })
    .catch(err => {
      console.log(err.message);
    })
    console.log('btn clicked');
    e.preventDefault();
  }

  const updateUserInfo = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name,
    }).then(
      console.log('user updated successfully!!!')
    ).catch(err => {
      console.log('not updated');
    });
  }
  return (
    <div className="App">
      {
        user.isSignedIn ? <button onClick={handleSignOut}>Sign Out</button> : <button onClick={handleSignIn}>Sign in</button>
      }
      <br/>
      <button onClick={handleFbLogin}>Sign in with facebook</button>
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
        <input onChange={() => setNewUser(!newUser)} type="checkbox" name="newUser"/>
        <label htmlFor="newUser">Create New User</label>
        <br/>
        { newUser && <input onBlur={handleBlur} type="text" name="name" placeholder="Enter Name" />}
        <br/>
        <input onBlur={handleBlur} type="text" name="email"  placeholder="Enter Email" required/>
        <br/> 
        <input onBlur={handleBlur} type="password" name="password" placeholder="Enter Password" required/>
        <br/> 
        <input type="submit" value="Submit"/>
      </form>
      <p style={{color: 'red'}}>{user.error}</p>
      {
        user.success && <p style={{color: 'green'}}>Successfully account {newUser ? 'created' : 'Logged In'}.</p>
      }
    </div>
  );
}

export default App;
