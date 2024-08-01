var lpSectionInitiatedUrl = window.location.href;
var lpAutoOpenWindowState = {
    autoOpenTimerRun: 0,
    autoOpenInProgress: true,
    autoOpenMsgWindowDivClicked: false,
    maxRetry: 4,
    autoOpenTimer: 0,
};

function renderAutoOpenMsgWindowContainer(){
	if(document.body){
		var autoOpenDiv = document.createElement('div');
		autoOpenDiv.id = "autoOpenMsgWindowContainer";
		document.body.appendChild(autoOpenDiv);
	} else{
		setTimeout(function(){
			renderAutoOpenMsgWindowContainer();
		},100);			
	}
}

if(!document.getElementById("autoOpenMsgWindowContainer")){
	renderAutoOpenMsgWindowContainer();	
}

var lpUtilConfig = {
    unifiedRoutingSkills: [
        '2506962030', // Prod skill ID where conversation is placed
        '2477810230', // Test Skill
        '2537153330',
        '2537155830',
        '2537156330',
        '3836773138' // to disable text field at SSO login page
    ],
    unifiedWelcomeMessage: ['Are you a new or existing customer - please click below.','Thank you for choosing Verizon Business Chat. How can we assist you today?'],
    preemptiveUrls: [ window.location.origin + '/business/shop/plans' , 
                      window.location.origin + '/business/shop/shopping-cart',    
                      window.location.origin + '/business/shop/business-info'],
    abTestingForMobileUrls: [ window.location.origin + '/business/shop/products/devices/smartphones',
                              window.location.origin + '/business/shop/products/devices/all']               

};

var lpSection = [];

function deviceType() {
    try {
        var ua = new UAParser();
        var os = ua.getOS();
        var parsedVersion = os.version.split('.')[0]+"."+os.version.split('.')[1];
        var deviceType = ua.getDevice().type;
        var section = ['deviceType:' + deviceType];

        if (os.name === 'iOS' && Number(parsedVersion) >= 11.3 && deviceType != 'tablet') {
            // logger("ABC compatible!");
            section.push('devicePlatform:iOS');
            section.push('messagingType:abc');
            return section;
        } else if (os.name === 'Android' && deviceType != 'tablet') {
            //logger("GBM compatible"); 
            section.push('devicePlatform:Android');
            section.push('messagingType:gbm');
            return section;
        }

        //Default
        section.push('devicePlatform:' + os.name);
        section.push('messagingType:web');
        return section;
    } catch (e) {
        console.error(e);
        //Default
        section.push('devicePlatform:undefined');
        section.push('messagingType:web');
        return section;
    }
}

function initLpChatAfterDomReady(){
    try{
        if(document.body){
            //configSectionBeforeLoadLptag();
            //var pageSections = manipulateLpTagSections();
            //loadLpTag(pageSections);
            configSectionBeforeLoadLptag();
        } else{
            setTimeout(function() {
                initLpChatAfterDomReady();
            }, 300);        
        }
    } catch (e){
        console.error(e);
    }
    
}

function configSectionBeforeLoadLptag() {
    try {
        var userDeviceType = deviceType();
        if (userDeviceType.includes('messagingType:abc') || userDeviceType.includes('messagingType:gbm')) {
            var div = document.createElement('div');
            div.id = 'lpMsgContainer';
            document.body.appendChild(div);
            setTimeout(function () {
                // Add section function here and append/merge to userDeviceType sections
                var pageSections = manipulateLpTagSections();
                var sections = pageSections.concat(userDeviceType);
                //pass sections to loadLpTag function. 
                loadLpTag(sections);
                console.log('sections:', sections);
                console.log('lpsections:', lpSection);
            }, 100);
        } else if (userDeviceType.includes('messagingType:web')) {
            var div = document.createElement('div');
            div.id = 'lpMsgWebContainer';
            document.body.appendChild(div);
            var pageSections = manipulateLpTagSections();
            var sections = pageSections.concat(userDeviceType);
            setTimeout(function() {
                loadLpTag(sections);
                console.log('sections:', lpSection);
            }, 100);
        } else {
            // Add section function here and append/merge to userDeviceType sections
            var pageSections = manipulateLpTagSections();
            var sections = pageSections.concat(userDeviceType);
            //pass sections to loadLpTag function. 
            loadLpTag(sections);
            console.log('sections:', sections);
            console.log('lpsections:', lpSection);
            preEmptiveLeave();
        }
    } catch (e) {
        console.error(e);
    }
};


function loadLpTag(lpSection) {
    var lpTagsiteId = '22209379';
    if(lpSection.includes('source:DigQuote-d2d')){
        lpTagsiteId = '88102062';
    }

    window.lpTag = window.lpTag || {}, 'undefined' == typeof window.lpTag._tagCount ? (window.lpTag = {
        wl: lpTag.wl || null,
        scp: lpTag.scp || null,
        site: lpTagsiteId || '',
        section: lpSection,
        tagletSection: lpTag.tagletSection || null,
        autoStart: lpTag.autoStart !== !1,
        ovr: lpTag.ovr || {},
        _v: '1.10.0',
        _tagCount: 1,
        protocol: 'https:',
        events: {
            bind: function (t, e, i) {
                lpTag.defer(function () {
                    lpTag.events.bind(t, e, i)
                }, 0)
            },
            trigger: function (t, e, i) {
                lpTag.defer(function () {
                    lpTag.events.trigger(t, e, i)
                }, 1)
            }
        },
        defer: function (t, e) {
            0 === e ? (this._defB = this._defB || [], this._defB.push(t)) : 1 === e ? (this._defT = this._defT || [], this._defT.push(t)) : (this._defL = this._defL || [], this._defL.push(t))
        },
        load: function (t, e, i) {
            var n = this;
            setTimeout(function () {
                n._load(t, e, i)
            }, 0)
        },
        _load: function (t, e, i) {
            var n = t;
            t || (n = this.protocol + '//' + (this.ovr && this.ovr.domain ? this.ovr.domain : 'lptag.liveperson.net') + '/tag/tag.js?site=' + this.site);
            var o = document.createElement('script');
            o.setAttribute('charset', e ? e : 'UTF-8'), i && o.setAttribute('id', i), o.setAttribute('src', n), 
            o.setAttribute('defer', 'defer'),
            document.getElementsByTagName('head').item(0).appendChild(o)
        },
        init: function () {
            this._timing = this._timing || {}, this._timing.start = (new Date).getTime();
            var t = this;
            window.attachEvent ? window.attachEvent('onload', function () {
                t._domReady('domReady')
            }) : (window.addEventListener('DOMContentLoaded', function () {
                t._domReady('contReady')
            }, !1), window.addEventListener('load', function () {
                t._domReady('domReady')
            }, !1)), 'undefined' === typeof window._lptStop && this.load()
        },
        start: function () {
            this.autoStart = !0
        },
        _domReady: function (t) {
            this.isDom || (this.isDom = !0, this.events.trigger('LPT', 'DOM_READY', {
                t: t
            })), this._timing[t] = (new Date).getTime()
        },
        vars: lpTag.vars || [],
        dbs: lpTag.dbs || [],
        ctn: lpTag.ctn || [],
        sdes: lpTag.sdes || [],
        hooks: lpTag.hooks || [],
        identities: lpTag.identities || [],
        ev: lpTag.ev || []
    }, lpTag.init()) : window.lpTag._tagCount += 1;
}

