import { createContext, FC, JSX, useEffect, useReducer } from 'react'

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'LOAD_THEME_COLOR': {
      return {
        ...state,
        themeColor: action.payload,
      }
    }
    case 'SET_THEME_COLOR': {
      return {
        ...state,
        themeColor: action.payload,
      }
    }
    default: {
      return { ...state }
    }
  }
}

const ThemeColorBarContext = createContext({
  themeColor: '',
  setThemeColorBar: () => {},
  getThemeColorBar: () => {},
})

type ThemeColorBarProviderProps = {
  children: JSX.Element
  settings: any
}

export const ThemeColorBarProvider: FC<any> = ({ settings, children }: ThemeColorBarProviderProps) => {
  const [state, dispatch]: any = useReducer(reducer, [])

  const getThemeColorBar = async () => {
    try {
      /*
            const res = await axios.get('/api/notification')
             */
      dispatch({
        type: 'LOAD_THEME_COLOR',
        payload: 'blue',
      })
    } catch (e) {
      console.error(e)
    }
  }
  const setThemeColorBar: any = async (themeColor: string) => {
    try {
      /*
            const res = await axios.post('/api/notification/add', {
                notification,
            })
            */
      dispatch({
        type: 'SET_THEME_COLOR',
        payload: themeColor,
      })
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await getThemeColorBar()
    }
    fetchData().catch((r) => console.log(r))
  }, [])

  return (
    <ThemeColorBarContext.Provider
      value={{
        themeColor: state.themeColor,
        setThemeColorBar,
        getThemeColorBar,
      }}
    >
      {children}
    </ThemeColorBarContext.Provider>
  )
}

export default ThemeColorBarContext
