$(window).on('load', function () {
    let controller = new CircleController();
});


class CircleController {
    constructor() {
        this.newEventfulRequest = new eventfulEventRequester();
        this.newEventRenderer = new EventRenderer(this.setPageState.bind(this));

        this.eventsArray = [];

        this.autoCompleteTimeout = null;
        this.categoryKeys = {
            'Music': 'music',
            'Comedy': 'comedy',
            'Kids/Family Fun': 'family_fun_kids',
            'Festivals': 'festivals',
            'Film': 'film',
            'Food & Wine': 'food &amp; Wine',
            'Art': 'art',
            'Holiday': 'holiday',
            'Museums': 'museums',
            'Buisiness': 'business',
            'Nightlife': 'nightlife',
            'Clubs': 'clubs',
            'Outdoors': 'outdoors',
            'Animals': 'animals',
            'Sales': 'sales',
            'Science': 'science',
            'Sports': 'sports',
            'Technology': 'technology',
            'Other': 'other',
        };

        this.setPageState(1);

        this.handleEventHandlers();

        //removes the class placed on certain DOM elements to keep them from populating
        //before page is ready. Only for cleaner look.
        this.removeInitialHideClass();
    }

    removeInitialHideClass(){
        $(".initialHide").removeClass('initialHide');
    }

    setPageState(state) {
        this.pageState = state;
        this[`pageState${state}`]();
    }

    pageState1() {
        $('.page1').removeClass('pageHidden');
        $('.page2').addClass('pageHidden');
        $('.page3').addClass('pageHidden');
    }
    pageState2() {
        $('.page1').addClass('pageHidden');
        $('.page2').removeClass('pageHidden');
        $('.page3').addClass('pageHidden');
    }
    pageState3() {
        $('.page1').addClass('pageHidden');
        $('.page2').addClass('pageHidden');
        $('.page3').removeClass('pageHidden');
    }

    requestEventData(date, numOfEntries, category) {
        this.newEventfulRequest.eventfulEventRequest(this.renderEventDataOnSuccess.bind(this), date, numOfEntries, category)
    }

    renderEventDataOnSuccess(dataArray) {
        this.eventsArray = dataArray;

        this.newEventRenderer.turnDataIntoDomElements(this.eventsArray);
    }

    handleEventHandlers() {
        $("#inputEventType, #inputEventType2").on({
            'keyup': this.onKeyUp.bind(this),

            'focusout': this.onFocusOutCloseAutoComplete.bind(this),
            'focus': this.autoCompleteAllChoices.bind(this),

        });

        $('#searchButton, .searchCategory').on({
            'click': () => {
                this.handleRequestEvents();
                this.setPageState(2);

            }
        });
        $('.closePage3').on({
            'click': () => {
                this.setPageState(2);
                this.clearMapData();
            }
        });

        $("#logo").on({
            'click': () => this.setPageState(1),
        });

    }

    handleRequestEvents() {
        //remove previous events
        $(".outerEventContainer ").remove();


        let categoryInputs = $(".categoryInput");
        let eventCategory = '';

        for (let categoryIndex = 0; categoryIndex < categoryInputs.length; categoryIndex++) {
            if (categoryInputs[categoryIndex].value !== '') {
                eventCategory = categoryInputs[categoryIndex].value;
            }
            categoryInputs[categoryIndex].value = '';
        }

        let category = this.categoryKeys[eventCategory];
        let date = $('#inputDate').val();

        this.requestEventData(date, 20, category);
    }

    clearMapData(){
        $('.gm-style').remove();
    }