var convInfo = function convInfoInit() {
    try {
        lpTag.external = lpTag.external || {};
        lpTag.external.convInfo = {
            getData: function getData() {
                var convEvents = lpTag.events.hasFired("lpUnifiedWindow", "conversationInfo");
                var windowStateEvents = lpTag.events.hasFired("lpUnifiedWindow", "state");
                var renderEvents = lpTag.events.hasFired("RENDERER_STUB", "AFTER_CREATE_ENGAGEMENT_INSTANCE");
                var engagementClicks = lpTag.events.hasFired("LP_OFFERS", "OFFER_CLICK");
                var displayedEngagements = renderEvents.map(this._extractEngDetails) || [];
                var latestEngagementClick = this._getLatest(engagementClicks) || {};
                var clickedEngagementRender = this._findRenderEvent(renderEvents, latestEngagementClick.engagementId) || {};
                var clickedEngagement = this._extractEngDetails(clickedEngagementRender);
                var lpVidCookie = document.cookie.split("; ").find(function (row) {
                    return row.startsWith("LPVID");
                });
                var lpSidCookie = document.cookie.split("; ").find(function (row) {
                    return row.startsWith("LPSID - ".concat(lpTag.site));
                });
                var lpVid = lpVidCookie ? lpVidCookie.split("=")[1] : undefined;
                var lpSid = lpSidCookie ? lpSidCookie.split("=")[1] : undefined;
                var ceVid = this._getLatest(convEvents, "visitorId");
                var pid = lpVid !== ceVid ? ceVid : undefined;
                return {
                    clickedEngagement: clickedEngagement,
                    latestSkillId: this._getLatest(convEvents, "skill"),
                    latestAgentId: this._getLatest(convEvents, "agentId"),
                    latestConvId: this._getLatest(convEvents, "conversationId"),
                    latestAgentName: this._getLatest(convEvents, "agentName"),
                    latestWindowState: this._getLatest(windowStateEvents, "state"),
                    displayedEngagements: displayedEngagements,
                    lpSid: lpSid,
                    lpVid: lpVid,
                    pid: pid,
                    siteId: lpTag.site,
                    sections: lpTag.section
                };
            },
            parseObjectProperties: function parseObjectProperties(obj, parse) {
                for (var k in obj) {
                    if (typeof obj[k] === 'object' && obj[k] !== null) {
                        parse("<div style=\"display:flex; width: 95%;background-color: rgb(0,0,0,0.2);margin-left: 10px;margin-right: 10px;border-bottom: 1px solid rgb(0,0,0,.05);padding: 2px 5px;\">							<div style=\"font-weight: bold;width: 100%; color:rgb(0,0,0,.7);\">"+k+"</div>");
                        parseObjectProperties(obj[k], parse);
                    } else if (obj.hasOwnProperty(k)) {
                        parse("<div style=\"display:flex; width: 95%;background-color: rgb(0,0,0,.05);margin-left: 10px;margin-right: 10px;border-bottom: 1px solid rgb(0,0,0,.05);padding: 2px 5px;\">							<div style=\"width: 50%; color:rgb(0,0,0,.7);\">"+k+"</div><div style=\"width: 50%\">"+obj[k]+"</div></div>");
                    }
                }
            },
            showData: function showData(opts) {
                if (opts && opts.data && opts.data.line && opts.data.line.text === "/convinfo") {
                    var data = lpTag.external.convInfo.getData();
                    console.log(data);
                    var div = document.createElement("div");
                    div.id = "lp_line_convinfo";
                    lpTag.external.convInfo.parseObjectProperties(data, function (prop) {
                        div.innerHTML += prop;
                    });
                    document.getElementsByClassName("lpc_transcript")[0].appendChild(div);
                    opts.data.line.text = "";
                    var scrollable = document.getElementsByClassName("lp_location_center")[0];
                    scrollable.scrollTop = scrollable.scrollHeight;
                }
            },
            _getLatest: function _getLatest(array, datum) {
                var event = undefined;
                if (datum) {
                    for (var i = array.length - 1; i >= 0; i--) {
                        if (array[i].data && array[i].data[datum]) {
                            event = array[i];
                            break;
                        }
                    }
                } else event = array[array.length - 1];
                if (event && event.data) return datum ? event.data[datum] : event.data;
                else return undefined;
            },
            _findRenderEvent: function _findRenderEventConf(renderEvents, engagementId) {
                return renderEvents.find(function (ev) {
                    return ev && ev.data && ev.data.conf && ev.data.conf.id === engagementId;
                });
            },
            _extractEngDetails: function _returnEngDetails(renderEvent) {
                var eng = renderEvent.data && renderEvent.data.eng;
                if (eng && eng.conf) {
                    var details = {
                        campaignId: eng.conf.campaignId,
                        engagementId: eng.conf.id,
                        engagementName: eng.conf.name,
                        skillId: eng.conf.skillId,
                        skillName: eng.conf.skillName,
                        windowId: eng.conf.windowId
                    };
                }
                return details;
            },
        };
        lpTag.hooks.push({
            name: "BEFORE_SEND_VISITOR_LINE",
            callback: lpTag.external.convInfo.showData
        });
    } catch (e) {
        console.log(e, "convinfo error");
    }
}

//Add LP Sections
function manipulateLpTagSections() {
    try {
        
        lpSection = [];
        // To determine if the URL is Wireles or Wireline
        //lpTag.section = document.location.host.indexOf('verizonwireless') > -1 ? ['l1:wireless'] : ['l1:wireline'];
        var actualPathName = document.location.pathname;
        var paths = actualPathName.replace('mbt/prospect', 'business').split("/").filter(Boolean);
        if (window.location.href.indexOf('localhost') >= 0) {
            paths = ('business/' + actualPathName).split('/').filter(Boolean);
        }
        for (var i = 0; i < paths.length; i++) {
            var currentPath = paths[i];
            if (lpSection == "") {
                lpSection = [];
            }
            if (currentPath) {
                lpSection.push("l" + (i + 2) + ":" + currentPath);
            }
        }
        if((typeof window.sessionStorage.getItem("_currentFlow") != undefined) && (window.sessionStorage.getItem("_currentFlow") != null) && window.sessionStorage.getItem("_currentFlow").indexOf("5g") >= 0){
            lpSection.push('product:5g');
        } 
        if((typeof window.sessionStorage.getItem("_currentFlow") != undefined) && (window.sessionStorage.getItem("_currentFlow") != null) && window.sessionStorage.getItem("_currentFlow").indexOf("4g") >= 0){
            lpSection.push('product:4g');
        } 
        if((typeof window.sessionStorage.getItem("_currentFlow") != undefined) && (window.sessionStorage.getItem("_currentFlow") != null) && window.sessionStorage.getItem("_currentFlow").indexOf("one-talk") >= 0){
            lpSection.push('product:one-talk');
        } 
        
        if(window.sessionStorage.getItem("_currentFlow") == "dsp"){
            lpSection.push('product:amzn-dsp');
        } else if(window.sessionStorage.getItem("hasSmartWatches") == "true"){
            lpSection.push('product:smartwatches');
        } 

        //Unified-Cart Flow 
        if((typeof window.sessionStorage.getItem("unified-cart") != undefined) && (window.sessionStorage.getItem("unified-cart") == "yes")){
            lpSection.push('unified-cart:yes');
        }

        //Chat enhancement - refresh page for credit responses
        if((typeof window.sessionStorage.getItem("dep-pymnt") != undefined) && (window.sessionStorage.getItem("dep-pymnt") == "yes")){
            lpSection.push('dep-pymnt:yes');
        }

        //5G & LTE BI Saved Cart Emails - VBGHSA-7309
        if((typeof window.sessionStorage.getItem("_currentChatFlow") != undefined) && (window.sessionStorage.getItem("_currentChatFlow") == "source:email-savedcart")){
            lpSection.push('source:email-savedcart');
        }

        //Unified Cart DQ for 5G but does not LQ for it - VBGHSA-13548
        if((typeof window.sessionStorage.getItem("5g-Qual") != undefined) && (window.sessionStorage.getItem("5g-Qual") == "no")){
            lpSection.push('5g-Qual:no');
        }

        //DIGITAL QUOTE_Prospect- New Chat treatment for Digital Quote - VBGHSA - 13869
        if((typeof window.sessionStorage.getItem("digitalQuoteChannel") != undefined) && 
                (window.sessionStorage.getItem("digitalQuoteChannel") == "i2b")){
            lpSection = 'source:DigQuote-i2b';
        } else if((typeof window.sessionStorage.getItem("digitalQuoteChannel") != undefined) && 
                (window.sessionStorage.getItem("digitalQuoteChannel") == "d2d")){
            lpSection.push('source:DigQuote-' + window.sessionStorage.getItem("digitalQuoteChannel"));            
        } else {
            //DIGITAL QUOTE_Prospect- New Chat treatment for Digital Quote showing error in I2B and d2d - BOVV-95900
            if((typeof window.sessionStorage.getItem("isDigitalQuote") != undefined) && (window.sessionStorage.getItem("isDigitalQuote") == "true")){
                lpSection.push('source:DigQuote');
            }
        }

        //Strore Locator enhancement - Yext Referral Traffic Sync
        if((typeof window.sessionStorage.getItem("Consumer-referral-storeintercept") != undefined) && (window.sessionStorage.getItem("Consumer-referral-storeintercept") != null) && 
            window.sessionStorage.getItem("Consumer-referral-storeintercept").indexOf("yes") >= 0){
            // lpSection.push('product:one-talk');
            lpSection  = ['Consumer-referral-storeintercept:yes']
        }

        //My-LINK:  Suppress Chat for My-Link Traffic - POLPROS-163
        if((typeof window.sessionStorage.getItem("prospectOriginFLow") != undefined) && (window.sessionStorage.getItem("prospectOriginFLow") == "myLink")){
            lpSection.push('source:myLink');
        }

        //AGENT-LINK:  Suppress Chat for Agent-Link Traffic - POLPROS-542
        if((typeof window.sessionStorage.getItem("prospectOriginFLow") != undefined) && (window.sessionStorage.getItem("prospectOriginFLow") == "agentLink")){
            lpSection.push('source:agentLink');
        }

        return lpSection;       

    } catch (Err) {
        console.log('manipulateLpTagSections Error:', Err);
    }
}

var lpUtils = {
    hideInput: function hideInput() {
        // Let DOM render
        setTimeout(function hideInputField() {
            if(document.getElementsByClassName('lpview_bottom_container') != null && 
                    document.getElementsByClassName('lpview_bottom_container').length > 0){
                document.getElementsByClassName('lpview_bottom_container')[0].style.display = 'none';
            }            
        }, 100);
    },
    showInput: function showInput() {
        setTimeout(function showInputField() {
            if(document.getElementsByClassName('lpview_bottom_container') != null && 
                    document.getElementsByClassName('lpview_bottom_container').length > 0){
                document.getElementsByClassName('lpview_bottom_container')[0].style.display = 'block';
            }
        }, 100);
    },
    includesWithin: function getUnifiedExperience(list, item) {
        return list.indexOf(item) !== -1;
    }
}

