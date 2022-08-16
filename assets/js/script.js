var classEl = document.querySelector("#charClass");
var raceEl = document.querySelector("#charRace");
var abilityEls = $(".abilityInput")
var abilityModEls = $(".abilityMod")
var imgApiUrl = "https://imsea.herokuapp.com/api/1?q=";
var dndApiUrl = "https://www.dnd5eapi.co/api/";

function languageSelectionPopulation(race) {
    console.log('Fetching allowed language proficiencies based on race ' + race);
    fetch(dndApiUrl+'/races/'+ race).then(function(res) {
        if (res.ok) {
            res.json().then(function(data) {
                for (var lang in data.languages) {
                    var langCheck = $('#lang' + data.languages[lang].index);
                    langCheck.prop('checked', true);
                }
            })
        }
        else {
            console.log('Failed with a status code of ' + res.statusText);
        }
    })
        .catch(function (error) {
            console.log('Could not connect to API');
        });
}

function languageUnselect() {
    $('#langSelect').find('input').each(function() {
        $(this).prop('checked', false)
    })
}


raceEl.addEventListener('change', (event) => {
    languageUnselect();
    console.log('Race has been changed to: ' + raceEl.value)
    languageSelectionPopulation(raceEl.value)
})

classEl.addEventListener('change', (event) => {
    console.log("Class has been changed to: " + classEl.value);

    fetch(dndApiUrl + "/classes/" + classEl.value)
        .then(function(res) {
            if (res.ok) {
                res.json().then(function(data) {
                    console.log(data)
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

// function onAbilityInput(event) {
//     var targetEl = $(event.target);
//     console.log(targetEl.index())
//     console.log(targetEl.attr("id") + " changed to " + targetEl.val())
//     console.log(targetEl.parent().parent().children().eq(1).eq(0))
//     console.log(targetEl.siblings(".abilityMod"))

//     // the most complicated traversal of elements
//     targetEl.parent().parent().children().eq(1).eq(0).val(targetEl.val())


// }

// $(".abilityInput").on('input', onAbilityInput);

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
})

// add event listener for race selection

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems);
});