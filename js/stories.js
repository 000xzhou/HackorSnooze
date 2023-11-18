"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
let favStoryList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
  <li id="${story.storyId}">
    <i class="star-icon fa-regular fa-star fa-xl"></i>
        <div>
          <a href="${story.url}" target="a_blank" class="story-link">
            ${story.title}
          </a>
          <small class="story-hostname">(${hostName})</small>
          <small class="story-author">by ${story.author}</small>
          <small class="story-user">posted by ${story.username}</small>
        </div>
      </li>
      <hr>
    `);
}
function generateFavStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
  <li id="${story.storyId}">
    <i class="star-icon fa-regular fa-star fa-xl"></i>
        <div>
          <a href="${story.url}" target="a_blank" class="story-link">
            ${story.title}
          </a>
          <small class="story-hostname">(${hostName})</small>
          <small class="story-author">by ${story.author}</small>
          <small class="story-user">posted by ${story.username}</small>
        </div>
      </li>
      <hr>
    `);
}
/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.log("hi on stroy");

  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function putFavStoriesOnPage() {
  console.log("hi on fav");
  favStoryList = await StoryList.getFav();

  $allStoriesList.empty();
  // loop through all of our stories and generate HTML for them
  for (let story of favStoryList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

// add story
$addStoryorm.on("click", addStory);
async function addStory(evt) {
  evt.preventDefault();

  if (
    $("#title").val() !== "" &&
    $("#author").val() !== "" &&
    $("#url").val() !== ""
  ) {
    await storyList.addStory(currentUser, {
      title: $("#title").val(),
      author: $("#author").val(),
      url: $("#url").val(),
    });
  }
  $addStoryorm.trigger("reset");
}

// adding and delete favs
$allStoriesList.on("click", ".fa-regular", addtoFav);
async function addtoFav() {
  let storyId = this.parentElement.id;
  await User.addFav(currentUser, storyId);
  $(this).removeClass("fa-regular").addClass("fa-solid");
}
$allStoriesList.on("click", ".fa-solid", deleteFromFav);
async function deleteFromFav() {
  let storyId = this.parentElement.id;
  await User.deleteFav(currentUser, storyId);
  $(this).removeClass("fa-solid").addClass("fa-regular");
}
