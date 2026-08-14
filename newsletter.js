"use strict";

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyCWQC1tU9HyyrQhNVt3t3Ep1rhtzYmobMQ",
  authDomain: "catholic-discovery-websi-af85b.firebaseapp.com",
  projectId: "catholic-discovery-websi-af85b",
  storageBucket: "catholic-discovery-websi-af85b.firebasestorage.app",
  messagingSenderId: "981649696506",
  appId: "1:981649696506:web:06ecfceeee7fb90bb50b43"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


const nameInput = document.getElementById("subscriberName");
const emailInput = document.getElementById("subscriberEmail");
const subscribeBtn = document.getElementById("subscribeBtn");
const status = document.getElementById("subscribeStatus");


async function subscribe() {

  const name = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();


  // Reset status

  status.textContent = "";
  status.className = "subscribe-status";


  // Validate email

  if (!email) {

    status.textContent =
      "Please enter your email address.";

    status.classList.add("error");

    return;
  }


  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  if (!emailPattern.test(email)) {

    status.textContent =
      "Please enter a valid email address.";

    status.classList.add("error");

    return;
  }


  // Disable button

  subscribeBtn.disabled = true;
  subscribeBtn.textContent = "Subscribing...";


  try {

    await addDoc(
      collection(db, "subscribers"),
      {
        name: name,
        email: email,
        subscribedAt: serverTimestamp()
      }
    );


    // SUCCESS

    status.textContent =
      "✓ Thank you! You have successfully subscribed.";

    status.classList.add("success");


    // Clear inputs

    nameInput.value = "";
    emailInput.value = "";


  } catch (error) {

    console.error(
      "Newsletter subscription error:",
      error
    );


    status.textContent =
      "Sorry, we couldn't subscribe you right now. Please try again.";

    status.classList.add("error");

  } finally {

    subscribeBtn.disabled = false;
    subscribeBtn.textContent = "Subscribe";

  }

}


if (subscribeBtn) {

  subscribeBtn.addEventListener(
    "click",
    subscribe
  );

}
