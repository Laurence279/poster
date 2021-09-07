// Arena Logic

const e = require("express");

var Arena = function(){};



// Current Time Clock

// const nextMatchTimer = document.getElementById("nextMatchTimer");
// const startBattleBtn = document.getElementById("startBattle");
// let date = new Date().toLocaleTimeString();

// function getDate()
// {
//     date = new Date().toLocaleTimeString();
//     return date;
// }

// function activateClock(){
//     setInterval(()=> nextMatchTimer.textContent = getDate(), 1000)
// }


//Countdown Timer

// const test = new Date(2021, 8, 2, 15);

// function countDown(dateOfNextMatch){

//     let currentDate = new Date();
//     const diff = Math.abs(currentDate - test);
//     if(currentDate > test)
//     {
//         nextMatchTimer.textContent = "In Progress";
//         return;
//     }


//     let sec = diff / 1000;
//     nextMatchTimer.textContent = new Date(0,0,0, 0, 0, sec+1).toLocaleTimeString();

//     {
//         timer = setInterval(function(){
//             if(currentDate > test)
//             {
//                 console.log("hi");
//                 nextMatchTimer.textContent = "In Progress";
//                 clearInterval(timer);
//                 return;
//             }
//             currentDate = new Date();
//             nextMatchTimer.textContent = new Date(0,0,0, 0, 0, sec).toLocaleTimeString();
//             sec--;

//         },1000);
//     }

// }

Arena.prototype.initArena = function(playerArr){
    let players = playerArr;
    //Take array of combatants as parameter
    // Push all combatants into array and ensure number is a power of 2.
    if (Math.log(players.length) / Math.log(2) % 1 === 0 && players.length > 1){
        console.log("Enough players to start");
    }
    else{
        while(Math.log(players.length) / Math.log(2) % 1 !== 0 || players.length <= 1)
        {
            players.push('Bot');
        }
    }
    // Generate matches for each combatant
        //Shuffle the array
        function shuffle(players){
            let currentIndex = players.length, randomIndex;

            while(currentIndex != 0)
            {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;

                [players[currentIndex], players[randomIndex]] = [
                    players[randomIndex], players[currentIndex]];
            }
            return players;
        }
        players = shuffle(players);
        const matches = [];

        //Pair up every 2 elements in array
        for(let i = 0; i < players.length; i+=2)
        {
            if(players.length<=2){
                matches.push( {round: "Final", combatantA: players[i], combatantB: players[i+1], winner: "None"} );
            }
            else{
                matches.push( {round: i/2+1, combatantA: players[i], combatantB: players[i+1], winner: "None"} );
            }

        }
        //Add empty rounds totalling the number of players /2 - 1
        const extraRounds = matches.length + (players.length/2 - 1); //Calculate round number to start from
        for(let i = matches.length+1; i <= extraRounds; i++){
            if(i == extraRounds)
            {
                i = "Final";
            }
            matches.push( {round: i, combatantA: "TBA", combatantB: "TBA"} );
        }
        //Output an array of objects(rounds)
        return matches;

}

initBattle = function(matchObj){
    // Take match object as parameter containing combatants
    let combatantA = matchObj.combatantA;
    let combatantB = matchObj.combatantB;
    let winner;
    // Generate random winner
    let roll = Math.floor(Math.random()*100)
    // Output winner
    roll > 50 ? console.log(combatantA + " Defeated "+ combatantB) : console.log(combatantB + " Defeated "+ combatantA);

    roll > 50 ? winner = combatantA : winner = combatantB;
    matchObj.winner = winner;
    return winner;
}

editArena = function(winner, matchArray){
    console.log(winner + " has passed to the next round.");
    //Take winner from a match and matches array as parameters
    //Search array for "TBA" and insert winner
    let found = false;
    for(let i = 0; i < matchArray.length; i++){
        if(matchArray[i].combatantA === "TBA")
        {
            matchArray[i].combatantA = winner;
            found = true;
            return matchArray[i];
        }
        else if (matchArray[i].combatantB === "TBA")
        {
            matchArray[i].combatantB = winner;
            found = true;
            return matchArray[i];
        }

        else if (i === matchArray.length-1)
        {
            found = true;
            console.log("Winner is " + winner);
            matchArray.push({'round': "Result", 'combatantA': winner, 'combatantB': "none"});
            return;
        }
    }
    if(!found)
    {
        console.log("ERROR: A winner was declared but did not pass through to the next round.")
    }

}

Arena.prototype.simulateBattles = function(matchList){
    
    // setTimeout(() => {
    //     matchList.forEach(function(match, i){
    //         setTimeout(() => {
    //             editArena(initBattle(match),matchList);
    //         }, i * 2000);
    //     })
    // }, 5000);
      
        matchList.forEach(function(match, i){
                editArena(initBattle(match),matchList);
        }
        )}

module.exports = Arena;

//We only need to worry about using simulateBattles() and initArena(). Pass the list of players to initArena()
//in order to retrieve an object containing a list of matches. Then call arena() passing this match
//list which will generate the entire tournament and output a winner.

//Example:
//      let arenaSim = new Arena();
//      let players = arenaSim.initArena(['1','2','3']);
//      arenaSim.simulateBattles(players);