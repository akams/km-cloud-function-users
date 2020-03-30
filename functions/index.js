const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');

admin.initializeApp(functions.config().firebase);

const db = admin.firestore(); // cloudFireStore Db
const app = express(); // Handle intern API
const main = express(); // Expose API

main.use('/api/v1', app);
main.use(bodyParser.json());

exports.kmUsersFunctions = functions.https.onRequest(main);

// Warmup server
app.get('/warmup', (request, response) => {
	response.send('Warming up friend {kmUsersFunctions} .');
});

// post data
app.post('/fights', async (request, response) => {
	try {
		const { winner, loser, title } = request.body;
		const data = {
			winner,
			loser,
			title
		};
		const fightRef = await db.collection('fights').add(data);
		const fight = await fightRef.get();
		response.json({
			msg: "okay 2",
			id: fightRef.id,
			data: fight.data()
		});
	}
	catch (error) {
		response.status(500).send({err: error.message});
	}
});

// get all data
app.get('/fights', async (request, response) => {
  try {
    const fightQuerySnapshot = await db.collection('fights').get();
    const fights = [];
    fightQuerySnapshot.forEach((doc) => {
			fights.push({
				id: doc.id,
				data: doc.data()
			});
		});
    response.json(fights);
	}
	catch(error) {
    response.status(500).send({err: error.message});
  }
});

// get single data
app.get('/fights/:id', async (request, response) => {
  try {
    const fightId = request.params.id;
    if (!fightId) {
			throw new Error('Fight ID is required');
		}
    const fight = await db.collection('fights').doc(fightId).get();
    if (!fight.exists){
			throw new Error('Fight doesnt exist.')
    }
    response.json({
			id: fight.id,
      data: fight.data()
    });
  } catch(error) {
    response.status(500).send({err: error.message});
  }
});

app.put('/fights/:id', async (request, response) => {
  try {
    const fightId = request.params.id;
		const title = request.body.title;

    if (!fightId) throw new Error('id is blank');
    if (!title) throw new Error('Title is required');

    const data = { 
			title
    };
    const fightRef = await db.collection('fights')
        .doc(fightId)
        .set(data, { merge: true });

    response.json({
			id: fightId,
			data
    });
  } catch(error){
    response.status(500).send({err: error.message});
  }
});

// delete single element
app.delete('/fights/:id', async (request, response) => {
  try {
    const fightId = request.params.id;
    if (!fightId) throw new Error('id is blank');

    await db.collection('fights')
        .doc(fightId)
        .delete();

    response.json({
			id: fightId,
    })
  } catch(error){
    response.status(500).send({err: error.message});
  }
});

