import '@material/mwc-dialog';
import '@material/mwc-fab';
import '@material/mwc-snackbar';

import type {
  TextFieldInputMode,
  TextFieldType
} from '@material/mwc-textfield/mwc-textfield-base';
import type {Cash} from 'cash-dom/dist/cash';
import collect from 'collect.js';
import {Children} from 'mithril';

import {Model} from '../../Models';
import {
  isFormValid,
  showSnackbar
} from '../../utils';
import type {
  TextArea,
  TextField
} from '../../WebComponents';
import DataTable from '../DataTable/DataTable.jsx';
import TableBody from '../DataTable/TableBody.jsx';
import TableCell from '../DataTable/TableCell.jsx';
import TableHead from '../DataTable/TableHead.jsx';
import TableHeadCell from '../DataTable/TableHeadCell.jsx';
import TableHeadRow from '../DataTable/TableHeadRow.jsx';
import TableRow from '../DataTable/TableRow.jsx';
import {
  Cell,
  LayoutGrid,
  Row
} from '../Grid';
import Mdi from '../Mdi.jsx';
import Page from '../Page.jsx';


export type ColumnT = {
  id?: string,
  title: string,
  type?: 'checkbox' | 'numeric'
}

export type FieldT = {
  id?: string,
  value?: string,
  type?: TextFieldType,
  label?: string,
  placeholder?: string,
  prefix?: string,
  suffix?: string,
  icon?: string,
  iconTrailing?: string,
  disabled?: boolean,
  charCounter?: boolean,
  outlined?: boolean,
  helper?: string,
  helperPersistent?: boolean | string,
  required?: boolean,
  minLength?: number,
  maxLength?: number,
  validationMessage?: string,
  pattern?: string,
  min?: number | string,
  max?: number | string,
  size?: number | null,
  step?: number | null,
  autoValidate?: boolean,
  validity?: ValidityState,
  willValidate?: boolean,
  validityTransform?: (value: string, nativeValidity: ValidityState) => Partial<ValidityState> |
    null,
  validateOnInitialRender?: boolean,
  name?: string,
  inputMode?: TextFieldInputMode,
  readOnly?: boolean,
  autocapitalize: 'on' | 'off' | 'sentences' | 'none' | 'words' | 'characters',
  endAligned?: boolean,
  ...
};

export type SectionT = FieldT[] | {
  id?: string,
  heading?: string,
  columns?: number,
  fields: FieldT[] | { [string]: FieldT }
};

/**
 * @abstract
 */
export default class RecordsPage extends Page {
  columns: { [string]: [string] | ColumnT } | ColumnT[];
  rows: string[][] | Model[] = [];

  sections: { [string]: SectionT } | SectionT[];

  dialogs: Children[];

  model: Model;

  async oninit(vnode) {
    // noinspection JSUnresolvedFunction
    vnode.state.data = (await this.model.all()).getData();
    if (vnode.state.data) {
      this.rows = vnode.state.data;
      m.redraw();
    }
  }

  async onupdate(vnode) {
    const rows = $('.mdc-data-table__row[data-model-id]');
    if (rows.length > 0) {
      rows.on(
        'click',
        (event: PointerEvent) => {
          this.updateRecord($(event.target)
            .parent('tr')
            .data('model-id'));
        }
      );
    }
  }

  tableColumns(): Children {
    return collect(this.columns)
      .map(
        (column: ColumnT | string, id: string) => (
          <TableHeadCell id={id} key={id} {...((typeof column === 'object') ? column : {})}>
            {typeof column === 'string' ? column : column.title}
          </TableHeadCell>
        )
      )
      .toArray();
  }

  tableRows(): Children {
    if (this.rows.length === 0) {
      return (
        <TableRow>
          <TableCell colspan={Object.keys(this.columns).length} style="text-align: center;">
            {this.__('Non sono presenti dati')}
          </TableCell>
        </TableRow>);
    }

    return this.rows.map((row: string[] | Model[], index) => {
      let cells = [];

      if (row instanceof Model) {
        // eslint-disable-next-line guard-for-in
        for (const attribute in this.columns) {
          cells.push(row[attribute]);
        }
      } else {
        cells = row;
      }

      return (
        <TableRow key={index} data-model-id={row.id} style="cursor: pointer">
          {cells.map((cell: string, index_) => <TableCell key={index_}>{cell}</TableCell>)}
        </TableRow>
      );
    });
  }

