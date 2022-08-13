var classEl = document.querySelector("#charClass");
var raceEl = document.querySelector("#charRace");
var abilityEls = $(".abilityInput")
var abilityModEls = $(".abilityMod")

classEl.addEventListener('change', (event) => {
    console.log("Class has been changed to: " + classEl.value);

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

abilityEls.on('input', function() {
    console.log($(this))
    console.log($(this).index()) 
    console.log(abilityEls.index(this))
    // console.log($(this).parent())
    // console.log($(this).parent().children())
    let scoreChanged;
    switch (abilityEls.index(this)) {
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

    $(".abilityMod").eq(abilityEls.index(this)).val( Math.floor(($(this).val() - 10) / 2 ));
})

// add event listener for race selection

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems);
});