import React, { useMemo, useState } from "react";
import styles from "../styles/Home.module.css";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { DeleteFilled, PlusOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu, Tooltip } from "antd";

interface DraggableListProps {
  items: string[];
  availableItems?: string[];
  newItemTitle: string;
  onChange: (items: string[]) => void;
  disabled?: boolean;
  dragDisabled?: boolean;
  restrictedItems?: string[];
}

export const DraggableList: React.FC<DraggableListProps> = ({
  items: itemNames,
  availableItems,
  newItemTitle,
  onChange,
  disabled = false,
  dragDisabled = false,
  restrictedItems = [],
}) => {
  const items = useMemo(
    () => itemNames.map((name, i) => ({ id: i + "", name })),
    [itemNames]
  );

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [movedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, movedItem);

    onChange(newItems.map((i) => i.name));
  };

  const itemsToAdd = availableItems?.filter((n) => itemNames.indexOf(n) < 0);

  const [showNewItemMenu, setShowNewItemMenu] = useState(false);

  const openNewItemMenu = () => {
    setShowNewItemMenu(!showNewItemMenu);
  };

  const handleNewItemMenuClick = (item: string) => {
    // If item is restricted, don't actually add it, just close menu
    if (restrictedItems.includes(item)) {
      setShowNewItemMenu(false);
      return;
    }

    setShowNewItemMenu(false);
    onChange([...itemNames, item]);
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={item.id}
                  index={index}
                  isDragDisabled={disabled || dragDisabled}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={provided.draggableProps.style}
                      className={styles.draggableItem}
                      data-disabled={disabled}
                    >
                      <div className="name">{item.name}</div>
                      <DeleteFilled
                        onClick={() =>
                          !disabled &&
                          onChange(itemNames.filter((n) => n !== item.name))
                        }
                        className={styles.draggableItemRemove}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {!!itemsToAdd?.length && (
        <Dropdown
          overlay={
            <Menu onClick={(e) => handleNewItemMenuClick(e.key)}>
              {itemsToAdd.map((item) => {
                const isRestricted = restrictedItems.includes(item);
                const menuItemContent = (
                  <Menu.Item
                    key={item}
                    disabled={isRestricted || disabled}
                    style={isRestricted ? { opacity: 0.5 } : undefined}
                  >
                    {item}
                  </Menu.Item>
                );

                return isRestricted ? (
                  <Tooltip
                    title="Available only in Professional Plan"
                    key={item}
                  >
                    {menuItemContent}
                  </Tooltip>
                ) : (
                  menuItemContent
                );
              })}
            </Menu>
          }
          visible={showNewItemMenu}
          onVisibleChange={(flag) => setShowNewItemMenu(flag)}
          trigger={["click"]}
          disabled={disabled}
        >
          <Button onClick={() => openNewItemMenu()}>
            <PlusOutlined /> {newItemTitle}
          </Button>
        </Dropdown>
      )}
    </>
  );
};
