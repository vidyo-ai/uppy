import { h } from 'preact'
import { useEffect, useState, useCallback } from 'preact/hooks'
import classNames from 'classnames'
import { nanoid } from 'nanoid/non-secure'
import getFileTypeIcon from '../../utils/getFileTypeIcon.jsx'
import ignoreEvent from '../../utils/ignoreEvent.js'
import FilePreview from '../FilePreview.jsx'
import RenderMetaFields from './RenderMetaFields.jsx'

export default function FileCard (props) {
  const {
    files,
    fileCardFor,
    toggleFileCard,
    saveFileCard,
    metaFields,
    requiredMetaFields,
    openFileEditor,
    i18n,
    i18nArray,
    className,
    canEditFile,
  } = props

  const getMetaFields = () => {
    return typeof metaFields === 'function'
      ? metaFields(files[fileCardFor])
      : metaFields
  }

  const file = files[fileCardFor]
  const computedMetaFields = getMetaFields() ?? []
  const showEditButton = canEditFile(file)

  const storedMetaData = {}
  computedMetaFields.forEach((field) => {
    storedMetaData[field.id] = file.meta[field.id] ?? ''
  })

  const [formState, setFormState] = useState(storedMetaData)

  const handleSave = useCallback((ev) => {
    ev.preventDefault()
    saveFileCard(formState, fileCardFor)
  }, [saveFileCard, formState, fileCardFor])

  const updateMeta = (newVal, name) => {
    setFormState({
      ...formState,
      [name]: newVal,
    })
  }

  const handleCancel = () => {
    toggleFileCard(false)
  }

  const [form] = useState(() => {
    const formEl = document.createElement('form')
    formEl.setAttribute('tabindex', '-1')
    formEl.id = nanoid()
    return formEl
  })

  useEffect(() => {
    document.body.appendChild(form)
    form.addEventListener('submit', handleSave)
    return () => {
      form.removeEventListener('submit', handleSave)
      document.body.removeChild(form)
    }
  }, [form, handleSave])

  return (
    <div
      className={classNames('uppy-Dashboard-FileCard', className)}
      data-uppy-panelType="FileCard"
      onDragOver={ignoreEvent}
      onDragLeave={ignoreEvent}
      onDrop={ignoreEvent}
      onPaste={ignoreEvent}
    >
      <div className="uppy-DashboardContent-bar">
        <div className="uppy-DashboardContent-title" role="heading" aria-level="1">
          {i18nArray('editing', {
            file: <span className="uppy-DashboardContent-titleFile">{file.meta ? file.meta.name : file.name}</span>,
          })}
        </div>
        <button
          className="uppy-DashboardContent-back"
          type="button"
          form={form.id}
          title={i18n('finishEditingFile')}
          onClick={handleCancel}
        >
          {i18n('cancel')}
        </button>
      </div>

      <div className="uppy-Dashboard-FileCard-inner">
        <div className="uppy-Dashboard-FileCard-preview" style={{ backgroundColor: getFileTypeIcon(file.type).color }}>
          <FilePreview file={file} />
          {showEditButton
            && (
            <button
              type="button"
              className="uppy-u-reset uppy-c-btn uppy-Dashboard-FileCard-edit"
              onClick={(event) => {
                // When opening the image editor we want to save any meta fields changes.
                // Otherwise it's confusing for the user to click save in the editor,
                // but the changes here are discarded. This bypasses validation,
                // but we are okay with that.
                handleSave(event)
                openFileEditor(file)
              }}
            >
              {i18n('editFile')}
            </button>
            )}
        </div>

        <div className="uppy-Dashboard-FileCard-info">
          <RenderMetaFields
            computedMetaFields={computedMetaFields}
            requiredMetaFields={requiredMetaFields}
            updateMeta={updateMeta}
            form={form}
            formState={formState}
          />
        </div>

        <div className="uppy-Dashboard-FileCard-actions">
          <button
            className="uppy-u-reset uppy-c-btn uppy-c-btn-primary uppy-Dashboard-FileCard-actionsBtn"
            // If `form` attribute is supported, we want a submit button to trigger the form validation.
            // Otherwise, fallback to a classic button with a onClick event handler.
            type="submit"
            form={form.id}
          >
            {i18n('saveChanges')}
          </button>
          <button
            className="uppy-u-reset uppy-c-btn uppy-c-btn-link uppy-Dashboard-FileCard-actionsBtn"
            type="button"
            onClick={handleCancel}
            form={form.id}
          >
            {i18n('cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
