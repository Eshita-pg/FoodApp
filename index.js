const express = require("express");
const multer = require("multer");
const path = require("path");
const { createWorker } = require("tesseract.js");

const app = express();
const port = 3000;

// Set up multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//reference: https://mphprogramslist.com/50-jawdroppingly-toxic-food-additives-to-avoid/
const harmful_stuff = ['Sodium nitrate', 'Sulfite', 'Azodicarbonamide','Potassium bromate', 'Propyl gallate' ,'BHA','BHT',
'Propylene glycol','Butane','Monosodium glutamate', 'Disodium inosinate','Disodium guanylate','Refined vegetable oil','Sodium benzoate','Brominated vegetable oil',
'Chlorine dioxide','Paraben' ,'Sodium carboxymethyl cellulose','Saccharin','Aspartame','High fructose corn syrup','Acesulfame potassium','Sucralose',
'Artificial' ,'Sodium Nitrite','acesulfame potassium','Sodium Benzoate','Trans fat','NATURE IDENTICAL FLAVOUR','nature identical','color','sugar','refined flour','refined wheat flour'];

// Serve static files (including the HTML and JavaScript files)
app.use(express.static("public"));

// Handle file uploads and text detection
app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const imageBuffer = req.file.buffer;
  const worker = await createWorker();

  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  const {
    data: { text },
  } = await worker.recognize(imageBuffer);
  await worker.terminate();
  const ingredients = text.split(/\s+/).filter(word => word.length > 0).map(word => word.toLowerCase());
  console.log(ingredients);
  const percentage = calculatePercentage(ingredients, harmful_stuff);
  res.send("Level of Harm(out of 100): " + percentage);
});

function calculatePercentage(list1, list2) {
    const commonWords = list1.filter(word => list2.includes(word));
    const percentage = (commonWords.length / list1.length) * 100;
    return percentage.toFixed(2); // Display percentage with two decimal places
}


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
