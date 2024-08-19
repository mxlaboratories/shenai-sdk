import React, { useMemo, useState } from "react";
import styles from "../styles/Home.module.css";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { DeleteFilled, PlusOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu } from "antd";

export const DraggableList: React.FC<{
  items: string[];
  availableItems?: string[];
  newItemTitle: string;
  onChange: (items: string[]) => void;
  disabled?: boolean;
}> = ({
  items: itemNames,
  availableItems,
  newItemTitle,
  onChange,
  disabled = false,
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
    setShowNewItemMenu(false);
    onChange([...itemNames, item]);
  };

  const deleteItem = (item: string) => {
    onChange(itemNames.filter((n) => n != item));
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
                  isDragDisabled={disabled}
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
                        onClick={() => !disabled && deleteItem(item.name)}
                        className={styles.draggableItemRemove}
                        disabled={disabled}
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
              {itemsToAdd.map((item) => (
                <Menu.Item key={item}>{item}</Menu.Item>
              ))}
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