    onKeyUp(event) {
        if (event.key === 'Escape') {
            this.removeAutoCompleteUL();
        } else if (!this.autoCompleteTimeout) {
            this.autoCompleteTimeout = setTimeout(this.autoCompleteCourse.bind(this, event.target), 500);
        } else {
            clearTimeout(this.autoCompleteTimeout);
            this.autoCompleteTimeout = setTimeout(this.autoCompleteCourse.bind(this, event.target), 500);
        }
    }
    onFocusOutCloseAutoComplete(event) {
        if (!this.focusOutTimeout) {
            this.focusOutTimeout = setTimeout(this.removeAutoCompleteUL, 200);
        } else {
            clearTimeout(this.focusOutTimeout);
            this.focusOutTimeout = setTimeout(this.removeAutoCompleteUL, 200);
        }
    }
    autoCompleteCourse(inputToComplete) {
        this.removeAutoCompleteUL();

        let appendParent = $(inputToComplete).closest('.input-group')
        let categoryInput = $(inputToComplete);
        let lettersSoFar = categoryInput.val().toLowerCase();

        if (lettersSoFar.length === 0) {
            // this.removeAutoCompleteUL();
            return;
        }

        let autoCompleteUL = $("<ul>", {
            'id': 'autoComplete',
            on: {
                'click': autoComplete.bind(this),
            },
        });
        //autoCompleteUL.on('click', '#autoCompleteLI', autoComplete.bind(this));

        let allAutoCorrectMatches = [];
        for (let category in this.categoryKeys) {
            let sliceToCheck = category.toLowerCase().slice(0, lettersSoFar.length);
            if (category.length === lettersSoFar.length) {
                this.removeAutoCompleteUL();
                continue;
            }
            if (sliceToCheck === lettersSoFar && lettersSoFar.length > 0) {
                let autoCompleteLI = $("<li>", {
                    text: category,
                    'class':'form-control autoCompleteLI',
                });
                allAutoCorrectMatches.push(autoCompleteLI);
            }
        }

        if (allAutoCorrectMatches.length > 0) {
            for (let index in allAutoCorrectMatches) {
                autoCompleteUL.append(allAutoCorrectMatches[index]);
            }
            appendParent.append(autoCompleteUL);
        }

        function autoComplete(event) {
            var clickedObj = event.target;
            categoryInput.val(clickedObj.outerText);
            this.removeAutoCompleteUL();
        }
    }
    removeAutoCompleteUL(event) {
        $("#autoComplete").remove();
    }
    autoCompleteAllChoices(event) {
        this.removeAutoCompleteUL();
        let appendParent = $(event.target).closest('.input-group')

        let autoCompleteUL = $("<ul>", {
            'id': 'autoComplete',
            on: {
                'click': autoComplete.bind(this),
            },
        });

        for (let category in this.categoryKeys) {
            let autoCompleteLI = $("<li>", {
                text: category,
                'class':'form-control autoCompleteLI'
            });
            autoCompleteUL.append(autoCompleteLI);
        }
        appendParent.append(autoCompleteUL);

        function autoComplete(clickedCategoryEvent) {
            var clickedObj = clickedCategoryEvent.target;
            $(event.target).val(clickedObj.outerText);
            this.removeAutoCompleteUL();
        }
    }
}

class eventfulEventRequester {
    constructor() {
        this.apiDataObject = {
            access_token: "17TJfP0tFmBX3bHRcvUEDnVkR2VgnziO0jhDrwgPcrEJXjJ0H66V0H5kmMWQwTHX2cZfhynFzE3sjaEzBb-v7chrsyweKxQQIvPbbW5SvMZt01-PWWi7PPo2PEvVWnYx",
            term: "restaurants",
            location : "Los Angeles",
            radius : 10,
            categories: "American (New)",
            priceRange : "1,2,3,4",
            open_now: false,
            sort_by: "best_match"
        };
    }

    formatDate(date){
        date = date.replace(/-/g,'')
        return date
    }

