//const url ='https://www.espncricinfo.com//series/ipl-2020-21-1210595/mumbai-indians-vs-chennai-super-kings-1st-match-1216492/full-scorecard'

const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const xlsx = require('xlsx')

//const { dirname } = require("path");

function processScoreCard(url) {
  request(url, cb);
}

function cb(err, response, html) {
  if (err) {
    console.log(err);
  } else {
    extractLink(html);
  }
}

function extractLink(html) {
  let $ = cheerio.load(html);
  let anchorElem = $(".header-info .description");
  let anchorElemRes = $(
    ".match-info.match-info-MATCH.match-info-MATCH-half-width .status-text"
  ).text();
  let arr = anchorElem.text().split(",");
  console.log(anchorElemRes);

  let venue = arr[1].trim();
  let date = arr[2].trim();

  console.log(venue);
  console.log(date);

  let innings = $(".card.content-block.match-scorecard-table>.Collapsible");

  let htmlString = "";

  for (let i = 0; i < innings.length; i++) {
    htmlString += $(innings[i]).html();
    let teamName = $(innings[i]).find("h5").text();

    teamName = teamName.split("INNINGS")[0].trim();

    let opponentIndex = i == 0 ? 1 : 0;
    let opponentName = $(innings[opponentIndex]).find("h5").text();
    opponentName = opponentName.split("INNINGS")[0].trim();

    console.log(teamName);
    console.log(opponentName);
    // console.log("---------------------------------")

    let cInning = $(innings[i]);
    let allRows = cInning.find(".table.batsman tbody tr");

    for (let j = 0; j < allRows.length; j++) {
      let allCols = $(allRows[j]).find("td");
      let isWorthy = $(allCols[0]).hasClass("batsman-cell");

      if (isWorthy) {
        let playerName = $(allCols[0]).text().trim();
        let runs = $(allCols[2]).text().trim();
        let balls = $(allCols[3]).text().trim();
        let fours = $(allCols[5]).text().trim();
        let sixes = $(allCols[6]).text().trim();
        let STR = $(allCols[7]).text().trim();

        //Template Literal
        console.log(
          `${playerName} | ${runs} | ${balls} | ${fours} | ${sixes} | ${STR}`
        );

        processPlayer(
          teamName,
          opponentName,
          playerName,
          balls,
          runs,
          sixes,
          fours,
          STR,
          venue,
          date,
          anchorElemRes
        );
      }
    }

    console.log("----------------------------------------------");
  }

  //console.log(htmlString)
}

function processPlayer(
  teamName,
  opponentName,
  playerName,
  balls,
  runs,
  sixes,
  fours,
  STR,
  venue,
  date,
  anchorElemRes
) {
  let teamPath = path.join(__dirname, "IPL", teamName);
  dirCreator(teamPath);

  let filePath = path.join(teamPath, playerName + ".xlsx");

  let content = excelReader(filePath, playerName);[]

  let playerObj = {
    teamName,
    opponentName,
    playerName,
    balls,
    runs,
    sixes,
    fours,
    STR,
    venue,
    date,
    anchorElemRes
  };
  content.push(playerObj)
  excelWriter(filePath , playerName , content)
}

function dirCreator(filePath) {
  if (fs.existsSync(filePath) == false) {
    fs.mkdirSync(filePath);
  }
}

function excelWriter(fileName, sheetName, jsonData) {
  let newWB = xlsx.utils.book_new(); //Creating a new Workbook
  let newWS = xlsx.utils.json_to_sheet(jsonData); //Adding json data inside the sheet(rows and column)
  xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
  xlsx.writeFile(newWB, fileName); //Writing inside the sheet
}

function excelReader(fileName, sheetName) {
  if (fs.existsSync(fileName) == false) {
    return [];
  }
  let wb = xlsx.readFile(fileName);
  let excelData = wb.Sheets[sheetName];
  let ans = xlsx.utils.sheet_to_json(excelData);
  return ans
  
}

module.exports = {
  ps: processScoreCard,
};
