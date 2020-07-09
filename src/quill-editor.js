import Quill from 'quill';
import { bindingMode } from 'aurelia-binding';
import { Container } from 'aurelia-dependency-injection';
import { bindable, inlineView, customElement } from 'aurelia-templating';

@inlineView(`<template>
    <div ref="quillEditor"></div>
</template>`)
@customElement('quill-editor')
export class QuillEditor {
    _textChanged = false;

    @bindable() options; // per instance options
    @bindable({ defaultBindingMode: bindingMode.twoWay }) value;
    @bindable({ defaultBindingMode: bindingMode.twoWay }) selection;
    @bindable({ defaultBindingMode: bindingMode.twoWay }) oldrange;
    @bindable({ defaultBindingMode: bindingMode.twoWay }) source;

    bind() {
        // merge the global options with any instance options
        let editorConfig = Container.instance.get('quill-editor-config');
        this.options = Object.assign({}, editorConfig, this.options);
    }

    attached() {
        // initialize a new instance of the Quill editor
        // with the supplied options
        this.editor = new Quill(this.quillEditor, this.options);

        // listen for changes and update the value
        this.editor.on('text-change', this.onTextChanged);
        this.editor.on('selection-change', this.onSelectionChanged);

        if (this.value) {
            this.editor.root.innerHTML = this.value;
        }
    }

    onTextChanged = () => {
        this._textChanged = true;
        this.value = this.editor.root.innerHTML;
    };

    onSelectionChanged = (range, oldRange, source) => {
        this.selection = range;
        this.oldrange = oldRange;
        this.source = source;
    }

    valueChanged(newValue, oldValue) {
        if (newValue !== oldValue && this.editor.root.innerHTML !== newValue) {
            this.editor.root.innerHTML = this.value;
        }
        
        this._textChanged = false;
    }

    detached() {
        // clean up
        this.editor.off('text-change', this.onTextChanged);
        this.editor.off('selection-change', this.onSelectionChanged)
        this.cleanModules();

        this.editor = null;
        delete this.editor;
    }

    cleanModules() {
        let toolbar = this.quillEditor.parentNode.querySelector('.ql-toolbar');

        if (toolbar) {
            toolbar.remove();
        }

        this.editor.options.modules.toolbar = null;
        delete this.editor.options.modules.toolbar;

        this.editor.theme.modules.toolbar = null;
        delete this.editor.theme.modules.toolbar;
    }
}
