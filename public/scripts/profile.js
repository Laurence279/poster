
const editableOptions = document.getElementsByClassName("editableProfileOption");
const editableOptionsArray = Array.prototype.slice.call(editableOptions);
const editableOptionsCharsRemaining = document.getElementsByClassName("editableProfileOptionCharsRem");
const editableOptionsArrayCharsRemaining = Array.prototype.slice.call(editableOptionsCharsRemaining);
const inputDesc = document.getElementById("descInput");
const colourDesc = document.getElementById("colourInput");
const fruitDesc = document.getElementById("fruitInput");

const maxDescriptionCharacters = 200;
const maxShortCharacters = 20;

const editButton = document.getElementById("editBtn");

var isEditing = false;

function placeCaretAtEnd(el) {
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

addProfileUpdateEvent(editableOptionsArray[0],editableOptionsArrayCharsRemaining[0],maxDescriptionCharacters);
addProfileUpdateEvent(editableOptionsArray[1],editableOptionsArrayCharsRemaining[1],maxShortCharacters);
addProfileUpdateEvent(editableOptionsArray[2],editableOptionsArrayCharsRemaining[2],maxShortCharacters);

function addProfileUpdateEvent(editableText, charsRemainingText, maxCharSize){
    editableText.addEventListener("input",function(e){
    let charsRemaining = maxCharSize - editableText.textContent.length;
    if(charsRemaining <= 0){
        charsRemaining = 0;
        editableText.textContent = editableText.textContent.substring(0,maxCharSize);
        placeCaretAtEnd( editableText );
    }
    charsRemainingText.textContent = updateCharsRemainingText(editableText,maxCharSize);
})}

function updateCharsRemainingText(element, maxSize){
    let charsRemaining = maxSize - element.textContent.length;
    return charsRemaining + " Characters Remaining.";
}





if(editButton != null)
{
    editButton.addEventListener("click", function (event) {
        if (!isEditing) {
            isEditing = true;
            editableOptionsArrayCharsRemaining.forEach(function(option){
                option.removeAttribute("hidden");
            })
            
            editableOptionsArrayCharsRemaining[0].textContent = updateCharsRemainingText(editableOptionsArray[0],maxDescriptionCharacters);
            editableOptionsArrayCharsRemaining[1].textContent = updateCharsRemainingText(editableOptionsArray[1],maxShortCharacters);
            editableOptionsArrayCharsRemaining[2].textContent = updateCharsRemainingText(editableOptionsArray[2],maxShortCharacters);


            editableOptionsArray.forEach(function (option) {
                option.classList.add("editField");
                option.setAttribute("contenteditable", "true");
                editButton.textContent = "Done";
                return;
            })
        } else {
                inputDesc.value =editableOptionsArray[0].textContent.substring(0,200);
                colourDesc.value = editableOptionsArray[1].textContent.substring(0,20);
                fruitDesc.value=editableOptionsArray[2].textContent.substring(0,20);
                editableOptionsArray.forEach(function (option) {
                option.classList.remove("editField");
                option.setAttribute("contenteditable", "false");
                editButton.setAttribute("type", "submit")
                editButton.textContent = "Edit Profile";
            })
            isEditing = false;
        }
    });
}


//