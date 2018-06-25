
function successAction(action, payload) {
    return {
        type: action,
        payload
    }
}

function failAction(action, error) {
    return {
        type: action,
        error
    }
}

/**
 * Generate Redux action which load JSON data from backend API.
 * @param {*} apiEndpoint 
 * @param {*} loadingAction 
 * @param {*} successActionName 
 * @param {*} failActionName 
 */
export function generateAction(apiEndpoint, loadingAction, successActionName, failActionName) {
    return dispatch => {
        dispatch({
            type: loadingAction
        });

        fetch(apiEndpoint, {
            credentials: 'include'
        })
            .then(function (response) {
                var contentType = response.headers.get("content-type")
                if (response.ok && contentType && contentType.indexOf("application/json") !== -1) {
                    return response.json().then(function (json) {
                        dispatch(successAction(successActionName, json))
                    });
                } else {
                    dispatch(failAction(failActionName))
                }
            })
            .catch(error => dispatch(failAction(failActionName, error)))
    }
}