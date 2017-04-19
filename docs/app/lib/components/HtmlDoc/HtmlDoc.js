import React, { Component } from 'react'
import PropTypes from 'prop-types'

import styles from './styles.css'

export default class HtmlDoc extends Component {
  static propTypes = {
    html: PropTypes.string.isRequired
  };

  render () {
    return (
      <div className={styles.root} dangerouslySetInnerHTML={{__html: this.props.html}} />
    )
  }
}
