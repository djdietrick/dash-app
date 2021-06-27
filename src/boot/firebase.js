import * as firebaseService from '../services/firebase.js';

export default async () => {
    // const config = process.env.environments.FIREBASE_CONFIG
    const config = {
        apiKey: process.env.API_KEY,
        authDomain: "dash-website-1b9cb.firebaseapp.com",
        databaseURL: "https://dash-website-1b9cb.firebaseio.com",
        projectId: "dash-website-1b9cb",
        storageBucket: "dash-website-1b9cb.appspot.com",
        messagingSenderId: process.env.MESSAGING_SENDER_ID,
        appId: process.env.APP_ID
    }
    firebaseService.init(config);
}