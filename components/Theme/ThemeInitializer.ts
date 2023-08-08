import React, {useEffect} from "react"
import {useTheme} from "next-themes"


const ThemeInitializer: React.FC = () => {
  const {theme, setTheme} = useTheme()

  useEffect(() => {
    console.log(`ThemeInitializer: ${theme}`)
    if (theme === undefined || theme === "system") {
      setTheme("dark")
    }
  }, [])

  return null
}

export default ThemeInitializer