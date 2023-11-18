"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  $addStoryorm.hide();
  putStoriesOnPage();
}
function navAllFavStories(evt) {
  hidePageComponents();
  $addStoryorm.hide();
  putFavStoriesOnPage();
}
function navAllMyStories(evt) {
  hidePageComponents();
  $addStoryorm.hide();
  putMyStoriesOnPage();
}
$body.on("click", "#nav-all", navAllStories);
// displaying favs
$body.on("click", "#fav-btn", navAllFavStories);
// displaying mt stories
$body.on("click", "#my-stories-btn", navAllMyStories);

/** Show login/signup on click on "login" */
function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

// addstory form
function addStoryClick(evt) {
  hidePageComponents();
  $addStoryorm.show();
}
$addStoryBtn.on("click", addStoryClick);
