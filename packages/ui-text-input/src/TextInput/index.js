/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 - present Instructure, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/** @jsx jsx */
import { Component } from 'react'
import PropTypes from 'prop-types'

import { controllable } from '@instructure/ui-prop-types'
import {
  callRenderProp,
  getInteraction,
  passthroughProps
} from '@instructure/ui-react-utils'
import { isActiveElement } from '@instructure/ui-dom-utils'
import { FormField, FormPropTypes } from '@instructure/ui-form-field'
import { Flex } from '@instructure/ui-flex'
import { uid } from '@instructure/uid'
import { testable } from '@instructure/ui-testable'
import { withStyle, jsx } from '@instructure/emotion'
import generateStyle from './styles'
import generateComponentTheme from './theme'

/**
---
category: components
tags: form, field
---
**/
@withStyle(generateStyle, generateComponentTheme)
@testable()
class TextInput extends Component {
  static propTypes = {
    /**
     * The form field label.
     */
    renderLabel: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    /**
     * Determines the underlying native HTML `<input>` element's `type`.
     * For more see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/url
     */
    type: PropTypes.oneOf([
      'text',
      'email',
      'url',
      'tel',
      'search',
      'password'
    ]),
    /**
     * The id of the text input. One is generated if not supplied.
     */
    id: PropTypes.string,
    /**
     * the selected value (must be accompanied by an `onChange` prop)
     */
    value: controllable(PropTypes.string),
    /**
     * value to set on initial render
     */
    defaultValue: PropTypes.string,
    /**
     * Specifies if interaction with the input is enabled, disabled, or readonly.
     * When "disabled", the input changes visibly to indicate that it cannot
     * receive user interactions. When "readonly" the input still cannot receive
     * user interactions but it keeps the same styles as if it were enabled.
     */
    interaction: PropTypes.oneOf(['enabled', 'disabled', 'readonly']),
    /**
     * object with shape: `{
     * text: PropTypes.string,
     * type: PropTypes.oneOf(['error', 'hint', 'success', 'screenreader-only'])
     *   }`
     */
    messages: PropTypes.arrayOf(FormPropTypes.message),
    /**
     * The size of the text input.
     */
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    /**
     * The text alignment of the input.
     */
    textAlign: PropTypes.oneOf(['start', 'center']),
    /**
     * The width of the input.
     */
    width: PropTypes.string,
    /**
     * The width of the input, in characters, if a width is not explicitly
     * provided via the `width` prop. Only applicable if `isInline={true}`.
     */
    htmlSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    /**
     * The display of the root element.
     */
    display: PropTypes.oneOf(['inline-block', 'block']),
    /**
     * Prevents the default behavior of wrapping the input and rendered content
     * when available space is exceeded.
     */
    shouldNotWrap: PropTypes.bool,
    /**
     * Html placeholder text to display when the input has no value. This should be hint text, not a label
     * replacement.
     */
    placeholder: PropTypes.string,
    /**
     * Whether or not the text input is required.
     */
    isRequired: PropTypes.bool,
    /**
     * a function that provides a reference to the actual input element
     */
    inputRef: PropTypes.func,
    /**
     * a function that provides a reference a parent of the input element
     */
    inputContainerRef: PropTypes.func,
    /**
     * Content to display before the input text, such as an icon
     */
    renderBeforeInput: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    /**
     * Content to display after the input text, such as an icon
     */
    renderAfterInput: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    /**
     * Callback executed when the input fires a change event.
     * @param {Object} event - the event object
     * @param {Object} value - the string value of the input
     */
    onChange: PropTypes.func,
    /**
     * Callback fired when input loses focus.
     */
    onBlur: PropTypes.func,
    /**
     * Callback fired when input receives focus.
     */
    onFocus: PropTypes.func,

    // eslint-disable-next-line react/require-default-props
    makeStyles: PropTypes.func,
    // eslint-disable-next-line react/require-default-props
    styles: PropTypes.object
  }

  static defaultProps = {
    renderLabel: undefined,
    type: 'text',
    id: undefined,
    // Leave interaction default undefined so that `disabled` and `readOnly` can also be supplied
    interaction: undefined,
    isRequired: false,
    value: undefined,
    defaultValue: undefined,
    display: 'block',
    shouldNotWrap: false,
    placeholder: undefined,
    width: undefined,
    size: 'medium',
    htmlSize: undefined,
    textAlign: 'start',
    messages: [],
    inputRef: function (input) {},
    inputContainerRef: function (container) {},
    onChange: function (event, value) {},
    onBlur: function (event) {},
    onFocus: function (event) {},
    renderBeforeInput: undefined,
    renderAfterInput: undefined
  }