function conversationInformationHandler(data) {
    if (data.skill) {
        // If we have a skill, the conversation has started and welcome message is not displayed anymore
        var isCurrentSkill = lpUtils.includesWithin(lpUtilConfig.unifiedRoutingSkills, data.skill);

        if (isCurrentSkill) {
            lpUtils.hideInput();
        } else {
            lpUtils.showInput();
        }
    }
}
function hideShowInputField() {
   // Bind event
   window.lpTag.events.bind('lpUnifiedWindow', 'conversationInfo', conversationInformationHandler);
   window.lpTag.hooks.push({
       name: 'AFTER_GET_LINES',
       callback: function(options) {
           // Filter every line, look for welcome message or not current skill and hide/show input
           options.data.lines.forEach(function(line) {

               // Filter out every line that is sent by the system or is part of previous history
               if (line.source === 'system' || line.history) return;

               // Check if the unified experience
               var isUnifiedExperience = lpUtils.includesWithin(lpUtilConfig.unifiedWelcomeMessage, line.text);

               //Check if the user need input box
               if (line.text.includes('[:::showinput:::]')) {
                   var dialog = line.text.split('[:::showinput:::]')
                   console.log(dialog);
                   line.text = dialog.length > 0 && dialog[1] ? dialog[1] : 'Please provide some additional information';
                   lpUtils.showInput();
               }

               // Hide input if line is welcome message and show if not current skill
               if ((line.isWelcomeMessage && isUnifiedExperience)) {
                   lpUtils.hideInput();
               }

           });
       },
   });
}

function modifySectionOnSupportPagesChange() {
    window.addEventListener('click', function () {
        var currUrl = window.location.href;
        if (lpSectionInitiatedUrl !== currUrl) {
            if (currUrl.indexOf("business/contact-us/?wireless") >= 0) {
                lpTag.newPage(currUrl, {
                    section: ['BUSINESS', 'CONTACT-US', 'WIRELESS']
                });
            } else if (currUrl.indexOf("business/contact-us/?small") >= 0) {
                lpTag.newPage(currUrl, {
                    section: ['BUSINESS', 'CONTACT-US', 'SMALL']
                });
            } else if (currUrl.indexOf("business/contact-us/?medium") >= 0) {
                lpTag.newPage(currUrl, {
                    section: ['BUSINESS', 'CONTACT-US', 'MEDIUM']
                });
            } else if (currUrl.indexOf("business/contact-us/?enterprise") >= 0) {
                lpTag.newPage(currUrl, {
                    section: ['BUSINESS', 'CONTACT-US', 'ENTERPRISE']
                });
            }
            lpSectionInitiatedUrl = currUrl;
        }
    });
}


//manipulateLpTagSections();
// modifySectionOnSupportPageChange();
// hideShowInputField(); 

window.addEventListener('click', function () {
    try {
        
        var resetIntervalForNewPage = 2000;
        //It will be removed once this logic will be moved into LP configuration
        if (window.location.href.indexOf("business-info") >= 0 || window.location.href.indexOf("verifyBusiness") >= 0) {
            resetIntervalForNewPage = 5000;
        }
        
        setTimeout(function() {
            var currUrl = window.location.href;
            if (lpSectionInitiatedUrl !== currUrl) {
                lpSection = [];
                var pageSections = manipulateLpTagSections();
                lpSection = pageSections.concat(deviceType());
                // If autoopen timer is running or has ran, we clear the timeout
                if (lpAutoOpenWindowState.autoOpenInProgress) {
                    lpAutoOpenWindowState.autoOpenInProgress = false;
                    lpAutoOpenWindowState.autoOpenMsgWindowDivClicked = false;
                    window.clearTimeout(lpAutoOpenWindowState.autoOpenTimerRun);
                }

                fireNewPageEvent(currUrl, lpSection);
                lpSectionInitiatedUrl = currUrl;
                preEmptiveLeave();
            }
        }, resetIntervalForNewPage);
    } catch(e){
        console.log('Issue on updating Setions on navigation', Err);
    }        
});

var _newPageTry =0;
function fireNewPageEvent(curl, csection){
    try {
        if(typeof window['lpTag'] == 'undefined' && _newPageTry <10){
			_newPageTry =  _newPageTry+1;
            window.setTimeout(function() {
                fireNewPageEvent(curl, csection);
            }, 300);
        } else{
            lpTag.newPage(curl, {
                section: csection
            });
            _newPageTry = 0;
        }
    } catch (Err) {
        console.log('Window.lpTag not rendered');
    }
}

function LPAddTextChatButton() {
    try {
        var currUrl = window.location.href;
        var pageSections = manipulateLpTagSections();
        lpSection = pageSections.concat(deviceType());
        // If autoopen timer is running or has ran, we clear the timeout
        if (lpAutoOpenWindowState.autoOpenInProgress) {
            lpAutoOpenWindowState.autoOpenInProgress = false;
            lpAutoOpenWindowState.autoOpenMsgWindowDivClicked = false;
            window.clearTimeout(lpAutoOpenWindowState.autoOpenTimerRun);
        }
        lpTag.newPage(currUrl, {
            section: lpSection
        });
    } catch (e) {
        console.log('Issue on triggering Click Event on Chat Link', Err);
    }
}

window.addEventListener('popstate', function(){
    try {
        setTimeout(function() {
            var currUrl = window.location.href;
            if (lpSectionInitiatedUrl !== currUrl) {
                lpSection = [];
                var pageSections = manipulateLpTagSections();
                lpSection = pageSections.concat(deviceType());
                // If autoopen timer is running or has ran, we clear the timeout
                if (lpAutoOpenWindowState.autoOpenInProgress) {
                    lpAutoOpenWindowState.autoOpenInProgress = false;
                    lpAutoOpenWindowState.autoOpenMsgWindowDivClicked = false;
                    window.clearTimeout(lpAutoOpenWindowState.autoOpenTimerRun);
                }
                fireNewPageEvent(currUrl, lpSection);
                lpSectionInitiatedUrl = currUrl;
                preEmptiveLeave();
            }
        }, 2000);
    } catch(e){
        console.log('Issue on updating Setions on navigation', Err);
    }
});

function getLPSectionData() {
    try {
        // To determine if the URL is Wireles or Wireline
        //lpTag.section = document.location.host.indexOf('verizonwireless') > -1 ? ['l1:wireless'] : ['l1:wireline'];

        // var lpTag = window.lpTag;
        lpSection = [];
        var actualPathName = document.location.pathname;
        var paths = actualPathName.replace('mbt/prospect', 'business').split("/").filter(Boolean);
        if (window.location.href.indexOf('localhost') >= 0) {
            // we dont have mbt/prospect in localhost
            paths = ('business/' + actualPathName).split('/').filter(Boolean);
        }
        for (var i = 0; i < paths.length; i++) {
            var currentPath = paths[i];
            if (currentPath) {
                lpSection.push("l" + (i + 2) + ":" + currentPath);
            }
        }
        if((window.location.href.indexOf('/5g/') == -1) && window.sessionStorage.getItem("_currentFlow") == "5g"){
            lpSection.push('product:5g');
        } else if((window.location.href.indexOf('/4g/') == -1) && window.sessionStorage.getItem("_currentFlow") == "4g"){
            lpSection.push('product:4g');
        } else if((window.location.href.indexOf('/one-talk') == -1) && window.sessionStorage.getItem("_currentFlow") == "one-talk"){
            lpSection.push('product:one-talk');
        }
        return lpSection;
    } catch (Err) {
        console.log('manipulateLpTagSections Error:', Err);
    }
}


/*!
 * UAParser.js v0.7.24
 * Lightweight JavaScript-based User-Agent string parser
 * https://github.com/faisalman/ua-parser-js
 *
 * Copyright ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© 2012-2021 Faisal Salman <f@faisalman.com>
 * Licensed under MIT License
 */
