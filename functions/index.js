const functions = require('firebase-functions');

exports.isDash = functions.https.onCall((data, context) => {
    return data.user && (data.user.userId === functions.config().dash.ash //Ash
        || data.user.userId === functions.config().dash.dave) // Dave
})