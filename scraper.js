const fs = require('fs');
const request = require('request');
const scrapeIt = require ('scrape-it')
const stringify = require('csv-stringify')
const CSV = require('csv-string');

function returnPlace(homeDir, found) {
  if (homeDir === `./`) {
    return `./data`;
  } else {
    return `./data/${found}`
  }
}

function createFiles(homeDir, file, boolean, toDo) {
 fs.readdir(homeDir, (err, files) => {
   const found = files.find((element) => {
       return element.indexOf(file)+1;
   });
   if (Boolean(found) === boolean) {
     toDo(returnPlace(homeDir, found), () => {
       if (err) throw err;
     })
   } else {
     createFiles(`./data`, `.csv`, true, fs.unlink);
   }
 })
};
createFiles(`./`, `data`, false, fs.mkdir);



scrapeIt("http://shirts4mike.com/shirts.php", {
  urls: {
    listItem: ".products li",
    data: {
      li: {
        selector:"a",
        attr: "href"
      }
    }
  }
}).then(({ data, response }) => {
    let shirts = data.urls.length;
    let stringTitles = 'Title, Price, ImageURL, URL, Time\n'
    fs.appendFile(`./data/${dateOrTime(1)}.csv`, stringTitles , (err) => {
      if (err) throw err;
    });
    for (let i=0; i<shirts; i++) {
      let currentUrl = `http://shirts4mike.com/${data.urls[i].li}`
      scrapeIt(currentUrl, {
        title: "title",
        price: ".shirt-details h1 .price",
        imageUrl: {
          selector: ".shirt-picture span img",
          attr: "src"
        }
      }).then(({ data, response }) => {
          data.Url = currentUrl;
          data.time = dateOrTime(0);
          let stringData = CSV.stringify(data);
          fs.appendFile(`./data/${dateOrTime(1)}.csv`, stringData , (err) => {
            if (err) throw err;
          });
      });
    }
}).catch((error) => {
  console.log(errorMessageGenerator(error));
  fs.appendFile('./data/scraper-error.log', createErrorLog(error, ), (err) => {
  if (err) throw err;
});
})


function dateOrTime(theSwitch) {
  var d = new Date();
  let theDate = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`
  let theTime = `${d.getHours()}:${d.getMinutes()+1}`
  if (theSwitch) {
    return theDate
  } else {
    return theTime;
  }
}


function errorMessageGenerator(error) {
  return `The site you're trying to get to is not working (error: ${error.code})`;

}

function createErrorLog(error) {
  var d = new Date();
  return `[${d.toString()}] <${error.code}>`
}
