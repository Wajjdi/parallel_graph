import { newSpecPage } from '@stencil/core/testing';
import { FetchData } from '../fetch-data';

describe('fetch-data', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [FetchData],
      html: `<fetch-data></fetch-data>`,
    });
    expect(page.root).toEqualHtml(`
      <fetch-data>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </fetch-data>
    `);
  });
});
