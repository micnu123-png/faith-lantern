"use strict";

console.log("✅ newsletter.js loaded successfully");

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
  apiKey: "AIzaSyCWQC1u9HyyrQhNVt3t3Ep1rhtzYmobMQ",
  authDomain: "catholic-discovery-websi-af85b.firebaseapp.com",
  projectId: "catholic-discovery-websi-af85b",
  storageBucket: "catholic-discovery-websi-af85b.firebasestorage.app",
  messagingSenderId: "981649696506",
  appId: "1:981649696506:web:06ecfceeee7fb90bb50b43"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("✅ Firebase initialized");


const form = document.getElementById("newsletterForm");

const nameInput =
  document.getElementById("subscriberName");

const emailInput =
  document.getElementById("subscriberEmail");

const button =
  document.getElementById("subscribeBtn");

const status =
  document.getElementById("subscribeStatus");


if (!form) {
  console.error("❌ newsletterForm not found");
} else {

  form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();


    status.textContent = "";
    status.className = "subscribe-status";


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


    button.disabled = true;
    button.textContent = "Subscribing...";


    try {

      const doc = await addDoc(
        collection(db, "subscribers"),
        {
          name: name,
          email: email,
          subscribedAt: serverTimestamp()
        }
      );


      console.log(
        "✅ Subscriber saved:",
        doc.id
      );


      status.textContent =
        "✓ Thank you! You have successfully subscribed.";

      status.classList.add("success");


      nameInput.value = "";
      emailInput.value = "";


    } catch (error) {

      console.error(
        "❌ Subscription failed:",
        error
      );


      status.textContent =
        "Sorry, we couldn't subscribe you right now. Please try again.";

      status.classList.add("error");


    } finally {

      button.disabled = false;
      button.textContent = "Subscribe";

    }

  });

}