var classEl = document.querySelector("#charClass");
var raceEl = document.querySelector("#charRace");
var abilityEls = $(".abilityInput");
var abilityModEls = $(".abilityMod");
var abilitySaveEls = $(".saveThrow");
var skillModEls = $(".skillMod");
var skillCheckboxEls = document.querySelectorAll(".isProf"); //$(".isProf");
var acEl = document.querySelector("#charArmor");
var hpEl = document.querySelector("#charHp");
var subraceMenuEl = $("#charSubrace");
var saveBtn = $("#saveCar");
var loadBtn = $("#loadChar");
var subraceMenuBackup = subraceMenuEl.clone()
var curHitDie;
var imgApiUrl = "https://imsea.herokuapp.com/api/1?q=";
var dndApiUrl = "https://www.dnd5eapi.co/api/";

var maxProficiencies;
var currentProfCount = 0;
var profRestrictions = [];

function populateCharList() {
    //get all the keys of the objects in local storage.
    keys = Object.keys(localStorage);
    for (var i =0; i < keys.length; i++) {
        //get a specific char name from local storage.
        var charName = JSON.parse(localStorage.getItem(keys[i])).charName;
        //build the button
        var newRow = document.createElement("div");
        newRow.classList.add("row");
        var newBtn = document.createElement("a");
        newBtn.innerText = "Load"
        newBtn.classList.add("btn-large", "btn-floating", "waves-effect", "waves-light", "red");
        newBtn.id = keys[i];
        var newI = document.createElement("i");
        newI.innerText = charName;
        //place the button
        $("#saveRow").append(newRow).append(newBtn).append(newI);
        //hook the button.
        newBtn.addEventListener("click", function (event) {
            loadChar(event.target.id);
        })
    }
}
populateCharList();


function saveChar() {
    //initialize empty character array
    currentChar = {};
    //get all inputs on page.
    var allInputEls = $(":input");
    // loop through them and persist them into local storage based on character name
    // as well as storing data based on input type.
   for (var x = 0; x < allInputEls.length; x++) {
       if (allInputEls[x].id !== "") {
           if ($("#"+allInputEls[x].id)[0].type == "checkbox") {
               currentChar[allInputEls[x].id] = $("#" + allInputEls[x].id).prop("checked");
           } else {
               console.log(allInputEls[x].id);
               console.log(allInputEls[x].value);
               currentChar[allInputEls[x].id] = allInputEls[x].value;
           }
       } else {
           //this is a lame hack I'm sorry.
           currentChar["charSubrace"] = allInputEls[x].value;
       }
   }
   //add the button.
   populateCharList();
   return currentChar;
}

function loadChar(characterName) {
    //load character into object
    char = JSON.parse(localStorage.getItem(characterName));
    for (var key in char) {
       console.log("Restoring Char" + char.charName)
        console.log(char[key])
        //make sure key is populated so we can use it.
        if (key !== "") {
            //if it's a checkbox, check it.
            if ($("#"+key)[0].type === "checkbox") {
                if (char[key] === true) {
                    $("#"+key).prop("checked", char[key]);
                }
                //if it's a select, select it and rerender the select options.
            } else if ($("#"+key)[0].type === "select-one") {
                $("#"+key).val(char[key]);
                var elems = document.querySelectorAll("select");
                var instances = M.FormSelect.init(elems);

            } else { //else it's a normal text input or a number, just set the val.
                $("#"+key).val(char[key]);
            }
        }

    }
}

saveBtn.on("click", function() {
    curChar = saveChar()
    //remove the spaces from the name for the key so we can use it as the id of the button later.
    localStorage.setItem(curChar.charName.replace(/\s+/g, ''), JSON.stringify(curChar));
})

loadBtn.on("click", function() {
    loadChar();
})

function languageSelectionPopulation(race) {
    console.log("Fetching allowed language proficiencies based on race " + race);
    fetch(dndApiUrl+"/races/"+ race).then(function(res) {
        if (res.ok) {
            res.json().then(function(data) {
                for (var lang in data.languages) {
                    var langCheck = $("#lang" + data.languages[lang].index);
                    langCheck.prop("checked", true);
                }

                //piggybacking off of this function for sub-race lookup
                updateSubraceMenu(data.subraces);
            })
        }
        else {
            console.log("Failed with a status code of " + res.statusText);
        }
    })
        .catch(function (error) {
            console.log("Could not connect to API");
        });
}

