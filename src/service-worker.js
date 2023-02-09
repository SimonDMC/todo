/* eslint-disable no-restricted-globals */
import { precacheAndRoute } from "workbox-precaching";

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("fetch", (event) => {
    // add to cache on network hit (network first)
    event.respondWith(
        fetch(event.request)
            .then(async (response) => {
                const cache = await caches.open("todo");

                // only cache GET requests which are not firebase and not chrome-extension
                if (
                    event.request.method === "GET" &&
                    !event.request.url.includes("fire") &&
                    !event.request.url.includes("chrome-extension")
                ) {
                    cache.put(event.request, response.clone());
                }
                return response;
            })
            .catch(async () => {
                // if network fails, return from cache
                const cache = await caches.open("todo");
                return cache.match(event.request);
            })
    );
});