(function (window, undefined) {
    "use strict";
    var LIBVERSION = "0.7.24",
        EMPTY = "",
        UNKNOWN = "?",
        FUNC_TYPE = "function",
        UNDEF_TYPE = "undefined",
        OBJ_TYPE = "object",
        STR_TYPE = "string",
        MAJOR = "major",
        MODEL = "model",
        NAME = "name",
        TYPE = "type",
        VENDOR = "vendor",
        VERSION = "version",
        ARCHITECTURE = "architecture",
        CONSOLE = "console",
        MOBILE = "mobile",
        TABLET = "tablet",
        SMARTTV = "smarttv",
        WEARABLE = "wearable",
        EMBEDDED = "embedded";
    var util = { extend: function (regexes, extensions) { var mergedRegexes = {}; for (var i in regexes) { if (extensions[i] && extensions[i].length % 2 === 0) { mergedRegexes[i] = extensions[i].concat(regexes[i]) } else { mergedRegexes[i] = regexes[i] } } return mergedRegexes }, has: function (str1, str2) { if (typeof str1 === "string") { return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1 } else { return false } }, lowerize: function (str) { return str.toLowerCase() }, major: function (version) { return typeof version === STR_TYPE ? version.replace(/[^\d\.]/g, "").split(".")[0] : undefined }, trim: function (str) { return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "") } };
    var mapper = {
        rgx: function (ua, arrays) {
            var i = 0,
                j, k, p, q, matches, match;
            while (i < arrays.length && !matches) {
                var regex = arrays[i],
                    props = arrays[i + 1];
                j = k = 0;
                while (j < regex.length && !matches) {
                    matches = regex[j++].exec(ua);
                    if (!!matches) {
                        for (p = 0; p < props.length; p++) {
                            match = matches[++k];
                            q = props[p];
                            if (typeof q === OBJ_TYPE && q.length > 0) { if (q.length == 2) { if (typeof q[1] == FUNC_TYPE) { this[q[0]] = q[1].call(this, match) } else { this[q[0]] = q[1] } } else if (q.length == 3) { if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) { this[q[0]] = match ? q[1].call(this, match, q[2]) : undefined } else { this[q[0]] = match ? match.replace(q[1], q[2]) : undefined } } else if (q.length == 4) { this[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined } } else { this[q] = match ? match : undefined }
                        }
                    }
                }
                i += 2
            }
        },
        str: function (str, map) { for (var i in map) { if (typeof map[i] === OBJ_TYPE && map[i].length > 0) { for (var j = 0; j < map[i].length; j++) { if (util.has(map[i][j], str)) { return i === UNKNOWN ? undefined : i } } } else if (util.has(map[i], str)) { return i === UNKNOWN ? undefined : i } } return str }
    };
    var maps = { browser: { oldsafari: { version: { "1.0": "/8", 1.2: "/1", 1.3: "/3", "2.0": "/412", "2.0.2": "/416", "2.0.3": "/417", "2.0.4": "/419", "?": "/" } } }, device: { amazon: { model: { "Fire Phone": ["SD", "KF"] } }, sprint: { model: { "Evo Shift 4G": "7373KT" }, vendor: { HTC: "APA", Sprint: "Sprint" } } }, os: { windows: { version: { ME: "4.90", "NT 3.11": "NT3.51", "NT 4.0": "NT4.0", 2000: "NT 5.0", XP: ["NT 5.1", "NT 5.2"], Vista: "NT 6.0", 7: "NT 6.1", 8: "NT 6.2", 8.1: "NT 6.3", 10: ["NT 6.4", "NT 10.0"], RT: "ARM" } } } };
    var regexes = {
        browser: [
            [/(opera\smini)\/([\w\.-]+)/i, /(opera\s[mobiletab]{3,6}).+version\/([\w\.-]+)/i, /(opera).+version\/([\w\.]+)/i, /(opera)[\/\s]+([\w\.]+)/i],
            [NAME, VERSION],
            [/(opios)[\/\s]+([\w\.]+)/i],
            [
                [NAME, "Opera Mini"], VERSION
            ],
            [/\s(opr)\/([\w\.]+)/i],
            [
                [NAME, "Opera"], VERSION
            ],
            [/(kindle)\/([\w\.]+)/i, /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]*)/i, /(avant\s|iemobile|slim)(?:browser)?[\/\s]?([\w\.]*)/i, /(bidubrowser|baidubrowser)[\/\s]?([\w\.]+)/i, /(?:ms|\()(ie)\s([\w\.]+)/i, /(rekonq)\/([\w\.]*)/i, /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon)\/([\w\.-]+)/i],
            [NAME, VERSION],
            [/(konqueror)\/([\w\.]+)/i],
            [
                [NAME, "Konqueror"], VERSION
            ],
            [/(trident).+rv[:\s]([\w\.]{1,9}).+like\sgecko/i],
            [
                [NAME, "IE"], VERSION
            ],
            [/(edge|edgios|edga|edg)\/((\d+)?[\w\.]+)/i],
            [
                [NAME, "Edge"], VERSION
            ],
            [/(yabrowser)\/([\w\.]+)/i],
            [
                [NAME, "Yandex"], VERSION
            ],
            [/(Avast)\/([\w\.]+)/i],
            [
                [NAME, "Avast Secure Browser"], VERSION
            ],
            [/(AVG)\/([\w\.]+)/i],
            [
                [NAME, "AVG Secure Browser"], VERSION
            ],
            [/(puffin)\/([\w\.]+)/i],
            [
                [NAME, "Puffin"], VERSION
            ],
            [/(focus)\/([\w\.]+)/i],
            [
                [NAME, "Firefox Focus"], VERSION
            ],
            [/(opt)\/([\w\.]+)/i],
            [
                [NAME, "Opera Touch"], VERSION
            ],
            [/((?:[\s\/])uc?\s?browser|(?:juc.+)ucweb)[\/\s]?([\w\.]+)/i],
            [
                [NAME, "UCBrowser"], VERSION
            ],
            [/(comodo_dragon)\/([\w\.]+)/i],
            [
                [NAME, /_/g, " "], VERSION
            ],
            [/(windowswechat qbcore)\/([\w\.]+)/i],
            [
                [NAME, "WeChat(Win) Desktop"], VERSION
            ],
            [/(micromessenger)\/([\w\.]+)/i],
            [
                [NAME, "WeChat"], VERSION
            ],
            [/(brave)\/([\w\.]+)/i],
            [
                [NAME, "Brave"], VERSION
            ],
            [/(whale)\/([\w\.]+)/i],
            [
                [NAME, "Whale"], VERSION
            ],
            [/(qqbrowserlite)\/([\w\.]+)/i],
            [NAME, VERSION],
            [/(QQ)\/([\d\.]+)/i],
            [NAME, VERSION],
            [/m?(qqbrowser)[\/\s]?([\w\.]+)/i],
            [NAME, VERSION],
            [/(baiduboxapp)[\/\s]?([\w\.]+)/i],
            [NAME, VERSION],
            [/(2345Explorer)[\/\s]?([\w\.]+)/i],
            [NAME, VERSION],
            [/(MetaSr)[\/\s]?([\w\.]+)/i],
            [NAME],
            [/(LBBROWSER)/i],
            [NAME],
            [/xiaomi\/miuibrowser\/([\w\.]+)/i],
            [VERSION, [NAME, "MIUI Browser"]],
            [/;fbav\/([\w\.]+);/i],
            [VERSION, [NAME, "Facebook"]],
            [/FBAN\/FBIOS|FB_IAB\/FB4A/i],
            [
                [NAME, "Facebook"]
            ],
            [/safari\s(line)\/([\w\.]+)/i, /android.+(line)\/([\w\.]+)\/iab/i],
            [NAME, VERSION],
            [/headlesschrome(?:\/([\w\.]+)|\s)/i],
            [VERSION, [NAME, "Chrome Headless"]],
            [/\swv\).+(chrome)\/([\w\.]+)/i],
            [
                [NAME, /(.+)/, "$1 WebView"], VERSION
            ],
            [/((?:oculus|samsung)browser)\/([\w\.]+)/i],
            [
                [NAME, /(.+(?:g|us))(.+)/, "$1 $2"], VERSION
            ],
            [/android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)*/i],
            [VERSION, [NAME, "Android Browser"]],
            [/(coc_coc_browser)\/([\w\.]+)/i],
            [
                [NAME, "Coc Coc"], VERSION
            ],
            [/(sailfishbrowser)\/([\w\.]+)/i],
            [
                [NAME, "Sailfish Browser"], VERSION
            ],
            [/(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i],
            [NAME, VERSION],
            [/(dolfin)\/([\w\.]+)/i],
            [
                [NAME, "Dolphin"], VERSION
            ],
            [/(qihu|qhbrowser|qihoobrowser|360browser)/i],
            [
                [NAME, "360 Browser"]
            ],
            [/((?:android.+)crmo|crios)\/([\w\.]+)/i],
            [
                [NAME, "Chrome"], VERSION
            ],
            [/(coast)\/([\w\.]+)/i],
            [
                [NAME, "Opera Coast"], VERSION
            ],
            [/fxios\/([\w\.-]+)/i],
            [VERSION, [NAME, "Firefox"]],
            [/version\/([\w\.]+)\s.*mobile\/\w+\s(safari)/i],
            [VERSION, [NAME, "Mobile Safari"]],
            [/version\/([\w\.]+)\s.*(mobile\s?safari|safari)/i],
            [VERSION, NAME],
            [/webkit.+?(gsa)\/([\w\.]+)\s.*(mobile\s?safari|safari)(\/[\w\.]+)/i],
            [
                [NAME, "GSA"], VERSION
            ],
            [/webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i],
            [NAME, [VERSION, mapper.str, maps.browser.oldsafari.version]],
            [/(webkit|khtml)\/([\w\.]+)/i],
            [NAME, VERSION],
            [/(navigator|netscape)\/([\w\.-]+)/i],
            [
                [NAME, "Netscape"], VERSION
            ],
            [/(swiftfox)/i, /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i, /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([\w\.-]+)$/i, /(firefox)\/([\w\.]+)\s[\w\s\-]+\/[\w\.]+$/i, /(mozilla)\/([\w\.]+)\s.+rv\:.+gecko\/\d+/i, /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir)[\/\s]?([\w\.]+)/i, /(links)\s\(([\w\.]+)/i, /(gobrowser)\/?([\w\.]*)/i, /(ice\s?browser)\/v?([\w\._]+)/i, /(mosaic)[\/\s]([\w\.]+)/i],
            [NAME, VERSION]
        ],
        cpu: [
            [/(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i],
            [
                [ARCHITECTURE, "amd64"]
            ],
            [/(ia32(?=;))/i],
            [
                [ARCHITECTURE, util.lowerize]
            ],
            [/((?:i[346]|x)86)[;\)]/i],
            [
                [ARCHITECTURE, "ia32"]
            ],
            [/windows\s(ce|mobile);\sppc;/i],
            [
                [ARCHITECTURE, "arm"]
            ],
            [/((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i],
            [
                [ARCHITECTURE, /ower/, "", util.lowerize]
            ],
            [/(sun4\w)[;\)]/i],
            [
                [ARCHITECTURE, "sparc"]
            ],
            [/((?:avr32|ia64(?=;))|68k(?=\))|arm(?:64|(?=v\d+[;l]))|(?=atmel\s)avr|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i],
            [
                [ARCHITECTURE, util.lowerize]
            ]
        ],
        device: [
            [/\((ipad|playbook);[\w\s\),;-]+(rim|apple)/i],
            [MODEL, VENDOR, [TYPE, TABLET]],
            [/applecoremedia\/[\w\.]+ \((ipad)/],
            [MODEL, [VENDOR, "Apple"],
                [TYPE, TABLET]
            ],
            [/(apple\s{0,1}tv)/i],
            [
                [MODEL, "Apple TV"],
                [VENDOR, "Apple"],
                [TYPE, SMARTTV]
            ],
            [/(archos)\s(gamepad2?)/i, /(hp).+(touchpad)/i, /(hp).+(tablet)/i, /(kindle)\/([\w\.]+)/i, /\s(nook)[\w\s]+build\/(\w+)/i, /(dell)\s(strea[kpr\s\d]*[\dko])/i],
            [VENDOR, MODEL, [TYPE, TABLET]],
            [/(kf[A-z]+)(\sbuild\/|\)).+silk\//i],
            [MODEL, [VENDOR, "Amazon"],
                [TYPE, TABLET]
            ],
            [/(sd|kf)[0349hijorstuw]+(\sbuild\/|\)).+silk\//i],
            [
                [MODEL, mapper.str, maps.device.amazon.model],
                [VENDOR, "Amazon"],
                [TYPE, MOBILE]
            ],
            [/android.+aft([\w])(\sbuild\/|\))/i],
            [MODEL, [VENDOR, "Amazon"],
                [TYPE, SMARTTV]
            ],
            [/\((ip[honed|\s\w*]+);.+(apple)/i],
            [MODEL, VENDOR, [TYPE, MOBILE]],
            [/\((ip[honed|\s\w*]+);/i],
            [MODEL, [VENDOR, "Apple"],
                [TYPE, MOBILE]
            ],
            [/(blackberry)[\s-]?(\w+)/i, /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[\s_-]?([\w-]*)/i, /(hp)\s([\w\s]+\w)/i, /(asus)-?(\w+)/i],
            [VENDOR, MODEL, [TYPE, MOBILE]],
            [/\(bb10;\s(\w+)/i],
            [MODEL, [VENDOR, "BlackBerry"],
                [TYPE, MOBILE]
            ],
            [/android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7|padfone|p00c)/i],
            [MODEL, [VENDOR, "Asus"],
                [TYPE, TABLET]
            ],
            [/(sony)\s(tablet\s[ps])\sbuild\//i, /(sony)?(?:sgp.+)\sbuild\//i],
            [
                [VENDOR, "Sony"],
                [MODEL, "Xperia Tablet"],
                [TYPE, TABLET]
            ],
            [/android.+\s([c-g]\d{4}|so[-l]\w+)(?=\sbuild\/|\).+chrome\/(?![1-6]{0,1}\d\.))/i],
            [MODEL, [VENDOR, "Sony"],
                [TYPE, MOBILE]
            ],
            [/\s(ouya)\s/i, /(nintendo)\s([wids3u]+)/i],
            [VENDOR, MODEL, [TYPE, CONSOLE]],
            [/android.+;\s(shield)\sbuild/i],
            [MODEL, [VENDOR, "Nvidia"],
                [TYPE, CONSOLE]
            ],
            [/(playstation\s[34portablevi]+)/i],
            [MODEL, [VENDOR, "Sony"],
                [TYPE, CONSOLE]
            ],
            [/(sprint\s(\w+))/i],
            [
                [VENDOR, mapper.str, maps.device.sprint.vendor],
                [MODEL, mapper.str, maps.device.sprint.model],
                [TYPE, MOBILE]
            ],
            [/(htc)[;_\s-]{1,2}([\w\s]+(?=\)|\sbuild)|\w+)/i, /(zte)-(\w*)/i, /(alcatel|geeksphone|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]*)/i],
            [VENDOR, [MODEL, /_/g, " "],
                [TYPE, MOBILE]
            ],
            [/(nexus\s9)/i],
            [MODEL, [VENDOR, "HTC"],
                [TYPE, TABLET]
            ],
            [/d\/huawei([\w\s-]+)[;\)]/i, /android.+\s(nexus\s6p|vog-[at]?l\d\d|ane-[at]?l[x\d]\d|eml-a?l\d\da?|lya-[at]?l\d[\dc]|clt-a?l\d\di?)/i],
            [MODEL, [VENDOR, "Huawei"],
                [TYPE, MOBILE]
            ],
            [/android.+(bah2?-a?[lw]\d{2})/i],
            [MODEL, [VENDOR, "Huawei"],
                [TYPE, TABLET]
            ],
            [/(microsoft);\s(lumia[\s\w]+)/i],
            [VENDOR, MODEL, [TYPE, MOBILE]],
            [/[\s\(;](xbox(?:\sone)?)[\s\);]/i],
            [MODEL, [VENDOR, "Microsoft"],
                [TYPE, CONSOLE]
            ],
            [/(kin\.[onetw]{3})/i],
            [
                [MODEL, /\./g, " "],
                [VENDOR, "Microsoft"],
                [TYPE, MOBILE]
            ],
            [/\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?:?(\s4g)?)[\w\s]+build\//i, /mot[\s-]?(\w*)/i, /(XT\d{3,4}) build\//i, /(nexus\s6)/i],
            [MODEL, [VENDOR, "Motorola"],
                [TYPE, MOBILE]
            ],
            [/android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i],
            [MODEL, [VENDOR, "Motorola"],
                [TYPE, TABLET]
            ],
            [/hbbtv\/\d+\.\d+\.\d+\s+\([\w\s]*;\s*(\w[^;]*);([^;]*)/i],
            [
                [VENDOR, util.trim],
                [MODEL, util.trim],
                [TYPE, SMARTTV]
            ],
            [/hbbtv.+maple;(\d+)/i],
            [
                [MODEL, /^/, "SmartTV"],
                [VENDOR, "Samsung"],
                [TYPE, SMARTTV]
            ],
            [/\(dtv[\);].+(aquos)/i],
            [MODEL, [VENDOR, "Sharp"],
                [TYPE, SMARTTV]
            ],
            [/android.+((sch-i[89]0\d|shw-m380s|SM-P605|SM-P610|SM-P587|gt-p\d{4}|gt-n\d+|sgh-t8[56]9|nexus 10))/i, /((SM-T\w+))/i],
            [
                [VENDOR, "Samsung"], MODEL, [TYPE, TABLET]
            ],
            [/smart-tv.+(samsung)/i],
            [VENDOR, [TYPE, SMARTTV], MODEL],
            [/((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-\w[\w\d]+))/i, /(sam[sung]*)[\s-]*(\w+-?[\w-]*)/i, /sec-((sgh\w+))/i],
            [
                [VENDOR, "Samsung"], MODEL, [TYPE, MOBILE]
            ],
            [/sie-(\w*)/i],
            [MODEL, [VENDOR, "Siemens"],
                [TYPE, MOBILE]
            ],
            [/(maemo|nokia).*(n900|lumia\s\d+)/i, /(nokia)[\s_-]?([\w-]*)/i],
            [
                [VENDOR, "Nokia"], MODEL, [TYPE, MOBILE]
            ],
            [/android[x\d\.\s;]+\s([ab][1-7]\-?[0178a]\d\d?)/i],
            [MODEL, [VENDOR, "Acer"],
                [TYPE, TABLET]
            ],
            [/android.+([vl]k\-?\d{3})\s+build/i],
            [MODEL, [VENDOR, "LG"],
                [TYPE, TABLET]
            ],
            [/android\s3\.[\s\w;-]{10}(lg?)-([06cv9]{3,4})/i],
            [
                [VENDOR, "LG"], MODEL, [TYPE, TABLET]
            ],
            [/linux;\snetcast.+smarttv/i, /lg\snetcast\.tv-201\d/i],
            [
                [VENDOR, "LG"], MODEL, [TYPE, SMARTTV]
            ],
            [/(nexus\s[45])/i, /lg[e;\s\/-]+(\w*)/i, /android.+lg(\-?[\d\w]+)\s+build/i],
            [MODEL, [VENDOR, "LG"],
                [TYPE, MOBILE]
            ],
            [/(lenovo)\s?(s(?:5000|6000)(?:[\w-]+)|tab(?:[\s\w]+))/i],
            [VENDOR, MODEL, [TYPE, TABLET]],
            [/android.+(ideatab[a-z0-9\-\s]+)/i],
            [MODEL, [VENDOR, "Lenovo"],
                [TYPE, TABLET]
            ],
            [/(lenovo)[_\s-]?([\w-]+)/i],
            [VENDOR, MODEL, [TYPE, MOBILE]],
            [/linux;.+((jolla));/i],
            [VENDOR, MODEL, [TYPE, MOBILE]],
            [/((pebble))app\/[\d\.]+\s/i],
            [VENDOR, MODEL, [TYPE, WEARABLE]],
            [/android.+;\s(oppo)\s?([\w\s]+)\sbuild/i],
            [VENDOR, MODEL, [TYPE, MOBILE]],
            [/crkey/i],
            [
                [MODEL, "Chromecast"],
                [VENDOR, "Google"],
                [TYPE, SMARTTV]
            ],
            [/android.+;\s(glass)\s\d/i],
            [MODEL, [VENDOR, "Google"],
                [TYPE, WEARABLE]
            ],
            [/android.+;\s(pixel c)[\s)]/i],
            [MODEL, [VENDOR, "Google"],
                [TYPE, TABLET]
            ],
            [/android.+;\s(pixel( [2-9]a?)?( xl)?)[\s)]/i],
            [MODEL, [VENDOR, "Google"],
                [TYPE, MOBILE]
            ],
            [/android.+;\s(\w+)\s+build\/hm\1/i, /android.+(hm[\s\-_]?note?[\s_]?(?:\d\w)?)\sbuild/i, /android.+(redmi[\s\-_]?(?:note|k)?(?:[\s_]?[\w\s]+))(?:\sbuild|\))/i, /android.+(mi[\s\-_]?(?:a\d|one|one[\s_]plus|note lte)?[\s_]?(?:\d?\w?)[\s_]?(?:plus)?)\sbuild/i],
            [
                [MODEL, /_/g, " "],
                [VENDOR, "Xiaomi"],
                [TYPE, MOBILE]
            ],
            [/android.+(mi[\s\-_]?(?:pad)(?:[\s_]?[\w\s]+))(?:\sbuild|\))/i],
            [
                [MODEL, /_/g, " "],
                [VENDOR, "Xiaomi"],
                [TYPE, TABLET]
            ],
            [/android.+;\s(m[1-5]\snote)\sbuild/i],
            [MODEL, [VENDOR, "Meizu"],
                [TYPE, MOBILE]
            ],
            [/(mz)-([\w-]{2,})/i],
            [
                [VENDOR, "Meizu"], MODEL, [TYPE, MOBILE]
            ],
            [/android.+a000(1)\s+build/i, /android.+oneplus\s(a\d{4})[\s)]/i],
            [MODEL, [VENDOR, "OnePlus"],
                [TYPE, MOBILE]
            ],
            [/android.+[;\/]\s*(RCT[\d\w]+)\s+build/i],
            [MODEL, [VENDOR, "RCA"],
                [TYPE, TABLET]
            ],
            [/android.+[;\/\s](Venue[\d\s]{2,7})\s+build/i],
            [MODEL, [VENDOR, "Dell"],
                [TYPE, TABLET]
            ],
            [/android.+[;\/]\s*(Q[T|M][\d\w]+)\s+build/i],
            [MODEL, [VENDOR, "Verizon"],
                [TYPE, TABLET]
            ],
            [/android.+[;\/]\s+(Barnes[&\s]+Noble\s+|BN[RT])(\S(?:.*\S)?)\s+build/i],
            [
                [VENDOR, "Barnes & Noble"], MODEL, [TYPE, TABLET]
            ],
            [/android.+[;\/]\s+(TM\d{3}.*\b)\s+build/i],
            [MODEL, [VENDOR, "NuVision"],
                [TYPE, TABLET]
            ],
            [/android.+;\s(k88)\sbuild/i],
            [MODEL, [VENDOR, "ZTE"],
                [TYPE, TABLET]
            ],
            [/android.+[;\/]\s*(gen\d{3})\s+build.*49h/i],
            [MODEL, [VENDOR, "Swiss"],
                [TYPE, MOBILE]
            ],
            [/android.+[;\/]\s*(zur\d{3})\s+build/i],
            [MODEL, [VENDOR, "Swiss"],
                [TYPE, TABLET]
            ],
            [/android.+[;\/]\s*((Zeki)?TB.*\b)\s+build/i],
            [MODEL, [VENDOR, "Zeki"],
                [TYPE, TABLET]
            ],
            [/(android).+[;\/]\s+([YR]\d{2})\s+build/i, /android.+[;\/]\s+(Dragon[\-\s]+Touch\s+|DT)(\w{5})\sbuild/i],
            [
                [VENDOR, "Dragon Touch"], MODEL, [TYPE, TABLET]
            ],
            [/android.+[;\/]\s*(NS-?\w{0,9})\sbuild/i],
            [MODEL, [VENDOR, "Insignia"],
                [TYPE, TABLET]
            ],
            [/android.+[;\/]\s*((NX|Next)-?\w{0,9})\s+build/i],
            [MODEL, [VENDOR, "NextBook"],
                [TYPE, TABLET]
            ],
            [/android.+[;\/]\s*(Xtreme\_)?(V(1[045]|2[015]|30|40|60|7[05]|90))\s+build/i],
            [
                [VENDOR, "Voice"], MODEL, [TYPE, MOBILE]
            ],
            [/android.+[;\/]\s*(LVTEL\-)?(V1[12])\s+build/i],
            [
                [VENDOR, "LvTel"], MODEL, [TYPE, MOBILE]
            ],
            [/android.+;\s(PH-1)\s/i],
            [MODEL, [VENDOR, "Essential"],
                [TYPE, MOBILE]
            ],
            [/android.+[;\/]\s*(V(100MD|700NA|7011|917G).*\b)\s+build/i],
            [MODEL, [VENDOR, "Envizen"],
                [TYPE, TABLET]
            ],
            [/android.+[;\/]\s*(Le[\s\-]+Pan)[\s\-]+(\w{1,9})\s+build/i],
            [VENDOR, MODEL, [TYPE, TABLET]],
            [/android.+[;\/]\s*(Trio[\s\w\-\.]+)\s+build/i],
            [MODEL, [VENDOR, "MachSpeed"],
                [TYPE, TABLET]
            ],
            [/android.+[;\/]\s*(Trinity)[\-\s]*(T\d{3})\s+build/i],
            [VENDOR, MODEL, [TYPE, TABLET]],
            [/android.+[;\/]\s*TU_(1491)\s+build/i],
            [MODEL, [VENDOR, "Rotor"],
                [TYPE, TABLET]
            ],
            [/android.+(Gigaset)[\s\-]+(Q\w{1,9})\s+build/i],
            [VENDOR, MODEL, [TYPE, TABLET]],
            [/android .+?; ([^;]+?)(?: build|\) applewebkit).+? mobile safari/i],
            [MODEL, [TYPE, MOBILE]],
            [/android .+?;\s([^;]+?)(?: build|\) applewebkit).+?(?! mobile) safari/i],
            [MODEL, [TYPE, TABLET]],
            [/\s(tablet|tab)[;\/]/i, /\s(mobile)(?:[;\/]|\ssafari)/i],
            [
                [TYPE, util.lowerize], VENDOR, MODEL
            ],
            [/[\s\/\(](smart-?tv)[;\)]/i],
            [
                [TYPE, SMARTTV]
            ],
            [/(android[\w\.\s\-]{0,9});.+build/i],
            [MODEL, [VENDOR, "Generic"]],
            [/(phone)/i],
            [
                [TYPE, MOBILE]
            ]
        ],
        engine: [
            [/windows.+\sedge\/([\w\.]+)/i],
            [VERSION, [NAME, "EdgeHTML"]],
            [/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i],
            [VERSION, [NAME, "Blink"]],
            [/(presto)\/([\w\.]+)/i, /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i, /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i, /(icab)[\/\s]([23]\.[\d\.]+)/i],
            [NAME, VERSION],
            [/rv\:([\w\.]{1,9}).+(gecko)/i],
            [VERSION, NAME]
        ],
        os: [
            [/(xbox);\s+xbox\s([^\);]+)/i, /microsoft\s(windows)\s(vista|xp)/i],
            [NAME, VERSION],
            [/(windows)\snt\s6\.2;\s(arm)/i, /(windows\sphone(?:\sos)*)[\s\/]?([\d\.\s\w]*)/i, /(windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i],
            [NAME, [VERSION, mapper.str, maps.os.windows.version]],
            [/(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i],
            [
                [NAME, "Windows"],
                [VERSION, mapper.str, maps.os.windows.version]
            ],
            [/\((bb)(10);/i],
            [
                [NAME, "BlackBerry"], VERSION
            ],
            [/(blackberry)\w*\/?([\w\.]*)/i, /(tizen|kaios)[\/\s]([\w\.]+)/i, /(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|sailfish|contiki)[\/\s-]?([\w\.]*)/i],
            [NAME, VERSION],
            [/(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]*)/i],
            [
                [NAME, "Symbian"], VERSION
            ],
            [/\((series40);/i],
            [NAME],
            [/mozilla.+\(mobile;.+gecko.+firefox/i],
            [
                [NAME, "Firefox OS"], VERSION
            ],
            [/crkey\/([\d\.]+)/i],
            [VERSION, [NAME, "Chromecast"]],
            [/(nintendo|playstation)\s([wids34portablevu]+)/i, /(mint)[\/\s\(]?(\w*)/i, /(mageia|vectorlinux)[;\s]/i, /(joli|[kxln]?ubuntu|debian|suse|opensuse|gentoo|(?=\s)arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?(?!chrom)([\w\.-]*)/i, /(hurd|linux)\s?([\w\.]*)/i, /(gnu)\s?([\w\.]*)/i],
            [NAME, VERSION],
            [/(cros)\s[\w]+\s([\w\.]+\w)/i],
            [
                [NAME, "Chromium OS"], VERSION
            ],
            [/(sunos)\s?([\w\.\d]*)/i],
            [
                [NAME, "Solaris"], VERSION
            ],
            [/\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]*)/i],
            [NAME, VERSION],
            [/(haiku)\s(\w+)/i],
            [NAME, VERSION],
            [/cfnetwork\/.+darwin/i, /ip[honead]{2,4}(?:.*os\s([\w]+)\slike\smac|;\sopera)/i],
            [
                [VERSION, /_/g, "."],
                [NAME, "iOS"]
            ],
            [/(mac\sos\sx)\s?([\w\s\.]*)/i, /(macintosh|mac(?=_powerpc)\s)/i],
            [
                [NAME, "Mac OS"],
                [VERSION, /_/g, "."]
            ],
            [/((?:open)?solaris)[\/\s-]?([\w\.]*)/i, /(aix)\s((\d)(?=\.|\)|\s)[\w\.])*/i, /(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms|fuchsia)/i, /(unix)\s?([\w\.]*)/i],
            [NAME, VERSION]
        ]
    };
    var UAParser = function (uastring, extensions) {
        if (typeof uastring === "object") {
            extensions = uastring;
            uastring = undefined
        }
        if (!(this instanceof UAParser)) { return new UAParser(uastring, extensions).getResult() }
        var ua = uastring || (window && window.navigator && window.navigator.userAgent ? window.navigator.userAgent : EMPTY);
        var rgxmap = extensions ? util.extend(regexes, extensions) : regexes;
        this.getBrowser = function () {
            var browser = { name: undefined, version: undefined };
            mapper.rgx.call(browser, ua, rgxmap.browser);
            browser.major = util.major(browser.version);
            return browser
        };
        this.getCPU = function () {
            var cpu = { architecture: undefined };
            mapper.rgx.call(cpu, ua, rgxmap.cpu);
            return cpu
        };
        this.getDevice = function () {
            var device = { vendor: undefined, model: undefined, type: undefined };
            mapper.rgx.call(device, ua, rgxmap.device);
            return device
        };
        this.getEngine = function () {
            var engine = { name: undefined, version: undefined };
            mapper.rgx.call(engine, ua, rgxmap.engine);
            return engine
        };
        this.getOS = function () {
            var os = { name: undefined, version: undefined };
            mapper.rgx.call(os, ua, rgxmap.os);
            return os
        };
        this.getResult = function () { return { ua: this.getUA(), browser: this.getBrowser(), engine: this.getEngine(), os: this.getOS(), device: this.getDevice(), cpu: this.getCPU() } };
        this.getUA = function () { return ua };
        this.setUA = function (uastring) { ua = uastring; return this };
        return this
    };
    UAParser.VERSION = LIBVERSION;
    UAParser.BROWSER = { NAME: NAME, MAJOR: MAJOR, VERSION: VERSION };
    UAParser.CPU = { ARCHITECTURE: ARCHITECTURE };
    UAParser.DEVICE = { MODEL: MODEL, VENDOR: VENDOR, TYPE: TYPE, CONSOLE: CONSOLE, MOBILE: MOBILE, SMARTTV: SMARTTV, TABLET: TABLET, WEARABLE: WEARABLE, EMBEDDED: EMBEDDED };
    UAParser.ENGINE = { NAME: NAME, VERSION: VERSION };
    UAParser.OS = { NAME: NAME, VERSION: VERSION };
    if (typeof exports !== UNDEF_TYPE) {
        if (typeof module !== UNDEF_TYPE && module.exports) { exports = module.exports = UAParser }
        exports.UAParser = UAParser
    } else { if (typeof define === "function" && define.amd) { define(function () { return UAParser }) } else if (window) { window.UAParser = UAParser } }
    var $ = window && (window.jQuery || window.Zepto);
    if ($ && !$.ua) {
        var parser = new UAParser;
        $.ua = parser.getResult();
        $.ua.get = function () { return parser.getUA() };
        $.ua.set = function (uastring) { parser.setUA(uastring); var result = parser.getResult(); for (var prop in result) { $.ua[prop] = result[prop] } }
    }
})(typeof window === "object" ? window : this);