    eventfulEventRequest(renderOnPageCallback, date='2018042000', numOfEntries=20, category='music'){
        let eventSearchResultArray = [];
        let eventSearchResultObject = {};

        date = this.formatDate(date);
        let dateEnd=(Number(date) + 3).toString();

        let url=`https://api.eventful.com/json/events/search?app_key=Zb7jwSS8MQppFwhH&location=los angeles&within=15&date=${date}00-${dateEnd}00&category=${category}&image_sizes=blackborder250,block100&page_size=${numOfEntries}&category=new`

        $.ajax({
            //url: "https://api.eventful.com/json/events/search?app_key=Zb7jwSS8MQppFwhH&location=los angeles&within=15&date="+  startDate +"00-" + endDate + "00&category=" +  category + "&image_sizes=blackborder250,block100&page_size=10&category=new",
            //"https://api.eventful.com/json/events/search?app_key=Zb7jwSS8MQppFwhH&location=los angeles&within=15&date=2018042000-2018042000&category=music&image_sizes=blackborder250,block100&page_size=20&category=new",
            url: url,
            dataType: 'jsonp',
            data: {},
            success: function (rawData) {
                console.log("eventful" , rawData);

                for (let event = 0; event < rawData.events.event.length; event++) {

                    if (rawData.events.event[event].title !== null) {
                        var title = rawData.events.event[event].title;
                    }
                    if (rawData.events.event[event].city_name !== null) {
                        var cityName = rawData.events.event[event].city_name;
                    }
                    if (rawData.events.event[event].image !== null) {
                        var imageSmallUrl = 'http:' + rawData.events.event[event].image.block100.url;
                        var imageLargeUrl = 'http:' + rawData.events.event[event].image.blackborder250.url;
                    }
                    if (rawData.events.event[event].venue_address !== null) {
                        var venue_address = rawData.events.event[event].venue_address;
                    }
                    if (rawData.events.event[event].venue_name !== null) {
                        var venue_name = rawData.events.event[event].venue_name;
                    }
                    if (rawData.events.event[event].description !== null) {
                        var description = rawData.events.event[event].description;
                    }
                    if (rawData.events.event[event].start_time !== null) {
                        var startTime = rawData.events.event[event].start_time;
                    }
                    if (rawData.events.event[event].venue_url !== null) {
                        var venueURL = rawData.events.event[event].venue_url;
                    }
                    if (rawData.events.event[event].latitude !== null) {
                        var venueLatitude = rawData.events.event[event].latitude;
                    }
                    if (rawData.events.event[event].longitude !== null) {
                        var venueLongitude = rawData.events.event[event].longitude;
                    }
                    if (rawData.events.event[event].postal_code !== null) {
                        var venueZip = rawData.events.event[event].postal_code;
                    }
                    if (rawData.events.event[event].region_abbr !== null) {
                        var venueState = rawData.events.event[event].region_abbr;
                    }


                    eventSearchResultObject = {
                        title: title,
                        cityName: cityName,
                        imageSmallUrl: imageSmallUrl,
                        imageLargeUrl: imageLargeUrl,
                        venue_address: venue_address,
                        venue_name: venue_name,
                        description: description,
                        startTime: startTime,
                        venueURL: venueURL,
                        latitude: venueLatitude,
                        longitude: venueLongitude,
                        venueZip: venueZip,
                        venueState:venueState,
                    };

                    eventSearchResultArray.push(eventSearchResultObject);
                }
                console.log("eventSearchResultArray: ", eventSearchResultArray);

                renderOnPageCallback(eventSearchResultArray);
            },
            error: function (error) {
                ////console.log(error)
            },
        });


    }
}

