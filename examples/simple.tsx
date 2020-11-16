import * as React from 'react';
import Collapse, { Panel } from '../src';
import motion from './_util/motionUtil';
import '../assets/index.less';

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;

function random() {
  return parseInt((Math.random() * 10).toString(), 10) + 1;
}

class Test extends React.Component {
  state = {
    time: random(),
    accordion: false,
    activeKey: ['4'],
    headerCollapsableOnly: false,
  };

  onChange = (activeKey: string) => {
    this.setState({
      activeKey,
    });
  };

  getItems() {
    const items = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0, len = 3; i < len; i++) {
      const key = i + 1;
      items.push(
        <Panel header={`This is panel header ${key}`} key={key} disabled={i === 0}>
          <p>{text.repeat(this.state.time)}</p>
        </Panel>,
      );
    }
    items.push(
      <Panel header="This is panel header 4" key="4">
        <Collapse defaultActiveKey="1">
          <Panel header="This is panel nest panel" key="41" id="header-test">
            <p>{text}</p>
          </Panel>
        </Collapse>
      </Panel>,
    );

    items.push(
      <Panel header="This is panel header 5" key="5">
        <Collapse defaultActiveKey="1">
          <Panel header="This is panel nest panel" key="51" id="another-test">
            <form>
              <label htmlFor="test">Name:&nbsp;</label>
              <input type="text" id="test" />
            </form>
          </Panel>
        </Collapse>
      </Panel>,
    );

    items.push(
      <Panel header="This is panel header 6" key="6" extra={<span>Extra Node</span>}>
        <p>Panel with extra</p>
      </Panel>,
    );

    return items;
  }

  setActivityKey = () => {
    this.setState({
      activeKey: ['2'],
    });
  };

  reRender = () => {
    this.setState({
      time: random(),
    });
  };

  toggle = () => {
    const { accordion } = this.state;
    this.setState({
      accordion: !accordion,
    });
  };

  toggleHeaderCollapsableOnly = () => {
    const { headerCollapsableOnly } = this.state;
    this.setState({
      headerCollapsableOnly: !headerCollapsableOnly,
    });
  };

  render() {
    const { accordion, activeKey, headerCollapsableOnly } = this.state;
    const btn = accordion ? 'Mode: accordion' : 'Mode: collapse';
    const headerCollapsableOnlyBtn = headerCollapsableOnly
      ? 'headerCollapsableOnly: true'
      : 'headerCollapsableOnly: false';
    return (
      <div style={{ margin: 20, width: 400 }}>
        <button type="button" onClick={this.reRender}>
          reRender
        </button>
        <button type="button" onClick={this.toggle}>
          {btn}
        </button>
        <button type="button" onClick={this.toggleHeaderCollapsableOnly}>
          {headerCollapsableOnlyBtn}
        </button>
        <br />
        <br />
        <button type="button" onClick={this.setActivityKey}>
          active header 2
        </button>
        <br />
        <br />
        <Collapse
          headerCollapsableOnly={headerCollapsableOnly}
          accordion={accordion}
          onChange={this.onChange}
          activeKey={activeKey}
          openMotion={motion}
        >
          {this.getItems()}
        </Collapse>
      </div>
    );
  }
}

export default Test;
