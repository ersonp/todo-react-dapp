import React, {Component} from 'react'
import Web3 from 'web3'
import './App.css'
import {TODO_LIST_ABI, TODO_LIST_ADDRESS} from './config'
import TodoList from './TodoList'

class App extends Component{

  componentWillMount(){
    this.loadBlockchainData()
  }
  
  async loadBlockchainData() {
    var web3 = new Web3()
    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
      try {
        window.ethereum.enable().then(function() {
          // User has allowed account access to DApp...
        });
      } catch (e) {
        // User has denied account access to DApp...
      }
    }
    // Legacy DApp Browsers
    else if (window.web3) {
      web3 = new Web3(web3.currentProvider);
    }
    // Non-DApp Browsers
    else {
      alert("You have to install MetaMask !");
    }
    window.ethereum.enable();
    console.log(" typoe of = ", typeof web3);
    if (typeof web3 != "undefined") {
      this.web3Provider = web3.currentProvider;
      window.ethereum.enable();
    } else {
      this.web3Provider = new Web3.providers.HttpProvider(
        "http://127.0.0.1:7545"
      );
      window.ethereum.enable();
    }
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const todoList = new web3.eth.Contract(TODO_LIST_ABI, TODO_LIST_ADDRESS)
    this.setState({ todoList })
    const taskCount = await todoList.methods.taskCount().call()
    this.setState({ taskCount })
    for (var i = 1; i <= taskCount; i++) {
      const task = await todoList.methods.tasks(i).call()
      this.setState({
        tasks: [...this.state.tasks, task]
      })
    }
    this.setState({ loading: false })
  }

  constructor(props) {
    super(props)
    this.state = { 
      account: '',
      taskCount: 0,
      tasks: [],
      loading: true
    }
    this.createTask = this.createTask.bind(this)
    this.toggleCompleted = this.toggleCompleted.bind(this)
  }

  createTask(content) {
    this.setState({ loading: true })
    this.state.todoList.methods.createTask(content).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload(false);
    })
  }

  toggleCompleted(taskId) {
    this.setState({ loading: true })
    this.state.todoList.methods.toggleCompleted(taskId).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
      console.log(this.state.tasks)
      window.location.reload(false);
    })
  }

  render (){
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="#">My Project | Todo List</a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small><a className="nav-link" href="#"><span id="account"></span></a></small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex justify-content-center">
              { this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : <TodoList 
                  tasks={this.state.tasks} 
                  createTask={this.createTask} 
                  toggleCompleted={this.toggleCompleted}
                />
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
