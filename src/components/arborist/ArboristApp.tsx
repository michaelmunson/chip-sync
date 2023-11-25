import React from 'react';
import { createTheme } from '@mui/material';
import { User } from '../../types/dataTypes';

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
	},
});
const lightTheme = createTheme({
	palette: {
		mode: "light"
	}
});

interface ArboristAppProps {
    userData:User,
    setUserData: React.Dispatch<React.SetStateAction<User | undefined>>
}

export default function ArboristApp({
    userData,
    setUserData
} : ArboristAppProps
){

    return (
        <div>ArboristApp</div>
    )
}
