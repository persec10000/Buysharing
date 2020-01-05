const initialState = {

}

const user = (state = initialState, action) => {
    switch (action.type) {
        case 'updateData':
            return {
                ...state,
                user: action.user,
            }
        case 'signOut':
            return initialState;
        default: {
            return state;
        }
    }
}

export default user;
