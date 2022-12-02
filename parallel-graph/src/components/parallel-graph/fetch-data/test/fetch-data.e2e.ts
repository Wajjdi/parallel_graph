import { newE2EPage } from '@stencil/core/testing';

describe('fetch-data', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<fetch-data></fetch-data>');

    const element = await page.find('fetch-data');
    expect(element).toHaveClass('hydrated');
  });
});