initLpChatAfterDomReady();

setTimeout(function() {
    convInfo();
}, 1000);

/*setTimeout(function(){

    var autoMessageWindowOpen = function autoMessageWindowOpen() {
        //Proactive chat Pop-Up

        var maxRetry = 4;
        var autoOpenMsgWindowDivClicked = false;

        var autoOpenWindow = function autoOpenWindow(event, currentRetry) {
            var retry = currentRetry || 0;
            setTimeout(function delay() {
                try {
                    //Try reloading lpTag
                    if (retry >= maxRetry || autoOpenMsgWindowDivClicked) return;
                    var autoOpenMsgWindowDiv = document.getElementById('autoOpenMsgWindow');
                    if (!autoOpenMsgWindowDiv && maxRetry !== 0) throw new Error('Could not find autoOpenMsgWindow');
                    console.log('autoMessageWindow Launched!');
                    autoOpenMsgWindowDiv.click();
                    autoOpenMsgWindowDivClicked = true;
                } catch (error) {
                    if (retry < maxRetry) {
                        autoOpenWindow(event, retry + 1);
                    }
                    if (window.location.href.indexOf("?lpDebug") >= 0) {
                        console.log('lpDebug:autoMessageWindow close not available!');
                    }
                }
            }, 500)
        };

        //Check for LP container
        var autoOpenMsgWindowDisplayHandler = function autoOpenMsgWindowDisplayHandler(data) {
            console.log("data", data);
            if (document.getElementById("autoOpenMsgWindowContainer")) {
                autoOpenWindow();
            }
        };

        window.setTimeout(function() {
            if(window.lpTag){
                try {
                    window.lpTag.events.bind('LP_OFFERS', 'OFFER_DISPLAY', autoOpenMsgWindowDisplayHandler);
                } catch (err) {
                    console.log("Error occured in invoking lpTag auto enable");
                }
            }

        }, 3000);
    };
    autoMessageWindowOpen();
}, 3000);*/

