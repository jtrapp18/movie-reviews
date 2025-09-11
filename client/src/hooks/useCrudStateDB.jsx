import { snakeToCamel, postJSONToDb, patchJSONToDb, deleteJSONFromDb } from "../helper";
import useCrudState from "./useCrudState";
 
const useCrudStateDB = (setState, dbKey, optionalFunc=null, addFunc=null) => {

    const {addToState, updateState, deleteFromState, 
      addToKeyInState, updateKeyInState, deleteFromKeyInState, 
      addNestedToKeyInState, updateNestedKeyInState, deleteNestedKeyInState} = 
    useCrudState(setState, optionalFunc, addFunc);

    const addItem = async (item) => {
      console.log('useCrudStateDB addItem called with:', { dbKey, item });
      try {
        console.log('Calling postJSONToDb with:', { dbKey, item });
        const json = await postJSONToDb(dbKey, item); // Wait for the response
        console.log('postJSONToDb response:', json);
        const jsonTransformed = snakeToCamel(json); // Transform the response
        console.log('Transformed response:', jsonTransformed);
        addToState(jsonTransformed); // Add the transformed item to state
    
        const newId = jsonTransformed.id; // Extract the new ID
        console.log('Returning newId:', newId);
        return newId; // Return the new ID
      } catch (error) {
        console.error('Error adding item:', error);
      }
    };
    
    const updateItem = (item, itemId) => {
      patchJSONToDb(dbKey, itemId, item)
      .then(json => {
        const jsonTransformed = snakeToCamel(json);
        updateState(jsonTransformed, itemId);

        console.log("EDITED", jsonTransformed);
      })
      .catch(e => console.error(e));
      
    }
      
    const deleteItem = (itemId) => {
      deleteJSONFromDb(dbKey, itemId)
      deleteFromState(itemId)
    };
    
    const addToKey = async (arrayKey, body, itemId=null) => {
      try {
        const json = await postJSONToDb(arrayKey, body);
        const jsonTransformed = snakeToCamel(json);
        addToKeyInState(arrayKey, jsonTransformed, itemId);
        return jsonTransformed; // Return the created item
      } catch (error) {
        console.error('Error adding item to key:', error);
        throw error;
      }
    };

    const updateKey = (arrayKey, arrayId, body, itemId=null) => {
      return patchJSONToDb(arrayKey, arrayId, body)
      .then(json => {
        const jsonTransformed = snakeToCamel(json);
        updateKeyInState(arrayKey, jsonTransformed, itemId);
        return jsonTransformed; // Return the transformed data
      });
    };

    const deleteFromKey = (arrayKey, arrayId, itemId=null) => {
      deleteJSONFromDb(arrayKey, arrayId);
      deleteFromKeyInState(arrayKey, arrayId, itemId);
    };
    
    const addNestedKey = (arrayKey, arrayId, nestedKey, body, itemId=null) => {
      postJSONToDb(nestedKey, body)
      .then(json => {
        const jsonTransformed = snakeToCamel(json);
        addNestedToKeyInState(arrayKey, arrayId, nestedKey, jsonTransformed, itemId);
      });
    };

    const updateNestedKey = (arrayKey, arrayId, nestedKey, nestedId, body, itemId=null) => {
      patchJSONToDb(nestedKey, nestedId, body)
      .then(json => {
        const jsonTransformed = snakeToCamel(json);
        updateNestedKeyInState(arrayKey, arrayId, nestedKey, nestedId, jsonTransformed, itemId);
      });
    };

    const deleteNestedKey = (arrayKey, arrayId, nestedKey, nestedId, itemId=null) => {
      deleteJSONFromDb(nestedKey, nestedId);
      deleteNestedKeyInState(arrayKey, arrayId, nestedKey, nestedId, itemId);
    };

  return {addItem, updateItem, deleteItem, 
    addToKey, updateKey, deleteFromKey,
    addNestedKey, updateNestedKey, deleteNestedKey
  }
}

export default useCrudStateDB;
