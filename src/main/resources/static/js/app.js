var modulo = (function(){
    var _author;
    var _bluePrints = [];
    var _currentBlueprint = {name: "", points: []}; // Objeto para almacenar el plano actual y sus puntos
    var _modulo = apimock;

    // Moveremos la inicialización del canvas y el contexto dentro de initCanvasAndEvents
    var canvas, ctx;

    var getBluePrintsByAuthor = function () {
        _bluePrints = [];
        $("#idTableBluePrints > tbody").empty();
        _author = document.getElementById("inputAuthor").value;
        setAuthorBluePrint(_author);
        return new Promise(function (resolve, reject) {
            _modulo.getBlueprintsByAuthor(_author, function (blueprintsArray) {
                if (blueprintsArray) {
                    _getNameAndSize(blueprintsArray);
                    resolve(blueprintsArray);
                } else {
                    reject("No se encontraron blueprints");
                }
            });
        });
    };

    var setAuthorBluePrint = function(nameBluePrint){
        $("#idNameBluePrintTitulo").text(nameBluePrint + "´s blueprints:");
    }

    var setBlueprints = function(author){
        _modulo.getBlueprintsByAuthor(author, _getNameAndSize);
    }

    var _getNameAndSize = function(blueprintsArray){
        _blueprints = blueprintsArray.map(blueprint => [blueprint.name, blueprint.points.length]);
        _setTable(_blueprints);
    }

    var _setTable = function(blueprintsArray){

        blueprintsArray.map(blueprint => $("table tbody").append("<tr><td>"+ (blueprintsArray.indexOf(blueprint)+1) +"</td><td>" + blueprint[0] + "</td><td>" + blueprint[1] + "</td><td><button type='button' class='btn btn-outline-success' id='"+blueprint[0] +"' type='button' onclick='modulo.getBluePrintToShow(this)'>Open</button></td></tr>"));
        var numArray = blueprintsArray.map(blueprint => blueprint[1]);
        $("#totalPoints").text(" Total user points: " + numArray.reduce((previousValue, currentValue) => previousValue + currentValue, 0));
    }

    var getBluePrintToShow = function(button){
        var idBlueprint = button.id;
        setnameBlueprint(idBlueprint);
        _modulo.getBlueprintsByNameAndAuthor(_author, idBlueprint, function(bp){
            _currentBlueprint = bp; // Almacenamos el blueprint actual
            _drawInCanvas(bp);
        });
    }

    var _drawInCanvas = function(blueprint){
        var canvas = document.getElementById('idCnavas');
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        if(blueprint.points.length > 0){
            ctx.moveTo(blueprint.points[0].x, blueprint.points[0].y);
            for(var i = 1; i < blueprint.points.length; i++){
                ctx.lineTo(blueprint.points[i].x, blueprint.points[i].y);
            }
        }
        ctx.strokeStyle = "black";
        ctx.stroke();
    }

    var setnameBlueprint = function(nameBluePrint){
        $("#idCurrentBluePrint").text("Current Blueprint: "+ nameBluePrint);
    }

    var initCanvasAndEvents = function () {
        canvas = document.getElementById('idCnavas');
        if (!canvas) {
            return;
        }
        ctx = canvas.getContext('2d');
        canvas.style.touchAction = 'none';
        canvas.addEventListener('pointerdown', handlePointerDown);
        // Añadimos el manejador para el botón de guardar
        $('#saveUpdateBtn').click(saveBlueprint);
        $('#createNewBlueprintBtn').click(createNewBlueprint);
        $('#deleteBlueprintBtn').click(deleteBlueprint);
    };

    var handlePointerDown = function (event) {
        if (_currentBlueprint.name !== "") {
            var rect = canvas.getBoundingClientRect();
            var x = event.clientX - rect.left;
            var y = event.clientY - rect.top;
            _currentBlueprint.points.push({ x: x, y: y });
            _drawInCanvas(_currentBlueprint);
        }
    };


    var updateBlueprintsAndPoints = function() {
        return new Promise(function(resolve, reject) {
            _modulo.getBlueprintsByAuthor(_author, function(blueprintsArray) {
                if(blueprintsArray) {
                    _bluePrints = blueprintsArray;
                    var totalPoints = _bluePrints.reduce((sum, bp) => sum + bp.points.length, 0);
                    $("#totalPoints").text("Total user points: " + totalPoints);
                    resolve(blueprintsArray);
                } else {
                    reject("Error al obtener blueprints");
                }
            });
        });
    };

    var saveBlueprint = function(){
        if(_currentBlueprint.name !== ""){
            $.ajax({
                url: "http://localhost:8080/blueprints/" + _author + "/" + _currentBlueprint.name,
                type: 'PUT',
                data: JSON.stringify(_currentBlueprint),
                contentType: "application/json"
            }).then(function(response){
                // Respuesta exitosa
                console.log("Blueprint actualizado con éxito.", response);
                return updateBlueprintsAndPoints();
            }).catch(function(error){
                // Error al actualizar
                console.error("Error al actualizar el blueprint", error);
            });
        } else {
            console.error("No se ha especificado el nombre del blueprint");
        }
    };


    var createNewBlueprint = function(){
        var blueprintName = prompt("Enter the name for the new blueprint:");
        if(blueprintName) {
            var newBlueprint = {
                author: _author,
                name: blueprintName,
                points: []
            };
            $.ajax({
                url: "/blueprints",
                type: "POST",
                data: JSON.stringify(newBlueprint),
                contentType: "application/json",
                success: function() {
                    alert("New blueprint created successfully.");
                    _currentBlueprint = newBlueprint;
                    _bluePrints.push(newBlueprint);
                    updateBlueprintsAndPoints();
                },
                error: function(xhr) {
                    alert("Failed to create blueprint. " + xhr.responseText);
                }
            });
        }
    };


    var deleteBlueprint = function(){
        if(_currentBlueprint.name) {
            $.ajax({
                url: "/blueprints/" + _currentBlueprint.author + "/" + _currentBlueprint.name,
                type: "DELETE",
                success: function() {
                    alert("Blueprint deleted successfully.");
                    _bluePrints = _bluePrints.filter(bp => bp.name !== _currentBlueprint.name);
                    _currentBlueprint = {name: "", points: []};
                    updateBlueprintsAndPoints();
                    clearCanvas();
                },
                error: function(xhr) {
                    alert("Failed to delete blueprint. " + xhr.responseText);
                }
            });
        } else {
            alert("No blueprint selected to delete.");
        }
    };

    var clearCanvas = function(){
        if(canvas && ctx){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            _currentBlueprint = {name: "", points: []}; // Restablecer el blueprint actual
        }
    };
    


    document.addEventListener('DOMContentLoaded', function(){
        initCanvasAndEvents();
    });

    return{
        saveBlueprint: saveBlueprint,
        updateBlueprintsAndPoints: updateBlueprintsAndPoints,
        deleteBlueprint: deleteBlueprint,
        clearCanvas: clearCanvas,
        getBluePrintsByAuthor: getBluePrintsByAuthor,
        getBluePrintToShow: getBluePrintToShow,
        initCanvasAndEvents: initCanvasAndEvents,
        createNewBlueprint: createNewBlueprint
    };
})();
