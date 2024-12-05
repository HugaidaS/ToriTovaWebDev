import {
	collection,
	getDocs,
	getFirestore
} from 'firebase/firestore/lite/dist/firestore/lite/index.js';

export const queryForDocuments = async () => {
	const db = getFirestore();
	const querySnapshot = await getDocs(collection(db, 'projects'));
	querySnapshot.forEach((doc) => {
		console.log(`${doc.id} => ${doc.data()}`);
	});

	//return array of documents
	return querySnapshot.docs.map((doc) => doc.data());
};
