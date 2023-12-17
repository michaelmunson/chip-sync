import { createTheme } from '@mui/material';

const Theme = {
    dark : createTheme({
        palette: {
            mode: 'dark',
        },
    }),
    light: createTheme({
        palette: {
            mode: 'light',
        },
    }),
    decide(){
        const hour = new Date().getHours();
        return (hour >= 18 || hour <= 6) 
                ? "dark" 
                : "light"; 
    }
}

export default Theme; 