var autoOpenWindow = function autoOpenWindow(currentRetry) {
    var retry = currentRetry || 0;

    lpAutoOpenWindowState.autoOpenInProgress = true;
    lpAutoOpenWindowState.autoOpenTimerRun = setTimeout(function delay() {
        try {
            //Try reloading lpTag
            if (retry >= lpAutoOpenWindowState.maxRetry || lpAutoOpenWindowState.autoOpenMsgWindowDivClicked) return;
            var autoOpenMsgWindowDiv = document.getElementById('autoOpenMsgWindow');
            //AO suppress logic            
            if(getAOsuppressForLPCookie("AOsuppressLPcookie") != ''){
                console.log("Already user closed this window");
                return;
            }

            if (!autoOpenMsgWindowDiv && lpAutoOpenWindowState.maxRetry !== 0) throw new Error('Could not find autoOpenMsgWindow');
            console.log('autoMessageWindow Launched!', lpAutoOpenWindowState);
            autoOpenMsgWindowDiv.click();
            lpAutoOpenWindowState.autoOpenMsgWindowDivClicked = true;
            lpAutoOpenWindowState.autoOpenInProgress = false;
        } catch (error) {
            if (retry < lpAutoOpenWindowState.maxRetry) {
                autoOpenWindow(retry + 1);
            }
            if (window.location.href.indexOf("?lpDebug") >= 0) {
                console.log('AutoOpenScript: autoMessageWindow close not available!');
            }
        }
    }, lpAutoOpenWindowState.autoOpenTimer * 1000);
};

