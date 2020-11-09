# useLanguageLoader
A React hook for loading languages suitable for [@wikimedia/react.i18n](https://www.npmjs.com/package/@wikimedia/react.i18n).

## Example
```js
import Banana from 'banana-i18n';
import useLanguageLoader from '@chickaree/language-loader';

async function languageLoader(lang) {
  const { default: messages } = await import(`../i18n/${lang}.json`);
  return messages;
}

function Demo() {
  const [locale, messages] = useLanguageLoader(languageLoader);

  const banana = new Banana(locale, {
    messages,
  });

  return (
    <h1>{banana.i18n('hello')}</h1>
  );
}
```

## API
```js
useLanguageLoader(
  languageLoader: (lang: string) => Promise<object>
  initialLanguages: string[] = []
  initialMessages: object = {}
): [locale: string, messages: object, languages: string[]]
```
  * `languageLoader` is a function that returns a promise (or an async function). The Promise should resolve to an object in the shame of `{ messageKey: "messageValue" }`. The function will be executed for every language the user has specified as well as the fallback languages. The function should *not* be created on every render or it may cause the browser to go into an infinite loop. It is better to use a named function (see example) or React's [useCallback](https://reactjs.org/docs/hooks-reference.html#usecallback) hook.
  * `initialLanguages` is an array of initial languages/locales to be used. This is useful for server-side rendering or static page generation where the initial render should be a specific language.
  * `initialMessages` is an object in the shape of: `{ langCode: { messageKey: "messageValue" } }`. Since the `languageLoader` is only executed on the 

  The hook will return an array with 3 values. The first locale that contains messages, the messages object, and all of the languages the user might be interested in. The first two values can be passed direclty into the `IntlProvider` provided by [@wikimedia/react.i18n](https://www.npmjs.com/package/@wikimedia/react.i18n). The last value can be used to provide suggestions in a language switcher UI element.