function languageUnselect() {
    $("#langSelect").find("input").each(function() {
        $(this).prop("checked", false)

    })

}

subraceMenuEl.on("contentChanged", function() {
    console.log("A new subrace was added! OR changed.");
    $(this).formSelect();
})

function updateSubraceMenu(subraces) {
    // clear any other subraces and reset the subrace selection

    if (subraceMenuEl.children().length > 1) {
        for (var i = 1; i < subraceMenuEl.children.length; i++) {
            subraceMenuEl.children()[i].remove();

            subraceMenuEl.trigger("contentChanged");
        }
    }

    // add the subraces
    for (var i = 0; i < subraces.length; i++) {
        var newEntry = $("<option>").attr("value", subraces[i].index).text(subraces[i].name);
        subraceMenuEl.append(newEntry);

        subraceMenuEl.trigger("contentChanged");
    }
}


function setSavingThrows(charclass) {
    for (var x = 0; x < abilityModEls.length; x++) {
        //set the save equal to the adjustment.
        abilitySaveEls.eq(x).val(abilityModEls.eq(x).val());
    }
    console.log("Fetching saving throw bonuses for class " + charclass);
    //fetch the classe saving throws
    fetch(dndApiUrl+"/classes/"+charclass).then(function(res) {
        if (res.ok) {
            res.json().then(function(data) {
                for (x in data.saving_throws) {
                    //set the saving throws for this class to +2 their current value.
                    $("#save" + data.saving_throws[x].index).val(Number($("#save" + data.saving_throws[x].index).val()) + 2);
                }
            })
        }
    })
}



raceEl.addEventListener("change", (event) => {
    languageUnselect();
    console.log("Race has been changed to: " + raceEl.value)
    languageSelectionPopulation(raceEl.value)
})


classEl.addEventListener("change", (event) => {
    console.log("Class has been changed to: " + classEl.value);

    fetch(dndApiUrl + "/classes/" + classEl.value)
        .then(function(res) {
            if (res.ok) {
                res.json().then(function(data) {
                    console.log(data)
                    // update skill proficiency selection
                    updateSkillProficiencySelection(data.proficiency_choices[0]);
                    curHitDie = data.hit_die;

                    // update HP
                    updateArmorAndHP();
                })
            }
            else {
                console.log("Failed with a status code of " + res.statusText)
            }
        })
        .catch(function (error) {
            console.log("Could not connect to API")
        })
    //call saving throws last so all other calcs are complete for adjustments.
    setSavingThrows(classEl.value)
    /*
        when class is selected, update:
            *saving throw proficiencies
            *skill proficiencies that can be selected, call api to enable which to select
    */
});

var updateSkillProficiencySelection = function(skills) {
    maxProficiencies = skills.choose;
    profRestrictions = [];


    for (var i = 0; i < skills.from.options.length; i++) {
        profRestrictions.push(skills.from.options[i].item.index)
    }
    
    currentProfCount = 0;

    // before changing selection, uncheck and disable all checkboxes
    for (var i = 0; i < skillCheckboxEls.length; i++) {
        skillCheckboxEls[i].checked = false;
        skillCheckboxEls[i].disabled = true;
    }

    for (var i = 0; i < skills.from.options.length; i++) {
        for (var j = 0; j < skillModEls.length; j++) {
            // This is kind of stupid, but by looping through the skill proficiencies that API gives and comparing it to the entries we have on the HTML, the index of the correct checkbox to enable can be found. It"s inefficient. I know. -JL
            if (skillModEls[j].id === skills.from.options[i].item.index) {
                skillCheckboxEls[j].disabled = false;
                break;
            }
        }
    }
}

