import logo from './logo.svg';
import './App.css';
import Accordion from '../src/component/accordion';
import ProgressBar from '../src/component/progressbar';
import TabComponent from '../src/component/tabComponent';

function App() {
  return (
    <div className="App">
      <Accordion/>
      <ProgressBar/>
      <TabComponent/>
    </div>
  );
}

export default App;