  constructor(props) {
    super(props)
    this.state = { hasFocus: false }
    this._defaultId = uid('TextInput')
    this._messagesId = uid('TextInput-messages')
  }

  componentDidMount() {
    this.props.makeStyles(this.makeStyleProps())
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.props.makeStyles(this.makeStyleProps())
  }

  makeStyleProps = () => {
    const { interaction } = this
    return {
      disabled: interaction === 'disabled',
      invalid: this.invalid,
      focused: this.state.hasFocus
    }
  }

  focus() {
    this._input.focus()
  }

  get interaction() {
    return getInteraction({ props: this.props })
  }

  get hasMessages() {
    return this.props.messages && this.props.messages.length > 0
  }

  get invalid() {
    return (
      this.props.messages &&
      this.props.messages.findIndex((message) => {
        return message.type === 'error'
      }) >= 0
    )
  }

  get focused() {
    return isActiveElement(this._input)
  }

  get value() {
    return this._input.value
  }

  get id() {
    return this.props.id || this._defaultId
  }

  handleInputRef = (node) => {
    this._input = node
    this.props.inputRef(node)
  }

  handleChange = (event) => {
    this.props.onChange(event, event.target.value)
  }

  handleBlur = (event) => {
    this.props.onBlur(event)
    this.setState({
      hasFocus: false
    })
  }

  handleFocus = (event) => {
    this.props.onFocus(event)
    this.setState({
      hasFocus: true
    })
  }

  renderInput() {
    const {
      type,
      size,
      htmlSize,
      display,
      textAlign,
      placeholder,
      value,
      defaultValue,
      isRequired,
      ...rest
    } = this.props

    const props = passthroughProps(rest)

    const { interaction } = this

    let descriptionIds = ''
    if (props['aria-describedby']) {
      descriptionIds = `${props['aria-describedby']}`
    }

    if (this.hasMessages) {
      descriptionIds =
        descriptionIds !== ''
          ? `${descriptionIds} ${this._messagesId}`
          : this._messagesId
    }

    return (
      <input
        {...props}
        css={this.props.styles.textInput}
        defaultValue={defaultValue}
        value={value}
        placeholder={placeholder}
        ref={this.handleInputRef}
        type={type}
        id={this.id}
        required={isRequired}
        aria-invalid={this.invalid ? 'true' : null}
        disabled={interaction === 'disabled'}
        readOnly={interaction === 'readonly'}
        aria-describedby={descriptionIds !== '' ? descriptionIds : null}
        size={htmlSize}
        onChange={this.handleChange}
        onBlur={this.handleBlur}
        onFocus={this.handleFocus}
      />
    )
  }

  render() {
    const {
      width,
      display,
      renderLabel,
      renderBeforeInput,
      renderAfterInput,
      messages,
      inputContainerRef,
      shouldNotWrap
    } = this.props

    const renderBeforeOrAfter = renderBeforeInput || renderAfterInput

    return (
      <FormField
        id={this.id}
        label={callRenderProp(renderLabel)}
        messagesId={this._messagesId}
        messages={messages}
        inline={display === 'inline-block'}
        width={width}
        inputContainerRef={inputContainerRef}
        layout={this.props.layout} // eslint-disable-line react/prop-types
      >
        <span css={this.props.styles.facade}>
          {renderBeforeOrAfter ? (
            <Flex wrap={shouldNotWrap ? 'no-wrap' : 'wrap'}>
              {renderBeforeInput && (
                <Flex.Item padding="0 0 0 small">
                  {callRenderProp(renderBeforeInput)}
                </Flex.Item>
              )}
              <Flex.Item shouldGrow shouldShrink>
                {/*
                    The input and content after input should not wrap, so they're in their own
                    Flex container
                  */}
                <Flex>
                  <Flex.Item shouldGrow shouldShrink>
                    {this.renderInput()}
                  </Flex.Item>
                  {renderAfterInput && (
                    <Flex.Item padding="0 small 0 0">
                      {callRenderProp(renderAfterInput)}
                    </Flex.Item>
                  )}
                </Flex>
              </Flex.Item>
            </Flex>
          ) : (
            /* If no prepended or appended content, don't render Flex layout */
            this.renderInput()
          )}
        </span>
      </FormField>
    )
  }
}

export default TextInput
export { TextInput }
