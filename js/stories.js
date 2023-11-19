"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
let favStoryList;
let myStoryList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  if (currentUser) {
    favStoryList = await User.getFav(currentUser);
  }
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function getFavStar(story) {
  let star = "fa-regular";
  if (currentUser) {
    for (let x in favStoryList.stories) {
      if (Story.compareStory(favStoryList.stories[x], story)) {
        star = "fa-solid";
        break;
      }
    }
  }
  return star;
}

function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup", story);
  const hostName = story.getHostName();
  const star = getFavStar(story);
  return $(`
  <li id="${story.storyId}">
    <div class="inside-li-container">
      <div>
        <i class="star-icon ${star} fa-star fa-xl"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story story-author">by ${story.author}</small>
        <small class="story story-user">posted by ${story.username}</small>
      </div>
    </div>
  </li>
  `);
}
//  generateMyStoriesMarkup for my stories to delete in that page
function generateMyStoriesMarkup(story) {
  const hostName = story.getHostName();
  const star = getFavStar(story);
  return $(`
  <li id="${story.storyId}">
    <div class="inside-li-container">
      <div>
        <i class="star-icon ${star} fa-star fa-xl"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story story-author">by ${story.author}</small>
        <small class="story story-user">posted by ${story.username}</small>
      </div>
      <div>
        <button class="editBtn">Edit</button>
        <button class="deleteBtn">Delete</button>
        </div>
    </div>
  </li>
    `);
}
/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  // console.log("hi on stroy");

  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}
// get all my fav stories
async function putFavStoriesOnPage() {
  $allStoriesList.empty();
  // loop through all of our stories and generate HTML for them
  for (let story of favStoryList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}
// get all the stroies I posted
async function putMyStoriesOnPage() {
  // console.log("hi on my stories");
  myStoryList = await User.getMyStories(currentUser);

  $allStoriesList.empty();
  // loop through all of our stories and generate HTML for them
  for (let story of myStoryList.stories) {
    const $story = generateMyStoriesMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}
// add story
$addStoryorm.on("submit", addStory);
async function addStory(evt) {
  evt.preventDefault();
  if (
    $("#title").val() !== "" &&
    $("#author").val() !== "" &&
    $("#url").val() !== ""
  ) {
    const addStroyFun = await storyList.addStory(currentUser, {
      title: $("#title").val(),
      author: $("#author").val(),
      url: $("#url").val(),
    });
    // checks if addStoryFun error or not (try try..catch but didn't work I guess because it's a function to another function that does that job)
    if (addStroyFun) {
      location.reload();
    } else {
      $addStoryorm.trigger("reset");
    }
  }
}
// $allStoriesList.on("click", ".fa-regular", addtoFav);
// async function addtoFav() {
//   let storyId = this.parentElement.parentElement.parentElement.id;
//   let res = await User.addFav(currentUser, storyId);
//   // console.log(res.user);
//   // console.log(favStoryList.stories);
//   // console.log(await User.getFav(currentUser));

//   $(this).removeClass("fa-regular").addClass("fa-solid");
//   favStoryList = await User.getFav(currentUser);
// }
// $allStoriesList.on("click", ".fa-solid", deleteFromFav);
// async function deleteFromFav() {
//   let storyId = this.parentElement.parentElement.parentElement.id;
//   // console.log(this.parentElement.parentElement.parentElement);
//   await User.deleteFav(currentUser, storyId);
//   $(this).removeClass("fa-solid").addClass("fa-regular");
//   favStoryList = await User.getFav(currentUser);
// }
// adding and delete favs
// toDO: Currently don't update HTML without hard reload. Same with adding new story
// toDO: also need to save favStoryList, myStoryList, maybe the current(storyList) to local storage or something

$allStoriesList.on("click", ".fa-regular, .fa-solid", toggleFav);
async function toggleFav() {
  let storyId = this.parentElement.parentElement.parentElement.id;
  if ($(this).hasClass("fa-regular")) {
    try {
      let res = await User.addFav(currentUser, storyId);
    } catch (error) {
      console.error("Error adding favorite:", error);
    }
  } else {
    try {
      await User.deleteFav(currentUser, storyId);
    } catch (error) {
      console.error("Error deleting favorite:", error);
    }
  }
  $(this).toggleClass("fa-regular fa-solid");
  try {
    favStoryList = await User.getFav(currentUser);
  } catch (error) {
    console.error("Error fetching favorites:", error);
  }
}
