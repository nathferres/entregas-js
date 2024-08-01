(function (evolv, client, context, collect, mutate) {
  evolv.javascript = evolv.javascript || {};
  evolv.javascript.variants = evolv.javascript.variants || {};
  evolv.javascript.variants["evolv_web_n34s32jld_96kry2ym5"] = function (resolve, reject) {
    window.evolvTrack('opt326_multi', '01_01');

// see scratch file in the repo for some work/notes done before pivoting to remove pricing

// currently relying on elements added via softcode
// will need to be refactored/rebuilt once hardcoded

// this is a new version of a variant previously tested (5.1 from opt306)

// thumbnails are background images on PDP
function getThumbnailSRC () {
  var firstThumbnail = document.querySelector('[class*="PDPCarousel"] .slotContainer:first-child [class*="OuterTileContainer-VDS"]');
  if(!firstThumbnail) return false;
  
  var backgroundStyle = window.getComputedStyle(firstThumbnail).getPropertyValue('background-image');
  if(!backgroundStyle || backgroundStyle.indexOf('url(') === -1) return false;
  var imgSRC = (/url\("(.*)"\)/ig).exec(backgroundStyle)[1] ?? false;
  return imgSRC;
}


function createTray(trayData, pageOption = 'Select options') {
  if (!trayData || Object.keys(trayData).length === 0) return false;
  var { thumbSRC, deviceName} = trayData;

  var tray = document.createElement('div');
  tray.classList.add('evolv-summary-tray');
  tray.innerHTML = `
    <div class="evolv-tray-left">
      <div class="evolv-thumbnail"><img src="${thumbSRC}"></div>
      <div class="evolv-summary">
        <div>${pageOption} for</div>
        <div class="evolv-device-name">${deviceName}</div>
      </div>
    </div>
  `;

  return tray;
}

function removeTray() {
    var staleTray = document.querySelector('.evolv-summary-tray');
    if (staleTray) staleTray.remove();
}


// ===[ PDP only ]=== //

mutate('pdpFirstThumbnail', this.key).customMutation((state1, pdpFirstThumbnail) => {

  mutate('pdpHeadlineDeviceName', this.key).customMutation((state2, pdpHeadlineDeviceName) => {
    if (!pdpFirstThumbnail) return;
    
    var summaryTrayLeftContainer = document.querySelector('.mobility-pdp-wrapper [class*="StickyHeader__StickyContainer"] [class*="StickyHeader__LeftContainer-sc"]');
    var deviceName = pdpHeadlineDeviceName.textContent;
    
    var initialThumbnailSRC = getThumbnailSRC();
    if(!initialThumbnailSRC) return;
  
    var trayData = {
      'thumbSRC': initialThumbnailSRC,
      'deviceName': deviceName,
    };
  
    var previewSummaryTray = createTray(trayData);
  
    removeTray();
  
    if (!summaryTrayLeftContainer) {
      mutate('addedStickyHeaderCTAContainer', this.key).customMutation((state, addedStickyHeaderCTAContainer) => {
        if (!(trayData && previewSummaryTray) || document.querySelector('.mobility-pdp-wrapper [class*="StickyHeader__StickyContainer"] [class*="StickyHeader__LeftContainer-sc"]')) return;
        addedStickyHeaderCTAContainer.insertAdjacentElement('afterbegin', previewSummaryTray);
        document.body.setAttribute('data-evolv-mobile-sticky-tray', 'fixed');

        // we need different placement for mobile breakpoints but don't want to 
        // - deal with 2 sets so using css overrides
        var lastKnownScrollPosition = 0;
        var ticking = false;
        
        document.addEventListener("scroll", (event) => {
          lastKnownScrollPosition = window.scrollY;
        
          if (!ticking) {
            window.requestAnimationFrame(() => {
              var mobileSticky = lastKnownScrollPosition > 2 ? 'sticky' : 'fixed';
              document.body.setAttribute('data-evolv-mobile-sticky-tray', mobileSticky);
              ticking = false;
            });
        
            ticking = true;
          }
        });
      });
    } else {
      summaryTrayLeftContainer.insertAdjacentElement('beforeend', previewSummaryTray);
    }
  });
});


// PDP - update image on color changes
mutate('colorSwatch', this.key).on('click', () => {
  var summaryTrayThumbnail = document.querySelector('.evolv-summary-tray .evolv-thumbnail img');
  if (!summaryTrayThumbnail) return;
  // needed a healthy bump to wait for BAU style prop to update
  setTimeout(() => {
    var currentThumbnailSRC = getThumbnailSRC();
    if(currentThumbnailSRC) summaryTrayThumbnail.src = currentThumbnailSRC;
  }, 750);
});


// ===[ Plans + TMP ]=== //

mutate('summaryTrayLeftContainer', this.key).customMutation((state1, summaryTrayLeftContainer) => {
  // for PDP, this only happens if there is already something in the cart and we're handling that above
  if (window.evolv_opt326_getCurrentPage() === 'pdp') return;
  
  mutate('accordionActivated', this.key).customMutation((state2, accordionActivated) => {
    if (!summaryTrayLeftContainer) return;
    
    var activeDeviceThumbnail = accordionActivated.parentNode.querySelector('img');
    var deviceName = accordionActivated.parentNode.querySelector('div:not([class*="Common__TitleWrapper-sc"]) > p:first-child');
  
    if (!(activeDeviceThumbnail && deviceName)) return;
  
    var trayData = {
      'thumbSRC': activeDeviceThumbnail.src,
      'deviceName': deviceName.textContent,
    };

    var pageOption = window.evolv_opt326_getCurrentPage() === 'tmp' ? 'Add protection' : 'Select a plan';
    var previewSummaryTray = createTray(trayData, pageOption);
    
    removeTray();
    summaryTrayLeftContainer.insertAdjacentElement('beforeend', previewSummaryTray);

    // we need to watch for changes
    var observer = new MutationObserver(mutations => {
      for (var mutation of mutations) {
          
          var currentlyOpenAccordion = document.querySelector('.accordionButton[aria-expanded="true"]');
  
        
          if (currentlyOpenAccordion) {
            var currentlyActiveImage = currentlyOpenAccordion.parentNode.querySelector('img');
            var currentlyActiveDeviceName = currentlyOpenAccordion.parentNode.querySelector('div:not([class*="Common__TitleWrapper-sc"]) > p:first-child');

            if (trayData.thumbSRC === currentlyActiveImage.src) return
            trayData.thumbSRC = currentlyActiveImage.src;
            trayData.deviceName = currentlyActiveDeviceName.textContent;
            
          } else {
           // when no accordions are open, we're using the first device
            var firstDevice = document.querySelector('*:not([data-evolv-int-section]) + [data-evolv-int-section]');
            if (!firstDevice) return;
            
            var firstDeviceImage = firstDevice.querySelector('img[data-mutate-id]');
            var firstDeviceName = firstDevice.querySelector('.accordionButton + div div:not([class*="Common__TitleWrapper-sc"]) > p:first-child');

            if (trayData.thumbSRC === firstDeviceImage.src) return;

            trayData.thumbSRC = firstDeviceImage.src;
            trayData.deviceName = firstDeviceName.textContent;

          }

          removeTray();
          previewSummaryTray = createTray(trayData, pageOption);
          summaryTrayLeftContainer.insertAdjacentElement('beforeend', previewSummaryTray);

      }
    });
    observer.observe(accordionActivated, {
      attributes: true
    });
  });
});





;
  };
  evolv.javascript.variants["evolv_web_n34s32jld_96kry2ym5"].timing = "immediate";
  evolv.javascript.variants["evolv_web_n34s32jld"] = function (resolve, reject) {
    // *****************************
//
// Softcodes have been abstracted out to an integration in order to make them 
// shareable for this project.
//
// If repairs are needed to softcodes in the meantime until they are hardcoded,
// the current gist lives here: https://gist.github.com/marcybarnett/e83c0211b8d58e0553569b4896011456
// please don't forget to update the integration in both staging and prod environments
//
// please note that compiled scss will need to be manually copied over for any softcode changes
// - original scss is commented out at the context level - please do not delete
// and collectors specific to the softcodes have a prefix added to distinguish them
// from any collectors created below since they will eventually go away.
//
// --------------------
// Additional PSA's:
// 
// sessionCart does not set until TMP page so there are no globals with any cart info until then
// - will likely need to lean on DOM elements for certain things
//
// *****************************

var pdpScope = '.mobility-pdp-wrapper';
// plans/tmp shared + indie scopes
var bottomSectionScope = '[class*="PlansLanding__BottomSection-sc"]';
var smartphoneSectionScope = `${bottomSectionScope} [data-evolv-int-section="smartphones"]`;
var plansSmartphoneScope = `[class*="PlansNewContainer__TopSection-sc"] ~ ${smartphoneSectionScope}`;
var tmpSmartphoneScope = `[class*="FeaturesNewContainer__TopSection-sc"] ~ ${smartphoneSectionScope}`;

var COLLECT_MAP = {
  // 1.1

  // - scoped
  'pdpHeadlineDeviceName': `${pdpScope} [class*="ProductDetails__PDPHeaderInfo"] h1`,
  'colorSwatch': `${pdpScope} [class*="ColorOptions__Colorbox-sc"]`,
  'pdpFirstThumbnail': `${pdpScope} [class*="PDPCarousel"] .slotContainer:first-child [class*="OuterTileContainer-VDS"]`,
  'accordionImage': `${bottomSectionScope} [id*="accordionHeader"] img`,
  'accordionActivated': `${bottomSectionScope} button[aria-expanded="true"]`, // only works the first time

  // - not scoped
  // 'shoppingBagIconInSummaryTray': `[aria-label*="shopping-bag"]`,
  'summaryTray': `[class*="StickyHeader__StickyContainer"]`,
  'summaryTrayLeftContainer': `[class*="StickyHeader__StickyContainer"] [class*="StickyHeader__LeftContainer-sc"]`,

  // - added el's
  'addedSummaryTray': `.evolv-summary-tray`,
  'addedStickyHeaderCTAContainer': `.evolv-stickyATC-container > .evolv-cta-container`,
};

Object.keys(COLLECT_MAP).forEach(mutateKey => {
  var selector = COLLECT_MAP[mutateKey];
  collect(selector, mutateKey);
});

// created for the softcodes integration but will likely leverage for scoping within variants as well
window.evolv_opt326_getCurrentPage = () => {
  var CONTEXT_URLS = {
    'pdp': /\/business\/products\/devices\/smartphones\/\S/ig,
    'plans': /\/business\/shop\/plans/ig,
    'tmp': /\/business\/shop\/features/ig,
  }
  
  var pages = Object.keys(CONTEXT_URLS);
  var currentPage = pages.find(page => CONTEXT_URLS[page].test(window.location.pathname));
  return currentPage;
}

// used on pageload + SPA changes (see end)
function applySoftcodes(CONTEXT_KEY) {
  var currentPage = window.evolv_opt326_getCurrentPage();
  if(currentPage) {

    // thought we needed to dedupe this in the integration but it adds a MASSIVE delay if 
    // we don't reset this here.
    window.evolvSoftcode = {};
    
    window.evolvApplyOpt326Softcode(currentPage, CONTEXT_KEY);
    // softcode implemented on plans/tmp selected state
  // if (currentPage === 'plans' || 'tmp') window.evolvApplyOpt326Softcode('plans_tmp', CONTEXT_KEY);

  }
}

// apply softcodes from other contexts on page load
applySoftcodes(this.key);



// SPA handling
if (!window.evolv_opt326_spaListener) {
  window.evolv_opt326_spaListener = true;

  window.history.pushState = (f => function pushState() {
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event('evolv_opt326_spaChange'));
    return ret;
  })(window.history.pushState);

  window.history.replaceState = (f => function replaceState() {
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event('evolv_opt326_spaChange'));
    return ret;
  })(window.history.replaceState);

  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('evolv_opt326_spaChange'));
  });
}


