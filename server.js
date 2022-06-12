const tf = require('@tensorflow/tfjs');
const tfn = require('@tensorflow/tfjs-node');
require('dotenv').config();

//run express server
const express = require('express');
const app = express();
const PORT= process.env.PORT || 8080;
  const HOST= process.env.HOST || 'localhost';
const fs = require('fs');
const multer = require('multer');
const upload = multer();
const { Readable } = require('stream');
app.use(express.json());
app.use(upload.any());

app.get('/', async (req, res) => {
  const handler = tfn.io.fileSystem('./model.json');
  var loadedImage = fs.readFileSync('./Anemia/img_1_152.jpg');

  const model = await tf.loadLayersModel(handler);
  const tensor = await tfn.node.decodeImage(loadedImage);

  const resized = tf.image.resizeBilinear(tensor, [150, 150]);

  const result = await model.predict(resized.reshape([1, 150, 150, 3]));
  const index = result.as1D().argMax().dataSync();
  console.log(index);
  const result_str = index == 1 ? 'Anemia' : 'Non Anemia';
  res.json({ result_str });
});

app.post('/predict', async (req, res) => {
  const handler = tfn.io.fileSystem('./model.json');

  const buffer = Buffer.from(req.files[0].buffer);

  const model = await tf.loadLayersModel(handler);
  const tensor = tfn.node.decodeImage(buffer);

  const resized = tf.image.resizeBilinear(tensor, [150, 150]);

  const result = model.predict(resized.reshape([1, 150, 150, 3]));
  const index = result.as1D().argMax().dataSync();
  console.log(index);
  const result_str = index == 1 ? 'Anemia' : 'Non Anemia';
  res.json({ result_str });
});
app.listen(PORT, HOST,() => console.log(`Example app listening on port ${PORT}!`));