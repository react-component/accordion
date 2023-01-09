import { fireEvent, render } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import KeyCode from 'rc-util/lib/KeyCode';
import React, { Fragment } from 'react';
import Collapse, { Panel } from '../src/index';

describe('collapse', () => {
  let changeHook: jest.Mock<any, any>;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    changeHook = null;
  });

  function onChange(...args: any[]) {
    if (changeHook) {
      // eslint-disable-next-line @typescript-eslint/no-invalid-this
      changeHook.apply(this, args);
    }
  }

  function runNormalTest(element: any) {
    let collapse: RenderResult;

    beforeEach(() => {
      collapse = render(element);
    });

    afterEach(() => {
      collapse.unmount();
    });

    it('add className', () => {
      const expectedClassName = 'rc-collapse-item important';
      expect(collapse.container.querySelectorAll('.rc-collapse-item')?.[2]).toHaveClass(
        expectedClassName,
      );
    });

    it('create works', () => {
      expect(collapse.container.querySelectorAll('.rc-collapse')).toHaveLength(1);
    });

    it('header works', () => {
      expect(collapse.container.querySelectorAll('.rc-collapse-header')).toHaveLength(3);
    });

    it('panel works', () => {
      expect(collapse.container.querySelectorAll('.rc-collapse-item')).toHaveLength(3);
      expect(collapse.container.querySelectorAll('.rc-collapse-content')).toHaveLength(0);
    });

    it('should render custom arrow icon corrctly', () => {
      expect(collapse.container.querySelector('.rc-collapse-header').textContent).toContain(
        'test>',
      );
    });

    it('default active works', () => {
      expect(collapse.container.querySelectorAll('.rc-collapse-item-active').length).toBeFalsy();
    });

    it('extra works', () => {
      const extraNodes = collapse.container.querySelectorAll('.rc-collapse-extra');
      expect(extraNodes).toHaveLength(1);
      expect(extraNodes?.[0]?.innerHTML).toBe('<span>ExtraSpan</span>');
    });

    it('onChange works', () => {
      changeHook = jest.fn();
      const header = collapse.container.querySelectorAll('.rc-collapse-header')?.[1];
      fireEvent.click(header);
      expect(changeHook.mock.calls[0][0]).toEqual(['2']);
    });

    it('click should toggle panel state', () => {
      const header = collapse.container.querySelectorAll('.rc-collapse-header')?.[1];
      fireEvent.click(header);
      jest.runAllTimers();
      expect(collapse.container.querySelectorAll('.rc-collapse-content-active')).toHaveLength(1);
      fireEvent.click(header);
      jest.runAllTimers();
      expect(collapse.container.querySelector('.rc-collapse-content-inactive')?.innerHTML).toBe(
        '<div class="rc-collapse-content-box">second</div>',
      );
      expect(collapse.container.querySelectorAll('.rc-collapse-content-active').length).toBeFalsy();
    });

    it('click should not toggle disabled panel state', () => {
      const header = collapse.container.querySelector('.rc-collapse-header');
      fireEvent.click(header);
      jest.runAllTimers();
      expect(collapse.container.querySelectorAll('.rc-collapse-content-active').length).toBeFalsy();
    });

    it('should not have role', () => {
      const item = collapse.container.querySelector('.rc-collapse');
      expect(item).toBeTruthy();
      expect(item.getAttribute('role')).toBe(null);
    });

    it('should set button role on panel title', () => {
      const item = collapse.container.querySelector('.rc-collapse-header');
      expect(item).toBeTruthy();
      expect(item.getAttribute('role')).toBe('button');
    });
  }

  describe('collapse', () => {
    const expandIcon = () => <span>test{'>'}</span>;

    const element = (
      <Collapse onChange={onChange} expandIcon={expandIcon}>
        <Panel header="collapse 1" key="1" collapsible="disabled">
          first
        </Panel>
        <Panel header="collapse 2" key="2" extra={<span>ExtraSpan</span>}>
          second
        </Panel>
        <Panel header="collapse 3" key="3" className="important">
          third
        </Panel>
      </Collapse>
    );

    runNormalTest(element);

    it('controlled', () => {
      const onChangeSpy = jest.fn();

      const ControlledCollapse = () => {
        const [activeKey, updateActiveKey] = React.useState<string[]>(['2']);

        const handleChange = (key: string[]) => {
          updateActiveKey(key);
          onChangeSpy(key);
        };

        return (
          <Collapse onChange={handleChange} activeKey={activeKey}>
            <Panel header="collapse 1" key="1">
              first
            </Panel>
            <Panel header="collapse 2" key="2">
              second
            </Panel>
            <Panel header="collapse 3" key="3">
              third
            </Panel>
          </Collapse>
        );
      };

      const { container } = render(<ControlledCollapse />);

      expect(container.querySelectorAll('.rc-collapse-content-active')).toHaveLength(1);
      const header = container.querySelector('.rc-collapse-header');
      fireEvent.click(header);
      jest.runAllTimers();
      expect(container.querySelectorAll('.rc-collapse-content-active')).toHaveLength(2);
      expect(onChangeSpy).toBeCalledWith(['2', '1']);
    });
  });

  describe('it should support number key', () => {
    const expandIcon = () => <span>test{'>'}</span>;
    const element = (
      <Collapse onChange={onChange} expandIcon={expandIcon}>
        <Panel header="collapse 1" key={1} collapsible="disabled">
          first
        </Panel>
        <Panel header="collapse 2" key={2} extra={<span>ExtraSpan</span>}>
          second
        </Panel>
        <Panel header="collapse 3" key={3} className="important">
          third
        </Panel>
      </Collapse>
    );

    runNormalTest(element);
  });

  it('shoule support extra whit number 0', () => {
    const { container } = render(
      <Collapse onChange={onChange} activeKey={0}>
        <Panel header="collapse 0" key={0} extra={0}>
          zero
        </Panel>
      </Collapse>,
    );

    const extraNodes = container.querySelectorAll('.rc-collapse-extra');
    expect(extraNodes).toHaveLength(1);
    expect(extraNodes[0].innerHTML).toBe('0');
  });

  it('should support activeKey number 0', () => {
    const { container } = render(
      <Collapse onChange={onChange} activeKey={0}>
        <Panel header="collapse 0" key={0}>
          zero
        </Panel>
        <Panel header="collapse 1" key={1}>
          first
        </Panel>
        <Panel header="collapse 2" key={2}>
          second
        </Panel>
      </Collapse>,
    );

    // activeKey number 0, should open one item
    expect(container.querySelectorAll('.rc-collapse-content-active')).toHaveLength(1);
  });

  it('click should toggle panel state', () => {
    const { container } = render(
      <Collapse onChange={onChange} destroyInactivePanel>
        <Panel header="collapse 1" key="1">
          first
        </Panel>
        <Panel header="collapse 2" key="2">
          second
        </Panel>
        <Panel header="collapse 3" key="3" className="important">
          third
        </Panel>
      </Collapse>,
    );

    const header = container.querySelectorAll('.rc-collapse-header')?.[1];
    fireEvent.click(header);
    expect(container.querySelectorAll('.rc-collapse-content-active')).toHaveLength(1);
    fireEvent.click(header);
    expect(container.querySelectorAll('.rc-collapse-content-inactive').length).toBeFalsy();
  });

  describe('prop: accordion', () => {
    let collapse: RenderResult;

    beforeEach(() => {
      collapse = render(
        <Collapse onChange={onChange} accordion>
          <Panel header="collapse 1" key="1">
            first
          </Panel>
          <Panel header="collapse 2" key="2">
            second
          </Panel>
          <Panel header="collapse 3" key="3">
            third
          </Panel>
        </Collapse>,
      );
    });

    it('accordion content, should default open zero item', () => {
      expect(collapse.container.querySelectorAll('.rc-collapse-content-active')).toHaveLength(0);
    });

    it('accordion item, should default open zero item', () => {
      expect(collapse.container.querySelectorAll('.rc-collapse-item-active')).toHaveLength(0);
    });

    it('should toggle show on panel', () => {
      let header = collapse.container.querySelectorAll('.rc-collapse-header')?.[1];
      fireEvent.click(header);
      jest.runAllTimers();
      expect(collapse.container.querySelectorAll('.rc-collapse-content-active')).toHaveLength(1);
      expect(collapse.container.querySelectorAll('.rc-collapse-item-active')).toHaveLength(1);
      header = collapse.container.querySelectorAll('.rc-collapse-header')?.[1];
      fireEvent.click(header);
      jest.runAllTimers();
      expect(collapse.container.querySelectorAll('.rc-collapse-content-active')).toHaveLength(0);
      expect(collapse.container.querySelectorAll('.rc-collapse-item-active')).toHaveLength(0);
    });

    it('should only show on panel', () => {
      let header = collapse.container.querySelector('.rc-collapse-header');
      fireEvent.click(header);
      jest.runAllTimers();
      expect(collapse.container.querySelectorAll('.rc-collapse-content-active')).toHaveLength(1);
      expect(collapse.container.querySelectorAll('.rc-collapse-item-active')).toHaveLength(1);
      header = collapse.container.querySelectorAll('.rc-collapse-header')?.[2];
      fireEvent.click(header);
      jest.runAllTimers();
      expect(collapse.container.querySelectorAll('.rc-collapse-content-active')).toHaveLength(1);
      expect(collapse.container.querySelectorAll('.rc-collapse-item-active')).toHaveLength(1);
    });

    it('should add tab role on panel title', () => {
      const item = collapse.container.querySelector('.rc-collapse-header');
      expect(item).toBeTruthy();
      expect(item.getAttribute('role')).toBe('tab');
    });

    it('should add tablist role on accordion', () => {
      const item = collapse.container.querySelector('.rc-collapse');
      expect(item).toBeTruthy();
      expect(item.getAttribute('role')).toBe('tablist');
    });

    it('should add tablist role on PanelContent', () => {
      const header = collapse.container.querySelector('.rc-collapse-header');
      fireEvent.click(header);
      const item = collapse.container.querySelector('.rc-collapse-content');
      expect(item).toBeTruthy();
      expect(item.getAttribute('role')).toBe('tabpanel');
    });
  });

  describe('forceRender', () => {
    it('when forceRender is not supplied it should lazy render the panel content', () => {
      const { container } = render(
        <Collapse>
          <Panel header="collapse 1" key="1" collapsible="disabled">
            first
          </Panel>
          <Panel header="collapse 2" key="2">
            second
          </Panel>
        </Collapse>,
      );
      expect(container.querySelectorAll('.rc-collapse-content')).toHaveLength(0);
    });

    it('when forceRender is FALSE it should lazy render the panel content', () => {
      const { container } = render(
        <Collapse>
          <Panel header="collapse 1" key="1" forceRender={false} collapsible="disabled">
            first
          </Panel>
          <Panel header="collapse 2" key="2">
            second
          </Panel>
        </Collapse>,
      );
      expect(container.querySelectorAll('.rc-collapse-content')).toHaveLength(0);
    });

    it('when forceRender is TRUE then it should render all the panel content to the DOM', () => {
      const { container } = render(
        <Collapse>
          <Panel header="collapse 1" key="1" forceRender collapsible="disabled">
            first
          </Panel>
          <Panel header="collapse 2" key="2">
            second
          </Panel>
        </Collapse>,
      );

      jest.runAllTimers();

      expect(container.querySelectorAll('.rc-collapse-content')).toHaveLength(1);
      expect(container.querySelectorAll('.rc-collapse-content-active')).toHaveLength(0);
      const inactiveDom = container.querySelector('div.rc-collapse-content-inactive');
      expect(inactiveDom).not.toBeFalsy();
      expect(getComputedStyle(inactiveDom)).toHaveProperty('display', 'none');
    });
  });

  it('should toggle panel when press enter', () => {
    const myKeyEvent = {
      key:'Enter',
      keyCode: 13,
      which: 13,
      // https://github.com/testing-library/react-testing-library/issues/269#issuecomment-455854112
      charCode: 13,
    }

    const { container } = render(
      <Collapse>
        <Panel header="collapse 1" key="1">
          first
        </Panel>
        <Panel header="collapse 2" key="2">
          second
        </Panel>
        <Panel header="collapse 3" key="3" collapsible="disabled">
          second
        </Panel>
      </Collapse>,
    );

    fireEvent.keyPress(container.querySelectorAll('.rc-collapse-header')?.[2], myKeyEvent);
    jest.runAllTimers();
    expect(container.querySelectorAll('.rc-collapse-content-active')).toHaveLength(0);

    fireEvent.keyPress(container.querySelector('.rc-collapse-header'), myKeyEvent);
    jest.runAllTimers();

    expect(container.querySelectorAll('.rc-collapse-content-active')).toHaveLength(1);

    expect(container.querySelector('.rc-collapse-content')).toHaveClass(
      'rc-collapse-content-active',
    );

    fireEvent.keyPress(container.querySelector('.rc-collapse-header'), myKeyEvent);
    jest.runAllTimers();

    expect(container.querySelectorAll('.rc-collapse-content-active')).toHaveLength(0);
    expect(container.querySelector('.rc-collapse-content').className).not.toContain(
      'rc-collapse-content-active',
    );
  });

  describe('wrapped in Fragment', () => {
    const expandIcon = () => <span>test{'>'}</span>;
    const element = (
      <Collapse onChange={onChange} expandIcon={expandIcon}>
        <Fragment>
          <Panel header="collapse 1" key="1" collapsible="disabled">
            first
          </Panel>
          <Panel header="collapse 2" key="2" extra={<span>ExtraSpan</span>}>
            second
          </Panel>
          <Fragment>
            <Panel header="collapse 3" key="3" className="important">
              third
            </Panel>
          </Fragment>
        </Fragment>
      </Collapse>
    );

    runNormalTest(element);
  });

  it('should support return null icon', () => {
    const { container } = render(
      <Collapse expandIcon={() => null}>
        <Panel header="title" key="1">
          first
        </Panel>
      </Collapse>,
    );
    expect(container.querySelector('.rc-collapse-header').childNodes).toHaveLength(1);
  });

  it('should support custom child', () => {
    const { container } = render(
      <Collapse>
        <Panel header="collapse 1" key="1">
          first
        </Panel>
        <a className="custom-child">custom-child</a>
      </Collapse>,
    );
    expect(container.querySelector('.custom-child').innerHTML).toBe('custom-child');
  });

  // https://github.com/ant-design/ant-design/issues/36327
  // https://github.com/ant-design/ant-design/issues/6179
  // https://github.com/react-component/collapse/issues/73#issuecomment-323626120
  it('should support custom component', () => {
    const PanelElement = (props) => (
      <Panel header="collapse 1" {...props}>
        <p>test</p>
      </Panel>
    );
    const { container } = render(
      <Collapse defaultActiveKey="1">
        <PanelElement key="1" />
        <Panel header="collapse 2" key="2">
          second
        </Panel>
      </Collapse>,
    );

    expect(container.querySelectorAll('.rc-collapse-content-active')).toHaveLength(1);
    expect(container.querySelector('.rc-collapse-content')).toHaveClass(
      'rc-collapse-content-active',
    );
    expect(container.querySelector('.rc-collapse-header').textContent).toBe('collapse 1');
    expect(container.querySelector('.rc-collapse-header').querySelectorAll('.arrow')).toHaveLength(
      1,
    );
    fireEvent.click(container.querySelector('.rc-collapse-header'));
    expect(container.querySelectorAll('.rc-collapse-content-active')).toHaveLength(0);
    expect(container.querySelector('.rc-collapse-content')).toHaveClass(
      'rc-collapse-content-inactive',
    );
  });

  describe('prop: collapsible', () => {
    it('default', () => {
      const { container } = render(
        <Collapse>
          <Panel header="collapse 1" key="1">
            first
          </Panel>
        </Collapse>,
      );
      expect(container.querySelector('.rc-collapse-header-text')).toBeTruthy();
      fireEvent.click(container.querySelector('.rc-collapse-header'));
      expect(container.querySelectorAll('.rc-collapse-item-active')).toHaveLength(1);
    });
    it('should work when value is header', () => {
      const { container } = render(
        <Collapse collapsible="header">
          <Panel header="collapse 1" key="1">
            first
          </Panel>
        </Collapse>,
      );
      expect(container.querySelector('.rc-collapse-header-text')).toBeTruthy();
      fireEvent.click(container.querySelector('.rc-collapse-header'));
      expect(container.querySelectorAll('.rc-collapse-item-active')).toHaveLength(0);
      fireEvent.click(container.querySelector('.rc-collapse-header-text'));
      expect(container.querySelectorAll('.rc-collapse-item-active')).toHaveLength(1);
    });
    it('should work when value is icon', () => {
      const { container } = render(
        <Collapse collapsible="icon">
          <Panel header="collapse 1" key="1">
            first
          </Panel>
        </Collapse>,
      );
      expect(container.querySelector('.rc-collapse-expand-icon')).toBeTruthy();
      fireEvent.click(container.querySelector('.rc-collapse-header'));
      expect(container.querySelectorAll('.rc-collapse-item-active')).toHaveLength(0);
      fireEvent.click(container.querySelector('.rc-collapse-expand-icon'));
      expect(container.querySelectorAll('.rc-collapse-item-active')).toHaveLength(1);
    });

    it('should disabled when value is disabled', () => {
      const { container } = render(
        <Collapse collapsible="disabled">
          <Panel header="collapse 1" key="1">
            first
          </Panel>
        </Collapse>,
      );
      expect(container.querySelector('.rc-collapse-header-text')).toBeTruthy();
      expect(container.querySelectorAll('.rc-collapse-item-disabled')).toHaveLength(1);
      fireEvent.click(container.querySelector('.rc-collapse-header'));
      expect(container.querySelectorAll('.rc-collapse-item-active')).toHaveLength(0);
    });

    it('the value of panel should be read first', () => {
      const { container } = render(
        <Collapse collapsible="header">
          <Panel collapsible="disabled" header="collapse 1" key="1">
            first
          </Panel>
        </Collapse>,
      );
      expect(container.querySelector('.rc-collapse-header-text')).toBeTruthy();

      expect(container.querySelectorAll('.rc-collapse-item-disabled')).toHaveLength(1);

      fireEvent.click(container.querySelector('.rc-collapse-header'));
      expect(container.querySelectorAll('.rc-collapse-item-active')).toHaveLength(0);
    });

    it('icon trigger when collapsible equal header', () => {
      const { container } = render(
        <Collapse collapsible="header">
          <Panel header="collapse 1" key="1">
            first
          </Panel>
        </Collapse>,
      );

      fireEvent.click(container.querySelector('.rc-collapse-header .arrow'));
      expect(container.querySelectorAll('.rc-collapse-item-active')).toHaveLength(1);
    });

    it('header not trigger when collapsible equal icon', () => {
      const { container } = render(
        <Collapse collapsible="icon">
          <Panel header="collapse 1" key="1">
            first
          </Panel>
        </Collapse>,
      );

      fireEvent.click(container.querySelector('.rc-collapse-header-text'));
      expect(container.querySelectorAll('.rc-collapse-item-active')).toHaveLength(0);
    });
  });

  it('!showArrow', () => {
    const { container } = render(
      <Collapse>
        <Panel header="collapse 1" key="1" showArrow={false}>
          first
        </Panel>
      </Collapse>,
    );

    expect(container.querySelectorAll('.rc-collapse-expand-icon')).toHaveLength(0);
  });

  it('Panel container dom can set event handler', () => {
    const clickHandler = jest.fn();
    const { container } = render(
      <Collapse defaultActiveKey="1">
        <Panel header="collapse 1" key="1" onClick={clickHandler}>
          <div className="target">Click this</div>
        </Panel>
      </Collapse>,
    );

    fireEvent.click(container.querySelector('.target'));
    expect(clickHandler).toHaveBeenCalled();
  });
});
