document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('chosedb').addEventListener("click", dbConfirm);
});

//chose a db option, go to the db option page
function dbConfirm() {
    console.log("c'est passé")
    var db = document.getElementById("dbOption").value
    if (db === "postgresql") {
        window.location.href="structuredPostgres.html"
    } else if(db === "oracle"){
        window.location.href="structuredOracle.html"
    }
}
