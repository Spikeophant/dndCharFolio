var classEl = document.querySelector("#charClass");
var raceEl = document.querySelector("#charRace");
var abilityEls = $(".abilityInput")
var abilityModEls = $(".abilityMod")
var skillModEls = $(".skillMod");
var skillCheckboxEls = document.querySelectorAll(".isProf"); //$(".isProf");
var imgApiUrl = "https://imsea.herokuapp.com/api/1?q=";
var dndApiUrl = "https://www.dnd5eapi.co/api/";

var maxProficiencies;
var currentProfCount = 0;
var profRestrictions = [];

classEl.addEventListener('change', (event) => {
    console.log("Class has been changed to: " + classEl.value);

    fetch(dndApiUrl + "/classes/" + classEl.value)
        .then(function(res) {
            if (res.ok) {
                res.json().then(function(data) {
                    console.log(data)
                    // update skill proficiency selection
                    updateSkillProficiencySelection(data.proficiency_choices[0]);
                })
            }
            else {
                console.log("Failed with a status code of " + res.statusText)
            }
        })
        .catch(function (error) {
            console.log("Could not connect to API")
        })

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
            // This is kind of stupid, but by looping through the skill proficiencies that API gives and comparing it to the entries we have on the HTML, the index of the correct checkbox to enable can be found. It's inefficient. I know. -JL
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
        let ability = $(this).attr('class').split(' ')[0];
        console.log($(this).index())
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

/*
    Handles ability score input changing. Should affect HP, Armor Class, and Skill modifiers.
*/
abilityEls.on('input', function() {
    let scoreChanged;
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
})

// add event listener for race selection

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems);
});