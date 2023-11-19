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
    myStoryList = await User.getMyStories(currentUser);
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
        <button class="editMyStoryBtn">Edit</button>
        <button class="deleteMyStoryBtn">Delete</button>
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
  favStoryList = await User.getFav(currentUser);

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
// adding and delete favs

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

$allStoriesList.on(
  "click",
  ".deleteMyStoryBtn",
  async function deleteMyStoryHandler() {
    let storyId = this.parentElement.parentElement.parentElement.id;
    const res = await storyList.deleteMyStory(currentUser.loginToken, storyId);
    this.parentElement.parentElement.parentElement.remove();
    // update list
    storyList = await StoryList.getStories();
  }
);
// $allStoriesList.on(
//   "click",
//   ".editMyStoryBtn",
//   async function editMyStoryHandler() {
//     let storyId = this.parentElement.parentElement.parentElement.id;
//     let story = {
//       author: "pickingachu",
//       title: "ver3.0",
//       url: "https://www.coolmathgames.com/",
//     };

//     const res = await storyList.editMyStory(
//       currentUser.loginToken,
//       storyId,
//       story
//     );
//     // update list
//     storyList = await StoryList.getStories();
//     putMyStoriesOnPage();
//   }
// );

{
  let storyId;
  // Function to open the popup
  function openPopup(author, title, url) {
    $("#popupBackdrop").fadeIn();
    $("#title2").val(title);
    $("#author2").val(author);
    $("#url2").val(url);
  }

  // Function to close the popup
  $("#myPopupForm").on("submit", async function name(e) {
    e.preventDefault();
    let story = {};
    let elements = this.elements;

    for (let i = 0; i < elements.length; i++) {
      let input = elements[i];
      if (input.name && input.value) {
        story[input.name.slice(0, -1)] = input.value;
      }
    }
    // console.log(storyId);
    // console.log(story);
    const res = await storyList.editMyStory(
      currentUser.loginToken,
      storyId,
      story
    );
    closePopup();
    storyList = await StoryList.getStories();
    favStoryList = await User.getFav(currentUser);
    putMyStoriesOnPage();
  });
  function closePopup() {
    $("#popupBackdrop").fadeOut();
  }
  // Event handler to open the popup, e.g., on a button click
  $allStoriesList.on("click", ".editMyStoryBtn", function () {
    // console.log(this.closest(".story-link").val());
    // console.log($(this).closest(".story-link").val());
    let author = $(this)
      .closest("div")
      .prev("div")
      .find(".story-author")
      .text()
      .slice(3)
      .trim();
    let title = $(this)
      .closest("div")
      .prev("div")
      .find(".story-link")
      .text()
      .trim();
    let url = $(this)
      .closest("div")
      .prev("div")
      .find(".story-link")
      .attr("href")
      .trim();

    storyId = this.parentElement.parentElement.parentElement.id;

    openPopup(author, title, url);
  });

  // Event handler to close the popup when clicking outside the popup form
  $("#popupBackdrop").click(function (event) {
    if (event.target === this) {
      closePopup();
    }
  });
}

// Open Popup for User Profile
$("#nav-user-profile").click(function () {
  $("#popupUserProfile").fadeIn();
});

// Close Popup when clicking outside the form
$("#popupUserProfile").click(function (event) {
  if ($(event.target).is(".popup-backdrop")) {
    $(this).fadeOut();
  }
});

// Stop propagation for inner form click
$(".popup-form").click(function (event) {
  event.stopPropagation();
});

// Handle Form Submission
$("#popupUserProfileForm").submit(async function (event) {
  event.preventDefault(); // Prevent default form submission

  const formData = {};
  $(this)
    .find(":input")
    .each(function () {
      if (this.name && this.value) {
        formData[this.name] = this.value;
      }
    });

  console.log(formData);
  const res = await User.updateUser(formData);
  console.log(res);
});
$("#deteleUserBtn").on("click", function deleteUser() {
  $("#confirmationPopup").fadeIn();
});
$("#yesButton").click(async function () {
  $("#confirmationPopup").fadeOut();
  const res = await User.delteUser();
  console.log(res);
  // $("#popupUserProfile").fadeOut();
  window.location.reload();
});

$("#noButton").click(function () {
  $("#confirmationPopup").fadeOut();
  return;
});
