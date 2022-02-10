const url ='https://www.espncricinfo.com/series/ipl-2020-21-1210595'

const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

const allMatchObj = require("./allMatch")

//Creating a new directory IPL
let iplPath = path.join(__dirname , "IPL")
dirCreator(iplPath)
function dirCreator(filePath)
{
    if(fs.existsSync(filePath)==false)
    {
        fs.mkdirSync(filePath)
    }
}
//------------------------------------------------

request(url , cb)

function cb(err , response , html)
{
    if(err)
    {
        console.log(err)
    }

    else{
        extractLink(html)
    }
   
}

function extractLink(html)
{
    let $ = cheerio.load(html);
    let anchorElem = $('a[data-hover="View All Results"]')

    let link = anchorElem.attr('href')
    //console.log(link)

    let fullLink = 'https://www.espncricinfo.com/'+link
    //console.log(fullLink)

    allMatchObj.getAllMatch(fullLink)


}