class EventRenderer{
    constructor(changeStateCallback){
        this.setStateCallback=changeStateCallback;

        this.maxNumOfCharsPerEventTitle = 40;

    }
    turnDataIntoDomElements(arrayOfInfo){
        for(let objectIndex=0; objectIndex<arrayOfInfo.length; objectIndex++){
            let infoObject = arrayOfInfo[objectIndex];

            let domElement = this.createEventDoms(infoObject);
            this.renderOnEventsScreen(domElement);
        }

    }
    createEventDoms(infoToParse, odd){
        let outerContainer = $("<div>",{
            'class': 'outerEventContainer col-xs-12 col-md-3'
        });

        if(infoToParse.imageLargeUrl === undefined){
            infoToParse.imageLargeUrl= 'includes/images/testPartyImg.jpeg'
        }
        let eventContainer = $("<div>",{
            'class':'event innerEventContainer',
            css:{
                'background-image': `url("${infoToParse.imageLargeUrl}")`
            },
            on:{
                // 'click': this.handlePopOutAnimation.bind(this),
            },
        });

        let shortHandTitle = this.formatEventName(infoToParse.title)

        let nameEl = $("<div>",{
            'class':'eventName eventContent row col-xs-8 col-md-12',
            text: shortHandTitle,
        });

        let infoTime = infoToParse.startTime.slice(11,16);

        infoToParse.eventTime = this.formatTime(infoTime);

        infoToParse.date = `${infoToParse.startTime.slice(5,7)}-${infoToParse.startTime.slice(8,10)}-${infoToParse.startTime.slice(0, 4)}`;

        let dateEl = $("<div>",{
            'class':'eventDate eventContent row  col-xs-8 col-md-12',
            text: `${infoToParse.eventTime}`,
        });


        //closure to get added data
        (function (eventRendererObj) {
            eventContainer.on({
                'click':eventRendererObj.openEventPageInformation.bind(this, eventRendererObj, infoToParse),
            })
        })(this);

        eventContainer.append(nameEl, dateEl);
        outerContainer.append(eventContainer);

        return outerContainer;
    }
    // handlePopOutAnimation(eventOfClick){
    //     let parent = $(eventOfClick.target).closest('.event');
    //     let extraInfoDiv = parent.find('.eventExtra');
    //
    //     this.shrinkAnyExpandedDivs(extraInfoDiv);
    //     this.popOutAnimation(extraInfoDiv);
    // }
    // shrinkAnyExpandedDivs(divToSkip){
    //     let expandedDivs=$(".expand");
    //     for(let divIndex = 0; divIndex < expandedDivs.length; divIndex++){
    //         if(expandedDivs[divIndex] !== divToSkip[0])
    //             expandedDivs.removeClass('expand').addClass('shrink')
    //     }
    // }
    // popOutAnimation(extraInfoDiv){
    //     if(extraInfoDiv.hasClass('expand')) {
    //         extraInfoDiv.removeClass('expand').addClass('shrink');
    //     }else{
    //         extraInfoDiv.removeClass('shrink').addClass('expand');
    //     }
    // }
    renderOnEventsScreen(domElement){
        $(".eventsContainer").append(domElement);
    }

    openEventPageInformation(thisObj, info, event){
        // set state to page 3
        thisObj.setStateCallback(3);

        let eventCoordinates = {
            latitude:info.latitude,
            longitude:info.longitude,
        };

        var yelpData = new YelpDataGetter(eventCoordinates,info);

        // let address = `${info.venue_address} ${info.cityName}, ${info.venueState} ${info.venueZip} `

        let image =  $("#imageArea").attr('src', info.imageLargeUrl);
        let street= $("#eventStreet").text(info.venue_address);
        let city= $("#eventCity").text(info.cityName);
        let state= $("#eventState").text(info.venueState);
        let zip= $("#eventZip").text(info.venueZip);
        let date= $("#eventDate").text(info.date);
        let time= $("#eventTime").text(info.eventTime);
        let infoDetails= $("#eventDetail").text(info.description);

        console.log(info)
    }
    formatTime(time){
        let meridiem = 'AM';
        let hour = time.slice(0,2);
        let min = time.slice(3,5);

        if(hour === 0){
            hour = 12;
        }
        if(hour > 12){
            hour = hour-12;
            meridiem = 'PM';
        }

        return `${hour}:${min} ${meridiem}`
    }
    formatEventName(name){
        //cut off title at closest space, add ... to indicate more info

        if(name.length > this.maxNumOfCharsPerEventTitle) {
            let lastSpaceIndex = 0;
            //find last space in string
            for (let charIndex in name.slice(0, this.maxNumOfCharsPerEventTitle)) {
                if (name[charIndex] === ' ') {
                    lastSpaceIndex = charIndex;
                }
            }

            let newName = name.slice(0, lastSpaceIndex) + '...';

            return newName;
        }else{
            return name
        }

    }
}