var updateSkillMods = function(index) {
    // if an index is specified, update the specific skill, meant for proficiency
    if (index !== undefined) {
        if (skillCheckboxEls[index].checked) {
            skillModEls.eq(index).val( parseInt(skillModEls.eq(index).val()) + 2 );
        }
        else {
            skillModEls.eq(index).val( parseInt(skillModEls.eq(index).val()) - 2 );
        }
        return;
    }

    // otherwise, go through this switch statement
    skillModEls.each(function () {
        let ability = $(this).attr("class").split(" ")[0];
        //console.log($(this).index())
        switch (ability) {
            case "str":
                $(this).val(abilityModEls.eq(0).val());
                break;
            case "dex":
                $(this).val(abilityModEls.eq(1).val());
                break;
            case "int":
                $(this).val(abilityModEls.eq(2).val());
                break;
            case "wis":
                $(this).val(abilityModEls.eq(3).val());
                break;
            case "con":
                $(this).val(abilityModEls.eq(4).val());
                break;
            case "cha":
                $(this).val(abilityModEls.eq(5).val());
                break;
            default:
                console.log("Still working on it!")
        }

    })
    //update saving throws when the skills are modified.
    setSavingThrows(classEl.value)
}

// Adding an event listener for objects of the same class. What is this nonsense
for (var x = 0; x < skillCheckboxEls.length; x++) {
    skillCheckboxEls[x].addEventListener("change", function(e) {
        if (this.checked) {
            currentProfCount++;
        }
        else {
            // When unchecking a checkbox, re-enable all valid checkboxes
            if (currentProfCount === maxProficiencies) {
                for (var i = 0; i < skillModEls.length; i++) {
                    console.log(profRestrictions)
                    console.log(skillModEls[i].id)
                    if (profRestrictions.includes(skillModEls[i].id)) {
                        skillCheckboxEls[i].disabled = false;
                    }
                }
            }
            currentProfCount--;
        }

        //update skill modifiers
        updateSkillMods(parseInt(e.target.classList[0], 10));

        // once max proficiencies have been chosen, disable all other checkboxes
        if (currentProfCount === maxProficiencies) {
            for (var i = 0; i < skillCheckboxEls.length; i++) {
                if (!skillCheckboxEls[i].checked) {
                    skillCheckboxEls[i].disabled = true;
                }
            }
        }
    });

    // Potential issues: This may not play well when selecting a race that gives a skill proficiency.
}

var updateArmorAndHP = function() {
    // Armor Class
    if (abilityModEls.eq(1).val() !== "") {
        acEl.value = 10 + parseInt(abilityModEls.eq(1).val());
    }

    // HP
    hpEl.value = curHitDie // + parseInt(abilityModEls.eq(4).val());
    console.log(typeof abilityModEls.eq(4).val())
    if (abilityModEls.eq(4).val() !== "") {
        hpEl.value = curHitDie + parseInt(abilityModEls.eq(4).val());
    }
}

/*
    Handles ability score input changing. Should affect HP, Armor Class, and Skill modifiers.
*/
abilityEls.on("input", function() {
    let scoreChanged;
    console.log($(this).index())
    switch ($(this).index()) {
        case 0:
            scoreChanged = "Strength";
            break;
        case 1:
            scoreChanged = "Dex"
            break;
        case 2:
            scoreChanged = "Int"
            break;
        case 3:
            scoreChanged = "Wis";
            break;
        case 4:
            scoreChanged = "Con"
            break
        case 5:
            scoreChanged = "Cha"
            break;
    }

    console.log($(".abilityInput"))
    console.log("Something changed, specifically " + scoreChanged + " to " + $(this).val())

    // change ability modifer
    $(".abilityMod").eq(abilityEls.index(this)).val( Math.floor(($(this).val() - 10) / 2 ));

    // propagate ability mods through skill list
    updateSkillMods();

    updateArmorAndHP();
})

// add event listener for race selection

document.addEventListener("DOMContentLoaded", function() {
    var elems = document.querySelectorAll("select");
    var instances = M.FormSelect.init(elems);
});

var init = function() {
    updateSkillMods();

    updateArmorAndHP();

    for (var i = 0; i < abilityEls.length; i++) {
        abilityModEls.eq(i).val( Math.floor( (abilityEls.eq(i).val() - 10) / 2 ) );
    }
}