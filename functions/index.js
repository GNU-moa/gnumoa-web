const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.listSubcollections = functions.https.onCall((data, context) => {
  const college = data.college;
  const department = data.department;
  const collections = [];
  return admin
    .firestore()
    .collection(college)
    .doc(department)
    .listCollections()
    .then((collectionsRef) => {
      collectionsRef.forEach((collection) => {
        collections.push(collection.id);
      });
      return { collections: collections };
    })
    .catch((error) => {
      console.log("Error getting subcollections:", error);
      throw new functions.https.HttpsError("internal", "Error getting subcollections");
    });
});
