let app = require("express")();
const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
const Namad = require("./Namad");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

(async () => {
  mongoose.connect("mongodb+srv://user-erfanpoorsina:@Imerfanpoorsina85@cluster0.a7x8h.mongodb.net/liveWarner?retryWrites=true&w=majority", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const browser = await puppeteer.launch({
    headless: false,
    waitUntil: "domcontentloaded",
    args: ["--no-sandbox"],
  });

  let iterator = 0;
  const data = require("./data.json");
  const loop = setInterval(async () => {
    console.log(iterator);
    const page = await browser.newPage();

    try {

      if (iterator == data.length - 1) {
        iterator = 0;
      }

      await page.goto(
        `https://rahavard365.com/asset/${data[iterator].id}/${data[iterator].name}`
      );

      const result = await page.evaluate(async () => {
        const dealingPriceContainer = document.getElementById("asset-info");
        const dealingPrice = dealingPriceContainer.querySelector(".bold-price")
          .innerText;
        const dealingPricePercent = document.querySelector(
          "#asset-info .asset-close span"
        ).innerText;

        const lastPriceContainer = document.querySelectorAll(
          ".symbolprices tr td"
        );
        const lastPrice = lastPriceContainer[1].childNodes[1].innerText;
        const lastPricePercent = lastPriceContainer[1].childNodes[5].innerText;

        const infoContainer = document.querySelectorAll(".symbolprices tr td");
        const hajmMoamelat = infoContainer[11].innerText.replace('M', '');
        const arzeshMoamelat = infoContainer[13].innerText.replace('B', '');

        const desc = document.querySelector(".asset-desc").innerText;

        const bidaskTableContainer = document.querySelectorAll(
          ".data-box.info-box"
        )[3];
        let bidaskTable = "";
        if (bidaskTableContainer.querySelector(".bidasks"))
          bidaskTable = bidaskTableContainer.innerHTML;
        else bidaskTable = null;

        return {
          desc,
          dealingPrice,
          dealingPricePercent,
          lastPrice,
          lastPricePercent,
          hajmMoamelat,
          arzeshMoamelat,
          bidaskTable,
        };
      }).then(async (result) => {
        const namad = await Namad.findOne({ namadID: data[iterator].id });
        if (namad) {
          await namad.updateOne({
            namadID: data[iterator].id,
            name: data[iterator].name,
            data: result,
          });
        } else {
          const newNamad = new Namad({
            namadID: data[iterator].id,
            name: data[iterator].name,
            data: result,
          });
          await newNamad.save();
        }
  
        iterator++;

        await page.close();
      });

    } catch (e) {
      if (e instanceof puppeteer.errors.TimeoutError) {
        console.log(`Failed: ${data[iterator].id}`);
        await page.close();
      }
    }
  }, 7000);
})();

app.listen(process.env.PORT || 5000, () => {
  console.log('Server is running ...');
})