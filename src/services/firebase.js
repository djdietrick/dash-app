import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

export const auth = () => {
    return firebase.auth();
}

export const db = () => {
    return firebase.firestore();
}

export const functions = () => {
    return firebase.functions();
}

export const init = (config) => {
    return firebase.initializeApp(config)
}