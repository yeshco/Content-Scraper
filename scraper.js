//All npm and node modules
const fs = require('fs');
const request = require('request');
const scrapeIt = require ('scrape-it')
const stringify = require('csv-stringify')
const CSV = require('csv-string');

//This function is used by the createFiles function to change the file that is going to be used dynamically
function returnPlace(homeDir, found) {
  if (homeDir === `./`) {
    return `./data`;
  } else {
    return `./data/${found}`
  }
}

//This function is going to create or delete files depending on the circumstance
function createFiles(homeDir, file, boolean, toDo) {
 fs.readdir(homeDir, (err, files) => {
   const found = files.find((element) => {
       return element.indexOf(file)+1;
   });
   if (Boolean(found) === boolean) {
     toDo(returnPlace(homeDir, found), () => {
       if (err) throw err;
     })
   } else if (boolean === false){
     //Calling the function to delete the .csv file each time
     createFiles(`./data`, `.csv`, true, fs.unlink);
   }
 })
};
//Calling the function to create the data directory
createFiles(`./`, `data`, false, fs.mkdir);


//Calling the main module to scrape the website
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
    //Creating the file were the information is going to be stored
    fs.appendFile(`./data/${dateOrTime(1)}.csv`, stringTitles , (err) => {
      if (err) throw err;
    });
    //Looking for each shirt on the website
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
          //Adding each shirt information to the .csv file
          fs.appendFile(`./data/${dateOrTime(1)}.csv`, stringData , (err) => {
            if (err) throw err;
          });
      });
    }
}).catch((error) => {
  //Creating error message
  console.log(errorMessageGenerator(error));
  //Creating error file //Extra Credit\\
  fs.appendFile('./data/scraper-error.log', createErrorLog(error, ), (err) => {
  if (err) throw err;
});
})

//This function is called to get the current date or time
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

//This function creates the error message
function errorMessageGenerator(error) {
  return `The site you're trying to get to is not working (error: ${error.code})`;

}

//This function creates the timestamp for the error file //Extra Credit\\
function createErrorLog(error) {
  var d = new Date();
  return `[${d.toString()}] <${error.code}>`
}
