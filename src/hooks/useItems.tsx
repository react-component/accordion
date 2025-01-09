import toArray from '@rc-component/util/lib/Children/toArray';
import React from 'react';
import type { CollapsePanelProps, CollapseProps, ItemType } from '../interface';
import CollapsePanel from '../Panel';

type Props = Pick<CollapsePanelProps, 'prefixCls' | 'onItemClick' | 'openMotion' | 'expandIcon'> &
  Pick<CollapseProps, 'accordion' | 'collapsible' | 'destroyInactivePanel'> & {
    activeKey: React.Key[];
  };

const convertItemsToNodes = (items: ItemType[], props: Props) => {
  const {
    prefixCls,
    accordion,
    collapsible,
    destroyInactivePanel,
    onItemClick,
    activeKey,
    openMotion,
    expandIcon,
  } = props;

  return items.map((item, index) => {
    const {
      children,
      label,
      wrapper,
      key: rawKey,
      collapsible: rawCollapsible,
      onItemClick: rawOnItemClick,
      destroyInactivePanel: rawDestroyInactivePanel,
      ...restProps
    } = item;

    // You may be puzzled why you want to convert them all into strings, me too.
    // Maybe: https://github.com/react-component/collapse/blob/aac303a8b6ff30e35060b4f8fecde6f4556fcbe2/src/Collapse.tsx#L15
    const key = String(rawKey ?? index);
    const mergeCollapsible = rawCollapsible ?? collapsible;
    const mergeDestroyInactivePanel = rawDestroyInactivePanel ?? destroyInactivePanel;

    const handleItemClick = (value: React.Key) => {
      if (mergeCollapsible === 'disabled') return;
      onItemClick(value);
      rawOnItemClick?.(value);
    };

    let isActive = false;
    if (accordion) {
      isActive = activeKey[0] === key;
    } else {
      isActive = activeKey.indexOf(key) > -1;
    }

    const collapsePanel = (
      <CollapsePanel
        {...restProps}
        prefixCls={prefixCls}
        key={key}
        panelKey={key}
        isActive={isActive}
        accordion={accordion}
        openMotion={openMotion}
        expandIcon={expandIcon}
        header={label}
        collapsible={mergeCollapsible}
        onItemClick={handleItemClick}
        destroyInactivePanel={mergeDestroyInactivePanel}
      >
        {children}
      </CollapsePanel>
    );

    if (wrapper) {
      return wrapper(collapsePanel);
    }

    return collapsePanel;
  });
};

/**
 * @deprecated The next major version will be removed
 */
const getNewChild = (
  child: React.ReactElement<CollapsePanelProps>,
  index: number,
  props: Props,
) => {
  if (!child) return null;

  const {
    prefixCls,
    accordion,
    collapsible,
    destroyInactivePanel,
    onItemClick,
    activeKey,
    openMotion,
    expandIcon,
  } = props;

  const key = child.key || String(index);

  const {
    header,
    headerClass,
    destroyInactivePanel: childDestroyInactivePanel,
    collapsible: childCollapsible,
    onItemClick: childOnItemClick,
  } = child.props;

  let isActive = false;
  if (accordion) {
    isActive = activeKey[0] === key;
  } else {
    isActive = activeKey.indexOf(key) > -1;
  }

  const mergeCollapsible = childCollapsible ?? collapsible;

  const handleItemClick = (value: React.Key) => {
    if (mergeCollapsible === 'disabled') return;
    onItemClick(value);
    childOnItemClick?.(value);
  };

  const childProps = {
    key,
    panelKey: key,
    header,
    headerClass,
    isActive,
    prefixCls,
    destroyInactivePanel: childDestroyInactivePanel ?? destroyInactivePanel,
    openMotion,
    accordion,
    children: child.props.children,
    onItemClick: handleItemClick,
    expandIcon,
    collapsible: mergeCollapsible,
  };

  // https://github.com/ant-design/ant-design/issues/20479
  if (typeof child.type === 'string') {
    return child;
  }

  Object.keys(childProps).forEach((propName) => {
    if (typeof childProps[propName] === 'undefined') {
      delete childProps[propName];
    }
  });

  return React.cloneElement(child, childProps);
};

function useItems(
  items?: ItemType[],
  rawChildren?: React.ReactNode,
  props?: Props,
): React.ReactElement<CollapsePanelProps>[] {
  if (Array.isArray(items)) {
    return convertItemsToNodes(items, props);
  }

  return toArray(rawChildren).map((child, index) => getNewChild(child, index, props));
}

export default useItems;
