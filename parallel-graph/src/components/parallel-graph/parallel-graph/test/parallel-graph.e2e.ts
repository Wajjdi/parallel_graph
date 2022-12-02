import { newE2EPage } from '@stencil/core/testing';

describe('parallel-graph', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<parallel-graph></parallel-graph>');

    const element = await page.find('parallel-graph');
    expect(element).toHaveClass('hydrated');
  });
});