class YelpDataGetter {
    constructor(eventCoord) {
        this.apiDataObject = {
            access_token: "17TJfP0tFmBX3bHRcvUEDnVkR2VgnziO0jhDrwgPcrEJXjJ0H66V0H5kmMWQwTHX2cZfhynFzE3sjaEzBb-v7chrsyweKxQQIvPbbW5SvMZt01-PWWi7PPo2PEvVWnYx",
            term: "restaurants",
            // location : "Los Angeles",
            radius : 300,
            categories: "Asian",
            priceRange : "1,2,3,4",
            open_now: false,
            sort_by: "best_match",
            'Access-Control-Allow-Origin':true,
            latitude: Number(eventCoord.latitude),
            longitude: Number(eventCoord.longitude),
        };

        this.handleEventHandler();

        this.ajaxCall();
    }

    handleEventHandler(){
        $("#yelpSearchButton").click(this.submitYelpButtonClicked.bind(this));
    }

    ajaxCall() {
        var yelpAjaxCall = {
            dataType: "JSON",
            method: 'POST',
            url: "http://yelp.ongandy.com/businesses",
            data: this.apiDataObject,
            success: this.successPullBusinessData.bind(this),
            error: function (errors) {
                ////console.log("errors : ", errors);
            }
        };
        $.ajax(yelpAjaxCall);
    }
    successPullBusinessData(data) {

        let yelpBusinessResultsArray = [];

        if(data.businesses) {
            for (let businessIndex = 0; businessIndex < data.businesses.length; businessIndex++) {
                yelpBusinessResultsArray.push(data.businesses[businessIndex]);
            }

            console.log(yelpBusinessResultsArray);
            let newMap = this.initMap(this.apiDataObject.latitude, this.apiDataObject.longitude, yelpBusinessResultsArray);

        }
    }

    initMap(lat,lng, yelpBusinessResultsArray) {
        console.log(yelpBusinessResultsArray[0].coordinates.latitude)
        let mapOptions = {
            zoom: 16,
            center: new google.maps.LatLng(lat,lng)
        };
        let map = new google.maps.Map(document.getElementById('google-map'), mapOptions);

        let markerLat;
        let markerLng;
        for (let markerIndex=0; markerIndex<yelpBusinessResultsArray.length; markerIndex++) {
            markerLat = yelpBusinessResultsArray[markerIndex].coordinates.latitude;
            markerLng = yelpBusinessResultsArray[markerIndex].coordinates.longitude;
            var marker = new google.maps.Marker({
                map: map,
                position: new google.maps.LatLng(markerLat, markerLng),
                animation: google.maps.Animation.DROP,
            });
        }
        return map
    }

    submitYelpButtonClicked(eventLocation, searchObjectParameters) {
        // var searchObj = {
        //     access_token: "17TJfP0tFmBX3bHRcvUEDnVkR2VgnziO0jhDrwgPcrEJXjJ0H66V0H5kmMWQwTHX2cZfhynFzE3sjaEzBb-v7chrsyweKxQQIvPbbW5SvMZt01-PWWi7PPo2PEvVWnYx"
        // };
        var milesToMeters = 1609.34/1; //1609.34m per 1 mile
        searchObjectParameters.term = $("#term").val() || this.apiDataObject.term;
        searchObjectParameters.latitude = eventLocation.latitude || this.apiDataObject.latitude;
        searchObjectParameters.longitude = eventLocation.longitude || this.apiDataObject.longitude;
        searchObjectParameters.location = $(/*#location*/).val() || this.apiDataObject.location;
        searchObjectParameters.radius = parseInt($("#radius").val())*milesToMeters || this.apiDataObject.radius;
        searchObjectParameters.categories = $(/*#categories*/).val() || this.apiDataObject.categories;
        searchObjectParameters.priceRange = $(/*"#priceRange"*/).val() || this.apiDataObject.price;
        searchObjectParameters.open_now = $(/*#open_now*/).val() || this.apiDataObject.open_now;
        searchObjectParameters.sort_by = $(/*#sort_by*/).val() || this.apiDataObject.sort_by;


        return searchObjectParameters;
        // var newYelpCall = new YelpDataGetter(eventLocation, searchObjectParameters);
        // console.log(newYelpCall);
        // var map = new CreateGoogleMap(newYelpCall.yelpBusinessResultsArray);

    }
}

/**
 * Global variables
 */