function getAOTimer(engName) {
    try {
		var findTimeRegex = /\b\d{0,3}s/g;
        var aoTimer = engName.match(findTimeRegex);

        // If no regex match, return 0
        if (aoTimer.length === 0) return 0;
        var time = aoTimer[0].replace('s', '');
        return parseInt(time);
    } catch (e) {
        console.log(e)
            //Default AO fallback timer 
        return 30;
    }
}

//Check for LP container
var autoOpenMsgWindowDisplayHandler = function autoOpenMsgWindowDisplayHandler(data) {
    var engagementName = data.engagementName;
    if (engagementName.toLowerCase().includes('ao')) {
        lpAutoOpenWindowState.autoOpenTimer = getAOTimer(engagementName);
        if (document.getElementById("autoOpenMsgWindowContainer")) {
            autoOpenWindow(0);
        } else {
            console.log('AutoOpenScript Error - autoOpenMsgWindowContainer not found!!')
        }
    } else if (engagementName.toLowerCase().includes('sales-off-hours')) {
        console.log('ABC/GBM off hours enagemetn found!');
        if (document.getElementById("lpMsgContainer")) {
            var href = document.getElementById("lpMsgContainer").getElementsByTagName("a")[0].href;
            var newHref = href.replace('currentURL', encodeURIComponent(document.URL));
            console.log(newHref);
            document.getElementById("lpMsgContainer").getElementsByTagName("a")[0].href = newHref;
        }
    }
};

