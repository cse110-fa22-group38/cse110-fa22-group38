const dataentryarray = [];

var dataentry = {
    UUID: "userID",
    DEID: "dataentryID",
    type: "event",
    name: "class 100a",
    relation: "class 100a",
    location: "9500 Gilman Drive",
    details: "description",
    start: "yyyy-mm-ddThh:mm:00",
    end: "yyyy-mm-ddThh:mm:00",
    done: Boolean(false),
    color: "#ffffff"
};

function getByUIUD(UIUDCheck) {
    const returnArray = [];

    for(let i = 0;i < dataentryarray.length;i++) {
        if(dataentryarray[i].UIUD == UIUDCheck) {
            returnArray.push(
                dataentryarray[i]
            )
        }
    }
    return returnArray
};

function getByDEID(DEIDCheck) {
    const returnArray = [];

    for(let i = 0;i < dataentryarray.length;i++) {
        if(dataentryarray[i].DEID == DEIDCheck) {
            returnArray.push(
                dataentryarray[i]
            )
        }
    }
    return returnArray
};

function getByType(typeCheck) {
    const returnArray = [];

    for(let i = 0;i < dataentryarray.length;i++) {
        if(dataentryarray[i].type == typeCheck) {
            returnArray.push(
                dataentryarray[i]
            )
        }
    }
    return returnArray
};

function getByName(nameCheck) {
    const returnArray = [];

    for(let i = 0;i < dataentryarray.length;i++) {
        if(dataentryarray[i].name == nameCheck) {
            returnArray.push(
                dataentryarray[i]
            )
        }
    }
    return returnArray
};

function getByRelation(relationCheck) {
    const returnArray = [];

    for(let i = 0;i < dataentryarray.length;i++) {
        if(dataentryarray[i].relation == relationCheck) {
            returnArray.push(
                dataentryarray[i]
            )
        }
    }
    return returnArray
};

function getByLocation(locationCheck) {
    const returnArray = [];

    for(let i = 0;i < dataentryarray.length;i++) {
        if(dataentryarray[i].location == locationCheck) {
            returnArray.push(
                dataentryarray[i]
            )
        }
    }
    return returnArray
};

function getByStart(startCheck) {
    const returnArray = [];

    for(let i = 0;i < dataentryarray.length;i++) {
        if(dataentryarray[i].start == startCheck) {
            returnArray.push(
                dataentryarray[i]
            )
        }
    }
    return returnArray
};

function getByEnd(endCheck) {
    const returnArray = [];

    for(let i = 0;i < dataentryarray.length;i++) {
        if(dataentryarray[i].end == endCheck) {
            returnArray.push(
                dataentryarray[i]
            )
        }
    }
    return returnArray
};

function getByDone(doneCheck) {
    const returnArray = [];

    for(let i = 0;i < dataentryarray.length;i++) {
        if(dataentryarray[i].done == doneCheck) {
            returnArray.push(
                dataentryarray[i]
            )
        }
    }
    return returnArray
};

function getByColor(colorCheck) {
    const returnArray = [];

    for(let i = 0;i < dataentryarray.length;i++) {
        if(dataentryarray[i].color == colorCheck) {
            returnArray.push(
                dataentryarray[i]
            )
        }
    }
    return returnArray
};

function update(dataentryCheck) {
    let updateArray = [];
    updateArray = getByDEID(dataentryCheck.DEID)

    for(let i = 0;i < updateArray.length;i++) {
        updateArray[i].UIUD = dataentryCheck.UIUD
        updateArray[i].type = dataentryCheck.type
        updateArray[i].name = dataentryCheck.name
        updateArray[i].relation = dataentryCheck.relation
        updateArray[i].location = dataentryCheck.location
        updateArray[i].details = dataentryCheck.details
        updateArray[i].start = dataentryCheck.start
        updateArray[i].end = dataentryCheck.end
        updateArray[i].done = dataentryCheck.done
        updateArray[i].color = dataentryCheck.color
    }
};

function create(dataentryCheck) {
    dataentry.push(dataentryCheck)
};

function remove(dataentryCheck) {
    let updateArray = [];
    updateArray = getByDEID(dataentryCheck.DEID)

    for(let i = 0;i < updateArray.length;i++) {
        updateArray.splice(i, 1)
    }
};