/***************************************************************************************************
 * initializing
 * @params {undefined} none
 * @returns: {undefined} none
 * initializes the application: adds click/hover handlers, eventfulEventRequest();
 */


// function initializeApp() {
//
//     addClickHandlers();
//     //eventfulEventRequest(startDate, endDate, category)
//     //center: new google.maps.LatLng(34.0522, -118.2437)
//
// }



/*************************************************************************x**************************
 * addHoverHandler
 * @params {undefined}
 * @returns: {undefined}
 * adds events for when DOM element is hovered over
 */

// function addHoverHandler() {
//
// }

/***************************************************************************************************
 * addClickHandlers
 * @params {undefined}
 * @returns: {undefined}
 * adds events for when DOM element is clicked
 */


// function addClickHandlers() {
//     $('#searchButton').click(function(){
//         $(".inputContainerToHide").addClass('pageHidden');
//         //**** katy add this, do not remove ***////
//         $(".eventsDropDownCont").removeClass('pageHidden');
//         //***** katy edited ends ****////
//         $(".eventPageContainer").removeClass('pageHidden');
//     });
//
//     // Dylan's Addition - Search button for yelp
//     $("#yelpSearchButton").click(submitYelpButtonClicked);
//
//
//
//     //var eventSearch = $('#searchButten').click(eventfulEventRequest(startDate, endDate, category));
//
//     // $("#yelpSearchButton").click(submitYelpButtonClicked);
// }

/***************************************************************************************************
 * callYelpData
 * @params {string} input from the User to search through Yelp
 * @returns: {object} data from Yelp
 * Sends request to Yelp API to pull data based off search input from User
 */



//console.log(newYelpCall);


// class GoogleMap {
//     constructor(yelpResultArray) {
//         this.yelpBusinessResultsArray = yelpResultArray
//     }




// }


// var testSearchObject = {
//     access_token: "17TJfP0tFmBX3bHRcvUEDnVkR2VgnziO0jhDrwgPcrEJXjJ0H66V0H5kmMWQwTHX2cZfhynFzE3sjaEzBb-v7chrsyweKxQQIvPbbW5SvMZt01-PWWi7PPo2PEvVWnYx",
//     term: "restaurants",
//     latitude: 47.6062,
//     longitude: -122.3321,
//     location : "Seattle",
//     radius : 800,
//     categories: "American (New)",
//     priceRange : "1,2,3,4",
//     open_now: false,
//     sort_by: "best_match"
// }
// var newYelpCall = new YelpDataGetter({latitude: 47.6062, longitude: -122.3321}, testSearchObject);
// console.log(testData);





/***************************************************************************************************
 * callEventData
 * @para`ms {string} input from the User to search through PredictHQ
 * @returns: {object} data from PredictHQ
 * Sends request to PredictHQ API to pull data based off search input from User
 */


/***************************************************************************************************
 * callGoogleData
 * @params {string} input from the User to search through Google Maps
 * @returns: {undefined}
 * Sends request to Google API to pull data based off search input from User
 */


/***************************************************************************************************
 * renderInformationOnDOM
 * @params {object} results from ajax calls
 * @returns: {undefined}
 * Takes the information from the ajax calls and displays on to DOM
 */


/***************************************************************************************************
 * submitEventButtonClicked
 * @params {undefined}
 * @returns: {undefined}
 * Leads user to eventPage from index upon click and fills in an object with search properties. Must be able to take all search parameters to filter through Event API.
 */



/***************************************************************************************************
 * submitYelpButtonClicked
 * @params {undefined}
 * @returns: {object} object with all of the search parameters from the user.
 * Creates an object from user search input upon click. Must be able to take all search parameters to filter through Yelp APIs.
 */


// function submitYelpButtonClicked() {
//     var searchObj = {};
//     //should have default values if no value entered
//     searchObj.term = $(/*#searchTerm*/).val();
//     searchObj.latitude = $(/*#latitude*/).val();
//     searchObj.longitude = $(/*#longitude*/).val();
//     searchObj.location = $(/*#location*/).val();
//     searchObj.radius = $(/*#radius*/).val();
//     searchObj.categories = $(/*#categories*/).val();
//     searchObj.price = $(/*#price*/).val();
//     searchObj.open_now = $(/*#open_now*/).val();
//     searchObj.sort_by = $(/*#sort_by*/).val();
//     return searchObj;