  async updateRecord(id: number) {
    // noinspection JSUnresolvedFunction
    const instance: Model = (await this.model.find(id)).getData();
    const dialog = $('mwc-dialog#add-record-dialog');

    // eslint-disable-next-line sonarjs/no-duplicate-string
    dialog.find('text-field, text-area')
      .each((index, field: TextField | TextArea) => {
        field.value = instance[field.id];
      });

    dialog.find('mwc-button#delete-button')
      .show()
      .on('click', () => {
        const confirmDialog = $('mwc-dialog#confirm-delete-record-dialog');
        confirmDialog.find('mwc-button#confirm-button')
          .on('click', async () => {
            await instance.delete();
            this.rows = this.rows.filter(row => row.id !== instance.id);
            m.redraw();
            confirmDialog.get(0)
              .close();
            dialog.get(0)
              .close();
            await showSnackbar(this.__('Record eliminato!'), 4000);
          });
        confirmDialog.get(0)
          .show();
      });

    dialog.get(0)
      .show();
  }

  recordDialog() {
    return (
      <mwc-dialog id="add-record-dialog" heading={this.__('Aggiungi nuovo record')}>
        <form method="PUT">
          <text-field id="id" name="id" style="display: none;" data-default-value=""/>
          {(() => {
            const sections = collect(this.sections);

            return sections.map((section, index) => (
              <>
                <div id={section.id ?? index}>
                  <h2>{section.heading}</h2>
                  <LayoutGrid>
                    <Row>
                      {(() => {
                        const fields = collect(section.fields);

                        return fields.map((field, fieldIndex) => (
                          <Cell key={fieldIndex} columnspan={12 / (section.columns ?? 3)}>
                            <text-field {...field} id={field.id ?? fieldIndex}
                                        name={field.name ?? field.id ?? fieldIndex}
                                        data-default-value={field.value ?? ''}/>
                          </Cell>))
                          .toArray();
                      })()}
                    </Row>
                  </LayoutGrid>
                </div>
                {index !== sections.keys()
                  .last() && <hr/>}
              </>
            ))
              .toArray();
          })()}
        </form>

        <mwc-button type="submit" slot="primaryAction">
          {this.__('Conferma')}
        </mwc-button>
        <mwc-button slot="secondaryAction" dialogAction="cancel">
          {this.__('Annulla')}
        </mwc-button>
        <mwc-button id="delete-button" slot="secondaryAction" label={this.__('Elimina')}
                    style="--mdc-theme-primary: var(--mdc-theme-error, red); float: left; display: none;">
          <Mdi icon="delete-outline" slot="icon"/>
        </mwc-button>
      </mwc-dialog>
    );
  }

  deleteRecordDialog(): Children {
    return (
      <mwc-dialog id="confirm-delete-record-dialog">
        <p>{this.__('Sei sicuro di voler eliminare questo record?')}</p>
        <mwc-button id="confirm-button" slot="primaryAction" label={this.__('Sì')}/>
        <mwc-button slot="secondaryAction" dialogAction="discard" label={this.__('No')}/>
      </mwc-dialog>
    );
  }

  view(vnode) {
    return (
      <>
        <h2>{this.title}</h2>
        <DataTable>
          <TableHead>
            <TableHeadRow>
              {this.tableColumns()}
            </TableHeadRow>
          </TableHead>
          <TableBody>
            {this.tableRows()}
          </TableBody>
        </DataTable>

        <mwc-fab id="add-record" label={this.__('Aggiungi')} class="sticky">
          <Mdi icon="plus" slot="icon"/>
        </mwc-fab>
        {this.recordDialog()}
        {this.deleteRecordDialog()}
        {this.dialogs}
      </>
    );
  }

  oncreate(vnode) {
    super.oncreate(vnode);

    const fab: Cash = $('mwc-fab#add-record');
    const dialog: Cash = fab.next('mwc-dialog#add-record-dialog');
    const form: Cash = dialog.find('form');

    fab.on('click', () => {
      form.find('text-field, text-area')
        .each((index, field) => {
          field.value = $(field)
            .data('default-value');
        });
      dialog.find('mwc-button#delete-button')
        .hide();

      dialog.get(0)
        .show();
    });

    dialog.find('mwc-button[type="submit"]')
      .on('click', () => {
        form.trigger('submit');
      });

    form.on('submit', async (event) => {
      event.preventDefault();

      if (isFormValid(form)) {
        // eslint-disable-next-line new-cap
        const instance: Model = new this.model();

        form.find('text-field, text-area')
          .each((index, field: TextField | TextArea) => {
            instance[field.id] = field.value;
          });

        const response = await instance.save();
        if (response.getModelId()) {
          dialog.get(0)
            .close();

          const id = form.find('text-field#id')
            .val();
          const model = response.getModel();

          if (id !== '') {
            let index = 0;
            for (const row of this.rows) {
              if (row.id === model.id) {
                this.rows[index] = model;
                break;
              }
              index += 1;
            }
          } else {
            this.rows.push(model);
          }
          m.redraw();
          await showSnackbar(this.__('Record salvato'), 4000);
        }
      } else {
        await showSnackbar(this.__('Campi non validi. Controlla i dati inseriti'));
      }
    });
  }
}
