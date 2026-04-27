import {createSlice} from '@reduxjs/toolkit'

const initialState={
    user:null,
    loading:false,
    checkingAuth:true
}

const authSlice=createSlice({
    name:"auth",
    initialState,
    reducers:{
        signup:(state,action)=>{},
        login:(state,action)=>{},
        logout:(state,action)=>{},
        checkAuth:(state,action)=>{},
        refreshToken:(state,action)=>{}
    }
})



//export const {} =authSlice.actions

export default authSlice.reducer