// function submitYelpButtonClicked(eventLocation, searchObjectParameters) {
//     // var searchObj = {
//     //     access_token: "17TJfP0tFmBX3bHRcvUEDnVkR2VgnziO0jhDrwgPcrEJXjJ0H66V0H5kmMWQwTHX2cZfhynFzE3sjaEzBb-v7chrsyweKxQQIvPbbW5SvMZt01-PWWi7PPo2PEvVWnYx"
//     // };
//     var milesToMeters = 1609.34/1; //1609.34m per 1 mile
//     searchObjectParameters.term = $("#term").val() || searchObjDefault.term;
//     searchObjectParameters.latitude = eventLocation.latitude || searchObjDefault.latitude;
//     searchObjectParameters.longitude = eventLocation.longitude || searchObjDefault.longitude;
//     searchObjectParameters.location = $(/*#location*/).val() || searchObjDefault.location;
//     searchObjectParameters.radius = parseInt($("#radius").val())*milesToMeters || searchObjDefault.radius;
//     searchObjectParameters.categories = $(/*#categories*/).val() || searchObjDefault.categories;
//     searchObjectParameters.priceRange = $(/*"#priceRange"*/).val() || searchObjDefault.price;
//     searchObjectParameters.open_now = $(/*#open_now*/).val() || searchObjDefault.open_now;
//     searchObjectParameters.sort_by = $(/*#sort_by*/).val() || searchObjDefault.sort_by;
//
//
//     return searchObjectParameters;
//     // var newYelpCall = new YelpDataGetter(eventLocation, searchObjectParameters);
//     // console.log(newYelpCall);
//     // var map = new CreateGoogleMap(newYelpCall.yelpBusinessResultsArray);
//
// }


/***************************************************************************************************
 * createGoogleMap
 * @params {undefined}
 * @returns: {object} apiDataObject that contains properties that contain an address or coordinates to center map
 * creates a map to display onto page that will contain makers. Markers will be yelp results
 */


// class CreateGoogleMap {
//     constructor(searchResults) {
//         this.latitude = searchResults.latitude;
//         this.longitude = searchResults.longitude;
//         this.searchCoordinates = {
//             lat: this.latitude,
//             lng: this.longitude
//         };
//     }
//
//         this.searchArray = searchResults.businesses;
//         this.map = new google.maps.Map(document.getElementById('map'), {
//             center: this.searchCoordinates,
//             zoom: 5
//         });
//         this.infoWindow = new google.maps.InfoWindow();
//         this.service = new google.maps.places.PlacesService(map);
//         this.service.nearbySearch({
//             location: this.searchCoordinates,
//             radius: 800,
//             type: ['restaurant']
//         }, this.callback);
//     }
//     callback(searchResults, status) {
//         if (status === google.maps.places.PlacesServiceStatus.OK) {
//             for(let i = 0; i < searchResults.businesses.length; i++) {
//                 this.createMarker = this.createMarker.bind(this);
//                 this.createMarker(searchResults.businesses[i]);
//             }
//         }
//     }
//     createMarker(place) {
//         this.placeLocation = place.geometry.location;
//         this.marker = new google.maps.Marker({
//             map: map,
//             position: this.placeLocation
//         });
//         google.maps.event.addListener(marker, 'click', function() {
//             infowindow.setContent(/**/);
//             infowindow.open(map, this);
//         });
//         this.provideLocationData(this.searchArray, this.marker);
//     }
//     provideLocationData(searchArray, marker /*businesses array*/) {
//         searchArray.map(function(item) {
//             this.locationDiv = $("<div>").addClass("locationDiv");
//             this.locationName = $("<p>").text(item.name).addClass("locationName");
//             this.locationImage = $("<img>").attr("src", item.image_url).addClass("locationImage");
//             this.locationLocation = $("<p>").text(item.location["display_address"].map( address => "" + address + ", " + address)).addClass("locationLocation");
//             this.locationPhoneNumber = $("<p>").text(item.phone).addClass("locationPhoneNumber");
//             this.locationPrice = $("<p>").text(item.price).addClass("locationPrice");
//             this.locationRating = $("<p>").text(item.rating).addClass("locationRating");
//             this.locationReviewCount = $("<p>").text(item.review_count).addClass("locationReviewCount");
//             this.locationURL = $("<p>").text(item.url).addClass("locationURL");
//
//             this.locationDiv.append(this.locationName, this.locationImage, this.locationPrice, this.locationRating, this.locationReviewCount, this.locationLocation, this.locationPhoneNumber, this.locationURL);
//             marker.append(this.locationDiv);
//         })
//     }
// }

