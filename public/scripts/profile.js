
const editableOptions = document.getElementsByClassName("editableProfileOption");
const editableOptionsArray = Array.prototype.slice.call(editableOptions);
const inputDesc = document.getElementById("descInput");
const colourDesc = document.getElementById("colourInput");
const fruitDesc = document.getElementById("fruitInput");


const editButton = document.getElementById("editBtn");

var isEditing = false;

if(editButton != null)
{
    editButton.addEventListener("click", function (event) {
        if (!isEditing) {
            isEditing = true;
            editableOptionsArray.forEach(function (option) {
                option.classList.add("editField");
                option.setAttribute("contenteditable", "true");
                editButton.textContent = "Done";
                return;
            })
        } else {
                inputDesc.value =editableOptionsArray[0].textContent;
                colourDesc.value = editableOptionsArray[1].textContent;
                fruitDesc.value=editableOptionsArray[2].textContent;
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