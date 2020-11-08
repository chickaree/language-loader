import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { render } from 'react-dom';
import Banana from 'banana-i18n';
import { useLanguageLoader } from '../../src';

async function languageLoader(lang) {
  const { default: messages } = await import(`../i18n/${lang}.json`);
  return messages;
}

function Demo() {
  const [locale, messages, languages] = useLanguageLoader(languageLoader);

  console.log('LOCALE', locale);

  const banana = new Banana(locale, {
    messages,
  });

  return (
    <div>
      <h1>{banana.i18n('hello')}</h1>
      <h2>Locale</h2>
      <code>{locale}</code>
      <h2>Messages:</h2>
      <pre>
        <code>
          {JSON.stringify(messages, null, 2)}
        </code>
      </pre>
      <h2>Languages:</h2>
      <pre>
        <code>
          {JSON.stringify(languages, null, 2)}
        </code>
      </pre>
    </div>
  );
}

// eslint-disable-next-line no-undef
render(<Demo />, document.getElementById('demo'));
