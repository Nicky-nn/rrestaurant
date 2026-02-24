import { createContext, FC, JSX, useEffect, useReducer } from 'react'

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'LOAD_NOTIFICATIONS': {
      return {
        ...state,
        notifications: action.payload,
      }
    }
    case 'DELETE_NOTIFICATION': {
      return {
        ...state,
        notifications: action.payload,
      }
    }
    case 'CLEAR_NOTIFICATIONS': {
      return {
        ...state,
        notifications: action.payload,
      }
    }
    default: {
      return { ...state }
    }
  }
}

const NotificationContext = createContext({
  notifications: [],
  deleteNotification: () => {},
  clearNotifications: () => {},
  getNotifications: () => {},
  createNotification: () => {},
})

type NotificationProviderProps = {
  children: JSX.Element
  settings: any
}

export const NotificationProvider: FC<any> = ({ settings, children }: NotificationProviderProps) => {
  const [state, dispatch] = useReducer(reducer, [])

  const deleteNotification: any = async (notificationID: any) => {
    try {
      /*
                  const res = await axios.post('/api/notification/delete', {
                      id: notificationID,
                  })
                  dispatch({
                      type: 'DELETE_NOTIFICATION',
                      payload: res.data,
                  })
                  */
    } catch (e) {
      console.error(e)
    }
  }

  const clearNotifications = async () => {
    try {
      /*
                  const res = await axios.post('/api/notification/delete-all')
                  dispatch({
                      type: 'CLEAR_NOTIFICATIONS',
                      payload: res.data,
                  })
                  */
    } catch (e) {
      console.error(e)
    }
  }

  const getNotifications = async () => {
    try {
      /*
                  const res = await axios.get('/api/notification')
                  dispatch({
                      type: 'LOAD_NOTIFICATIONS',
                      payload: res.data,
                  })
                   */
    } catch (e) {
      console.error(e)
    }
  }
  const createNotification: any = async (notification: any) => {
    try {
      /*
                  const res = await axios.post('/api/notification/add', {
                      notification,
                  })
                  dispatch({
                      type: 'CREATE_NOTIFICATION',
                      payload: res.data,
                  })
                   */
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    getNotifications().then()
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications: state.notifications,
        deleteNotification,
        clearNotifications,
        getNotifications,
        createNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationContext
