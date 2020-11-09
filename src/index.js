import {
  useEffect, useMemo, useReducer, useRef
} from 'react';
import Banana from 'banana-i18n';

const LANGUAGES_SET = 'LANGUAGES_SET';
const MESSAGES_ADD = 'MESSAGES_ADD';

function reducer(state, action) {
  switch (action.type) {
    case LANGUAGES_SET:
      return {
        ...state,
        languages: [
          ...(action.payload || []),
        ],
      };
    case MESSAGES_ADD:
      return {
        ...state,
        messages: {
          ...state.messages,
          ...action.payload,
        },
      };
    default:
      throw new Error('Unknown Action');
  }
}

function getLanguageList(languages) {
  const provided = new Set(languages.map((locale) => locale.toLowerCase()));

  // Change `en-US` to `en` and add it to the end of the list.
  const userLanguages = [...provided].reduce((set, locale) => {
    if (locale.includes('-')) {
      const [lang] = locale.split('-');
      set.add(lang);
    }

    return set;
  }, provided);

  // Add the fallbacks specificed in banana-i18n.
  const languageSet = [...userLanguages].reduce((set, locale) => {
    const banana = new Banana(locale);

    banana.getFallbackLocales().forEach((fallback) => {
      set.add(fallback);
    });

    return set;
  }, userLanguages);

  return [...languageSet];
}

function useLanguageLoader(loader, initialLanguages = [], initialMessages = {}) {
  // Ignore changes to the initialLanguages param.
  const initLangsRef = useRef(initialLanguages);

  const [state, dispatch] = useReducer(reducer, {
    languages: initialLanguages,
    messages: initialMessages,
  });

  useEffect(() => {
    dispatch({
      type: LANGUAGES_SET,
      payload: window.navigator.languages,
    });

    const onLanguageChange = () => {
      dispatch({
        type: LANGUAGES_SET,
        payload: window.navigator.languages,
      });
    };

    window.addEventListener('languagechange', onLanguageChange);

    return () => {
      window.removeEventListener('languagechange', onLanguageChange);
    };
  }, []);

  const languages = useMemo(() => (
    [...(new Set([
      ...getLanguageList(state.languages),
      ...getLanguageList(initLangsRef.current),
    ]))]
  ), [
    state.languages,
    initLangsRef,
  ]);

  useEffect(() => {
    Promise.all(
      languages.map((lang) => (
        loader(lang)
          .then((messages) => [lang, messages])
          .catch(() => undefined)
      )),
    ).then((messageMap) => {
      const messages = messageMap.reduce((obj, data) => {
        if (!data) {
          return obj;
        }

        const [lang, langMessages] = data;

        return {
          ...obj,
          [lang]: langMessages,
        };
      }, {});

      dispatch({
        type: MESSAGES_ADD,
        payload: messages,
      });
    });
  }, [
    languages,
    loader,
  ]);

  // First language that has messages is our locale of choice.
  const locale = useMemo(() => (
    languages.find((lang) => typeof state.messages[lang] !== 'undefined')
  ), [
    state.messages,
    languages,
  ]);

  return [
    locale,
    state.messages,
    languages,
  ];
}

export default useLanguageLoader;
