---
title: Testing Network Requests With Axios Mock Adapter
date: '2019-01-08'
---

[Axios](https://github.com/axios/axios) and 
[Axios Mock Adapter v1.16.0](https://github.com/ctimmerm/axios-mock-adapter) are a really powerful
combination of tools when it comes to testing network requests made with Axios. I wanted to create 
a place to document the API and write a few tests for 
[this model](https://github.com/mackness/MVC-Movie-Finder/blob/master/src/scripts/model.js).


### Axios Mock Adapter API Overview
Mock Adapter's API can be broken down into three logical parts; 
[request matcher functions](https://github.com/ctimmerm/axios-mock-adapter/blob/8d4ba3864abe9ecb03dcc5dde01913c437149469/types/index.d.ts#L54-L61),
[request handler functions](https://github.com/ctimmerm/axios-mock-adapter/blob/8d4ba3864abe9ecb03dcc5dde01913c437149469/types/index.d.ts#L14-L21) 
and some additional [utility methods](https://github.com/ctimmerm/axios-mock-adapter/blob/8d4ba3864abe9ecb03dcc5dde01913c437149469/types/index.d.ts#L49-L52).
I will document all three in the following section then talk about practical use cases for each.

#### Request Matcher Functions
Request matcher functions are designed to take some information about a request like the URL 
query params, headers, request body content and use that information to match against Axios 
requests. When a match is made, request handler functions can be used to mock the request and define
the response. It's important to note that the information that you pass to matcher functions must 
match the request information perfectly, there is no concept of partial matches as of v1.16.0.
Here is what the function type looks like for all of the
[matcher functions](https://github.com/ctimmerm/axios-mock-adapter/blob/8d4ba3864abe9ecb03dcc5dde01913c437149469/types/index.d.ts#L54-L61):

```typescript
type RequestMatcherFunc = (
  matcher?: string | RegExp,
  body?: string | RequestDataMatcher,
  headers?: HeadersMatcher
) => RequestHandler;
```

<code class="not-pre">matcher</code> Can be a string or a RegExp literal and is used to match the URL. <br>
<code class="not-pre">body</code> The body can be a string or a
[RequestDataMatcher](https://github.com/ctimmerm/axios-mock-adapter/blob/8d4ba3864abe9ecb03dcc5dde01913c437149469/types/index.d.ts#L28) 
representing parts of the request information that we want to match against. In this case request 
information could be the request body or query params.<br>
<code class="not-pre">headers</code> 
[HeadersMatcher](https://github.com/ctimmerm/axios-mock-adapter/blob/8d4ba3864abe9ecb03dcc5dde01913c437149469/types/index.d.ts#L35) 
representing the request headers we want to match against.

#### Request Handler Functions
Request handler functions are returned by matcher functions and are used to configure and define 
the mocked response. Some of the request handler functions 
[accept configuration](https://github.com/ctimmerm/axios-mock-adapter/blob/8d4ba3864abe9ecb03dcc5dde01913c437149469/types/index.d.ts#L14-L17) 
and some of them [don't](https://github.com/ctimmerm/axios-mock-adapter/blob/8d4ba3864abe9ecb03dcc5dde01913c437149469/types/index.d.ts#L19-L21).
The request handler functions that accept configuration have the following function type:

```typescript
type ResponseSpecFunc = (
  statusOrCallback: number | CallbackResponseSpecFunc,
  data?: any,
  headers?: any
) => MockAdapter;
```

<code class="not-pre">statusOrCallback</code> This parameter can either be a status code as a number
or a [CallbackResponseSpecFunc](https://github.com/ctimmerm/axios-mock-adapter/blob/8d4ba3864abe9ecb03dcc5dde01913c437149469/types/index.d.ts#L3)
that takes axios config object as a parameter and returns the response configuration in the form of 
an array <code class="not-pre">[status, responseObject, headerObject]</code><br>
<code class="not-pre">data</code> is the response body.<br>
<code class="not-pre">headers</code> is an object that represents the response headers.

#### Utility Functions
[Utility functions](https://github.com/ctimmerm/axios-mock-adapter/blob/8d4ba3864abe9ecb03dcc5dde01913c437149469/types/index.d.ts#L48-L52)
account for the rest of the API surface area and they are pretty straight forward in terms of their
naming and usage.<br>
<code class="not-pre">adapter</code> returns an instance of 
[Axios Adapter](https://github.com/axios/axios/blob/75c8b3f146aaa8a71f7dca0263686fb1799f8f31/index.d.ts#L5)
which is basically the axios request configuration object.<br>
<code class="not-pre">reset</code> maintain mocking behavior but remove matcher function handlers. <br>
<code class="not-pre">restore</code> remove mocking behavior and matcher function handlers - 
restore the real Axios instance.<br>
<code class="not-pre">history</code> display history of requests categorized by HTTP verb. I'll show 
an example of the history object later on.

### Setup the Actual Test

The first thing that we need to think about is how to use the Axios Mock Adapter instance in a test 
and the real Axios instance in the application code. An easy way to accomplish that is to pass the 
Mock Axios instance into the Model class constructor:
 
 ```js
export default class Model {
    constructor({axiosInstance} = {}) {
        this.currentMovieList = [];
        this.movieDetailsCache = {};
        this._axios = axiosInstance ? axiosInstance : axios;
    }
 ```

 Now the mock instance can be used in test code and the real instance can be used in application 
 code.

 ### Pick a Request to Test

Let's use the movie details request on 
[line 45](https://github.com/mackness/MVC-Movie-Finder/blob/26eec40116934d9c15b1b0d74dbfbd20e63f23e4/src/scripts/model.js#L45) 
as the test subject.
```js
/**
  * @param {string} id movie imdbID as a string
  * @return {ApiResponse} details API response
  * @description Get movie details by imdbID
*/
loadMovieDetails = (id) => {
  if (this.movieDetailsCache[id]) {
    return Promise.resolve(this.movieDetailsCache[id]);
  } else {
    return this._axios
      .get(`http://www.omdbapi.com`, {params: {apikey: process.env.API_TOKEN, i: encodeURIComponent(id)}})
        .then((response) => this.movieDetailsCache[id] = response)
        .then((response) => this.validateApiResponse(response));
  }
}
```
The request is pretty straight forward. Load movie details from the API or the local cache.

### The Test Case
The first thing we need to do in the 
[model.spec.js](https://github.com/mackness/MVC-Movie-Finder/blob/master/src/tests/model.spec.js) file 
is setup instances of the model and mock adapter passing in the mock adapter instance into the 
model.

```js
const mockAxiosInstance = new MockAdapter(axios);
const model = new Model(mockAxiosInstance);
```
With that in mind consider the following test case. There is a lot going on but I'll go into detail
about each part in a sec.

```js{numberLines: true}
const mockDetailResponse = require('./mock-detail-response');
const imdbID = 'tt0372784';
const params = {
  params: {
    apikey: process.env.API_TOKEN,
    i: encodeURIComponent(imdbID)
  }
};

it('should respond with movie detail results based on a movie id', () => {
  mockAxiosInstance
    .onGet('http://www.omdbapi.com', params)
    .replyOnce(200, mockDetailResponse, {'x-cache': 'hit'});

  model.loadMovieDetails(imdbID)
    .then((response) => {
      assert.equal(response.status, 200);
      assert.deepEqual(response.data, mockDetailResponse);
      assert.equal(response.headers['x-cache'], 'hit');
    });
});
```

<!-- Then Axios Mock Adapter's <code class="not-pre">onGet</code> matcher method in combination with the 
<code class="not-pre">replyOnce</code> request handler can be used to create a mock 
response when <code class="not-pre">model.loadMovieDetails</code> is called -->

The example is pretty contrived but it does a good job of demonstrating the important parts of Axios
Mock Adapter's API that I talked about earlier in the post. I'll break down what is happening line
by line.

Lines 1 though 8 should be pretty straight forward. The mock response is stored in a variable along
with the imdbID and the request data matcher object that will eventually be passed to the
<code class="not-pre">onGet</code> matcher function.

On line 12 the <code class="not-pre">onGet</code> matcher function is used. The first parameter can 
either be a string or a RegExp literal to match the URL used in the loadMovieDetails request. The
second parameter is the 
[RequestDataMatcher](https://github.com/ctimmerm/axios-mock-adapter/blob/8d4ba3864abe9ecb03dcc5dde01913c437149469/types/index.d.ts#L28)
which can be used to match different parts of the request information such as the body or query 
params. The above example is matching the <code class="not-pre">apikey</code> and 
<code class="not-pre">i</code> query params.

On line 13 the <code class="not-pre">replyOnce</code> request handler is used to define the mocked
response. Like I mentioned earlier in the post request handlers support a callback that takes 
the request config as a parameter so line 13 can also be expressed this way:

```js
.replyOnce(config => [200, mockDetailResponse, {
  'x-cache': 'hit',
  'request-url': config.url
}]);
```

Which is useful if you need to use config information in your mock response for whatever reason.

Then on line 15 we call <code class="not-pre">model.loadMovieDetails</code> method and instead of 
making a network request and getting a response from the real imdb API the request is mocked and 
we get the response defined by <code class="not-pre">replyOnce</code>.

That's pretty much it, feel free to clone the
[movie finder app](https://github.com/mackness/MVC-Movie-Finder/) and run the tests. 
Thanks for reading!
