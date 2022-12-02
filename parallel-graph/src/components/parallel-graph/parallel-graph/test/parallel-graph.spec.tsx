import { newSpecPage } from '@stencil/core/testing';
import { ParallelGraph } from '../parallel-graph';

describe('parallel-graph', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [ParallelGraph],
      html: `<parallel-graph></parallel-graph>`,
    });
    expect(page.root).toEqualHtml(`
      <parallel-graph>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </parallel-graph>
    `);
  });
});
