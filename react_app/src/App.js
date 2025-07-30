import logo from './logo.svg';
import './App.css';
import Accordion from './container/accordion';
import ProgressBar from './container/progressbar';
import TabComponent from './container/tabComponent';
import Count from './container/count';
import According_Sg from './container/accordian_sg';
import ContactUsForm from './container/contact_us_form';
import MortagageCalculator from './container/mortgage_calculator';
import PaginatedTable from './container/paginated_table';
import FileExplorer from './container/fileExplorer';
import ButtonState from './container/button_state';
import Modal from "./container/modal"; 
import StarRating from './container/star_rating';
import ToDoList from './container/todoList';
import TrafficLight from "./container/trafficLight";
import ShopingCart from './container/shopingcart';


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
      <FileExplorer/>
      <ButtonState />
      <Modal />
      <StarRating />
      <ToDoList/>*/}
      {/* <TrafficLight/> */}
      <ShopingCart/>
    </div>
  );
}

export default App;
