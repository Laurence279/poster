

const textInput = document.getElementById("textInput");
const charsRem = document.getElementById("charsRem");


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

addProfileUpdateEvent(textInput,charsRem,200);

function addProfileUpdateEvent(editableText, charsRemainingText, maxCharSize){
    editableText.addEventListener("input",function(e){
    let charsRemaining = maxCharSize - editableText.value.length;
    if(charsRemaining <= 0){
        charsRemaining = 0;
        editableText.value = editableText.value.substring(0,maxCharSize);
        placeCaretAtEnd( editableText );
    }
    charsRemainingText.textContent = updateCharsRemainingText(editableText,maxCharSize);
})}

function updateCharsRemainingText(element, maxSize){
    let charsRemaining = maxSize - element.value.length;
    return charsRemaining + " Characters Remaining.";
}

textInput.addEventListener("blur",function(){
    charsRem.setAttribute("hidden",true);
})

textInput.addEventListener("click",function(){
    charsRem.removeAttribute("hidden");
})