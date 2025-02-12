import logo from './logo.svg';
import './App.css';
import Accordion from '../src/component/accordion';
import ProgressBar from '../src/component/progressbar';
import TabComponent from '../src/component/tabComponent';
import Count from '../src/component/count';
import According_Sg from '../src/component/accordian_sg';
import ContactUsForm from '../src/component/contact_us_form';


function App() {
  return (
    <div className="App">
      {/* 
      <Accordion/>
      <ProgressBar/>
      <TabComponent/> 
      <Count/>
      < According_Sg />
      */}
      <ContactUsForm/>
    </div>
  );
}

export default App;
