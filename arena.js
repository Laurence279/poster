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

function roll(sides){
    return Math.floor(Math.random()*sides + 1);
}

function generateDamage(modifier){
    let dmg = roll(6) + modifier;
    if (dmg <= 0) dmg = 1;
    console.log("Did " + dmg + " points of damage");
    return dmg;
}

function generateAction(preBattleActions, bodyParts, attackActions, currentPlayer, otherPlayer){

    const actionObj = {
        name: currentPlayer.name,
        otherName: otherPlayer.name
    };

    const attackRoll = roll(100);
    if(attackRoll > 20){
        actionObj.action = "attack";
    }
    else{
        actionObj.action = preBattleActions[roll(preBattleActions.length)-1];
    }


    if(actionObj.action === "attack"){
        actionObj.target = bodyParts[roll(bodyParts.length)-1]
        if(attackRoll > 50){
            actionObj.attackAction = "hit";
        }
        else{
            actionObj.attackAction = attackActions[roll(attackActions.length)-1];
        }

        //Damage modifiers
        if(actionObj.target === "head"){
            actionObj.modifier = roll(6);
        }
        else{
            actionObj.modifier = 1;
        }


    }


    
    return actionObj;
}

function generateTurnLog(obj){

    if(obj.death)
    {
        console.log(`Returning ${obj.otherName} collapsed to the floor.`)
        return `${obj.otherName} collapsed to the floor.`;
    }

    let str;

        switch(obj.action){
            case "attack":
                if(obj.attackAction === "hit"){
                    str = `${obj.name} hit ${obj.otherName} in the ${obj.target} for ${obj.dmg} damage.`
                }
                else if(obj.attackAction === "missed"){
                    str =  `${obj.name} attacked ${obj.otherName} in the ${obj.target} but missed.`;
                }
                else if(obj.attackAction === "blocked"){
                    str =  `${obj.name} attacked ${obj.otherName} in the ${obj.target} but it was blocked.`;
                }
                break;
            case "stumbled":
                str =  `${obj.name} lost their footing and clumsily stumbled.`
                break;
            case "focused":
                str =  `${obj.name} took a moment to focus and reposition.`
                break;
        }




        console.log(`Returning ${str}`);
    return str;
}


initBattle = function(matchObj){
    // Take match object as parameter containing combatants
    let combatantA = matchObj.combatantA;
    let combatantB = matchObj.combatantB;
    let winner;
    // Output winner


    matchObj.log = [];


    const preBattleActions = ["attack", "stumbled", "focused"];
    const bodyParts = ["head", "neck", "chest", "arm", "leg", "stomach", "groin", "foot"];
    const attackActions = ["hit", "missed", "blocked"];


    let i = 0;

    let playerA = {name: combatantA, luck: roll(6), hp: 10};
    let playerB = {name: combatantB, luck: roll(6), hp: 10};
    playerA.hp += playerA.luck;
    playerB.hp += playerB.luck;
    let currentPlayer = playerA;
    let otherPlayer = playerB;
    let lastPlayer;
    console.log("Starting new Round");
    while (playerA.hp >=1 || playerB.hp >= 1){
        console.log("current turn is " + currentPlayer.name);
        console.log(currentPlayer.name + " HP is " + currentPlayer.hp);
        const action = generateAction(preBattleActions, bodyParts, attackActions, currentPlayer, otherPlayer);
        console.log(currentPlayer.name + " action before checking if a hit was made.");
        console.log(action);
        if(action.attackAction === "hit"){
            const dmg = generateDamage(action.modifier + currentPlayer.luck - otherPlayer.luck);
            action.dmg = dmg;
            otherPlayer.hp = otherPlayer.hp - dmg;
            console.log("damage is " + dmg);
            console.log(otherPlayer.name + " HP is now " + otherPlayer.hp);


            if(otherPlayer.hp <= 0){
                otherPlayer.hp = 0;
                matchObj.log.push(generateTurnLog(action));
                action.death = true;
                console.log("otherplayer is dead due to -" + dmg);
                matchObj.log.push(generateTurnLog(action));
                winner = currentPlayer.name;
                break;
            }

        }

        console.log(currentPlayer.name + " action after checking if a hit was made.");
        console.log(action);
        matchObj.log.push(generateTurnLog(action));

        //Next turn
        lastPlayer = currentPlayer;
        currentPlayer = otherPlayer;
        otherPlayer = lastPlayer;
    }

    console.log("winner is " + winner);
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