// Re-run softcode for new pages (primarily for editor since other contexts are calling their own)
window.addEventListener('evolv_opt326_spaChange', () => {
  applySoftcodes(this.key);
});
  };
  evolv.javascript.variants["evolv_web_n34s32jld"].timing = "immediate";
  evolv.javascript.variants["evolv_web_r900lh25g_9ngulawil"] = function (resolve, reject) {
    window.evolvTrack('opt326_pdp', '07_01');

var boxSVG = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24.4256 16.7562C23.9122 16.1187 23.2624 15.6044 22.524 15.2512V8.15762L12.444 2.33752L2.36328 8.15762V19.7968L12.444 25.6161L15.8991 23.6217C16.8095 24.7523 18.1318 25.4751 19.575 25.6308C21.0183 25.7866 22.4644 25.3626 23.595 24.4522C24.7257 23.5418 25.4484 22.2195 25.6042 20.7762C25.7599 19.3329 25.336 17.8869 24.4256 16.7562ZM12.444 4.00702L15.6459 5.85582L7.73756 10.4217L4.53748 8.57167L12.444 4.00702ZM11.7211 23.5292L3.80895 18.9625V9.82002L11.7211 14.394V23.5292ZM9.18257 11.2572L17.0922 6.69068L20.3567 8.5755L12.4496 13.1458L9.18257 11.2572ZM15.1276 22.3972L13.1662 23.5295V14.4013L21.0783 9.82795V14.7804C20.0997 14.6058 19.092 14.7013 18.1636 15.0566C17.2352 15.4119 16.4213 16.0136 15.8093 16.7969C15.1973 17.5803 14.8105 18.5156 14.6904 19.5024C14.5702 20.4891 14.7214 21.4899 15.1276 22.3972ZM24.2367 20.1785C24.2367 21.2641 23.8054 22.3053 23.0377 23.073C22.27 23.8406 21.2288 24.2719 20.1431 24.2719C19.0574 24.2718 18.0162 23.8406 17.2486 23.0729C16.4809 22.3052 16.0496 21.264 16.0496 20.1783C16.0496 19.0927 16.4809 18.0515 17.2486 17.2838C18.0162 16.5161 19.0574 16.0848 20.1431 16.0848C21.2288 16.0848 22.27 16.516 23.0377 17.2837C23.8054 18.0514 24.2367 19.0928 24.2367 20.1785ZM22.0107 20.4522L21.5158 20.9468C21.1517 20.5828 20.6579 20.3783 20.143 20.3783C19.6282 20.3783 19.1344 20.5828 18.7703 20.9468L18.2759 20.4522C18.7712 19.957 19.443 19.6789 20.1434 19.6789C20.8437 19.6789 21.5154 19.957 22.0107 20.4522ZM21.1136 21.3497L20.6186 21.8434C20.4902 21.7213 20.3197 21.6533 20.1425 21.6534C19.9653 21.6535 19.7949 21.7217 19.6666 21.8439L19.1723 21.3493C19.4338 21.0996 19.7815 20.9603 20.1431 20.9604C20.5047 20.9605 20.8522 21.0999 21.1136 21.3497ZM22.9071 19.5554L22.4129 20.05C21.8108 19.4482 20.9943 19.11 20.143 19.11C19.2917 19.11 18.4752 19.4482 17.8732 20.05L17.3788 19.5554C18.112 18.8223 19.1062 18.4105 20.143 18.4105C21.1797 18.4105 22.174 18.8223 22.9071 19.5554Z" fill="black"/></svg>`;

mutate('shippingOption', this.key).customMutation((state, shippingOption) => {
  // to better scope styles as well as to play nicely with concept 16 in the future
  shippingOption.setAttribute('data-evolv-shipping-tile', true);
  if (!shippingOption.querySelector('.evolv-shipping-icon')) shippingOption.insertAdjacentHTML('afterbegin', `<div class="evolv-shipping-icon">${boxSVG}</div>`);
});

;
  };
  evolv.javascript.variants["evolv_web_r900lh25g_9ngulawil"].timing = "immediate";
  evolv.javascript.variants["evolv_web_r900lh25g_h55kwfbzk"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_r900lh25g_h55kwfbzk"].timing = "immediate";
  evolv.javascript.variants["evolv_web_r900lh25g_ianxyeq3x"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_r900lh25g_ianxyeq3x"].timing = "immediate";
  evolv.javascript.variants["evolv_web_r900lh25g_tbc0x93jw"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_r900lh25g_tbc0x93jw"].timing = "immediate";
  evolv.javascript.variants["evolv_web_r900lh25g_tdgfs2am5"] = function (resolve, reject) {
    window.evolvTrack('opt326_pdp_desktop', '03_02');

// device scoping in manager

// same as 3.1
mutate('accordionButtonColor', this.key).customMutation((state, accordionButtonColor) => {
  if(!window.evolv_opt326_pdp_urlCheck()) return;
  
  // It doesn't seem to matter what we wait for, 
  // - there is a div with an inline style that gets interrupted in removing
  // - its "display:none" if we click too quickly
  setTimeout(() => {
    var ariaExpanded = accordionButtonColor.getAttribute('aria-expanded');
    
    if(ariaExpanded && ariaExpanded === 'false') {
      accordionButtonColor.click();
      accordionButtonColor.setAttribute('data-evolv-disabled', true);
    }
  }, 750);
});;
  };
  evolv.javascript.variants["evolv_web_r900lh25g_tdgfs2am5"].timing = "immediate";
  evolv.javascript.variants["evolv_web_r900lh25g_u6owi8960"] = function (resolve, reject) {
    window.evolvTrack('opt326_pdp', '09_02');
;
  };
  evolv.javascript.variants["evolv_web_r900lh25g_u6owi8960"].timing = "immediate";
  evolv.javascript.variants["evolv_web_r900lh25g_xxpnzwf8m"] = function (resolve, reject) {
    window.evolvTrack('opt326_pdp', '08_01');

// add the panel carousel
mutate('thumbnailCarouselContainer', this.key).customMutation((state1, thumbnailCarouselContainer) => {
  var panelContainer = document.createElement('div');
  panelContainer.classList.add('evolv-panel-container');
  panelContainer.innerHTML = `
    <div class="evolv-panel-sidebar"></div>
    <div class="evolv-panel-view"></div>
  `;

  // for styling
  var thumbCount = thumbnailCarouselContainer.querySelectorAll('.slotContainer').length;
  var sidebar = panelContainer.querySelector('.evolv-panel-sidebar');
  if (sidebar && thumbCount > 6) sidebar.setAttribute('data-evolv-thumb-count', thumbCount);

  if (!document.querySelector('.evolv-panel-container')) thumbnailCarouselContainer.insertAdjacentElement('beforebegin', panelContainer);

  // BAU carousel is made up of empty divs with background images
  mutate('thumbnailOuterTileContainer', this.key).customMutation((state2, thumbnailOuterTileContainer) => {
    if (!(panelContainer && thumbnailCarouselContainer)) return;

    var thumbSRC = getComputedStyle(thumbnailOuterTileContainer).backgroundImage;
    var panelSidebar = panelContainer.querySelector('.evolv-panel-sidebar');
    if (!(thumbSRC && panelSidebar)) return;
    
    var panelThumb = document.createElement('div');
    panelThumb.classList.add('evolv-panel-thumb');
    panelThumb.style.backgroundImage = thumbSRC;
    panelThumb.onclick = e => {
      var panelView = document.querySelector('.evolv-panel-view');
      if (!panelView) return;

      panelView.style.backgroundImage = getComputedStyle(panelThumb).backgroundImage;

      var staleSelected = document.querySelector('.evolv-selected');
      if (staleSelected) staleSelected.classList.remove('evolv-selected');
      e.target.classList.add('evolv-selected');
    };
    
    panelSidebar.insertAdjacentElement('beforeend', panelThumb);

    // post-release patch for color changes
    var observer = new MutationObserver(mutations => {
      for (var mutation of mutations) {
        setTimeout(() => { // need a lengthy delay as they have a cross fade
          var newSRC = getComputedStyle(mutation.target).backgroundImage;
          panelThumb.style.backgroundImage = newSRC;

          // update the panelView as well
          if (panelThumb.classList.contains('evolv-selected')) panelThumb.click();
        }, 250);
      }
    });

    observer.observe(thumbnailOuterTileContainer, {
      attributes: true
    });
 
  });
});

// Set the first image on page load
mutate('addedFirstPanelThumb', this.key).customMutation((state, addedFirstPanelThumb) => {
  var firstThumbSRC = getComputedStyle(addedFirstPanelThumb).backgroundImage;
  if (!firstThumbSRC) return;
  
  var panelView = document.querySelector('.evolv-panel-view');
  if (panelView) {
    panelView.style.backgroundImage = firstThumbSRC;
    addedFirstPanelThumb.classList.add('evolv-selected');
  }
});;
  };
  evolv.javascript.variants["evolv_web_r900lh25g_xxpnzwf8m"].timing = "immediate";
  evolv.javascript.variants["evolv_web_r900lh25g_ymc1foy66"] = function (resolve, reject) {
    window.evolvTrack('opt326_pdp_mobile', '03_02');

// device scoping in manager

// same as 3.1
mutate('accordionButtonColor', this.key).customMutation((state, accordionButtonColor) => {
  if(!window.evolv_opt326_pdp_urlCheck()) return;
  
  // It doesn't seem to matter what we wait for, 
  // - there is a div with an inline style that gets interrupted in removing
  // - its "display:none" if we click too quickly
  setTimeout(() => {
    var ariaExpanded = accordionButtonColor.getAttribute('aria-expanded');
    
    if(ariaExpanded && ariaExpanded === 'false') {
      accordionButtonColor.click();
      accordionButtonColor.setAttribute('data-evolv-disabled', true);
    }
  }, 750);
});;
  };
  evolv.javascript.variants["evolv_web_r900lh25g_ymc1foy66"].timing = "immediate";
  evolv.javascript.variants["evolv_web_r900lh25g"] = function (resolve, reject) {
    //#region Generated Code
collect([".Quantity__StyledButton-sc-b6drzc-1[aria-label='Add to cart'] > [class*='StyledChild']"], "x1w86xrst");
collect(["button[aria-label='Add to cart']", "button[aria-label='Preorder']", "[class*='Quantity__StyledButton-sc']"], "atc-and-preorder-button-on9vi0xsk");
collect(".evolv-stickyATC", "new-control-sticky-a-t-c-e89y7hb5m");
//#endregion

// PSA - when creating components for genAI variants that contain attribute values, 
// - please use single quotes on the value to prevent escaped quotes in the generated code above
// -- the escaped quotes cause contamination errors on older browsers that do not support them

var scope = '.mobility-pdp-wrapper';
var COLLECT_MAP = {
  // new control - abstracted out, will not affect integration if changed or removed
  'quantityDropDown': `${scope} select.numLines-dropdownSelect`,
  // 'inlineAddToCart': `${scope} button[aria-label='Add to cart'], ${scope} button[aria-label='Preorder']`,
  'inlineAddToCart': `${scope} [class*="Quantity__StyledButton-sc"]`,
  'shoppingBag': `${scope} [class*="StickyHeader__FlexContainer-sc"] [class*="ButtonIconContainer-VDS__sc"]`,
  'reviews': `${scope} [class*="PriceInfo__RatingContainer"]`,
  'shippingContainer': `${scope} [class*="ShippingOptions__Container"]`,

  // 3.1, 3.2, 3.3, 3.4
  'accordionButtonColor': `${scope} [data-track="ShowColor"]`,
  'deviceHeaderInfo': `${scope} [class*="ProductDetails__PDPHeaderInfo"]`,

  // 4.1
  'waysToSaveCarousel': `${scope} [class*="ProductDetails__AccordionSection-sc"] #carousel-container`,
  'offerDetailLink': `${scope} [class*="OfferCard__TopSection-sc"] [class*="Wrapper-VDS__sc"]`,
  
  // 5.1
  'quantityContainer': `${scope} [class*="ProductDetails__QuantitySection-sc"]`,
  
  // 7.1
  'shippingOption': `${scope} [class*="ShippingOptions__Option-sc"]`,

  // 8.1
  'thumbnailCarouselContainer': `${scope} [class*="PDPCarouselVds3__ImageContainer-sc"]`,
  'thumbnailOuterTileContainer': `${scope} [class*="__ImageContainer"] [class*="OuterTileContainer-VDS"]`,
  'addedFirstPanelThumb': `${scope} .evolv-panel-thumb:first-child`,
  
  // 9.1
  'promoCTANotYetAdded': `${scope} #carousel-container [class*="OfferCard__BottomSection-sc"] button`,


};

Object.keys(COLLECT_MAP).forEach(mutateKey => {
  var selector = COLLECT_MAP[mutateKey];
  collect(selector, mutateKey);
});


// url checks are becomming necessary
window.evolv_opt326_pdp_urlCheck = () => {
  var pdpPath = /\/business\/products\/devices\/smartphones\/.+/igm;
  return pdpPath.test(window.location.pathname);
};

// SPA handling
if (!window.evolv_opt326_spaListener) {
  window.evolv_opt326_spaListener = true;

  window.history.pushState = (f => function pushState() {
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event('evolv_opt326_spaChange'));
    return ret;
  })(window.history.pushState);

  window.history.replaceState = (f => function replaceState() {
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event('evolv_opt326_spaChange'));
    return ret;
  })(window.history.replaceState);

  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('evolv_opt326_spaChange'));
  });
}


// ===[ Softcode from opt307/306]=== //
// - 1.1 Sticky CTA 
// - 2.1 moved review group
//

// see multi context notes
window.evolvApplyOpt326Softcode('pdp', this.key);


// window.evolvTrack('opt326_pdp', 'newControl');

// // NC - sticky CTA
// function createStickyATC() {
//   var staleStickyATC = document.querySelector('.evolv-stickyATC-container');
//   if (staleStickyATC) staleStickyATC.remove();

//   var svgCaret = `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21.6 21.6"><polygon points="10.8 15.71 1.8 6.71 2.62 5.89 10.8 14.07 18.98 5.89 19.8 6.71 10.8 15.71"></polygon></svg>`;

//   // create the new button
//   var stickyATCContainer = document.createElement('div');
//   stickyATCContainer.classList.add('evolv-stickyATC-container');
//   stickyATCContainer.innerHTML = `
//     <div class="evolv-sticky-qty evolv-mobile">
//       <div class="qty-label">Quantity</div>
//       <div class="evolv-styled-selected">
//         <span class="qty">1</span>
//         <span class="evolv-caret">${svgCaret}</span>
//       </div>
//       <div class="evolv-styled-menu">
//         <div class="option" value="1">1</div>
//         <div class="option" value="2">2</div>
//         <div class="option" value="3">3</div>
//         <div class="option" value="4">4</div>
//         <div class="option" value="5">5</div>
//         <div class="option" value="6">6</div>
//         <div class="option" value="7">7</div>
//         <div class="option" value="8">8</div>
//         <div class="option" value="9">9</div>
//         <div class="option" value="10">10+</div>
//       </div>
//     </div>
//     <button class="evolv-stickyATC evolv-mobile">Continue to plans</button>
//     <div class="evolv-cta-container">
//       <button class="evolv-stickyATC">Continue to plans</button>
//     </div>
//   `;

//   var atcButtonDesktop = stickyATCContainer.querySelector('.evolv-cta-container button');
//   var atcButtonMobile = stickyATCContainer.querySelector('button.evolv-mobile');

//   function atcButtonHandler () {
//     var inlineAddToCart = document.querySelector('button[class*="Quantity__StyledButton-sc"]');

//     if (!inlineAddToCart) return;
//     return inlineAddToCart.click();
//   }

//   atcButtonDesktop.onclick = () => atcButtonHandler();
//   // touchstart is not supported in the editor but the switch was required for a live patch
//   atcButtonMobile.addEventListener('touchstart', atcButtonHandler);


//   // Qty dropdown handlers
//   var stickyQuantity = stickyATCContainer.querySelector('.evolv-sticky-qty');
//   var styledSelected = stickyQuantity.querySelector('.evolv-styled-selected');
//   var selectedQty = styledSelected.querySelector('.qty');
//   var styledMenu = stickyQuantity.querySelector('.evolv-styled-menu');

//   // show/hide the menu
//   styledSelected.onclick = function () {
//     styledMenu.classList.toggle('evolv-expanded');
//   };

//   // selection handler - piggyback on inline quantity dropdown for actual ATC's
//   var options = stickyQuantity.querySelectorAll('.option');
//   options.forEach(option => {
//     option.onclick = function () {
//       // update our fake input
//       selectedQty.textContent = option.textContent;

//       // update the real input to match
//       var ogQuantityWrapper = collect.get('quantityDropDown').elements[0] || document.querySelector('select.numLines-dropdownSelect');
//       if (ogQuantityWrapper) {
//         var value = option.getAttribute('value');

//         ogQuantityWrapper.value = value;
//         ogQuantityWrapper.dispatchEvent(new Event('change', { bubbles: true }));
//       }

//       // collapse the fake menu
//       option.closest('.evolv-styled-menu').classList.remove('evolv-expanded');
//     };
//   });

//   return stickyATCContainer;
// }



// // add it to the page
// mutate('inlineAddToCart', this.key).customMutation((state, inlineAddToCart) => {
//   if (!window.evolv_opt326_pdp_urlCheck()) return;
  
//   var stickyATCContainer = createStickyATC();
//   if (!stickyATCContainer) return;

//   // Alternate positioning when summary bar already exists
//   var shoppingBag = document.querySelector('[class*="StickyHeader__FlexContainer-sc"] [class*="ButtonIconContainer-VDS__sc"]');
//   if (shoppingBag) stickyATCContainer.classList.add('evolv-summary-bar');

//   var pdpWrapper = document.querySelector('.mobility-pdp-wrapper');
//   var stickyATCButton = stickyATCContainer.querySelector('button');

//   // has "Add to cart" hardcoded as the fallback
//   if (pdpWrapper) {
//     var placementEl = shoppingBag ?? pdpWrapper;
//     placementEl.insertAdjacentElement('beforebegin', stickyATCContainer);

//     // edgecase on refresh
//     mutate('shoppingBag', this.key).customMutation((state2, shoppingBag) => {
//       if (pdpWrapper && stickyATCContainer && !shoppingBag.parentNode.querySelector('.evolv-summary-bar')) {
//         stickyATCContainer.classList.add('evolv-summary-bar');
//         shoppingBag.insertAdjacentElement('beforebegin', stickyATCContainer);
//       }
//     });
//   }

//   // just in case we're changing the ATC somewhere later, or it changes in prod
//   setTimeout(() => {
//     var inlineCTACopy = inlineAddToCart.textContent;

//     if (inlineCTACopy.length > 1) stickyATCButton.textContent = inlineCTACopy;
//   }, 500); // need at least this much for prod repaints

//   // had to change approach to continue watching for changes to the ATC
//   // -- using a vanilla observer because a subscriber was looping
//   var observer = new MutationObserver(mutations => {
//     for (var mutation of mutations) {
//       var button = mutation.target.closest('button');

//       if (mutation.type !== 'attributes' || !mutation.attributeName) return;

//       // catching disabled/enabled state changes
//       if (mutation.attributeName === 'disabled' || mutation.attributeName === 'aria-disabled') {
//         var ariaDisabled = button.getAttribute('aria-disabled');
//         var isDisabled = ariaDisabled === true || ariaDisabled === 'true';

//         stickyATCButton.disabled = isDisabled;
//       }

//       // should catch any copy change to ATC
//       if (mutation.attributeName === 'aria-label') stickyATCButton.textContent = button.textContent;
//     }
//   });
//   observer.observe(inlineAddToCart, { attributes: true });

// });


// // update our fake input to match whenever the inline qty is updated
// mutate('quantityDropDown', this.key).on('change', e => {
//   if (!e.isTrusted) return;

//   var value = e.target.value;

//   if (value) {
//     var stickyQuantity = document.querySelector('.evolv-sticky-qty');
//     if (!stickyQuantity) return;
//     var stickySelected = stickyQuantity.querySelector('.evolv-styled-selected .qty');
//     var stickyOption = stickyQuantity.querySelector(`.option[value="${value}"]`);

//     stickySelected.textContent = stickyOption.textContent;
//   }

// });


// // NC - move reviews
// mutate('shippingContainer', this.key).customMutation((state, shippingContainer) => {
//   mutate('reviews', this.key).customMutation((state, reviews) => {
//     if (window.evolv_opt326_pdp_urlCheck()) {
//       shippingContainer.setAttribute('data-evolv-reviews-moved', true);
//       shippingContainer.insertAdjacentElement('afterend', reviews);
//       // console.info('hey brian')
//     }
//   });
// });

