import { useReducer, useState, useContext, useEffect, createContext } from "react";
import { db as firestore } from "../config/fbConfig";
import {collection,getDocs} from "firebase/firestore";

const RidesContext = createContext<any>(null);

interface initialStateType {
  rides: any[];
  loading: boolean;
  error: string | null;
}

interface ActionType {
  type: string;
  payload?: any;
}

const initialState = {
  rides: [],
  loading: true,
  error: null,
};

function ridesReduce(state: any, action: ActionType) {
  switch (action.type) {
    case "FETCH_RIDES_REQUEST":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "FETCH_RIDES_SUCCESS":
      return {
        ...state,
        rides: action.payload,
        loading: false,
        error: null,
      };
    case "FETCH_RIDES_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
  }
}

export const RidesProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(ridesReduce, initialState);

    useEffect(()=>{
        const fetchRides = async () => {
            dispatch({ type: "FETCH_RIDES_REQUEST" });
            try {
                // Fetch rides from Firestore
                const ridesCollection = await getDocs(collection(firestore, "rides"));
                const ridesData = ridesCollection.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                console.log('====================================');
                console.log('ridesData', ridesData);
                console.log('====================================');
                dispatch({ type: "FETCH_RIDES_SUCCESS", payload: ridesData });
            } catch (error:any) {
                dispatch({ type: "FETCH_RIDES_FAILURE", payload: error.message });
            }
        };
        fetchRides();
    },[])
    return (
        <RidesContext.Provider value={{ state, dispatch }}>
            {children}
        </RidesContext.Provider>
    );
}

export const useRides = () => {
    const context = useContext(RidesContext);
    if (!context) {
        throw new Error("useRides must be used within a RidesProvider");
    }
    return context;
};