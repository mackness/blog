---
title: Mocking Axios Requests With Axios Mock Adapter
date: '2018-12-31'
---

I have had a lot of fun working with [Axios](https://github.com/axios/axios) and 
[Axios Mock Adapter](https://github.com/ctimmerm/axios-mock-adapter) recently so I thought I would 
write a post documenting what I have learned.

[Axios](https://github.com/axios/axios) makes it really easy to:

* Make HTTP requests from the browser
* Make HTTP requests form node.js
* Cancel requests
* Perform automatic transforms on JSON data

I wrote a tiny vanilla JS [demo app](https://bitbucket.org/macksol/movie-finder/src/master/) that 
fetches movies from the IMDB API. Here is the model that we are going to write tests for -> 
[Model Class](https://bitbucket.org/macksol/movie-finder/src/master/src/scripts/model.js)


#### Setting up the Mock Axios Instance
The first thing that we need to think about is how to use the Axios Mock Adapter instance in a test
and the real Axios instance in the application code. An easy way to accomplish that is to pass
the Mock Axios instance into the constructor fo the Model class:

```js
this._axios = (options && options.axiosInstance) ? options.axiosInstance : axios;
```

Now the mock instance can be used in test code and the real instance can be used in application
code.

#### Pick a Request to Test

We will start by writing a test for the movie details request on 
[line 34](https://bitbucket.org/macksol/movie-finder/src/43149d733dd1eb2ec65d430ed7546f7a29cf0e36/src/scripts/model.js#lines-45).

```js{numberLines: true}
/**
 * @param {string} id movie imdbID as a string
 * @return {ApiResponse} details API response
 * @description Get movie detials by imdbID
 */
loadMovieDetails(id) {
    if (this.movieDetailsCache[id]) {
        return Promise.resolve(this.movieDetailsCache[id]);
    } else {
        return this._axios
                    .get(`http://www.omdbapi.com/?apikey=${process.env.API_TOKEN}&i=${encodeURIComponent(id)}`)
                    .then((response) => this.validateApiResponse(response))
                    .then((response) => this.movieDetailsCache[id] = response);
    }
}
```

The function make a <code class="not-pre">GET</code> request for movie details by movie id and 
cahces the response on the model class, The cache gets purged evertime a new movie is searched for. 
It's a naive caching strategy but it serves the demo app well. 

Before we start writing the actual test let's break down what the funciton is doing line by line.

<code class="not-pre">[7]</code> Check to see a cache entry exists for the movie id that we are 
searching for.<br>
<code class="not-pre">[8]</code> If it does return the cached movie details data.<br>
<code class="not-pre">[10]</code> If it doesn't make the details request.<br>
<code class="not-pre">[12]</code> When the details request resolves validate the request was 
successul.<br>
<code class="not-pre">[13]</code> Store the reponse in the cache.<br>

#### The Actual Unit Test

The first thing we need to do in the 
[model.spec.js](https://bitbucket.org/macksol/movie-finder/src/master/src/tests/model.spec.js) file 
is setup instances of the model and mock adapter passing in the mock adapter instance into the model.

```js
const mockAxiosInstance = new MockAdapter(axios);
const model = new Model({mockAxiosInstance});
```

Axios Mock Adapter's <code class="not-pre">onGet</code> method can be used to mock requests made to 
a given url. Consider the following test case:

```js{numberLines: true}
describe('Movie Detail Request', () => {
    const mockDetailResponse = require('./mock-detail-response');
    const imdbID = 'tt0372784';

    it('should respond with movie detail results based on a movie id', () => {
        mockAxiosInstance.onGet(`http://www.omdbapi.com/?apikey=${process.env.API_TOKEN}&i=${imdbID}`).reply(200, mockDetailResponse);
        
        model.loadMovieDetails(imdbID).then((response) => {
            assert.equal(response.status, 200);
            assert.deepEqual(response.data, mockDetailResponse);
        });
    });
});
```

Let'ts go through the test line by line.

<code class="not-pre">[2]</code> Load the mock mock response.<br>
<code class="not-pre">[3]</code> Store the IMDB movie id in a variable.<br>
<code class="not-pre">[6]</code> Call the <code class="not-pre">onGet</code> matcher function in the
url we want to match. Then call the reply request handler passing in the status code and mock response.<br>
<code class="not-pre">[8]</code> Call <code class="not-pre">model.loadMovieDetails</code> and expect
the reponse to match the response passed into the adapters reply function.

#### More on Axios Mock Adapter

Here is a complete list of Mock Adapter's matcher functions: 
[axios-mock-adapter/types/index.d.ts](https://github.com/ctimmerm/axios-mock-adapter/blob/9836b59e248fdeef5627c246007ca60cd4497aec/types/index.d.ts#L54-L61)

Here is the <code class="not-pre">onGet</code> signature, it applies to all the other matcher 
functions also:

```js
onGet(
    matcher?: string | RegExp, 
    body?: string | object, 
    headers?: object
);
```

<code class="not-pre">matcher</code> can be a string or RegExp literal that is used to match against
the request url.</br>
<code class="not-pre">body</code> is am object that is used to match against query params in the
request url.
<code class="not-pre">headers</code> is an object used to match against request headers.

Here is the <code class="not-pre">reply</code> signature, it applies to 
[these request handlers also](https://github.com/ctimmerm/axios-mock-adapter/blob/9836b59e248fdeef5627c246007ca60cd4497aec/types/index.d.ts#L14-L17).

```js
reply(
    statusOrCallback: number | function,
    data?: any,
    headers?: any
);
```
<code class="not-pre">statusOrCallback</code> this can eithe be a number that represents the 
response status code or it can be a function that take an axios config object as a parameter.</br>
<code class="not-pre">data</code> is the mock object that will be retured in the response body.
<code class="not-pre">headers</code> headers that will be set on the mock resposne.


Axios mock adapter is a pretty awesome little library that makes it fun to unit test your network 
request code. Thanks for reading!