// window.addEventListener('evolv_opt326_spaChange', () => {
//   var stickyATC = document.querySelector('.evolv-stickyATC-container');
//   if (!window.evolv_opt326_pdp_urlCheck() && stickyATC) stickyATC.remove();
// });
;
  };
  evolv.javascript.variants["evolv_web_r900lh25g"].timing = "immediate";
  evolv.javascript.variants["evolv_web_z5sll7g02_1sw9y1rho"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_z5sll7g02_1sw9y1rho"].timing = "immediate";
  evolv.javascript.variants["evolv_web_z5sll7g02"] = function (resolve, reject) {
    var plansPageScope = '[class*="PlansNewContainer__TopSection-sc"] ~ [class*="PlansLanding__BottomSection"]';
var smartphoneSectionScope = `${plansPageScope} [data-evolv-int-section="smartphones"]`;

var COLLECT_MAP = {
  // PSA - please check collectors note in plans+tmp context.
  // -----
  // Also, a data-attribute has been added via integration to differentiate sections for multiple devices
  // -- descriptive section ID's were recently removed in BAU so we needed a way to scope treatments
  // --- to the smartphone section exclussively where applicable. See scope varianble.
  // -----
  // TMP uses very similar selectors so we need to scope specifically to plans to avoid bleeding where appropriate

  // New Control - abstracted out, will not affect integration if changed or removed
  'businessPlanCardTileContainer': `${smartphoneSectionScope} [class*="BusinessPlanCard__TileContainer"]`,
  'selectPlanCta': `${smartphoneSectionScope} [aria-label="Select plan"], ${smartphoneSectionScope} [aria-label="Keep this plan"]`,
  'planTitleTopSection': `${smartphoneSectionScope} .top-section`,
  'appliedToLinesLabel': `${smartphoneSectionScope} [class*="BusinessPlanCard__AppliedToLines"]`,
  'promoBadgeCopy': `${smartphoneSectionScope} [class*="BusinessPlanCard__PromoBadge"] p`,
  'addDevicesButton': `button.add-devices`,

  // 2.1
  'planIncludesSection': `${smartphoneSectionScope} [class*="BusinessPlanCard__TileContents"] > div:last-of-type`,
  'fccLabelWrapper': `${smartphoneSectionScope} [class*="BroadbandPlan__BroadBandWrapper-sc"]`,
  'seeAllPlans': '.evolv-seeAllPlans',
  'seeLess': '.evolv-seeLess',

};

Object.keys(COLLECT_MAP).forEach(mutateKey => {
  var selector = COLLECT_MAP[mutateKey];
  collect(selector, mutateKey);
});


// ===[ Remaining Softcode from opt315/316]=== //
// 
// 4.2 - Promo specific copy
//


// see multi context notes
window.evolvApplyOpt326Softcode('plans', this.key);
// window.evolvApplyOpt326Softcode('plans_tmp', this.key); // softcode has been implemented

// window.evolvTrack('opt326_plans', 'new_control');


// // NC - Promo specific copy
// mutate('promoBadgeCopy').text('Get a device promo with this plan.');

;
  };
  evolv.javascript.variants["evolv_web_z5sll7g02"].timing = "immediate";
  evolv.javascript.variants["evolv_web_myyg661hr_c972qqqnn"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_myyg661hr_c972qqqnn"].timing = "immediate";
  evolv.javascript.variants["evolv_web_myyg661hr_ep4lf3j5o"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_myyg661hr_ep4lf3j5o"].timing = "immediate";
  evolv.javascript.variants["evolv_web_myyg661hr_n6dnlxdx8"] = function (resolve, reject) {
    window.evolvTrack('opt320', '03_01');;
  };
  evolv.javascript.variants["evolv_web_myyg661hr_n6dnlxdx8"].timing = "immediate";
  evolv.javascript.variants["evolv_web_myyg661hr_tx6cf4ulf"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_myyg661hr_tx6cf4ulf"].timing = "immediate";
  evolv.javascript.variants["evolv_web_myyg661hr_t5gbn2qt8"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_myyg661hr_t5gbn2qt8"].timing = "immediate";
  evolv.javascript.variants["evolv_web_myyg661hr_m9wrin40z"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_myyg661hr_m9wrin40z"].timing = "immediate";
  evolv.javascript.variants["evolv_web_myyg661hr"] = function (resolve, reject) {
    //#region Generated Code
collect(".mutate-heroHeadlineCopy", "hero-copy-g4zc434g8");
collect(".mutate-heroSubtitleCopy", "hero-subcopy-y6qlpba79");
//#endregion
// PSA - elements change tags between desktop and mobile upon browser resize (e.g. h1 -> h2)

var scope = '[class*="Byod__Container-sc"]';
var COLLECT_MAP = {
  // 1.1
  'heroHeadlineCopy': `${scope} [class*="TitleWrapper-VDS__sc"] [class*="StyledTitle-VDS__sc"] span`,
  
  // 2.1
  'hero' : `${scope} [class*="PromoHeader__PromoHeaderContainer-sc"]`,
  'heroSubtitleCopy': `${scope} [class*="SubtitleWrapper-VDS__sc"] span`,

  // 4.1
  'firstDeviceContainer': `${scope} > [class*="styleTag__MarginSpacerM-sc"] + div > [class*="StyledGridContainer-VDS__sc"] > [class*="RowWrapper-VDS__sc"] > [class*="StyledRow-VDS__sc"] > div:first-child`,
  'tooltipButton': `${scope} [class*="PromoBannerVDS3__TextContainer-sc"] p span`,

  // 6.1
  'deviceTypeOption': `${scope} select[label="Device type"] option`,
  'carrierOption': `${scope} select[label*="Carrier"] option`,

  // 8.1
  'keepNumberLabel': `${scope} [class*="DeviceTile__CustomRadioBoxGroup-sc"] input[value="Yes"] + label`,
};

Object.keys(COLLECT_MAP).forEach(mutateKey => {
  var selector = COLLECT_MAP[mutateKey];
  collect(selector, mutateKey);
});
  };
  evolv.javascript.variants["evolv_web_myyg661hr"].timing = "immediate";
  evolv.javascript.variants["evolv_web_nz98arr5l_a4arursrg"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_nz98arr5l_a4arursrg"].timing = "immediate";
  evolv.javascript.variants["evolv_web_nz98arr5l_s4cxq7otw"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_nz98arr5l_s4cxq7otw"].timing = "immediate";
  evolv.javascript.variants["evolv_web_nz98arr5l_ir3lmqjve"] = function (resolve, reject) {
    window.evolvTrack('opt302', '19_01');

var trophySVG = `<svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.7 6.60001C17.8 5.50001 17.9 4.40001 17.9 3.30001V2.70001H5.2V3.30001C5.2 4.40001 5.3 5.50001 5.4 6.60001H2.5V7.20001C2.5 9.90001 4.3 12.3 7.3 13.5C8.3 15.4 9.6 16.6 11 16.9V17.8H7.7V18.9H15.4V17.8H12.1V16.9C13.5 16.6 14.8 15.4 15.8 13.5C18.7 12.3 20.6 9.90001 20.6 7.20001V6.60001H17.7ZM3.7 7.70001H5.6C5.8 9.10001 6.2 10.5 6.6 11.8C5 11 4 9.50001 3.7 7.70001ZM11.5 15.8C9 15.8 6.4 11 6.3 3.90001H16.7C16.6 11 14 15.8 11.5 15.8ZM16.5 11.8C17 10.5 17.3 9.10001 17.5 7.70001H19.4C19.1 9.50001 18 11 16.5 11.8Z" fill="black"/></svg>`;

mutate('pageWrapper', this.key).customMutation((state, pageWrapper) => {
  var ribbon = document.createElement('div');
  ribbon.classList.add('evolv-ribbon');
  ribbon.innerHTML = `
    <div class="evolv-ribbon-inner">
      <div class="ribbon-icon">${trophySVG}</div>
      <p class="ribbon-content">Verizon wins J.D. Power award for Wireless Network Quality 32nd time in&nbsp;a&nbsp;row.</p>
      <a class="ribbon-cta" href="https://www.verizon.com/about/news/verizon-wins-jd-power-award-wireless-network-quality-32nd-time-row" target="_blank">See details</a>
    </div>
  `;

  if (!pageWrapper.querySelector('.evolv-ribbon')) pageWrapper.insertAdjacentElement('afterbegin', ribbon);
});

;
  };
  evolv.javascript.variants["evolv_web_nz98arr5l_ir3lmqjve"].timing = "immediate";
  evolv.javascript.variants["evolv_web_nz98arr5l_gsuxrxzvj"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_nz98arr5l_gsuxrxzvj"].timing = "immediate";
  evolv.javascript.variants["evolv_web_nz98arr5l_gouf1u2td"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_nz98arr5l_gouf1u2td"].timing = "immediate";
  evolv.javascript.variants["evolv_web_nz98arr5l_fosgh1bbh"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_nz98arr5l_fosgh1bbh"].timing = "immediate";
  evolv.javascript.variants["evolv_web_nz98arr5l"] = function (resolve, reject) {
    var scope = '.landing5g';
var COLLECT_MAP = {
  // matches both top and inline buttons
  'continueButton': `${scope} button[aria-label="Continue"]`,
  'disabledContinueButton': `${scope} button[aria-label="Continue"][aria-disabled="true"]`,
  'enabledContinueButton': `${scope} button[aria-label="Continue"][aria-disabled="false"]`,
  
  // matches all input buttons - checked or not
  'selectionInputLabel': `${scope} [data-loc] input + label`,
  // matches all accordions - expanded or not
  'accordionButton': `${scope} .accordionButton`,
  'collapsedAccordionButton': `${scope} .accordionButton[aria-expanded="false"]`,
  
  // sections - these will all break on accordion interaction, see data-attribute workaround below
  'plansSection': `${scope} [class*="PlanSelection__PlansAccordionContainer"]`,
  // there are 3 versions of the equipment section depending on reciever/router config, which depends on self/pro install
  'equipmentSection': `[id="5gReceiver"], [id="5gEquipmentSectionwithoutstark"], [id="5gEquipmentSectionwithstark"]`,
  // there are 2 versions of the payment section depending on self/pro install address
  'paymentSection': `[id="5gRouterPayment"], [id="5gReceiverPaymentwithStark"]`,
  'section': `.mutate-plansSection, .mutate-equipmentSection, .mutate-paymentSection`,
  
  'desktopPlansSectionHeadlineButtonWrapper': `${scope} [class*="PlanSelection__TitleContainer"]`,
  // section headlines - relies on classList bug workaround below
  'sectionHeadline': `${scope} [data-evolv-section] button h3, ${scope} [data-evolv-section] button + [data-testid] h3`,
  
  // page header things
  'stickySummaryBar': `${scope} [class*="StickyHeader__StickyContainer"]`,
  'planCardsH4': `${scope} [id="5gPlanSelection"] [class*="PlanCard__FourGFiveGPlanBoxWrap-sc"] h4`,
  'byorContinueButton': `[class*="IMEICheckModal__SIMModalFooter"] button[aria-label="Continue"]`,



  // 16.1
  'lastPlanCard': `${scope} [class*="PlanSelection__PlanCardGroup-sc"] > div:last-child:not(.evolv-social-proof)`,

  // 18.1
  'includedInOrderContainer': `${scope} [class*="IncludedInOrder__IncludedContainer-sc"]`,

  // 19.1
  'pageWrapper': `${scope} > div > [class*="StyledGridContainer-VDS__sc"]:first-child`,

  // 21.1
  // class dynamically changes on resize
  'routerImageWrapper': `[class*="image-align"]`, 

  // 23.1
  'equipPayToggleInput': `.toggleSection-equip [class*="ToggleWrapper-VDS__sc"] input`,

  // 26.1
   'selectPlanButton': `[class*="PlanCard"] button:not([analyticstrack])`,
   'routerReceiverButton': '[class*="EquipmentCard"] button', 
   'paymentButton': '[class*="PaymentCard"] button',
  
  // 27.1
  'planCardInput': `[class*="PlanCard"] input`,
  'gnav': `#vz-gh20-limited-gnav`
  
};

Object.keys(COLLECT_MAP).forEach(mutateKey => {
  var selector = COLLECT_MAP[mutateKey];
  collect(selector, mutateKey);
});


// The section parents for both the equipment and payment sections are affected
// by the Mutate classList bug upon accordion interaction so we need to set 
// data attributes that won't disappear on us. Running this at the context 
// level in case we need to lean on it outside of concept 6.
var keyIDs = ['plans', 'equipment', 'payment'];

keyIDs.forEach(id => {
  mutate(`${id}Section`).customMutation((state, section) => {
    section.setAttribute('data-evolv-section', id); // just using 1 attribute for both classes we lose
  });
});


// this one is more general as new selectors emerge being affected by classList replacement
// -- just add them to the array as they're found and then adjust code (mostly css)
// -- accordingly
var keyIDs = ['sectionHeadline'];

keyIDs.forEach(id => {
  mutate(id).customMutation((state, section) => {
    section.setAttribute('data-evolv-mutate-key', id);
  });
});


// placing this out here in case we need it elsewhere
window.evolv_opt302_addSpinnerTransition = (interval = 2000, cover = false) => {
  var pageContent = document.querySelector('[class*="HeroSection__HeroDiv"] ~ div:not([class*="LandingPage5G__ChatDiv-sc"]) [class*="StyledGridContainer-VDS"]');
  
  // if(!pageContent) return;
  var body = document.body;
  body.classList.add('evolv-spinner-active'); // not sure if getting replaced
  body.setAttribute('evolv-spinner-active', true);
  
  // just cover the section that's changing
  // var overlay = document.createElement('div');
  // overlay.setAttribute('class', 'evolv-spinner-overlay');
  
  // so we can keep the spinner centered
  var spinner = document.createElement('div');
  spinner.setAttribute('class', 'evolv-spinner-container');
  spinner.innerHTML = '<div class="evolv-spinner spinner-center"></div>';
  spinner.style.setProperty('--evolv-spinner-animation', interval + 100);

  if (pageContent && !cover) {
    pageContent.insertAdjacentElement('afterend', spinner);
  } else {
    body.insertAdjacentElement('beforeend', spinner);
  }
  
  setTimeout(() => {
    // if(document.querySelector('.evolv-spinner-overlay')) overlay.remove();
    if(document.querySelector('.evolv-spinner')) spinner.remove();
    
    if(body.classList.contains('evolv-spinner-active')) body.classList.remove('evolv-spinner-active');
    
    var bodyAttribute = body.getAttribute('evolv-spinner-active');
      if(bodyAttribute && bodyAttribute === 'true') {
        body.setAttribute('evolv-spinner-active', false);
      }
  }, interval);
};






;
  };
  evolv.javascript.variants["evolv_web_nz98arr5l"].timing = "immediate";
  evolv.javascript.variants["evolv_web_6328uszw3_ih8xtqu8c"] = function (resolve, reject) {
    window.evolvTrack('opt322', '04_02');

// copied over from opt 321 
// - desktop required hover workarounds that were not removed here because it wasn't breaking anything

mutate('startsAtPricing', this.key).customMutation((state, startsAtPricing) => {
  var toggle = document.createElement('button');
  toggle.setAttribute('class', 'evolv-pricing-toggle evolv-collapsed');
  toggle.innerHTML = `pricing details`;
  toggle.onclick = e => {

    e.stopPropagation();
    e.target.classList.toggle('evolv-collapsed');
  };

  var pricingContainer = startsAtPricing.parentNode;
  if (!pricingContainer.querySelector('.evolv-pricing-toggle')) pricingContainer.insertAdjacentElement('beforeend', toggle);
  
  // when you hover over a color swatch, the area repaints and there's a gross flicker
  document.body.setAttribute('data-evolv-pricing-toggle', 'applied');
});;
  };
  evolv.javascript.variants["evolv_web_6328uszw3_ih8xtqu8c"].timing = "immediate";
  evolv.javascript.variants["evolv_web_6328uszw3_t3qojxd3d"] = function (resolve, reject) {
    window.evolvTrack('opt322', '06_01');

mutate('startsAtPricingCopy', this.key).customMutation((state, startsAtPricingCopy) => {
  var copy = startsAtPricingCopy.textContent.replace(/\$.*/g, '');
  var price = startsAtPricingCopy.textContent.replace(/^(\s|\w)*/i, '');

  if (!!copy && !!price) startsAtPricingCopy.innerHTML = `${copy} <strong>${price}</strong>`;
});;
  };
  evolv.javascript.variants["evolv_web_6328uszw3_t3qojxd3d"].timing = "immediate";
  evolv.javascript.variants["evolv_web_6328uszw3_gwrnp8lph"] = function (resolve, reject) {
    //#region Generated Code
mutate('brand-bar-l4oxzcaqv', this.key).hide();
mutate('sitcky-filter-wrap-bymoho9j7', this.key).styles({
  'top': '0'
});
//#endregion
window.evolvTrack('opt322', '07_01');;
  };
  evolv.javascript.variants["evolv_web_6328uszw3_gwrnp8lph"].timing = "immediate";
  evolv.javascript.variants["evolv_web_6328uszw3_i382t55uu"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_6328uszw3_i382t55uu"].timing = "immediate";
  evolv.javascript.variants["evolv_web_6328uszw3_evbntvme8"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_6328uszw3_evbntvme8"].timing = "immediate";
  evolv.javascript.variants["evolv_web_6328uszw3"] = function (resolve, reject) {
    //#region Generated Code
collect(".MobilityGridwall__GridwallTabBar-sc-ee0kus-1", "brand-bar-l4oxzcaqv");
collect(["[class*='MobilityGridwall__FilterSortWrap-sc']"], "sitcky-filter-wrap-bymoho9j7");
//#endregion
var scope = '[class*="MobilityGridwall__MobilityGridwallWrap-sc"]';
var COLLECT_MAP = {
  // 2.1
  // created a component for genAI

  // 4.1
  'startsAtPricing': `${scope} [class*="DeviceCard__PricingContainer-sc"] > [class*="DeviceCard__PricingInfo-sc"]`,

  // 6.1
  'startsAtPricingCopy': `${scope} [class*="DeviceCard__PricingContainer-sc"] > [class*="DeviceCard__PricingInfo-sc"] p`,

  //10,11
  'offerText': `[class*="DeviceCard__OfferText"]`
};

Object.keys(COLLECT_MAP).forEach(mutateKey => {
  var selector = COLLECT_MAP[mutateKey];
  collect(selector, mutateKey);
});


// concept 1 things - should be moved to variant at some point
evolv.app = evolv.app || {};
evolv.app.opt322 = {
  insertCTA(text){
    $mu('.device-card')
      .classes({'evolv-cardWithButton': true})
      .customMutation((_,card)=> {
        if (!/devices\/smartphones/.test(window.location.href)) return;

        card.insertAdjacentHTML('beforeend', ctaTemplate(text))
      });
  }
};


function ctaTemplate(text){
  return `
      <button style="display:none;" class="evolv-tile-button noOutline" display="flex" width="auto" aria-label="Go to details" role="button" aria-disabled="false" tabindex="0">
        <span tabindex="-1" display="flex" width="auto" class="evolv-button-text">
         ${text}
       </span>
      </button>
  `;
}
;
  };
  evolv.javascript.variants["evolv_web_6328uszw3"].timing = "immediate";
  evolv.javascript.variants["evolv_web_cs95155fo_32wtdk86m"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_cs95155fo_32wtdk86m"].timing = "immediate";
  evolv.javascript.variants["evolv_web_cs95155fo_3bumszscb"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_cs95155fo_3bumszscb"].timing = "immediate";
  evolv.javascript.variants["evolv_web_cs95155fo_ex75pskyh"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_cs95155fo_ex75pskyh"].timing = "immediate";
  evolv.javascript.variants["evolv_web_cs95155fo_ouecd31j1"] = function (resolve, reject) {
    window.evolvTrack('opt319', '03_01');;
  };
  evolv.javascript.variants["evolv_web_cs95155fo_ouecd31j1"].timing = "immediate";
  evolv.javascript.variants["evolv_web_cs95155fo_rjfpmx0vp"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_cs95155fo_rjfpmx0vp"].timing = "immediate";
  evolv.javascript.variants["evolv_web_cs95155fo_rzl2d8esh"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_cs95155fo_rzl2d8esh"].timing = "immediate";
  evolv.javascript.variants["evolv_web_cs95155fo"] = function (resolve, reject) {
    //#region Generated Code
collect(".mutate-heroHeadlineCopy", "hero-header-copy-gq61p4a4d");
collect(".mutate-heroSubtitleCopy", "hero-subcopy-r9x5djrs5");
//#endregion
// PSA - elements change tags between desktop and mobile upon browser resize (e.g. h1 -> h2)

var scope = '[class*="Byod__Container-sc"]';
var COLLECT_MAP = {
  // 1.1
  'heroHeadlineCopy': `${scope} [class*="TitleWrapper-VDS__sc"] [class*="StyledTitle-VDS__sc"] span`,

  // 2.1
  'hero': `${scope} [class*="PromoHeader__PromoHeaderContainer-sc"]`,
  'heroSubtitleCopy': `${scope} [class*="SubtitleWrapper-VDS__sc"] span`,
  
  // 4.1
  'firstDeviceContainer': `${scope} > [class*="styleTag__MarginSpacerM-sc"] + div > [class*="StyledGridContainer-VDS__sc"] > [class*="RowWrapper-VDS__sc"] > [class*="StyledRow-VDS__sc"] > div:first-child`,
  'tooltipButton': `${scope} [class*="PromoBannerVDS3__TextContainer-sc"] p span`,

  // 6.1
  'deviceTypeOption': `${scope} select[label="Device type"] option`,
  'carrierOption': `${scope} select[label*="Carrier"] option`,

  // 8.1
  'keepNumberLabel': `${scope} [class*="DeviceTile__CustomRadioBoxGroup-sc"] input[value="Yes"] + label`,
  
};

Object.keys(COLLECT_MAP).forEach(mutateKey => {
  var selector = COLLECT_MAP[mutateKey];
  collect(selector, mutateKey);
});
  };
  evolv.javascript.variants["evolv_web_cs95155fo"].timing = "immediate";
  evolv.javascript.variants["evolv_web_pws9uv10z_4jln8llii"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_pws9uv10z_4jln8llii"].timing = "immediate";
  evolv.javascript.variants["evolv_web_pws9uv10z_bdyx3qunu"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_pws9uv10z_bdyx3qunu"].timing = "immediate";
  evolv.javascript.variants["evolv_web_pws9uv10z_29jmioiln"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_pws9uv10z_29jmioiln"].timing = "immediate";
  evolv.javascript.variants["evolv_web_pws9uv10z_rmo5hn24h"] = function (resolve, reject) {
    window.evolvTrack('opt324', '05_01');;
  };
  evolv.javascript.variants["evolv_web_pws9uv10z_rmo5hn24h"].timing = "immediate";
  evolv.javascript.variants["evolv_web_pws9uv10z_ya7xwmlx8"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_pws9uv10z_ya7xwmlx8"].timing = "immediate";
  evolv.javascript.variants["evolv_web_pws9uv10z"] = function (resolve, reject) {
    //#region Generated Code

//#endregion

// PSA - there are mobile breakpoint issues in BAU at this time

var containerScope = `[class*="components__ChatDiv-sc-"] ~ div > [class*="StyledGridContainer-VDS__sc"], [class*="StickyHeader__ButtonWrapperMobile-sc"] ~ div > [class*="StyledGridContainer-VDS__sc"]`;
var cardGroupScope = `[class*="components__AddonsCardGroup-sc"]`; // both sections

var COLLECT_MAP = {
  // for helpful general tagging
  'addonPageContainer': containerScope,
  'containerRow': `${containerScope} > [class*="RowWrapper-VDS__sc-"]`,
  'addOnCard': `${cardGroupScope} [class*="AddonCard__AddonsCardWrapper-sc"]`,
  'backupCard': `${cardGroupScope} [class*="BackUpPlanCard__AddonsBackupCardWrapper-sc"]`,
  'cardWrapper': `[class*="CardWrapper-sc"]`,

  // 3.1
  'continueCTACopy': `button[aria-label="Continue"] span[class*="StyledChildWrapper-VDS__sc"]`,

  // 4.1
  'accordionLabelText' :`.accordionButton [id*="accordionHeaderLabel"], .accordionButton + div h5`,
  'accordionDetailContentContainer': `[class*="StyledAccordionDetail-VDS__sc"] > div > div > [class*="ChildWrapper-VDS"]`, 
  
};

Object.keys(COLLECT_MAP).forEach(mutateKey => {
  var selector = COLLECT_MAP[mutateKey];
  collect(selector, mutateKey);
});

// switching approach away from using classes -> attributes for general tagging
// - since there are known issues with classes being replaced on page/browser interaction
mutate('addOnCard', this.key).customMutation((state, addOnCard) => {
  var containerRow = addOnCard.closest('[class*="RowWrapper-VDS__sc-"]');
  if (containerRow) containerRow.setAttribute('data-evolv-card-row', 'add-on');
});

mutate('backupCard', this.key).customMutation((state, backupCard) => {
  var containerRow = backupCard.closest('[class*="RowWrapper-VDS__sc-"]');
  if (containerRow) containerRow.setAttribute('data-evolv-card-row', 'backup');
});



// custom event
mutate('cardWrapper', this.key).on('click', e => {
  var card = e.target.closest('[class*="CardWrapper-sc"]');
  if (card.textContent.toLowerCase.includes('skip')) return;
  evolv.client.emit('opt324.click.select_plan')
});
;
  };
  evolv.javascript.variants["evolv_web_pws9uv10z"].timing = "immediate";
  evolv.javascript.variants["evolv_web_l682b37zp_hl4mh4v61"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_l682b37zp_hl4mh4v61"].timing = "immediate";
  evolv.javascript.variants["evolv_web_l682b37zp_3o54bi0ql"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_l682b37zp_3o54bi0ql"].timing = "immediate";
  evolv.javascript.variants["evolv_web_l682b37zp_ca4rnnruf"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_l682b37zp_ca4rnnruf"].timing = "immediate";
  evolv.javascript.variants["evolv_web_l682b37zp_3wrulk7qu"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_l682b37zp_3wrulk7qu"].timing = "immediate";
  evolv.javascript.variants["evolv_web_l682b37zp_io9p4xq2f"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_l682b37zp_io9p4xq2f"].timing = "immediate";
  evolv.javascript.variants["evolv_web_l682b37zp_3qm0ghnlp"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_l682b37zp_3qm0ghnlp"].timing = "immediate";
  evolv.javascript.variants["evolv_web_l682b37zp_cfhoxetmd"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_l682b37zp_cfhoxetmd"].timing = "immediate";
  evolv.javascript.variants["evolv_web_l682b37zp_ry7b1az8n"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_l682b37zp_ry7b1az8n"].timing = "immediate";
  evolv.javascript.variants["evolv_web_l682b37zp_zh37lejbn"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_l682b37zp_zh37lejbn"].timing = "immediate";
  evolv.javascript.variants["evolv_web_l682b37zp_i375dwclz"] = function (resolve, reject) {
    window.evolvTrack('opt317', '28_01');

collect.get('tenMbpsWarning').subscribe((action, tenMbpsWarning) => {
  console.log('action', action);
  if (action !== 1) {
    tenMbpsWarning.closest('label').classList.add('evolv-hasWarning');
  } else {
    tenMbpsWarning.closest('label').classList.remove('evolv-hasWarning');
  }
});




mutate('planCardInput').customMutation((state, planCardInput) => {
  planCardInput.insertAdjacentHTML('afterend', `
    <svg role="img" aria-hidden="false" aria-label="checkmark icon" viewBox="0 0 21.6 21.6" fill="#000000" class="StyledSVG-VDS__sc-1fane64-0 iYsPVa"><title>checkmark icon</title><path d="M19.74,5.29,7.88,17.15,1.74,11l.84-.84,5.3,5.31,11-11Z" stroke="none" fill="#000000"></path></svg>  
  `);
});

;
  };
  evolv.javascript.variants["evolv_web_l682b37zp_i375dwclz"].timing = "immediate";
  evolv.javascript.variants["evolv_web_l682b37zp_mjw9ywmwj"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_l682b37zp_mjw9ywmwj"].timing = "immediate";
  evolv.javascript.variants["evolv_web_l682b37zp"] = function (resolve, reject) {
    //#region Generated Code
collect(".EquipmentSection__LinksSection-sc-n98xxa-8:nth-child(1) > .StyledTypography-VDS__sc-5k55co-0", "router-header-copy-a9xtehj5i");
collect(["#\\34 8390 > .StyledDiv-VDS__sc-n9jxr1-0 > .StyledSVG-VDS__sc-1fane64-0"], "svg-nviaeh55u");
//#endregion

collect('[data-evolv-card-speed="10"] div[type="warning"]', 'tenMbpsWarning');

var scope = '.landing4g';
var plansSectionScope = `${scope} #plansContainer`;
var routerSectionScope = `${scope} #primaryEquipmentSel`;
var paymentSectionScope = `${scope} #routerPaymentSel`;
var COLLECT_MAP = {
  // easier section identification - see below
  'plansSection': plansSectionScope,
  'routerSection': routerSectionScope,
  'paymentSection': paymentSectionScope,
  'plansCardInner': `${plansSectionScope} [class*="PlanSelection__PlanCardGroup-sc"] [data-loc]`,
  
  // general/spinner
  'pageContent': `${scope} [class*="HeroSection__HeroDiv"] ~ div[style]:not([class*="LandingPage4G__ChatDiv"])`,

  // keeping old collectors just in case since they took time to figure out
  //
  // 'headline': `${scope} [class*="HeroSection__HeroDiv-sc"] h1`,
  // 'subHeader': `${scope} [class*="HeroSection__HeroDiv-sc"] [class*="SubtitleWrapper-VDS__sc"] h2, ${scope} .evolv-right-rail-header h1 + h2`,
  // 'loopQualEyebrow': `${scope} [class*="HeroSection__TitleLockupLQ-sc"] h2`,
  // 'contentWrapper': `${scope} [class*="HeroSection__HeroDiv"] ~ div:not([class*="LandingPage4G__"]) > [class*="StyledGridContainer-VDS__"] > [class*="RowWrapper-VDS__"] > div`,
  // 'routerRecoBadge': `${routerSectionScope} [class*="EquipmentSection__RecommendedBadge-sc"]`,
  // 'routerRecoBadgeCopy': `${routerSectionScope} [class*="EquipmentSection__RecommendedBadge-sc"] p`,
  // 'plansSectionAccordionButton': `${plansSectionScope} .accordionButton`,
  // 'routerSectionAccordionButton': `${routerSectionScope} .accordionButton`,
  // 'paymentSectionAccordionButton': `${paymentSectionScope} .accordionButton`,
  // // all accordions and input labels
  // 'accordionButton': `${scope} .accordionButton`,
  // 'inputLabels': `${scope} [data-loc] label`,
  // 'plansTenButton': `${plansSectionScope} [data-loc*="10"] button`,
  // 'routerButton': `${routerSectionScope} input[name="router"] + label button`,
  // 'payMonthlyButton': `${paymentSectionScope} [data-loc*="monthly"] button`,
  // 'planCardSpeed': `${plansSectionScope} [class*="PlanCard__FourGFiveGPlanBoxWrap-sc"] h4`,
  


  // 7.1
  'idleModalYesButton': `#portal [class*="IdleModal__SessionIdleModal"] button[aria-label="Yes"]`,

  // 11.1, 11.2
  'originalPlanCardContentTagged': `${plansSectionScope} [data-evolv-plan-order] .display-features`,
  'planCardsContainer': `${plansSectionScope} [class*="PlanSelection__PlanCardGroup-sc"]`,

  // 15.1
  // see 11

  // 16.1, 16.2
  'routerCardGroup': `${routerSectionScope} [class*="EquipmentSection__EquipmentCardGroup-sc"]`,

  // 18.1
  'promoBannerContainer': `${scope} [class*="PlanSelection__PromoBannerContainer-sc"]`,

  // 21.1
  'continueButton': `${scope} button[aria-label="Continue"]`, // there are 3
  'cartIcon': `[class*="StickyHeader__FlexContainer-sc"] [class*="ButtonIconContainer-VDS__sc"] button`,
  'tabPanelButton': `${scope} [class*="StyledTabButton-VDS__sc"]`,

  // 23.2
  'promoStripParagraph': `${scope} .promoBannerStrip [class*="PlanSelection__GridSpanItem-sc"] p`,

  // 25.1
  'equipPayToggleInput': `.toggleSection-equip [class*="ToggleWrapper-VDS__sc"] input`,

  // 27.1
  'planSectionParagraph': `[class*="StyledAccordionItem-VDS__sc"] > .promoBannerdiv,
  [class*="PlanSelection__GridContainer-sc"] ~ .promoBannerdiv`,

  // 28.1
  'planCardInput': '[class*="PlanCard"] input',
};

Object.keys(COLLECT_MAP).forEach(mutateKey => {
  var selector = COLLECT_MAP[mutateKey];
  collect(selector, mutateKey);
});

// adding some section-level attributes for easier identification in events
mutate('plansSection', this.key).customMutation((state, plansSection) => {
  plansSection.setAttribute('data-evolv-section', 'plans');
});

mutate('routerSection', this.key).customMutation((state, routerSection) => {
  routerSection.setAttribute('data-evolv-section', 'router');
});

mutate('paymentSection', this.key).customMutation((state, paymentSection) => {
  paymentSection.setAttribute('data-evolv-section', 'payment');
});

// tagging the card wrapper with its speed for ordering/targeting
mutate('plansCardInner', this.key).customMutation((state, plansCardInner) => {
      var cardData = plansCardInner.getAttribute('data-loc');
      plansCardInner.parentNode.setAttribute('data-evolv-card-speed', cardData.toLowerCase().replace('4g:', '').replace(' mbps', ''))

});


window.evolv_opt317_addSpinnerTransition = (interval = 2000) => {
  // var pageContent = document.querySelector(`${scope} [class*="HeroSection__HeroDiv"] ~ div[style]:not([class*="LandingPage4G__ChatDiv"])`);
  // if(!pageContent) return;
  mutate('pageContent', this.key).customMutation((state, pageContent) => {
    var body = document.body;

    body.classList.add('evolv-spinner-active'); // not sure if getting replaced
    body.setAttribute('evolv-spinner-active', true);
    
    var cssProp = parseInt(interval); // just in case because we have math in the css
    if (typeof cssProp === 'number') body.style.setProperty('--interval', cssProp);
    
    // so we can keep the spinner centered
    var spinner = document.createElement('div');
    spinner.setAttribute('class', 'evolv-spinner-container');
    spinner.innerHTML = '<div class="evolv-spinner spinner-center"></div>';
    
    var spinnerAlreadyAdded = document.querySelector('.evolv-spinner');
    
    if(!spinnerAlreadyAdded) {
      pageContent.insertAdjacentElement('beforeend', spinner);
      
      setTimeout(() => {
        if(document.querySelector('.evolv-spinner')) spinner.remove();
        
        if(body.classList.contains('evolv-spinner-active')) body.classList.remove('evolv-spinner-active');
        
        var bodyAttribute = body.getAttribute('evolv-spinner-active');
          if(bodyAttribute && bodyAttribute === 'true') {
            body.setAttribute('evolv-spinner-active', false);
          }
      }, interval);
    }

    
  });
};



// SPA handling
if (!window.evolv_opt317_spaListener) {
  window.evolv_opt317_spaListener = true;

  window.history.pushState = (f => function pushState() {
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event('evolv_opt317_spaChange'));
    return ret;
  })(window.history.pushState);

  window.history.replaceState = (f => function replaceState() {
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event('evolv_opt317_spaChange'));
    return ret;
  })(window.history.replaceState);

  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('evolv_opt317_spaChange'));
  });
}


;
  };
  evolv.javascript.variants["evolv_web_l682b37zp"].timing = "immediate";
  evolv.javascript.variants["evolv_web_s3m9d6hts_b5b0e0czc"] = function (resolve, reject) {
    let app = evolv.app.opt321;

app.insertCTA('Select');
;
  };
  evolv.javascript.variants["evolv_web_s3m9d6hts_b5b0e0czc"].timing = "immediate";
  evolv.javascript.variants["evolv_web_s3m9d6hts_qor7t3ffu"] = function (resolve, reject) {
    //#region Generated Code
mutate('device-card-container-61ibrmino', this.key).customMutation(function initialize(state, subject) {
  subject.addEventListener('mouseover', function () {
    subject.style.outline = '2px solid black';
    subject.style.outlineOffset = '-2px';
    subject.style.transform = 'scale(1)';
    subject.style.transition = 'none';
  });
  subject.addEventListener('mouseout', function () {
    subject.style.outline = '';
    subject.style.outlineOffset = '';
    subject.style.transform = '';
    subject.style.transition = '';
  });
}, function modify(state, subject) {}, function revert(state, subject) {
  subject.style.outline = '';
  subject.style.outlineOffset = '';
  subject.style.transform = '';
  subject.style.transition = '';
});
//#endregion
window.evolvTrack('opt321', '02_01');;
  };
  evolv.javascript.variants["evolv_web_s3m9d6hts_qor7t3ffu"].timing = "immediate";
  evolv.javascript.variants["evolv_web_s3m9d6hts_ou4pi2nsx"] = function (resolve, reject) {
    window.evolvTrack('opt321', '03_01');

// tried to use genAI but needed !important to override;
  };
  evolv.javascript.variants["evolv_web_s3m9d6hts_ou4pi2nsx"].timing = "immediate";
  evolv.javascript.variants["evolv_web_s3m9d6hts_f2ce7ynmh"] = function (resolve, reject) {
    window.evolvTrack('opt321', '04_02');
// same as 4.1, slight CSS adjustment

mutate('startsAtPricing', this.key).customMutation((state, startsAtPricing) => {
  var toggle = document.createElement('button');
  toggle.setAttribute('class', 'evolv-pricing-toggle evolv-collapsed');
  toggle.innerHTML = `pricing details`;
  toggle.onclick = e => {

    e.stopPropagation();
    e.target.classList.toggle('evolv-collapsed');
  };

  var pricingContainer = startsAtPricing.parentNode;
  if (!pricingContainer.querySelector('.evolv-pricing-toggle')) pricingContainer.insertAdjacentElement('beforeend', toggle);
  
  // when you hover over a color swatch, the area repaints and there's a gross flicker
  document.body.setAttribute('data-evolv-pricing-toggle', 'applied');
});;
  };
  evolv.javascript.variants["evolv_web_s3m9d6hts_f2ce7ynmh"].timing = "immediate";
  evolv.javascript.variants["evolv_web_s3m9d6hts_nsi4ov4mn"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_s3m9d6hts_nsi4ov4mn"].timing = "immediate";
  evolv.javascript.variants["evolv_web_s3m9d6hts_kd6b28x12"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_s3m9d6hts_kd6b28x12"].timing = "immediate";
  evolv.javascript.variants["evolv_web_s3m9d6hts_4dnrnyozt"] = function (resolve, reject) {
    //#region Generated Code
mutate('brand-bar-bc7hxbvd1', this.key).hide();
//#endregion
window.evolvTrack('opt321', '07_01');;
  };
  evolv.javascript.variants["evolv_web_s3m9d6hts_4dnrnyozt"].timing = "immediate";
  evolv.javascript.variants["evolv_web_s3m9d6hts_rnhvjs1no"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_s3m9d6hts_rnhvjs1no"].timing = "immediate";
  evolv.javascript.variants["evolv_web_s3m9d6hts_cvh5wnxss"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_s3m9d6hts_cvh5wnxss"].timing = "immediate";
  evolv.javascript.variants["evolv_web_s3m9d6hts_mbr2kyvle"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_s3m9d6hts_mbr2kyvle"].timing = "immediate";
  evolv.javascript.variants["evolv_web_s3m9d6hts_tuortln3y"] = function (resolve, reject) {
  };
  evolv.javascript.variants["evolv_web_s3m9d6hts_tuortln3y"].timing = "immediate";
  evolv.javascript.variants["evolv_web_s3m9d6hts"] = function (resolve, reject) {
    //#region Generated Code
collect([".device-card"], "device-card-container-61ibrmino");
collect(".MobilityGridwall__GridwallTabBar-sc-ee0kus-1", "brand-bar-bc7hxbvd1");
collect(".sc-ifAKCX:nth-child(2) > .DeviceCard__DeviceContainer-sc-1drjk55-3", "div-p66u7o7mb");
//#endregion
var scope = '[class*="MobilityGridwall__MobilityGridwallWrap-sc"]';
var COLLECT_MAP = {
  // 2.1
  // created a component for genAI

  // 4.1
  'startsAtPricing': `${scope} [class*="DeviceCard__PricingContainer-sc"] > [class*="DeviceCard__PricingInfo-sc"]`,

  // 5.1
  'sortDropdown': `[class*="MobilityGridwall__StyledDropDownList-sc"]`,
  'filterSiderail': `[class*="GridwallFilterBar__GridFilter-sc"]`,
  'filterSortWrap': `[class*="MobilityGridwall__FilterSortWrap-sc"]`,
  'filterSortInput': `[class*="GridwallFilterBar__CBWrapper-sc"] input, [class*="MobilityGridwall__StyledDropDownList-sc"] select`,
  'siderailClearButton': `[class*="GridwallFilterBar__"] button[aria-label="Clear all"]`,

  // 6.1
  'startsAtPricingCopy': `${scope} [class*="DeviceCard__PricingContainer-sc"] > [class*="DeviceCard__PricingInfo-sc"] p`,

  //10,11
  'offerText': `[class*="DeviceCard__OfferText"]`
};

Object.keys(COLLECT_MAP).forEach(mutateKey => {
  var selector = COLLECT_MAP[mutateKey];
  collect(selector, mutateKey);
});


collect('[class*="GridwallFilterBar__FilterTitle"]', 'filterTitle');
collect('[class*="GridwallFilterBar__FilterTitle"] h4', 'filterTitleH4');
collect('[class*="MobilityGridwall__ColContainer"]', 'filterColumn');
collect('.evolv-caret', 'evolvCaret');




// concept 1 things - should be moved to variant at some point

evolv.app = evolv.app || {};
evolv.app.opt321 = {
  insertCTA(text){
    $mu('.device-card')
      .classes({'evolv-cardWithButton': true})
      .customMutation((_,card)=>{
        if (!/devices\/smartphone/.test(window.location.href)) return;
        
        card.insertAdjacentHTML('beforeend', ctaTemplate(text))
      });
  }
};


function ctaTemplate(text){
  return `
      <button style="display:none;" class="evolv-tile-button noOutline" display="flex" width="auto" aria-label="Go to details" role="button" aria-disabled="false" tabindex="0">
        <span tabindex="-1" display="flex" width="auto" class="evolv-button-text">
         ${text}
       </span>
      </button>
  `;
}




// SPA handling
if (!window.evolv_opt321_spaListener) {
  window.evolv_opt321_spaListener = true;

  window.history.pushState = (f => function pushState() {
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event('evolv_opt321_spaChange'));
    return ret;
  })(window.history.pushState);

  window.history.replaceState = (f => function replaceState() {
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event('evolv_opt321_spaChange'));
    return ret;
  })(window.history.replaceState);

  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('evolv_opt321_spaChange'));
  });
};
  };
  evolv.javascript.variants["evolv_web_s3m9d6hts"].timing = "immediate";
  (function () {
    const fn = (function(){"use strict";function n(n,t,e){return(t=(function(n){var t=(function(n,t){if("object"!=typeof n||null===n)return n;var e=n[Symbol.toPrimitive];if(void 0!==e){var o=e.call(n,t||"default");if("object"!=typeof o)return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(n)})(n,"string");return"symbol"==typeof t?t:String(t)})(t))in n?Object.defineProperty(n,t,{value:e,enumerable:!0,configurable:!0,writable:!0}):n[t]=e,n}function t(n,t){(null==t||t>n.length)&&(t=n.length);for(var e=0,o=new Array(t);e<t;e++)o[e]=n[e];return o}function e(n,e){var o="undefined"!=typeof Symbol&&n[Symbol.iterator]||n["@@iterator"];if(!o){if(Array.isArray(n)||(o=(function(n,e){if(n){if("string"==typeof n)return t(n,e);var o=Object.prototype.toString.call(n).slice(8,-1);return"Object"===o&&n.constructor&&(o=n.constructor.name),"Map"===o||"Set"===o?Array.from(n):"Arguments"===o||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o)?t(n,e):void 0}})(n))||e&&n&&"number"==typeof n.length){o&&(n=o);var i=0,a=function(){};return{s:a,n:function(){return i>=n.length?{done:!0}:{done:!1,value:n[i++]}},e:function(n){throw n},f:a}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var r,l=!0,c=!1;return{s:function(){o=o.call(n)},n:function(){var n=o.next();return l=n.done,n},e:function(n){c=!0,r=n},f:function(){try{l||null==o.return||o.return()}finally{if(c)throw r}}}}var o=function(){window.evolvApplyOpt326Softcode=function(t,o){var i=0;(function a(){if(!(i++>20)){if(!window.evolvTrack)return setTimeout(a,250);window.evolvSoftcode||(window.evolvSoftcode={});var r=window.location.pathname,l=!1,c=!1;switch(t){case"pdp_plans_tmp":case"plans_tmp":case"tmp":break;case"pdp":l=/\/business\/products\/devices\/smartphones\/\S/gi,c=function(t){var o,i,a="newControl_pdp_",r=".mobility-pdp-wrapper",l=(n(o={},"".concat(a,"quantityDropDown"),"".concat(r," select.numLines-dropdownSelect")),n(o,"".concat(a,"inlineAddToCart"),"".concat(r,' button[class*="Quantity__StyledButton-sc"]')),n(o,"".concat(a,"shoppingBag"),"".concat(r,' [class*="StickyHeader__FlexContainer-sc"] [class*="ButtonIconContainer-VDS__sc"]')),n(o,"".concat(a,"reviews"),"".concat(r,' [class*="PriceInfo__RatingContainer"]')),n(o,"".concat(a,"shippingContainer"),"".concat(r,' [class*="ShippingOptions__Container"]')),o);Object.keys(l).forEach((function(n){collect(l[n],n)})),window.evolv_opt326_pdp_urlCheck=function(){return/\/business\/products\/devices\/smartphones\/.+/gim.test(window.location.pathname)},window.evolv_opt326_spaListener||(window.evolv_opt326_spaListener=!0,window.history.pushState=(i=window.history.pushState,function(){var n=i.apply(this,arguments);return window.dispatchEvent(new Event("evolv_opt326_spaChange")),n}),window.history.replaceState=(function(n){return function(){var t=n.apply(this,arguments);return window.dispatchEvent(new Event("evolv_opt326_spaChange")),t}})(window.history.replaceState),window.addEventListener("popstate",(function(){window.dispatchEvent(new Event("evolv_opt326_spaChange"))}))),s("\n          [evolv-opt326_pdp*=newControl]:has(.evolv-stickyATC-container) ._15gifts-launcher-view {\n            bottom: 103px !important;\n          }\n          [evolv-opt326_pdp*=newControl] [class*=ModalContainer-VDS] {\n            z-index: 9999;\n          }\n          [evolv-opt326_pdp*=newControl] .evolv-stickyATC-container {\n            background-color: #fff;\n            text-align: center;\n            z-index: 20;\n          }\n          @media (max-width: 767px) {\n            [evolv-opt326_pdp*=newControl] .evolv-stickyATC-container {\n              position: fixed;\n              bottom: 0;\n              left: 0;\n              width: 100vw;\n              border-top: 1px solid #D2D5D5;\n              padding: 12px 20px 21px;\n              z-index: 9999;\n              display: flex;\n              justify-content: space-between;\n              align-items: flex-end;\n            }\n          }\n          @media (min-width: 768px) {\n            [evolv-opt326_pdp*=newControl] .evolv-stickyATC-container .evolv-mobile {\n              display: none !important;\n            }\n          }\n          @media (max-width: 767px) {\n            [evolv-opt326_pdp*=newControl] .evolv-stickyATC-container .evolv-cta-container {\n              display: none !important;\n            }\n          }\n          [evolv-opt326_pdp*=newControl] .evolv-stickyATC-container .evolv-stickyATC {\n            background-color: #000;\n            color: #fff;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            border: none;\n            border-radius: 2.75rem;\n            font-weight: 700;\n            line-height: 1.3333;\n            font-family: Verizon-NHG-eDS;\n            max-height: 32px;\n            padding: 8px 16px;\n          }\n          @media (max-width: 767px) {\n            [evolv-opt326_pdp*=newControl] .evolv-stickyATC-container .evolv-stickyATC {\n              font-size: 16px;\n              width: 100%;\n              max-width: 230px;\n              max-height: 44px;\n              padding: 13px 24px 12px;\n              margin-left: 1rem;\n              pointer-events: all;\n            }\n          }\n          [evolv-opt326_pdp*=newControl] .evolv-stickyATC-container .evolv-stickyATC:hover {\n            cursor: pointer;\n          }\n          [evolv-opt326_pdp*=newControl] .evolv-stickyATC-container .evolv-stickyATC:disabled {\n            pointer-events: none;\n            background-color: #d8dada;\n          }\n          [evolv-opt326_pdp*=newControl] .evolv-stickyATC-container .evolv-sticky-qty .qty-label {\n            font-family: Verizon-NHG-eTX;\n            font-size: 12px;\n            margin-bottom: 5px;\n            text-align: left;\n          }\n          [evolv-opt326_pdp*=newControl] .evolv-stickyATC-container .evolv-styled-selected {\n            box-sizing: border-box;\n            border: 1px solid #6F7171;\n            border-radius: 4px;\n            height: 42px;\n            width: 84px;\n            display: flex;\n            justify-content: space-between;\n            align-items: center;\n            padding-inline: 10px;\n          }\n          [evolv-opt326_pdp*=newControl] .evolv-stickyATC-container .evolv-styled-selected .qty {\n            font-size: 16px;\n            font-family: Verizon-NHG-eDS;\n          }\n          [evolv-opt326_pdp*=newControl] .evolv-stickyATC-container .evolv-styled-selected .evolv-caret {\n            height: 1.25rem;\n            width: 1.25rem;\n          }\n          [evolv-opt326_pdp*=newControl] .evolv-stickyATC-container .evolv-styled-menu {\n            display: none;\n          }\n          [evolv-opt326_pdp*=newControl] .evolv-stickyATC-container .evolv-styled-menu.evolv-expanded {\n            display: block;\n            position: absolute;\n            left: 20px;\n            bottom: 20px;\n            width: 70px;\n            background-color: #fff;\n            border: 1px solid #000;\n          }\n          [evolv-opt326_pdp*=newControl] .evolv-stickyATC-container .evolv-styled-menu.evolv-expanded .option {\n            border-bottom: 1px solid #d8dada;\n            text-align: left;\n            padding: 13px 0 13px 14px;\n            font-size: 14px;\n          }\n          [evolv-opt326_pdp*=newControl] .evolv-stickyATC-container:not(.evolv-summary-bar) {\n            position: sticky;\n            top: 0;\n            left: 0;\n            width: 100vw;\n            padding: 16px 20px;\n            border-bottom: 1px solid #d8dada;\n            display: flex;\n            justify-content: center;\n          }\n          @media (max-width: 767px) {\n            [evolv-opt326_pdp*=newControl] .evolv-stickyATC-container:not(.evolv-summary-bar) {\n              position: fixed;\n              bottom: 0;\n              top: initial;\n            }\n          }\n          [evolv-opt326_pdp*=newControl] .evolv-stickyATC-container:not(.evolv-summary-bar) .evolv-cta-container {\n            width: 100%;\n            max-width: 1272px;\n            display: flex;\n            justify-content: flex-end;\n          }\n          @media (min-width: 1272px) {\n            [evolv-opt326_pdp*=newControl] .evolv-stickyATC-container:not(.evolv-summary-bar) .evolv-cta-container {\n              max-width: 1240px;\n            }\n          }\n          [evolv-opt326_pdp*=newControl] .evolv-stickyATC-container.evolv-summary-bar {\n            height: auto;\n          }\n          [evolv-opt326_pdp*=newControl] [class*=ShippingOptions__Container-sc][data-evolv-reviews-moved] [class*=ShippingOptions__Option] {\n            margin-bottom: 0;\n          }\n          [evolv-opt326_pdp*=newControl] [class*=ShippingOptions__Container-sc][data-evolv-reviews-moved] ~ [class*=PriceInfo__RatingContainer] {\n            margin-bottom: 60px;\n          }\n        "),window.evolvTrack("opt326_pdp","newControl"),mutate("".concat(a,"inlineAddToCart"),t).customMutation((function(n,o){if(window.evolv_opt326_pdp_urlCheck()){var i=(function(){var n=document.querySelector(".evolv-stickyATC-container");n&&n.remove();var t=document.createElement("div");t.classList.add("evolv-stickyATC-container"),t.innerHTML='\n            <div class="evolv-sticky-qty evolv-mobile">\n              <div class="qty-label">Quantity</div>\n              <div class="evolv-styled-selected">\n                <span class="qty">1</span>\n                <span class="evolv-caret">'.concat('<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21.6 21.6"><polygon points="10.8 15.71 1.8 6.71 2.62 5.89 10.8 14.07 18.98 5.89 19.8 6.71 10.8 15.71"></polygon></svg>','</span>\n              </div>\n              <div class="evolv-styled-menu">\n                <div class="option" value="1">1</div>\n                <div class="option" value="2">2</div>\n                <div class="option" value="3">3</div>\n                <div class="option" value="4">4</div>\n                <div class="option" value="5">5</div>\n                <div class="option" value="6">6</div>\n                <div class="option" value="7">7</div>\n                <div class="option" value="8">8</div>\n                <div class="option" value="9">9</div>\n                <div class="option" value="10">10+</div>\n              </div>\n            </div>\n            <button class="evolv-stickyATC evolv-mobile">Continue to plans</button>\n            <div class="evolv-cta-container">\n              <button class="evolv-stickyATC">Continue to plans</button>\n            </div>\n          ');var e=t.querySelector(".evolv-cta-container button"),o=t.querySelector("button.evolv-mobile");function i(){var n=document.querySelector('button[class*="Quantity__StyledButton-sc"]');if(n)return n.click()}e.onclick=function(){return i()},o.addEventListener("touchstart",i);var a=t.querySelector(".evolv-sticky-qty"),r=a.querySelector(".evolv-styled-selected"),l=r.querySelector(".qty"),c=a.querySelector(".evolv-styled-menu");return r.onclick=function(){c.classList.toggle("evolv-expanded")},a.querySelectorAll(".option").forEach((function(n){n.onclick=function(){l.textContent=n.textContent;var t=document.querySelector("select.numLines-dropdownSelect");if(t){var e=n.getAttribute("value");t.value=e,t.dispatchEvent(new Event("change",{bubbles:!0}))}n.closest(".evolv-styled-menu").classList.remove("evolv-expanded")}})),t})();if(i){var r=document.querySelector('[class*="StickyHeader__FlexContainer-sc"] [class*="ButtonIconContainer-VDS__sc"]');r&&i.classList.add("evolv-summary-bar");var l=document.querySelector(".mobility-pdp-wrapper"),c=i.querySelector("button");l&&((null!=r?r:l).insertAdjacentElement("beforebegin",i),mutate("".concat(a,"shoppingBag"),t).customMutation((function(n,t){l&&i&&!t.parentNode.querySelector(".evolv-summary-bar")&&(i.classList.add("evolv-summary-bar"),t.insertAdjacentElement("beforebegin",i))}))),setTimeout((function(){var n=o.textContent;n.length>1&&(c.textContent=n)}),500),new MutationObserver((function(n){var t,o=e(n);try{for(o.s();!(t=o.n()).done;){var i=t.value,a=i.target.closest("button");if("attributes"!==i.type||!i.attributeName)return;if("disabled"===i.attributeName||"aria-disabled"===i.attributeName){var r=a.getAttribute("aria-disabled"),l=!0===r||"true"===r;c.disabled=l}"aria-label"===i.attributeName&&(c.textContent=a.textContent)}}catch(n){o.e(n)}finally{o.f()}})).observe(o,{attributes:!0})}}})),mutate("".concat(a,"quantityDropDown"),t).on("change",(function(n){if(n.isTrusted){var t=n.target.value;if(t){var e=document.querySelector(".evolv-sticky-qty");if(!e)return;var o=e.querySelector(".evolv-styled-selected .qty"),i=e.querySelector('.option[value="'.concat(t,'"]'));o.textContent=i.textContent}}})),mutate("".concat(a,"shippingContainer"),t).customMutation((function(n,e){mutate("".concat(a,"reviews"),t).customMutation((function(n,t){window.evolv_opt326_pdp_urlCheck()&&(e.setAttribute("data-evolv-reviews-moved",!0),e.insertAdjacentElement("afterend",t))}))})),window.addEventListener("evolv_opt326_spaChange",(function(){var n=document.querySelector(".evolv-stickyATC-container");!window.evolv_opt326_pdp_urlCheck()&&n&&n.remove()}))};break;case"plans":l=/\/business\/shop\/plans/gi,c=function(t){var e="".concat('[class*="PlansNewContainer__TopSection-sc"] ~ [class*="PlansLanding__BottomSection"]',' [data-evolv-int-section="smartphones"]'),o="newControl_plans_",i=n({},"".concat(o,"promoBadgeCopy"),"".concat(e,' [class*="BusinessPlanCard__PromoBadge"] p'));Object.keys(i).forEach((function(n){var t=i[n];collect(t,n)})),s("\n          @media (max-width: 767px) {\n            [evolv-opt326_plans*=new_control] [class*=PlansNewContainer__TopSection-sc] ~ [class*=PlansLanding__BottomSection-sc] [data-evolv-int-section=smartphones] [class*=BusinessPlanCard__PromoBadge-sc] p {\n              white-space: nowrap;\n            }\n          }\n        "),window.evolvTrack("opt326_plans","new_control"),mutate("".concat(o,"promoBadgeCopy"),t).text("Get a device promo with this plan.")};break;default:return}l&&l.test(r)&&(!window.evolvSoftcode[t]&&c?(window.evolvSoftcode[t]=!0,c(o),console.info("opt326Softcodes - context target applied",t)):console.info("opt326Softcodes - nothing new to apply"))}function s(n){var e=document.createElement("style");e.id="opt326_"+t,e.type="text/css",e.innerHTML=n,document.head.appendChild(e)}})()}};return{__proto__:null,default:o,__moduleExports:o}})().default;
    fn({});
  })();
  (function () {
    const fn = (function(){"use strict";var e=function(){var e,t;function n(){switch(window.location.pathname){case"/business/products/networks/connectivity/5g-business-internet/":e="fiveg";break;case"/business/products/internet/":e="all"}e&&(collect("#lq-widget-continuebutton","checkAvailabilityCta"),mutate("checkAvailabilityCta").listen("click",(function(){var t=document.querySelector('#lq-widget-email-address svg[aria-label="success icon"]'),n=document.querySelector('#lq-widget-email-address svg[aria-label="success icon"]'),s=document.querySelector('#lq-widget-email-address svg[aria-label="success icon"]');t&&n&&s&&window.evolv.client.emit("click.check_availability_cta.".concat(e,"_business_internet"))})))}n(),e&&!window["evolv_".concat(e,"BusinessInternet_spaListener")]&&(window["evolv_".concat(e,"BusinessInternet_spaListener")]=!0,window.addEventListener("evolv_".concat(e,"BusinessInternet_spaListener"),(function(){n()})),history.pushState=(t=history.pushState,function(){var n=t.apply(this,arguments);return window.dispatchEvent(new Event("evolv_".concat(e,"BusinessInternet_spaListener"))),n}),history.replaceState=(function(t){return function(){var n=t.apply(this,arguments);return window.dispatchEvent(new Event("evolv_".concat(e,"BusinessInternet_spaListener"))),n}})(history.replaceState),window.addEventListener("popstate",(function(){window.dispatchEvent(new Event("evolv_".concat(e,"BusinessInternet_spaListener")))})))};return{__proto__:null,default:e,__moduleExports:e}})().default;
    fn({});
  })();
  (function () {
    const fn = (function(){"use strict";function e(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function n(n){for(var t=1;t<arguments.length;t++){var o=null!=arguments[t]?arguments[t]:{};t%2?e(Object(o),!0).forEach((function(e){r(n,e,o[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(o)):e(Object(o)).forEach((function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(o,e))}))}return n}function t(e){return t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},t(e)}function r(e,n,t){return(n=(function(e){var n=(function(e,n){if("object"!=typeof e||null===e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var r=t.call(e,n||"default");if("object"!=typeof r)return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===n?String:Number)(e)})(e,"string");return"symbol"==typeof n?n:String(n)})(n))in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){if(null==e)return{};var t,r,o=(function(e,n){if(null==e)return{};var t,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||(o[t]=e[t]);return o})(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}function i(e,n){return(function(e){if(Array.isArray(e))return e})(e)||(function(e,n){var t=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=t){var r,o,i,u,a=[],c=!0,s=!1;try{if(i=(t=t.call(e)).next,0===n){if(Object(t)!==t)return;c=!1}else for(;!(c=(r=i.call(t)).done)&&(a.push(r.value),a.length!==n);c=!0);}catch(e){s=!0,o=e}finally{try{if(!c&&null!=t.return&&(u=t.return(),Object(u)!==u))return}finally{if(s)throw o}}return a}})(e,n)||a(e,n)||(function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")})()}function u(e){return(function(e){if(Array.isArray(e))return c(e)})(e)||(function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)})(e)||a(e)||(function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")})()}function a(e,n){if(e){if("string"==typeof e)return c(e,n);var t=Object.prototype.toString.call(e).slice(8,-1);return"Object"===t&&e.constructor&&(t=e.constructor.name),"Map"===t||"Set"===t?Array.from(e):"Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?c(e,n):void 0}}function c(e,n){(null==n||n>e.length)&&(n=e.length);for(var t=0,r=new Array(n);t<n;t++)r[t]=e[t];return r}function s(e,i,u){var a=u-1;if(u<=0)return e;if(Array.isArray(e))return e.map((function(e){return s(e,i,u)}));if("object"!=t(e))return e;var c=e.macro,l=o(e,["macro"]),f=Object.keys(l).reduce((function(t,o){return n(n({},t),{},r({},o,s(e[o],i,a)))}),{});return c?n(n({},i[c]),f):f}function l(e){var t=(function(e){return e.apply.reduce((function(e,t){var r=t.defmacros;return r?n(n({},e),r):e}),{})})(e);return 0===Object.keys(t).length?e:s(e,t,3)}function f(e){return l((function(e){var t=Object.keys(e).filter((function(e){return/^_/.test(e)}));if(t.length>0){var o=Object.keys(e).filter((function(e){return!/^_/.test(e)})).reduce((function(t,o){return n(n({},t),{},r({},o,e[o]))}),{});return{apply:t.reduce((function(n,t){return[].concat(u(n),[e[t]])}),[o])}}return e})(e))}function p(e){window.evolv.metrics.executed.push(e)}function v(e){var n,t;window.evolv.metrics.warnings=(null===(n=window.evolv)||void 0===n||null===(t=n.metrics)||void 0===t?void 0:t.warnings)||[],window.evolv.metrics.warnings.push(e)}var d={};var m=["source"];var y={join:function(e,n,t,r){var o=e[n];if(o){var i=r||"|";return o.map((function(e){return x.getExpressionValue(t,e)})).filter((function(e){return e})).join(i)}},values:function(e,n,t,r){var o=e[n];return o?{values:Object.values(o)}:null},at:function(e,n,t,r){var o=Array.from(e[n]);return o?x.getExpressionValue(t,o.at(r)):null},sum:function(e,n,t){var r=e[n];if(r)return r.reduce((function(e,n){return e+(x.getExpressionValue(t,n)||0)}),0)},count:function(e,n,t){var r=e[n];if(r)return r.reduce((function(e,n){return e+(x.getExpressionValue(t,n)?1:0)}),0)},promise:function(e,n,t,r){var o=e[n];if(o){var i=function(e){return e},u=r||"then";return function(n,t){"then"===u?o.apply(e,[n]).then(t).catch(i):o.apply(e,[n]).then(i).catch(t)}}}};function g(e){return Array.isArray(e)?e:e.split(".")}function w(e){var n=e.indexOf("(");if(n<=0)return{name:e};var t=e.indexOf(")"),r=e.slice(n+1,t);return{name:e.slice(0,n),param:r}}var h={is:function(e,n){return e.indexOf(":")>0},process:function(e,n,t){var r=i(e.split(":"),3),o=r[0],u=r[1],a=r[2],c=w(u),s=y[c.name];try{if(a){var l=w(a);return(0,y[l.name])(s(n,o,t,c.param),c.name,t,l.param)}return s(n,o,t,c.param)}catch(e){return}}},b={is:function(e,n){return e.indexOf("(")>0},process:function(e,n,t){var r=e.indexOf("(");if(!(r<=0))try{var o=e.indexOf(")"),i=e.slice(r+1,o),u=n[e=e.slice(0,r)];return"function"==typeof u?u.apply(n,[i]):void 0}catch(e){return}}},x={getExpressionValue:function(e,n){var t=g(e),r=n||window;for("window"===t[0]&&(t=t.slice(1));t.length>0&&r;){var o=t[0];if(t=t.slice(1),h.is(o,t))r=h.process(o,r,t),t=[];else if(b.is(o,t))r=b.process(o,r,t);else{var i=r;"function"==typeof(r=r[o])&&(r=r.bind(i))}}return r},setExpressionValue:function(e,n,t){var r=g(e),o=r.pop(),i=x.getExpressionValue(r);i&&(t?i[o]+=n:i[o]=n)},getFetchValue:function(e){return fetch(e,{method:"POST",mode:"cors",cache:"no-cache",credentials:"same-origin",headers:{"Content-Type":"application/json"},redirect:"follow",referrerPolicy:"no-referrer",body:JSON.stringify({})}).then((function(e){return e.json()})).then((function(e){return e.data}))},getCookieValue:function(e){var n=document.cookie.split(";").find((function(n){return n.trim().split("=")[0]===e}));return n?n.split("=")[1]:null},getLocalStorageValue:function(e){return localStorage.getItem(e)},getSessionStorageValue:function(e){return sessionStorage.getItem(e)},getDomValue:function(e){return document.querySelector(e)&&"found"},getJqDomValue:function(e){return window.$&&$(e).length>0&&"found"},getQueryValue:function(e){try{return new URL(location.href).searchParams.get(e)}catch(e){return null}},getExtensionValue:function(e){if("distribution"===e)return Math.floor(100*Math.random());v({name:e,message:"No audience extension called"})}},O={session:window.sessionStorage,local:window.localStorage,default:window.sessionStorage};function S(e){return"".concat("evolv:").concat(e.key)}function E(e){return O[e.type||"default"]}function j(e,n,t){E(e).setItem(S(e),(function(e,n){switch(e){case"float":case"int":case"number":case"boolean":return n;case"array":return JSON.stringify(n);default:return n.toString()}})(n,t))}function k(e,n){return(function(e,n){if(null===n)return null;switch(e){case"float":return parseFloat(n);case"int":return parseInt(n);case"number":return Number(n);case"boolean":return/^true$/i.test(n);case"array":return JSON.parse(n);default:return n.toString()}})(n,E(e).getItem(S(e)))}function V(e,n){var t=n.storage,r=n.type||"string";if(!(function(e){return!!e.key||(v({storage:e,message:"No key for storage"}),!1)})(t))return e;var o=k(t,r),i=(function(e,n,t,r){if(null===r)return t;var o=e.resolveWith;if("array"===n)switch("string"==typeof r&&(r=JSON.parse(r)),o){case"cached":return r;case"new":return t;default:return u(new Set([].concat(u(r),u(t))))}else if("number"===n)switch(o){case"max":return Math.max(r,t);case"min":return Math.min(r,t);case"sum":return r+t;case"cached":return r;default:return t}else{if("boolean"!==n)return"cached"===o?r:t;switch(o){case"or":return r||t;case"and":return r&&t;case"cached":return r;default:return t}}})(t,r,e,o);return o!==i&&j(t,r,i),i}function A(e){return"string"==typeof e?e.replace(/[^0-9\.]/g,""):e}function P(e,n){switch(n){case"float":return parseFloat(A(e));case"int":return parseInt(A(e));case"number":return Number(A(e));case"boolean":return/^true$/i.test(e);case"array":return e;default:return e.toString()}}function I(e,n){var t=n||(function(e,n){switch(e){case"expression":case"on-async":return x.getExpressionValue(n);case"fetch":return x.getFetchValue(n);case"dom":return x.getDomValue(n);case"jqdom":return x.getJqDomValue(n);case"cookie":return x.getCookieValue(n);case"localStorage":return x.getLocalStorageValue(n);case"sessionStorage":return x.getSessionStorageValue(n);case"query":return x.getQueryValue(n);case"extension":return x.getExtensionValue(n)}return v({metric:{source:e,key:n},message:'source "'.concat(e,'" is invalid')})})(e.source,e.key),r=e.extract,o=e.value;if(r)if(r.attribute){var i=n[r.attribute];t=r.parse?i.match(new RegExp(r.parse,"i"))[0]:i}else if(r.expression)"function"!=typeof t&&(n="string"==typeof(n=n||t)?JSON.parse(n):n,t=x.getExpressionValue(r.expression,n));else if(r.parse&&"string"==typeof t){var u=new RegExp(r.parse,"i"),a=t.match(u);t=a&&a[0]}else v({metric:e,message:"extract did not include attribute or expression"});return o&&(t=o),e.storage?V(t,e):t}var N=["number","int","float"];function M(e,n,r){if(null==e)return!0;var o=n.value;return null==o&&(o=I(n,r||n.data)),"object"===t(e)?(function(e,n,t){var r=e.operator,o=e.value;if(n=P(n,t),N.includes(t))switch(r){case"<":return n<o;case"<=":return n<=o;case">":return n>o;case">=":return n>=o;default:console.info("evolv metrics: unsupported when operator for number",e)}else{if("string"===t)return new RegExp(o,"i").test(n);console.info("evolv metrics: complex when not operating on numbers",e)}return!1})(e,o,n.type):"string"==typeof e?new RegExp(e,"i").test(o):"boolean"==typeof e||"number"==typeof e?e===o:(console.info("evolv metrics: invalid when",e),!1)}var D=null,T=null;function _(e){return null!=e}function q(){var e=window.evolv.collect.scope("metrics-".concat((new Date).getTime()));D=e.collect,T=e.mutate}function L(){J.forEach((function(e){return clearInterval(e)})),void(J=[]),C.forEach((function(e){return e.revert()})),C=[]}var J=[];function R(e){clearInterval(e),J=J.filter((function(n){return n!==e}))}var C=[],F={};function U(e){var n,t=F[e.key];t||(n=e.tag,t="".concat(n,"-").concat(Q++),F[e.key]=t,D(e.key,t));var r=T(t);return C.push(r),r}var H={iframe:function(e,n,t){U(e).customMutation((function(r,o){if("focus"!==t)return v({metric:e,message:"Listening to iframe:".concat(t," not supported, did you intend iframe:focus")});window.addEventListener("blur",(function(e){document.activeElement==o&&n(null,o)}))}))},scroll:function(e,n){var t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:10;window.addEventListener("scroll",(function(){100*(window.scrollY/(document.body.offsetHeight-window.innerHeight))>=Number(t)&&n(null,window)}))},wait:function(e,n){var t,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:5e3;setTimeout((function(){return n(null,window)}),Math.max(Number(r)-((null===(t=performance)||void 0===t?void 0:t.now())||0),0))}},Q=0;function W(e,n){return{subscribe:function(t){if(M(e.when,n)){var r=I(e);if(_(r))return t(r,null),void 0}if(!(function(e){return e.poll&&"dom"!==e.source&&"query"!==e.source})(e))return _(e.default)&&t(e.default,e.default),void 0;var o=0,i=!1,u=setInterval((function(){try{if(!M(e.when,n))return;var r=I(e);o++,_(r)&&(i=!0,t(r,r),R(u))}catch(n){v({metric:e,error:n,message:"metric processing exception"})}}),e.poll.interval||50);(function(e){J.push(e)})(u),setTimeout((function(){R(u),!i&&e.default&&t(e.default,e.default)}),e.poll.duration||250)}}}var Y={dom:function(e){return{subscribe:function(n){if(e.on){var t=function(e){return e.includes(":")},r=e.on.split(" "),o=r.filter((function(e){return t(e)}));r.filter((function(e){return!t(e)})).forEach((function(t){return U(e).listen(t,(function(e){return n(null,e.target)}))})),o.forEach((function(t){var r=t.split(":"),o=H[r[0]];r.length>=2&&o?o(e,n,r[1]):v({metric:e,message:"event ".concat(t," is an invalid extended event")})}))}else{var i=function(e,t){return n(null,t)};U(e).customMutation(i,i)}}}},onAsync:function(e){return{subscribe:function(n){if(!e.on)return e.data?n(null,e.data):v({metric:e,message:"on-async requires attribute 'on'"});var t=x.getExpressionValue(e.key);if(!t.on||"function"!=typeof t.on)return v({metric:e,message:"on-async object from '${metric.key}' did not have method 'on'"});t.on(e.on,(function(){n(null,{params:arguments})}))}}},expression:function(e,n){var t=W(e,n);return{subscribe:function(n){t.subscribe((function(t){if("function"==typeof t){var r=t;if(!e.on)return e.data?n(null,e.data):v({metric:e,message:"on-async requires attribute 'on'"});function o(){for(var e=arguments.length,t=new Array(e),r=0;r<e;r++)t[r]=arguments[r];n(null,{params:t})}r(e.on,o)}else n(t,t)}))}}}};function z(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r=e.source;e.key;switch(r){case"dom":return Y.dom(e,t);case"expression":return Y.expression(e,t);case"on-async":return Y.expression(n(n({},e),{},{source:"expression",key:"".concat(e.key,".on")}),t);default:return Y[r]?Y[r](e,t):W(e,t)}}var B=[];function G(e,t){if(M(e.when,t)&&!B.includes(e)){B.push(e);var r=(function(e,t){var r=e.key,i=(e.apply,e.value,e.comment,e.when,o(e,["key","apply","value","comment","when"]));return Object.keys(t).some((function(e){return m.includes(e)}))?n(n({},i),t):n(n({},i),{},{key:r},t)})(t,e);(function(e){window.evolv.metrics.evaluating.push(e)})(r),e.apply?!(function(e,n){return e.key&&e.key!==n.key})(r,t)?(e.data=t.data,K(e.apply,r)):(function(e,n,t){z(n,t).subscribe((function(t,r){n.data=e.data=r;n.on,n.when;var i=o(n,["on","when"]);e.key||(n.key=e.key),K(e.apply,i)}))})(e,r,t):!(function(e){return!!e.source&&"string"==typeof e.source&&!!e.tag&&"string"==typeof e.tag})(r)?e.comment||v({metric:r,message:"Evolv Audience - Metric was incomplete: "}):(function(e,t){"event"===e.action?(function(e,n,t){var r=!1;z(n,t).subscribe((function(t,o){if(!r){r=!0;var i=(function(e,n){var t=/\${([^}]*)}/,r=e.match(/((\${([^}]*)})|([^${}])+)/g);if(!n)return e;var o=function(e,r){var o=r.match(t);return e+(o?x.getExpressionValue(o[1],n):r)}.bind(this);return r.reduce(o,"")})(e,o);setTimeout((function(){return(function(e,n,t){var r=d[e],o=(new Date).getTime();r&&r>o-500||(evolv.client.emit(e),p({tag:e,event:n,context:t}),d[e]=o)})(i,n,o)}),0)}}))})(e.tag,e,t):(function(e,t,r){try{z(t,r).subscribe((function(r,o){null==r&&(r=I(t,o)),null!=r&&(function(e,t,r){var o,i=window.evolv.context;if(r.default===t)o=t;else if(r.map){if(o=(function(e,n){var t,r,o=n.map,i=n.match;function u(e){return e.default||e.value}return"first"===(void 0===i?"first":i)?(r=o.find((function(n){return n.when?new RegExp(n.when,"i").test(e):n.default||n.value})))?u(r):n.default:0===(r=o.filter((function(n){return n.when?new RegExp(n.when,"i").test(e):(t=n,null)}))).length&&t?u(t):1===r.length?u(r[0]):null})(t,r),!(o||r.type&&"string"!==r.type))return}else o=r.combination?(function(e,t){var r=t.combination,o=r.operator,i=r.metric,u=n({source:t.source,key:t.key,type:t.type},i),a=I(u);if("number"!=typeof e||"number"!=typeof a)return v({metric:u,message:"value ".concat(e," or ").concat(a," is not a number")}),void 0;switch(o){case"product":return e*a;case"sum":return e+a;case"min":return Math.min(e,a);case"max":return Math.max(e,a);default:return v({metric:u,message:"operator ".concat(o," for combination, is invalid")}),e}})(t,r):P(t,r.type);i.get(e)!==o&&(i.set(e,o),p({tag:e,bind:r,value:o}))})(e,r,t)}))}catch(n){v({metric:t,tag:e,message:"Unable to add audience for: ".concat(n)})}})(e.tag,e,t)})(r,t)}}function K(e,n){if(!Array.isArray(e))return v({applyList:e,context:n,message:"Evolv Audience warning: Apply list is not array"});e.forEach((function(e){return G(e,n)}))}var X,Z,ee,ne={source:"expression",key:"location.pathname"},te={};X=ee="evolv_metrics_spaChange",window.history.pushState=(Z=window.history.pushState,function(){var e=window.location.href,n=Z.apply(this,arguments);return e!=window.location.href&&window.dispatchEvent(new Event(X)),n}),window.history.replaceState=(function(e){return function(){var n=window.location.href,t=e.apply(this,arguments);return n!=window.location.href&&window.dispatchEvent(new Event(X)),t}})(window.history.replaceState),void window.addEventListener("popstate",(function(){window.dispatchEvent(new Event(X))})),void window.addEventListener(ee,(function(){L(),window.evolv.metrics={executed:[],evaluating:[]},requestAnimationFrame((function(){B=[],void(function e(n){n.data=void 0,(n.apply||[]).forEach(e)})(te),G(te,ne)}))}));var re=function(e){try{if(q(),window.evolv.metrics=window.evolv.metrics||{executed:[],evaluating:[]},!e)return v({json:e,message:"Evolv Audience warning: Apply list is not array"});G(te=f(e),ne)}catch(e){v({error:e,message:"Evolv Audience error: Unable to process config"})}};return{__proto__:null,default:re,__moduleExports:re}})().default;
    fn({"source":"expression","key":"window.location.pathname","action":"bind","apply":[{"tag":"progression.step","action":"bind","type":"number","map":[{"value":1,"when":"/business/shop/products/devices/smartphones($|\\?)"},{"value":2,"when":"/business/products/devices/smartphones/.+"},{"value":4,"when":"/business/shop/plans"},{"value":5,"when":"/business/shop/features"},{"value":6,"when":"/business/shop/shopping-cart"}]},{"when":"/business/products/devices/smartphones/.+","action":"bind","type":"number","source":"dom","key":"button[data-track='Add to cart']","on":"click","apply":[{"tag":"progression.step","value":3},{"tag":"progression.score","value":72},{"tag":"progression.weighted.deviceCount","source":"localStorage","key":"_cartData","extract":{"expression":"devices:values:sum.quantity"},"combination":{"operator":"product","metric":{"value":72}}}]},{"tag":"progression.score","action":"bind","type":"number","default":0,"map":[{"value":25,"when":"/business/shop/products/devices/smartphones($|\\?)"},{"value":40,"when":"/business/products/devices/smartphones/.+"},{"value":76,"when":"/business/shop/plans"},{"value":95,"when":"/business/shop/features"},{"value":100,"when":"/business/shop/shopping-cart"}]},{"tag":"progression.weighted.deviceCount","source":"localStorage","key":"_cartData","extract":{"expression":"devices:values:sum.quantity"},"type":"number","combination":{"operator":"product","metric":{"source":"expression","type":"number","default":0,"key":"window.evolv.context.remoteContext.progression.score"}},"poll":{"duration":500}},{"tag":"progression.page.load","action":"event","apply":[{"when":"/business/shop/products/devices/smartphones($|\\?)"},{"when":"/business/products/devices/smartphones/.+"},{"when":"/business/shop/plans"},{"when":"/business/shop/features"},{"when":"/business/shop/shopping-cart"}]},{"key":"window.performance.now()","type":"number","tag":"performance.evolvStarted"},{"tag":"config.distribution","action":"bind","source":"extension","key":"distribution","type":"number","storage":{"type":"local","key":"distribution","resolveWith":"cached"}},{"source":"expression","poll":{"interval":50,"duration":5000},"tag":"vbg.pageName","key":"window.digitalData.pageInfo.pageName"},{"source":"expression","poll":{"interval":50,"duration":5000},"tag":"vbg.flowName","key":"window.digitalData.pageInfo.flowName"},{"comment":"Cart Page","when":"^/business/shop/shopping-cart","action":"event","apply":[{"comment":"Page View | Cart","tag":"metrics.page.cart"},{"source":"dom","on":"click","apply":[{"tag":"metrics.click.continue_button.cart","key":"button[aria-label='Continue']"}]},{"action":"bind","type":"number","apply":[{"source":"localStorage","key":"_cartData","apply":[{"tag":"cart.due.monthly","extract":{"expression":"totalAmounts.dueMonthly"}},{"tag":"cart.due.today","extract":{"expression":"totalAmounts.dueToday"}},{"tag":"cart.deviceCount","extract":{"expression":"devices:values:sum.quantity"}}]},{"source":"expression","poll":{"duration":10000,"interval":50},"apply":[{"key":"window.digitalData.shoppingCartInfo.shoppingCartInfo.productsArray:count","tag":"cart.productCount"},{"key":"window.digitalData.shoppingCartInfo.shoppingCartInfo.totalDevicesCount","tag":"cart.dlDeviceCount"}]}]}]},{"comment":"Smartphone PDP Page","when":"^/business/products/devices/smartphones/[^?].+","action":"event","apply":[{"comment":"Page View | Smartphone PDP","tag":"metrics.page.prospect_smartphone_pdp"},{"source":"dom","on":"click","apply":[{"tag":"metrics.click.add_to_cart.prospect_smartphone_pdp","key":"button[aria-label='Add to cart']"}]}]},{"comment":"Thank You Page","when":"^/business/shop/automation/thank-you","action":"event","apply":[{"comment":"Page View | Thank You","tag":"metrics.page.thank_you"}]},{"comment":"Smartphone Plans Page","when":"^/business/shop/plans","action":"event","apply":[{"comment":"Page View | Smartphone Plans","tag":"metrics.page.plans"}]},{"comment":"Smartphone TMP Page","when":"^/business/shop/features","action":"event","apply":[{"comment":"Page View | Smartphone TMP","tag":"metrics.page.tmp"},{"source":"dom","on":"click","apply":[{"tag":"metrics.click.select_plan_button","key":"[class*='BusinessPlanCard__'] button"}]}]},{"comment":"Page View | LTE and 5G Internet Plans","when":"^/business/shop/products/networks/connectivity/lte-business-internet/plans|^/business/shop/solutions/5g/plans","action":"event","tag":"metrics.page.lte_or_5g_internet"},{"comment":"LTE Business Internet Plans Page","when":"^/business/shop/products/networks/connectivity/lte-business-internet/plans","action":"event","apply":[{"comment":"Page View | LTE Business Internet Plans","tag":"metrics.page.lte_business_internet"},{"source":"dom","on":"click","apply":[{"tag":"metrics.click.continue_button.lte_business_internet","key":"button[aria-label='Continue']"}]}]},{"comment":"Business Info","when":"^/business/shop/unified-checkout/verifyBusiness","action":"event","apply":[{"comment":"Page View | Business Info","tag":"metrics.page.business_info"},{"source":"dom","on":"click","apply":[{"tag":"metrics.click.accept_and_continue.businessInfo","key":"button[aria-label='Accept and continue']:not([disabled]), .mobile-view-btn-continue button:not([disabled])"}]}]},{"comment":"Business Info","when":"^/business/shop/checkout","action":"event","apply":[{"comment":"Page View | Business Info","tag":"metrics.page.business_info"},{"source":"dom","on":"click","apply":[{"tag":"metrics.click.accept_and_continue.businessInfo","key":"#BusinessVerification button[data-track*=\"Continue\"]:not([disabled])"}]}]}]});
  })();
  (function () {
    const fn = (function(){"use strict";var n=function(){function n(){if("/business/shop/solutions/5g/plans"===window.location.pathname){var n=".landing5g",e="\n              ".concat(n,' button[aria-label="Continue"][aria-disabled="false"],\n              ').concat(n," .evolv-checkout-button,\n              ").concat(n," .evolv-continue-button:not(.evolv-disabled)\n            ");collect(e,"eventContinueCTA"),mutate("eventContinueCTA").listen("click",(function(){window.evolv.client.emit("click.continue_cta.fiveg_business_internet_plans")}))}}var e;n(),window.evolv_fivegBusinessInternetPlans_spaListener||(window.evolv_fivegBusinessInternetPlans_spaListener=!0,window.addEventListener("evolv_fivegBusinessInternetPlans_spaListener",(function(){n()})),history.pushState=(e=history.pushState,function(){var n=e.apply(this,arguments);return window.dispatchEvent(new Event("evolv_fivegBusinessInternetPlans_spaListener")),n}),history.replaceState=(function(n){return function(){var e=n.apply(this,arguments);return window.dispatchEvent(new Event("evolv_fivegBusinessInternetPlans_spaListener")),e}})(history.replaceState),window.addEventListener("popstate",(function(){window.dispatchEvent(new Event("evolv_fivegBusinessInternetPlans_spaListener"))})))};return{__proto__:null,default:n,__moduleExports:n}})().default;
    fn({});
  })();
  (function () {
    const fn = (function(){"use strict";var o=function(){window.evolvTrack=function(o,t){if(!document||!document.body)return console.info("evolvTrack document.body does not exist"),setTimeout((function(){window.evolvTrack(o,t)}),250);var e=document.body.getAttribute("evolv-".concat(o));e?-1===e.indexOf(t)&&document.body.setAttribute("evolv-".concat(o),"".concat(e," ").concat(t)):document.body.setAttribute("evolv-".concat(o),t)}};return{__proto__:null,default:o,__moduleExports:o}})().default;
    fn({});
  })();
  (function () {
    const fn = (function(){"use strict";var t=function(){var t,e=0;function n(){if(!(e++>20))return window.evolv&&window.evolv.context&&window.evolv.context.remoteContext&&window.evolv.context.remoteContext.experiments&&window.evolv.context.remoteContext.experiments.allocations&&window.evolv.context.remoteContext.experiments.confirmations?(setTimeout((function(){var t=window.evolv.context.remoteContext.experiments.confirmations,e=window.evolv.context.remoteContext.experiments.allocations;window._uxa=window._uxa||[];for(var n=0;n<t.length;n++)for(var o=t[n].cid,i=0;i<e.length;i++){var a=e[i];o===a.cid&&window._uxa.push(["trackDynamicVariable",{key:"evolv_".concat(a.eid),value:"combination_".concat(a.ordinal)}])}}),250),void 0):setTimeout(n,250)}n(),window.evolv.csSpaListener||(window.evolv.csSpaListener=!0,window.addEventListener("cslocationchange",(function(){e=0,n()})),window.history.pushState=(t=window.history.pushState,function(){return window.dispatchEvent(new Event("cslocationchange")),t.apply(this,arguments)}),window.history.replaceState=(function(t){return function(){return window.dispatchEvent(new Event("cslocationchange")),t.apply(this,arguments)}})(window.history.replaceState),window.addEventListener("popstate",(function(){window.dispatchEvent(new Event("cslocationchange"))})))};return{__proto__:null,default:t,__moduleExports:t}})().default;
    fn({});
  })();
  (function () {
    const fn = (function(){"use strict";var t=function(){function t(t){try{JSON.parse(t)}catch(t){return!1}return JSON.parse(t)}collect("app-aem-promotion .joint-offer-promo-msg","jointOfferPromoMsgSchemaIntegration"),collect(".devicerow","deviceRowSchemaIntegration"),collect(".m-cartOrderDetails .dmonthly","orderTotalDueMonthlySchemaIntegration");var e=0;function o(){if(!(e++>20)){var n=window.localStorage.getItem("_cartData");if(!n)return setTimeout(o,250);var a=t(n);if(!(window.digitaldata&&window.digitaldata.shoppingCartInfo&&window.digitaldata.shoppingCartInfo.productsArray&&window.digitaldata.shoppingCartInfo.shoppingCartNewDevicesTotal&&a&&void 0!==a.totalAmounts&&void 0!==a.totalAmounts.dueMonthly&&void 0!==a.totalAmounts.dueToday))return setTimeout(o,250);var i=(function(t){var e=0;if(t){var o=t.totalAmounts;o&&o.dueMonthly&&(e=o.dueMonthly)}return e})(a),s=(function(t){var e=0;if(t){var o=t.totalAmounts;o&&o.dueToday&&(e=o.dueToday)}return e})(a),r=0;return i&&s&&(r=i+s,window.evolv.context.set("cartDueMonthly",i),window.evolv.context.set("cartDueToday",s),window.evolv.context.set("cartTotalDue",r)),window.evolv.context.set("cartNewDeviceCount",window.digitaldata.shoppingCartInfo.shoppingCartNewDevicesTotal||0),0===r?setTimeout(o,0):void 0}}var n=0;function a(){return n++>20?(console.info("Evolv - pollForCartPageLoadedSafetyNet exceeded"),void 0):document.querySelector(".spinner1, .btn-spinner")?setTimeout(a,250):(setTimeout((function(){var t=document.querySelector("app-aem-promotion .joint-offer-promo-msg");"true"===window.sessionStorage.getItem("evolv_hasCartLtePromo")||t||(console.info("Evolv - setting hasCartLtePromo false (3)"),window.evolv.context.set("hasCartLtePromo",!1),window.sessionStorage.setItem("evolv_hasCartLtePromo",!1))}),250),void 0)}var i=0;function s(){if(!(i++>20)){var t=window.digitaldata;if(!t)return setTimeout(s,250);var e=t.pageInfo;if(!e)return setTimeout(s,250);var o=e.businessCredit;if(!o)return setTimeout(s,250);var n=1;o.toLowerCase().indexOf("federal")>-1&&(n=0),window.evolv.context.set("hasSsnInput_businessInfoPage",n)}}var r=0;function c(){if(!(r++>20)){var t=document.querySelector("app-root"),e=document.getElementById("root");if(t)window.evolv.context.set("lteBusinessInternetPlans_pageType","angular");else{if(!e)return setTimeout(c,250);window.evolv.context.set("lteBusinessInternetPlans_pageType","react")}}}var l,d=0;function v(){if(!(d++>20)){var t=document.querySelector("app-root"),e=document.getElementById("root");if(t)window.evolv.context.set("pageFramework","angular");else{if(!e)return setTimeout(v,250);window.evolv.context.set("pageFramework","react")}}}function u(){if("complete"!==document.readyState)return setTimeout(u,250);setTimeout((function(){var e,n,i,r;window.location.href.indexOf("https://www.verizon.com/business/")>-1&&((function(){var e=window.digitalData,o=null==e?void 0:e.shoppingCartInfo,n=!!o&&Object.keys(o).length>0;if(e&&n){var a=new XMLHttpRequest;a.open("POST","https://www.verizon.com/business/shop/cartcompsvc/prospect/cart/sessionCart"),a.setRequestHeader("Accept","application/json"),a.setRequestHeader("Content-Type","application/json");var i=0,s=0,r=0,c=0,l=!1;a.onreadystatechange=function(){if(4===a.readyState&&a.responseText){var e=t(a.responseText);if(e){window.evolv_sessionCart=e;var o=e.serviceStatus;if(o)if(500===o.statusCode)window.evolv.client.contaminate({reason:"sessionCartApiError",details:"url_path: "+window.location.pathname});else if(e.prospectFlowData){var n=e.prospectFlowData;if(n.cart){var d=n.cart;if(d){var v=d.packages;if(v)for(var u=Object.keys(v),w=0;w<u.length;w++){var p=v[u[w]];i++;var m=p.deviceCategory,h=p.deviceType,f=p.description,g=!!f&&!!f.match(/pda(\/|)smartphones/gi);!m&&g||g?s=1:"BroadbandAccess Devices"===m?(c=1,r=1,h&&"FOURGROUTER"===h&&(l=!0)):(r=1,h&&"FOURGROUTER"===h&&(l=!0))}}}}}window.evolv.context.set("cartTotalDeviceCount",i),window.evolv.context.set("hasSmartphoneInCart",s),window.evolv.context.set("hasNonSmartphoneDeviceInCart",r),window.evolv.context.set("hasBroadbandAccessDevice",c),window.evolv.context.set("hasFourgRouterInCart",l)}},a.send('{"shoppingPath":"PROSPECT","approach":"","flow":"prospect"}')}})(),v()),window.evolv.context.set("isPlansFirst","true"===window.sessionStorage.getItem("evolv-wasPlansFirst")?1:"true"===window.sessionStorage.getItem("isPlansFirst")?(window.sessionStorage.setItem("evolv-wasPlansFirst","true"),1):0),"/business/shop/plans"!==window.location.pathname&&"/business/shop/features"!==window.location.pathname||(e=[],n='[class*="PlansLanding__BottomSection-sc"] [class*="PlansLanding__ColNoPad-sc"] > div > h4[class*="StyledTitle-VDS__"]',i=document.querySelector(".mutate-int_sectionTitle"),r=document.querySelector(".mutate-int_firstSectionAccordion"),i||collect(n,"int_sectionTitle"),r||collect('[data-evolv-int-section], [data-evolv-int-section] + [id*="id"]:not([data-evolv-int-section]), [class*="FeaturesNewContainer__TopSection-sc"] + * [data-evolv-int-section] + div:not([class*="styleTag"]):not([data-evolv-int-section])',"int_sectionAccordion"),mutate("int_sectionTitle").customMutation((function(t,o){var a=document.querySelectorAll(n);a.length>0&&a.forEach((function(t){var o,n=null===(o=t.textContent)||void 0===o?void 0:o.toLowerCase();t.setAttribute("data-evolv-int-section-header",n);var a=t.nextElementSibling;a&&a.setAttribute("data-evolv-int-section",n),-1===e.indexOf(n)&&e.push(n);var i=e.indexOf("smartphones")>-1;window.evolv.context.set("plansHasSmartphone",i)}))})),mutate("int_sectionAccordion").customMutation((function(t,e){if(!e.getAttribute("data-evolv-int-section")){var o,n=e.id;if(n){var a=n.replace(/\+.*/gi,"");o=document.querySelector('[id*="'.concat(a,'"][data-evolv-int-section]'))}else{var i=e.previousElementSibling;o=!!i.getAttribute("data-evolv-int-section")&&i}o&&e.setAttribute("data-evolv-int-section",o.getAttribute("data-evolv-int-section"))}}))),"/business/shop/business-info"===window.location.pathname&&s(),"/business/shop/shopping-cart"===window.location.pathname&&(o(),"true"===window.sessionStorage.getItem("evolv_hasCartLtePromo")?(console.info("Evolv - setting hasCartLtePromo true (1)"),window.evolv.context.set("hasCartLtePromo",!0)):(mutate("jointOfferPromoMsgSchemaIntegration").customMutation((function(t,e){console.info("Evolv - setting hasCartLtePromo true (2)"),window.evolv.context.set("hasCartLtePromo",!0),window.sessionStorage.setItem("evolv_hasCartLtePromo",!0)})),a())),window.location.href.indexOf("/business/shop/products/networks/connectivity/lte-business-internet/plans")>-1&&c()}),0)}u(),window.evolv.schemaSpaListener||(window.evolv.schemaSpaListener=!0,window.addEventListener("schemalocationchange",(function(){e=0,i=0,r=0,d=0,n=0,u()})),window.history.pushState=(l=window.history.pushState,function(){var t=l.apply(this,arguments);return window.dispatchEvent(new Event("schemalocationchange")),t}),window.history.replaceState=(function(t){return function(){var e=t.apply(this,arguments);return window.dispatchEvent(new Event("schemalocationchange")),e}})(window.history.replaceState),window.addEventListener("popstate",(function(){window.dispatchEvent(new Event("schemalocationchange"))})))};return{__proto__:null,default:t,__moduleExports:t}})().default;
    fn({});
  })();
  (function () {
    const fn = (function(){"use strict";function n(t){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(n){return typeof n}:function(n){return n&&"function"==typeof Symbol&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n})(t)}function t(n,t,e){return t in n?Object.defineProperty(n,t,{value:e,enumerable:!0,configurable:!0,writable:!0}):n[t]=e,n}function e(n,t){var e=Object.keys(n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(n);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable}))),e.push.apply(e,r)}return e}function r(n){for(var r=1;r<arguments.length;r++){var o=null!=arguments[r]?arguments[r]:{};r%2?e(Object(o),!0).forEach((function(e){t(n,e,o[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(o)):e(Object(o)).forEach((function(t){Object.defineProperty(n,t,Object.getOwnPropertyDescriptor(o,t))}))}return n}function o(n){this.event=n,this.localVars={}}o.prototype.isLocalVar=function(n){return 0===n.indexOf("@")},o.prototype.eventValue=function(n){var t=this.event;switch(n){case"combination_id":return t.ordinal;case"experiment_id":return t.group_id;case"user_id":return t.uid;default:return t[n]||""}},o.prototype.parseTemplateString=function(n){var t=/\${([^}]*)}/,e=n.match(/((\${([^}]*)})|([^${}])+)/g),r=function(n,e){var r=e.match(t);return n+(r?this.eventValue(r[1]):e)}.bind(this);return e.reduce(r,"")},o.prototype.extractValue=function(t){return Array.isArray(t)?this.buildArray(t):"object"===n(t)?this.buildMap(t):this.isLocalVar(t)?this.localVars[t]:this.parseTemplateString(t)},o.prototype.buildMap=function(n){var t=this,e=Object.keys(n),r={};return e.forEach((function(e){r[e]=t.extractValue(n[e])})),r},o.prototype.buildArray=function(n){var t=this;return n.map((function(n){return t.extractValue(n)}))};var i={confirmed:"experiments.confirmations",contaminated:"experiments.contaminations"};function c(n){for(var t=window.evolv.context.get("experiments").allocations,e=0;e<t.length;e++)if(t[e].cid===n)return t[e]}function a(n){return Array.isArray(n)?n:n.split(".")}function u(n,t,e,r){var o=a(n),i=o.pop(),c=f(o);r.isLocalVar(i)&&(c=r.localVars),c&&(e?c[i]+=t:c[i]=t)}function l(n,t,e){var r=a(n),o=r.pop(),i=f(r);if("function"!=typeof i[o])return console.warn("Evolv: Is not proper emit function",i,o),void 0;try{return e?new(Function.prototype.bind.apply(i[o],[null].concat(t))):i[o].apply(i,t)}catch(n){console.warn("Evolv: Could not guarantee success for analytics invocation.")}}function f(n){var t=a(n),e=window;for("window"===t[0]&&(t=t.slice(1));t.length>0&&e;){var r=t[0];if(t=t.slice(1),r.indexOf("(")>0)try{var o=e[r=r.slice(0,-2)];e="function"==typeof o?o.apply(e,[]):void 0}catch(n){}else{var i=e[r];e="function"==typeof i&&0===t.length?i.bind(e):i}}return e}function s(n,t){var e;return e=n.with?t.extractValue(n.with):s(n.withExpression,t),n.bind?u(n.bind,e,!1,t):n.append?u(n.bind,e,!0,t):n.invoke?l(n.invoke,e):n.init?l(n.init,e,!0):(console.info("Evolv: Nothing to run for",this.statement),void 0)}function v(n){return(function(n,t){var e=n.ordinal===Math.min.apply(null,t);return{activeCombinations:e?t.join("|"):"",controlTag:e?"(Control)":""}})(n,m(n.eid)||[])}var p=!1;var d="evolv:active-combinations",y="https://participants.evolv.ai/v1/";function h(){try{var n=window.localStorage.getItem(d);return n||(n="{}",window.localStorage.setItem(d,n)),JSON.parse(n)}catch(n){return console.info("evolv active combinations not available",n),{}}}function m(n){return h()[n]}var b={activeCombinations:{extend:v,deferredExtend:function(n){var e=window.evolv.client.environment,o=n.eid,i=m(o);return p||i?null:(function(n){return fetch(y+n).then((function(n){return n.json()})).then((function(n){return n._experiments}))})(e).then((function(e){try{var i=e.map((function(n){return n.id})),c=e.find((function(n){return n.id===o})),a=null==c?void 0:c._candidates.map((function(n){return null==n?void 0:n.ordinal}));return p=!0,u=i,l=h(),f=u.reduce((function(n,e){return r(r({},n),{},t({},e,l[e]))}),{}),window.localStorage.setItem(d,JSON.stringify(f)),(function(n,t){var e=h();e[n]=t;try{window.localStorage.setItem(d,JSON.stringify(e))}catch(n){}})(o,a),v(n)}catch(n){return console.info("evolv: failed to retrieve active combinations",n),null}var u,l,f}))}}};function w(n){return((null==n?void 0:n.extends)||[]).map((function(n){return b[n]||console.info("Evolv could not find extender",n),b[n]})).filter((function(n){return!!n}))}function g(n,t,e){if(n())return t(),void 0;var r=setInterval((function(){try{n()&&(t(),clearInterval(r),r=null)}catch(n){console.info("Evolv: Listener not processed")}}),e.interval);setTimeout((function(){r&&(clearInterval(r),console.info("Evolv: Listener timeout"))}),e.duration)}function O(n){var t=n.poll||{duration:2e3,interval:50},e=n.events||["confirmed"],r={confirmed:{},contaminated:{},others:{}},o=n.check,a=n.emit;g((function(){return window.evolv}),(function(){e.forEach((function(n){function e(){(function(n,t,e){for(var r=e[n]||e.others,o=i[n]||"",a=window.evolv.context.get(o)||[],u=0;u<a.length;u++)try{var l=a[u].cid;r[l]||(t(n,c(l)),r[l]=!0)}catch(n){console.info("Evolv: Analytics not sent",n)}})(n,a,r)}window.evolv.client.on(n,(function(n){g(o,e,t)}))}))}),t)}function x(n,t,e){function i(t){var e=n.statements,r=new o(t);try{e.forEach((function(n){s(n,r)}))}catch(n){console.info("statement failed",n)}}var c;i((c=e,w(n).reduce((function(n,t){var e;return r(r({},n),(null===(e=t.extend)||void 0===e?void 0:e.call(t,c))||{})}),c))),(function(n,t){var e=w(n).map((function(n){var e;return null===(e=n.deferredExtend)||void 0===e?void 0:e.call(n,t)})).filter((function(n){return!!n}));return Promise.all(e).then((function(n){return n.length>0?n.filter((function(n){return n})).reduce((function(n,t){return r(r({},n),t)}),t):null}))})(n,e).then((function(n){n&&i(n)}))}function E(n){return n.statements.every((function(n){var t=n.invoke||n.bind||n.init||n.append;if(n.bind){var e=a(t).slice(0,-1);return 0===e.length||!!f(e)}return!!f(t)}))}var j=function(n){Object.keys(n).forEach((function(t){try{var e=(function(n){for(var t=0;t<n.length;t++){var e=n[t];if(!e.page||new RegExp(e.page).test(location.pathname))return e}return null})(n[t]||[]);if(!e)return;O({events:e.events,check:E.bind(null,e),emit:x.bind(null,e),poll:e.poll})}catch(n){console.info("Evolv: Analytics not setup for",t)}}))};return{__proto__:null,default:j,__moduleExports:j}})().default;
    fn({"adobe":[{"statements":[{"bind":"@eventName","with":"EVOLV Test Loaded"},{"bind":"@eventPayloadObj","with":{"personalizationInfo":{"testID":"Combination_${combination_id}:${experiment_id}","testName":"${experiment_id}"}}},{"invoke":"window.digitalData.events.push","with":[{"eventName":"@eventName","eventPayload":"@eventPayloadObj"}]},{"invoke":"window.dataLayer.push","with":[{"event":"@eventName","eventPayload":"@eventPayloadObj"}]},{"bind":"@evolvTestLoaded","withExpression":{"init":"CustomEvent","with":["@eventName",{"detail":"@eventPayloadObj"}]}},{"invoke":"window.dispatchEvent","with":["@evolvTestLoaded"]}],"poll":{"duration":20000,"interval":50}}]});
  })();
  (function () {
    const fn = (function(){"use strict";var t=function(){window.evolv&&window.evolv.client&&window.evolv.client.on("confirmed",(function(t){!window.hasOwnProperty("doOnceEvolvSetCustomAttribute")&&window.NREUM&&window.NREUM.setCustomAttribute&&(window.doOnceEvolvSetCustomAttribute=!0,window.NREUM.setCustomAttribute("firstABTest",window.location.pathname))}))};return{__proto__:null,default:t,__moduleExports:t}})().default;
    fn({});
  })();
})(window.evolv, window.evolv.client, window.evolv.context, window.evolv.collect, window.evolv.mutate);

