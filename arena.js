var Arena = function () {};

// Setting up matches
Arena.prototype.initArena = function (playerArr) {
    let players = playerArr;
    //Take array of combatants as parameter

    // Push all combatants into array and ensure number is a power of 2.
    if (Math.log(players.length) / Math.log(2) % 1 === 0 && players.length > 1) {
        //Enough players to start
    } else {
        while (Math.log(players.length) / Math.log(2) % 1 !== 0 || players.length <= 1) {
            players.push('Bot');
        }
    }

    // Generate matches for each combatant

    //Shuffle the array
    function shuffle(players) {
        let currentIndex = players.length,
            randomIndex;

        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [players[currentIndex], players[randomIndex]] = [
                players[randomIndex], players[currentIndex]
            ];
        }
        return players;
    }
    players = shuffle(players);
    const matches = [];

    //Pair up every 2 elements in array
    for (let i = 0; i < players.length; i += 2) {
        if (players.length <= 2) {
            matches.push({
                round: "Final",
                combatantA: players[i],
                combatantB: players[i + 1],
                winner: "None"
            });
        } else {
            matches.push({
                round: i / 2 + 1,
                combatantA: players[i],
                combatantB: players[i + 1],
                winner: "None"
            });
        }

    }

    //Add empty (future) rounds totalling the number of players /2 - 1 
    //e.g 2 matches have been generated from 4 players, so we will need a third for the 2 remaining winners to go to.
    const extraRounds = matches.length + (players.length / 2 - 1);
    for (let i = matches.length + 1; i <= extraRounds; i++) { 
        if (i == extraRounds) {
            i = "Final";
        }
        matches.push({
            round: i,
            combatantA: "TBA",
            combatantB: "TBA"
        });
    }

    //Output an array of rounds/matches as objects
    return matches;

}

// To get the output:
Arena.prototype.simulateBattles = function (matchList) {

    matchList.forEach(function (match) {
        editArena(initBattle(match), matchList);
    })
}

// Simulating battles between combatants
function roll(sides) {
    return Math.floor(Math.random() * sides + 1);
}

function generateDamage(modifier) {
    let dmg = roll(6) + modifier;
    if (dmg <= 0) dmg = 1;
    return dmg;
}

function generateAction(preBattleActions, bodyParts, attackActions, currentPlayer, otherPlayer) {

    const actionObj = {
        name: currentPlayer.name,
        otherName: otherPlayer.name
    };

    const attackRoll = roll(100);
    if (attackRoll > 20) {
        actionObj.action = "attack";
    } else {
        actionObj.action = preBattleActions[roll(preBattleActions.length) - 1];
    }


    if (actionObj.action === "attack") {
        actionObj.target = bodyParts[roll(bodyParts.length) - 1]
        if (attackRoll > 50) {
            actionObj.attackAction = "hit";
        } else {
            actionObj.attackAction = attackActions[roll(attackActions.length) - 1];
        }

        //Damage modifiers
        if (actionObj.target === "head") {
            actionObj.modifier = roll(6);
        } else {
            actionObj.modifier = 1;
        }


    }



    return actionObj;
}

function generateTurnLog(obj) {

    if (obj.death) {
        return `${obj.otherName} collapsed to the floor.`;
    }

    let str;

    switch (obj.action) {
        case "attack":
            if (obj.attackAction === "hit") {
                str = `${obj.name} hit ${obj.otherName} in the ${obj.target} for ${obj.dmg} damage.`
            } else if (obj.attackAction === "missed") {
                str = `${obj.name} attacked ${obj.otherName} in the ${obj.target} but missed.`;
            } else if (obj.attackAction === "blocked") {
                str = `${obj.name} attacked ${obj.otherName} in the ${obj.target} but it was blocked.`;
            }
            break;
        case "stumbled":
            str = `${obj.name} lost their footing and clumsily stumbled.`
            break;
        case "focused":
            str = `${obj.name} took a moment to focus and reposition.`
            break;
    }

    return str;
}

// Simulate a single battle
initBattle = function (matchObj) {
    // Take match object as parameter containing combatants
    // Battles are turn based and work as follows:
    // 1: Each combatant is assigned 10 HP and a random luck factor affecting total HP and dmg taken/made.
    // 2: Each turn, the player will generate an action (attack, stumble, or focus), as well as a body part to target, and whether the attack hit, missed, or was blocked.
    // 3: Damage is generated and inflicted if hit was made. Death check made.
    // 4: The resulting action is generated into a string and pushed into the match/round object "log" property.
    // 5: Go to next player's turn.
    // 6: Output the winner.

    let combatantA = matchObj.combatantA;
    let combatantB = matchObj.combatantB;
    let winner;
    


    matchObj.log = [];


    const preBattleActions = ["attack", "stumbled", "focused"];
    const bodyParts = ["head", "neck", "chest", "arm", "leg", "stomach", "groin", "foot"];
    const attackActions = ["hit", "missed", "blocked"];

    // 1
    let playerA = {
        name: combatantA,
        luck: roll(6),
        hp: 10
    };
    let playerB = {
        name: combatantB,
        luck: roll(6),
        hp: 10
    };
    playerA.hp += playerA.luck;
    playerB.hp += playerB.luck;
    let currentPlayer = playerA;
    let otherPlayer = playerB;
    let lastPlayer;

    // 2
    while (playerA.hp >= 1 || playerB.hp >= 1) {
        const action = generateAction(preBattleActions, bodyParts, attackActions, currentPlayer, otherPlayer);


        // 3
        if (action.attackAction === "hit") {
            const dmg = generateDamage(action.modifier + currentPlayer.luck - otherPlayer.luck);
            action.dmg = dmg;
            otherPlayer.hp = otherPlayer.hp - dmg;


            if (otherPlayer.hp <= 0) {
                otherPlayer.hp = 0;
                matchObj.log.push(generateTurnLog(action));
                action.death = true;
                matchObj.log.push(generateTurnLog(action));
                winner = currentPlayer.name;
                break;
            }

        }

        // 4
        matchObj.log.push(generateTurnLog(action));

        // 5
        lastPlayer = currentPlayer;
        currentPlayer = otherPlayer;
        otherPlayer = lastPlayer;
    }

    // 6
    matchObj.winner = winner;
    return winner;
}


// Push results of battle to the match list
editArena = function (winner, matchArray) {
    //Take winner from a match and matches array as parameters
    //Search array for "TBA" and insert winner
    let found = false;
    for (let i = 0; i < matchArray.length; i++) {
        if (matchArray[i].combatantA === "TBA") {
            matchArray[i].combatantA = winner;
            found = true;
            return matchArray[i];
        } else if (matchArray[i].combatantB === "TBA") {
            matchArray[i].combatantB = winner;
            found = true;
            return matchArray[i];
        } else if (i === matchArray.length - 1) {
            found = true;
            matchArray.push({
                'round': "Result",
                'combatantA': winner,
                'combatantB': "none"
            });
            return;
        }
    }
    if (!found) {
        console.log("ERROR: A winner was declared but did not pass through to the next round.")
    }

}

module.exports = Arena;


// Usage:
// The first step is to generate a list of matches/rounds. Use initArena() and input an array of names/participants. Returns a list of matches.
// Then simply pass through the returned matches to simulateBattles(). The same match list can then be viewed with all the winners/battle logs etc.
//
// Example:
//      let arenaSim = new Arena();
//      let players = arenaSim.initArena(['1','2','3']);
//      arenaSim.simulateBattles(players);