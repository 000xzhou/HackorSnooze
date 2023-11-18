"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {
  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    // UNIMPLEMENTED: complete this function!
    return "hostname.com";
  }
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map((story) => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, newStory) {
    // UNIMPLEMENTED: complete this function!
    try {
      const newStoryResponse = await axios({
        url: `${BASE_URL}/stories`,
        method: "POST",
        data: {
          token: user.loginToken,
          story: {
            author: newStory.author,
            title: newStory.title,
            url: newStory.url,
          },
        },
      });
      const newStory2 = newStoryResponse.data;
      // build an instance of our own class using the new array of stories
      return new Story({
        storyId: newStory2.storyId,
        title: newStory2.title,
        author: newStory2.author,
        url: newStory2.url,
        username: newStory2.username,
        createdAt: newStory2.createdAt,
      });
    } catch (error) {
      console.log("error creating new story:" + " " + error);
    }
  }
  // get fav stories
  static async getFav() {
    try {
      const response = await axios({
        url: `${BASE_URL}/stories`,
        method: "GET",
      });

      // turn plain old story objects from API into instances of Story class
      const stories = response.data.stories.map((story) => new Story(story));
      const favOnly = stories.filter((story) =>
        currentUser.favorites.some((fav) => fav.storyId === story.storyId)
      );
      // build an instance of our own class using the new array of stories
      return new StoryList(favOnly);
    } catch (error) {
      console.log("getFav area error: " + " " + error);
    }
  }
}
/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor(
    { username, name, createdAt, favorites = [], ownStories = [] },
    token
  ) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map((s) => new Story(s));
    this.ownStories = ownStories.map((s) => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  // add fav to api
  static async addFav(user, storyId) {
    try {
      const res = await axios({
        url: `${BASE_URL}/users/${user.username}/favorites/${storyId}`,
        method: "POST",
        params: { token: user.loginToken },
      });
      const dataF = res.data;
      console.log(dataF);
    } catch (error) {
      console.log(error);
    }
  }
  static async deleteFav(user, storyId) {
    try {
      const res = await axios({
        url: `${BASE_URL}/users/${user.username}/favorites/${storyId}`,
        method: "DELETE",
        params: { token: user.loginToken },
      });
      const dataF = res.data;
      console.log(dataF);
    } catch (error) {
      console.log(error);
    }
  }
}
