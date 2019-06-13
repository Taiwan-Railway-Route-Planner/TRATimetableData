let items = document.body.getElementsByClassName("traincode_cen");

let allTrainCodes = [];

for (let o = 0; o < items.length; o++){
    for (let x = 0; x < items[o].children.length; x += 2){
        //console.log(items[o].children[x]);
        allTrainCodes.push({
            "traWebsiteCode": items[o].children[x + 1].innerHTML,
            "站名": items[o].children[x].innerHTML
        })
    }
}

console.log(allTrainCodes);