function livePersonScriptHandler() {
    if (window.lpTag && window.lpTag.events && window.lpTag.events.bind) {
        try {
            window.lpTag.events.bind('LP_OFFERS', 'OFFER_DISPLAY', autoOpenMsgWindowDisplayHandler);
            window.lpTag.events.bind('lpUnifiedWindow', 'conversationInfo', captureChatConvId);
            window.lpTag.events.bind({ eventName: "windowClosed", appName: "lpUnifiedWindow", func: this.windowClosedCallback, context: this });
        } catch (err) {
            console.log(err)
            console.log("AutoOpenScript Error occured in invoking lpTag auto enable");
        }
    } else {
        setTimeout(livePersonScriptHandler, 100);
    }
}

function captureChatConvId(data){
    //POLPROS - 190: Chat Digital Influenced: (Prospect): Capture Chat Conversation ID Via Browser Storage
    try{
        if (data && data.conversationId) {
            console.log(data.conversationId);              
            window.localStorage.setItem("vzw_prospect_conversation_id", data.conversationId);
            console.log("vzw_prospect_conversation_id-->" + window.localStorage.getItem("vzw_prospect_conversation_id"));
        }
    } catch (err) {
        console.log(err)
        console.log("Error on setting  conversationId");
    }    
}

function windowClosedCallback(){
    setAOsuppressForLPCookie("AOsuppressLPcookie", true, 20);
}
//Check this method while initiating AO
function getAOsuppressForLPCookie(cookieName) { 
    try{
        var name = cookieName + "="; 
        var ca = document.cookie.split(";"); 
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i]; while (c.charAt(0) == " ") { 
                c = c.substring(1) 
            } 
            if (c.indexOf(name) == 0) { 
                return c.substring(name.length, c.length) 
            } 
        } 
        return "";
    } catch (e) {
        console.log(e, 'getAOsuppressForLPCookie error');
    }
     
}
function setAOsuppressForLPCookie(cookieName, cookieValue, exMins) { 
    try{
        var d = new Date; 
        console.log("current time =" + d); 
        var milliSecs = exMins * 60 * 1e3; d.setTime(d.getTime() + milliSecs); 
        console.log("cookie expires =" + d); 
        var expires = "expires=" + d.toUTCString(); 
        var domainStr = window.location.host; 
        var domain = ""; 
        if (domainStr && domainStr.length > 0) { 
            domain = "domain=" + domainStr 
        } 
        document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/" + ";" + domain;
    } catch (e) {
        console.log(e, 'setAOsuppressForLPCookie error');
    }     
}

livePersonScriptHandler();

function preEmptiveLeave() {
    var isPreEmptiveUrls = lpUtils.includesWithin(lpUtilConfig.preemptiveUrls, window.location.href);
    if(isPreEmptiveUrls) {
        document.body.addEventListener('mouseout', function(event) {
            try {
                if (typeof lpTag != 'undefined' && lpTag != null && Object.keys(lpTag).length != 0) {
                    if (event.clientY <= 50 && lpTag && lpTag.section && lpTag.section.indexOf('preemptiveLeave') <= -1) {
                        console.log('preemptive event triggered');
                        var section = (lpTag && lpTag.section) || [];
                        section.push('preemptiveLeave');
                        lpTag.newPage(document.URL, {
                            section: section
                        })
                    }
                }
            } catch (e) {
                console.log(e, 'preemptive error');
            }
        });
    }
}

window.setTimeout(function() {
	if(window.lpTag){
			try {
				isLpTagRendered(hideShowInputField);					
			} catch (err) {
					console.log("Error occured in invoking lpTag auto enable");
			}
	}
}, 3000);

function isLpTagRendered(callback){
	try {
		if(typeof window[lpTag] == undefined){
			window.setTimeout(function() {
				isLpTagRendered(callback);
			}, 300);
		} else{
			callback();
		}
	} catch (Err) {
        console.log('Window.lpTag not rendered');
    }
}

function showLpServiceNumberModal(){
    var coBrowseeSNDiv = document.createElement('div');
    coBrowseeSNDiv.id = "lpServiceNumber";
    coBrowseeSNDiv.innerHTML = '<div id="lpServiceNumber" class="Modal-container is-active pos-fixed">' +
                '<div class="Modal-overlay is-active"></div>' +
                '<div class="Modal is-active compare-model mt-0">' +
                '<button id="lpServiceNumberCloseModal" aria-label="Close modal" class="Modal-close">' +
                '</button>' +

                '<header class="Modal-header u-marginBottomMedium">' +
                '<div class="Grid">' +
                '	<div class="Col Col--lg10 Col--md10 Col--sm11 Col--xs11">' +
                '		<h3 _ngcontent-prospectapp-c109="" tabindex="0" class="font-20 u-textLineHeightTight">CoBrowse Invitation</h3>' +
                '	</div>' +
                '</div><br>' +
                '		<div tabindex="0">Please enter otp / service number </div><br>' +
                '<input type="text" id="lpServiceNumberInput" style="width:300px; height:30px;" name="lpServiceNumber" required minlength="6" maxlength="12" size="10">'+
                '<div id="invalidServiceNumber" style="color:red; display:none;">Invalid otp/service number </div><br>' +
                '</header>' +

                '<footer class="Modal-footer">' +
                '<button id="lpServiceNumberVerifyBtn" class="bold u-marginAllMedium u-marginLeftNone px__sm--24 btn-fw">Start Cobrowse</button>' +
                '<button id="lpServiceNumberCancelBtn" abindex="0" data-loc="Content:Button:Existing" class="Button--secondary u-marginAllMedium bold px__sm--24 btn-fw">Cancel</button>' +
                '</footer>' +
                '</div></div>';
    document.body.appendChild(coBrowseeSNDiv);

    document.getElementById('lpServiceNumberVerifyBtn').addEventListener('click', function() {
        var serviceIdEle = document.getElementById('lpServiceNumberInput');
        if (serviceIdEle != null && serviceIdEle.value) {
            requestCobrowse(serviceIdEle.value);
        }
    });
    
    document.getElementById('lpServiceNumberCloseModal').addEventListener('click', function() {
        closeLpServiceNumberModal();
        preventDefault();
    });
    
    document.getElementById('lpServiceNumberCancelBtn').addEventListener('click', function() {
        closeLpServiceNumberModal();
        preventDefault();
    });
}

function closeLpServiceNumberModal(){
    var lpServiceNumebEle = document.getElementById('lpServiceNumber');
    lpServiceNumebEle.parentNode.removeChild(lpServiceNumebEle);
}

function requestCobrowse(serviceId) {
 lpTag.taglets.cobrowse.loadApi(function (visitorApi) {
     console.log("CoBrowse visitor API loaded");
     visitorApi.once("sessionRejected", function () {
         //alert("The service number is invalid.");
         //Displaying error msg
         var invalidServiceNumberEle = document.getElementById('invalidServiceNumber');
         invalidServiceNumberEle.style.display = "block";
     });
     visitorApi.once("sessionOffered", function (event) {
         console.log("Agent answered the request and offers a CoBrowse session");
         //Hiding Error Msgs
         var invalidServiceNumberEle = document.getElementById('invalidServiceNumber');
         invalidServiceNumberEle.style.display = "none";

         var automaticallyAcceptOffer = true; // Set to false if you would like to ask the visitor to confirm the session start.
         if (automaticallyAcceptOffer || confirm("Would you like to start a CoBrowse session with '" + event.agentAlias + "'?")) {
             visitorApi.acceptSupportOffer(event);
         } else {
             visitorApi.cancelSupportOffer(event);
         }
         closeLpServiceNumberModal();
         preventDefault();
     });
     function sessionReadyCallback(startEvent) {
         if (startEvent) {
             console.log("Session is ready and will be started shortly.");
         }
     }
     visitorApi.requestSupport({serviceId: serviceId}, sessionReadyCallback);
 });
}