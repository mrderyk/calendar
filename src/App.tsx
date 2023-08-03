

import { RecoilRoot } from 'recoil';
import './App.css';
import { Calendar } from './Calendar';
import { ChakraProvider, extendTheme } from '@chakra-ui/react'

export const App = () => {
  return (
    <div className="App">
      <ChakraProvider
        theme={extendTheme({
          fonts: {
            body: "'Roboto', sans-serif"
          }
        })}
      >
        <RecoilRoot>
          <Calendar />
        </RecoilRoot>
      </ChakraProvider>
    </div>
  );
}