// class CreateGoogleMap {
//     constructor(searchResults) {
//         this.latitude = searchResults.latitude;
//         this.longitude = searchResults.longitude;
//         this.searchCoordinates = {
//             lat : this.latitude,
//             lng : this.longitude
//         };
//         this.searchArray = searchResults.businesses;
//         this.map = new google.maps.Map(document.getElementById('map'), {
//             center: this.searchCoordinates,
//             zoom: 5
//         });
//         this.infoWindow = new google.maps.InfoWindow();
//         this.service = new google.maps.places.PlacesService(map);
//         this.service.nearbySearch({
//             location: this.searchCoordinates,
//             radius: 10,
//             type: ['restaurant']
//         }, this.callback);
//     }
//     callback(searchResults, status) {
//         if (status === google.maps.places.PlacesServiceStatus.OK) {
//             for(let i = 0; i < searchResults.businesses.length; i++) {
//                 this.createMarker = this.createMarker.bind(this);
//                 this.createMarker(searchResults.businesses[i]);
//             }
//         }
//     }
//     createMarker(place) {
//         this.placeLocation = place.geometry.location;
//         this.marker = new google.maps.Marker({
//             map: map,
//             position: this.placeLocation
//         });
//         google.maps.event.addListener(marker, 'click', function() {
//             infowindow.setContent(/**/);
//             infowindow.open(map, this);
//         });
//         this.provideLocationData(this.searchArray, this.marker);
//     }
//     provideLocationData(searchArray, marker /*businesses array*/) {
//         searchArray.map(function(item) {
//             this.locationDiv = $("<div>").addClass("locationDiv");
//             this.locationName = $("<p>").text(item.name).addClass("locationName");
//             this.locationImage = $("<img>").attr("src", item.image_url).addClass("locationImage");
//             this.locationLocation = $("<p>").text(item.location["display_address"].map( address => "" + address + ", " + address)).addClass("locationLocation");
//             this.locationPhoneNumber = $("<p>").text(item.phone).addClass("locationPhoneNumber");
//             this.locationPrice = $("<p>").text(item.price).addClass("locationPrice");
//             this.locationRating = $("<p>").text(item.rating).addClass("locationRating");
//             this.locationReviewCount = $("<p>").text(item.review_count).addClass("locationReviewCount");
//             this.locationURL = $("<p>").text(item.url).addClass("locationURL");
//
//             this.locationDiv.append(this.locationName, this.locationImage, this.locationPrice, this.locationRating, this.locationReviewCount, this.locationLocation, this.locationPhoneNumber, this.locationURL);
//             marker.append(this.locationDiv);
//         })
//     }
// }




/***************************************************************************************************
 * autoCompleteLocation
 * @params {undefined}
 * @returns: {object}
 *
 */


// function activePlaceSearch(){
//     // var input = $('#search-city');
//     // var autocomplete = new google.maps.places.Autocomplete(input[0]);
//     var input = document.getElementById('search-city');
//     var autocomplete = new google.maps.places.Autocomplete(input);
//
// }

// function activePlaceSearch(){
//     // var input = $('#search-city');
//     // var autocomplete = new google.maps.places.Autocomplete(input[0]);
//     var input = document.getElementById('search-city');
//     var autocomplete = new google.maps.places.Autocomplete(input);
//
// }


