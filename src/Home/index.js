import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import { DragDropContext, Droppable } from "react-beautiful-dnd";

import InputContainer from "../components/InputContainer";
import List from "../components/List";

import store from "../utils/store";
import StoreApi from "../utils/storeApi";

import "./styles.scss";
import { Card, Grid } from "@material-ui/core";

const dataStorage = JSON.parse(window.localStorage.getItem("dataKanban"));

const initialState = () => {
  if (dataStorage) {
    return dataStorage;
  } else {
    window.localStorage.setItem("dataKanban", JSON.stringify(store));
    return store;
  }
};

export default function Home() {
  const [data, setData] = useState(initialState);

  /**
   * Adds a new card to the list with the given ID.
   *
   * @param {string} title - The title of the new card.
   * @param {string} listId - The ID of the list to add the card to.
   */
  const addMoreCard = (title, listId) => {
    if (!title) {
      return;
    }

    const newCardId = uuid();
    const newCard = {
      id: newCardId,
      title,
    };

    const list = data.lists[listId];
    list.cards = [...list.cards, newCard];

    const newState = {
      ...data,
      lists: {
        ...data.lists,
        [listId]: list,
      },
    };
    setData(newState);
    window.localStorage.setItem("dataKanban", JSON.stringify(newState));
  };

  /**
   * Removes a card from the specified list.
   *
   * @param {number} index - The index of the card to remove.
   * @param {string} listId - The ID of the list containing the card.
   * @returns {void}
   */
  const removeCard = (index, listId) => {
    const list = data.lists[listId];

    list.cards.splice(index, 1);

    const newState = {
      ...data,
      lists: {
        ...data.lists,
        [listId]: list,
      },
    };
    setData(newState);
    window.localStorage.setItem("dataKanban", JSON.stringify(newState));
  };

  /**
   * Updates the title of a card in the specified list.
   * @param {string} title - The new title for the card.
   * @param {number} index - The index of the card in the list.
   * @param {string} listId - The ID of the list containing the card.
   */
  const updateCardTitle = (title, index, listId) => {
    const list = data.lists[listId];
    list.cards[index].title = title;

    const newState = {
      ...data,
      lists: {
        ...data.lists,
        [listId]: list,
      },
    };
    setData(newState);
    window.localStorage.setItem("dataKanban", JSON.stringify(newState));
  };

  /**
   * Adds a new list to the data state.
   * @param {string} title - The title of the new list.
   */
  const addMoreList = (title) => {
    if (!title) {
      return;
    }

    const newListId = uuid();
    const newList = {
      id: newListId,
      title,
      cards: [],
    };
    const newState = {
      listIds: [...data.listIds, newListId],
      lists: {
        ...data.lists,
        [newListId]: newList,
      },
    };
    setData(newState);
    window.localStorage.setItem("dataKanban", JSON.stringify(newState));
  };

  /**
   * Updates the title of a list.
   * @param {string} title - The new title for the list.
   * @param {string} listId - The ID of the list to update.
   */
  const updateListTitle = (title, listId) => {
    const list = data.lists[listId];
    list.title = title;

    const newState = {
      ...data,
      lists: {
        ...data.lists,
        [listId]: list,
      },
    };

    setData(newState);
    window.localStorage.setItem("dataKanban", JSON.stringify(newState));
  };

  /**
   * Deletes a list from the data object and updates the state and local storage.
   * @param {string} listId - The ID of the list to be deleted.
   */
  const deleteList = (listId) => {
    const lists = data.lists;
    const listIds = data.listIds;

    delete lists[listId];

    listIds.splice(listIds.indexOf(listId), 1);

    const newState = {
      lists: lists,
      listIds: listIds,
    };

    setData(newState);
    window.localStorage.setItem("dataKanban", JSON.stringify(newState));
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) {
      return;
    }

    if (type === "list") {
      const newListIds = data.listIds;

      newListIds.splice(source.index, 1);
      newListIds.splice(destination.index, 0, draggableId);

      const newState = {
        ...data,
        listIds: newListIds,
      };
      setData(newState);
      window.localStorage.setItem("dataKanban", JSON.stringify(newState));

      return;
    }

    const sourceList = data.lists[source.droppableId];
    const destinationList = data.lists[destination.droppableId];
    const draggingCard = sourceList.cards.filter(
      (card) => card.id === draggableId
    )[0];

    if (source.droppableId === destination.droppableId) {
      sourceList.cards.splice(source.index, 1);
      destinationList.cards.splice(destination.index, 0, draggingCard);

      const newState = {
        ...data,
        lists: {
          ...data.lists,
          [sourceList.id]: destinationList,
        },
      };
      setData(newState);
      window.localStorage.setItem("dataKanban", JSON.stringify(newState));
    } else {
      sourceList.cards.splice(source.index, 1);
      destinationList.cards.splice(destination.index, 0, draggingCard);

      const newState = {
        ...data,
        lists: {
          ...data.lists,
          [sourceList.id]: sourceList,
          [destinationList.id]: destinationList,
        },
      };

      setData(newState);
      window.localStorage.setItem("dataKanban", JSON.stringify(newState));
    }
  };

  return (
    <StoreApi.Provider
      value={{
        addMoreCard,
        addMoreList,
        updateListTitle,
        removeCard,
        updateCardTitle,
        deleteList,
      }}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="app" type="list" direction="horizontal">
          {(provided) => (
            <Grid
              container
              className="wrapper"
              ref={provided.innerRef}
              {...provided.droppableProps}
              spacing={2}
            >
              {data.listIds.map((listId, index) => {
                const list = data.lists[listId];

                return (
                  <Grid item key={listId} xs={12} sm={6} md={4} lg={3}>
                    <Card>
                      <List list={list} index={index} />
                    </Card>
                  </Grid>
                );
              })}

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Card>
                  <InputContainer type="list" />
                </Card>
              </Grid>

              {provided.placeholder}
            </Grid>
          )}
        </Droppable>
      </DragDropContext>
    </StoreApi.Provider>
  );
}
