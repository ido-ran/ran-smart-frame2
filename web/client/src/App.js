import React, { Component } from 'react';
import { MuiThemeProvider, createMuiTheme, withStyles } from 'material-ui/styles';
import purple from 'material-ui/colors/purple';
import green from 'material-ui/colors/green';
import red from 'material-ui/colors/red';
import { AppBar, Toolbar, Typography, Button, IconButton  } from 'material-ui'
import MenuIcon from 'material-ui-icons/Menu';

import { Link  } from 'react-router'
import './App.css';

class App extends Component {

  constructor() {
    super()
    this.state = {content: ''}

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
  }

  handleChange(event) {
    this.setState({content: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();

    this.setState({content: ''})
  }

  render() {
    if ('/select-frame' === this.props.location.pathname) {
      // select-frame is standalone app and should not have the
      // applciation chrome.
      return (
        <div>
          {this.props.children}
        </div>
      );
    }

    const theme = createMuiTheme({
      palette: {
        primary: purple, // Purple and green play nicely together.
        secondary: {
          ...green,
          A400: '#00e677',
        },
        error: red,
      },
    });

    const { classes } = this.props;

    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <IconButton className={classes.menuButton} color="contrast" aria-label="Menu">
              <MenuIcon />
            </IconButton>
            <Typography type="title" color="inherit" className={classes.flex}>
              OomkiK
            </Typography>
            <Button color="contrast">Logout</Button>
          </Toolbar>
        </AppBar>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/streams">Streams</Link></li>
          <li><Link to="/frames">Frames</Link></li>
        </ul>
        <MuiThemeProvider theme={theme}>
          {this.props.children}
        </MuiThemeProvider>
      </div>
    );
  }
}

const styles = theme => ({
  root: {
    marginTop: theme.spacing.unit * 3,
    width: '100%',
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
});

export default withStyles(styles)(App);
