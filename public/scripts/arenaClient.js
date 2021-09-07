// Arena Logic

// Current Time Clock

const nextMatchTimer = document.getElementById("nextMatchTimer");
const startBattleBtn = document.getElementById("startBattle");
let date = new Date().toLocaleTimeString();

function getDate()
{
    date = new Date().toLocaleTimeString();
    return date;
}

function activateClock(){
    setInterval(()=> nextMatchTimer.textContent = getDate(), 1000)
}


//Countdown Timer



function countDown(dateOfNextMatch,serverTime){

    const arenaDate = new Date(dateOfNextMatch);
    let currentDate = new Date(serverTime);
    const diff = Math.abs(currentDate - arenaDate);
    if(currentDate > arenaDate)
    {
        nextMatchTimer.textContent = "This should not be displaying... oops";
        return;
    }


    let sec = diff / 1000;

    const regex = /(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)/;
    nextMatchTimer.textContent = new Date(0,0,0, 0, 0, sec+1).toISOString().match(regex)[0];


    {
        timer = setInterval(function(){
            if(currentDate > arenaDate)
            {
                console.log("hi");
                nextMatchTimer.textContent = "In Progress";
                clearInterval(timer);
                return;
            }
            currentDate = new Date(serverTime);
            nextMatchTimer.textContent = new Date(0,0,0, 0, 0, sec).toISOString().match(regex)[0];
            sec--;

        },1000);
    }

}

fetch("/arenaTime")
.then(function(response){
    return response.json();
})
.then(function(myJson){
    countDown(myJson.dateOfNextMatch,myJson.currentServerTime);
})
.catch(function(err){
    console.log(err);
})

// View Match Results

const matchResultsButtons = document.getElementsByClassName("viewResultBtn");
const matchResultsButtonsArr = Array.prototype.slice.call(matchResultsButtons);

const battleLogTitle = document.getElementById("battleLogTitle");
const battleLog = document.getElementById("battleLogText");

for(let i = 0; i < matchResultsButtonsArr.length; i++){

    matchResultsButtonsArr[i].addEventListener("click",function(e){
        let matchResult;
        if(i === matchResultsButtonsArr.length-1){
            matchResult = document.getElementById("arenaRoundFinal");
            battleLogTitle.innerHTML = `${matchResult.dataset.combatanta} Vs ${matchResult.dataset.combatantb}`;
            battleLog.textContent = `${matchResult.dataset.round}: ${matchResult.dataset.combatanta} fought ${matchResult.dataset.combatantb}. ${matchResult.dataset.winner} has won the tournament.`;
        }
        else{
            matchResult = document.getElementById("arenaRound"+[i+1]);
            battleLogTitle.textContent = `${matchResult.dataset.combatanta} Vs ${matchResult.dataset.combatantb}`;
            battleLog.textContent = `Round ${matchResult.dataset.round}: ${matchResult.dataset.combatanta} fought ${matchResult.dataset.combatantb} ${matchResult.dataset.winner} won.`;
        }

    })
}
