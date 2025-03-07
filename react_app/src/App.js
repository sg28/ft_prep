import logo from './logo.svg';
import './App.css';
import Accordion from '../src/component/accordion';
import ProgressBar from '../src/component/progressbar';
import TabComponent from '../src/component/tabComponent';
import Count from '../src/component/count';
import According_Sg from '../src/component/accordian_sg';
import ContactUsForm from '../src/component/contact_us_form';
import MortagageCalculator from './component/mortgage_calculator';
import PaginatedTable from './component/paginated_table';
import FileExplorer from './component/fileExplorer';
import ButtonState from './component/button_state';

function App() {
  return (
    <div className="App">
      {/* 
      <Accordion/>
      <ProgressBar/>
      <TabComponent/> 
      <Count/>
      < According_Sg />
      <ContactUsForm/>
      <MortagageCalculator/>
      <PaginatedTable/>
      <FileExplorer/>*/}
      <ButtonState />
    </div>
  );
}

export default App;
