import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { loadFrame } from './actions'

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    margin: 30,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  button: {
    margin: theme.spacing.unit,
  },
});

const MODES = Object.freeze({
  EDIT: 'EDIT',
  LINKING: 'LINKING',
  DONE: 'DONE',
})

class DeviceLink extends Component {

  constructor(props) {
    super(props)
    this.state = {
      secret: '',
      mode: MODES.EDIT,
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    this.props.loadFrame(this.props.match.params.frameId)
  }

  handleSecretChange(event) {
    this.setState({ secret: event.target.value });
  }

  /**
   * Handle submiting the form and linking the device.
   */
  handleSubmit(event) {
    event.preventDefault();

    const { frameId } = this.props.match.params;
    const { secret } = this.state;
    var form = new FormData();
    form.append('secret', secret)

    this.setState({
      mode: MODES.LINKING
    })

    fetch(`/api/frames/${frameId}/link-device`, {
      method: "POST",
      body: form,
      credentials: 'include'
    }).then(response => {
      console.log(response)
      
      this.setState({
        mode: response.ok ? MODES.DONE : MODES.EDIT
      })
    });

    this.setState({ newFrameName: '' })
  }

  renderDone() {
    return (<div>Done!</div>)
  }

  renderForm() {
    const { classes } = this.props;
    const { mode } = this.state;

    return (
      <form onSubmit={this.handleSubmit} className={classes.container} noValidate autoComplete="off">
        <TextField
          disabled={mode === MODES.LINKING}
          required
          id="secret"
          label="Secret"
          className={classes.textField}
          value={this.state.secret}
          onChange={(e) => this.handleSecretChange(e)}
          margin="normal"
        />

        <Button type="submit" variant="contained" color="primary" className={classes.button}>
          Link to my device
    </Button>
      </form>
    )
  }

  render() {
    const { classes } = this.props;
    const { mode } = this.state;

    if (!this.props.loaded) return null;

    const body = (mode === MODES.DONE) ? this.renderDone() : this.renderForm();

    return (
      <div className={classes.root}>
        <Link to={`/frames/${this.props.frame.frame.id}`}>
          <h1>{this.props.frame.frame.name}</h1>
        </Link>

        <h2>Device Link</h2>

        {body}

      </div>)
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    loadFrame,
  }, dispatch);
}

function mapStateToProps(state) {
  return {
    frame: state.frame.item,
    loaded: state.frame.loaded,
  };
}

export default withStyles(styles)(connect(
  mapStateToProps,
  mapDispatchToProps
)(DeviceLink))
