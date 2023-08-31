import RequestHttpClient from '@osm/Models/Http/RequestHttpClient';
import {
  Model as BaseModel,
  PaginationStrategy,
  PluralResponse
} from 'coloquent';
import dayjs from 'dayjs';
import type {ValueOf} from 'type-fest';

export interface ModelAttributes {
  id: number;
  createdAt: Date;
  updatedAt: Date;

  [key: string]: unknown;
}

export interface ModelRelations {
  [key: string]: unknown;
}

/**
 * The base model for all models.
 */
export default abstract class Model<A extends ModelAttributes, R extends ModelRelations> extends BaseModel {
  protected static paginationStrategy = PaginationStrategy.PageBased;
  protected static jsonApiBaseUrl = '/api/restify';
  getHttpClient() { return new RequestHttpClient(); }

  static dates: Record<string, string> = {
    createdAt: 'YYYY-MM-DDTHH:mm:ss.ssssssZ',
    updatedAt: 'YYYY-MM-DDTHH:mm:ss.ssssssZ'
  };

  protected static get jsonApiType() {
    return `${this.name.toLowerCase()}s`;
  }

  /**
   * Returns all the instances of the model. (Alias of {@link Model.get}).
   */
  static all<M extends typeof Model<any, any> & {
    new (): InstanceType<M>;
    // @ts-ignore
  }>(this: M): Promise<PluralResponse<InstanceType<M>>> {
    // @ts-expect-error
    return this.get();
  }

  /**
   * Set multiple attributes on the model.
   */
  setAttributes(attributes: Partial<A> | Map<keyof A, ValueOf<A>>) {
    // Record to map
    if (!(attributes instanceof Map)) {
      // eslint-disable-next-line no-param-reassign
      attributes = new Map(Object.entries(attributes) as [keyof A, ValueOf<A>][]);
    }

    for (const [attribute, value] of attributes) {
      this.setAttribute(attribute, value);
    }
  }

  getAttribute<AN extends keyof A = keyof A>(attributeName: AN) {
    return super.getAttribute(attributeName as string) as ValueOf<A, AN>;
  }

  getAttributes() {
    return super.getAttributes() as ModelAttributes;
  }

  protected getAttributeAsDate(attributeName: string) {
    // @ts-ignore
    let attribute: string | Date = (this.attributes as Map<string, string | null>).get(attributeName);
    if (attribute && dayjs(attribute).isValid()) {
      attribute = super.getAttributeAsDate(attributeName) as Date;
    }
    return attribute;
  }

  setAttribute<AN extends keyof A = keyof A>(attributeName: AN, value: ValueOf<A, AN>) {
    const date = dayjs(value as string | Date | undefined);
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (this.isDateAttribute(attributeName) && date.isValid()) {
      const format = this.constructor.dates[attributeName as string];
      // eslint-disable-next-line no-param-reassign
      value = (format === 'YYYY-MM-DDTHH:mm:ss.ssssssZ' ? date.toISOString() : date.format(format)) as ValueOf<A, AN>;
    }
    // @ts-expect-error — This is needed to parse the dates correctly.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    this.attributes.set(attributeName as string, value);
  }

  getRelation<RN extends keyof R = keyof R>(relationName: RN) {
    return super.getRelation(relationName as string) as ValueOf<R, RN>;
  }

  /**
   * Get model ID.
   */
  getId() {
    return this.getApiId();
  }

  /**
   * Check if the model is new (not already saved).
   */
  isNew() {
    return this.getId() === undefined;
  }
}
