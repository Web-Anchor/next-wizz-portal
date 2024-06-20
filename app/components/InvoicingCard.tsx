import Switch from './Switch';
import { useEffect, useState } from 'react';
import { cFetch } from '@lib/cFetcher';
import { mutate } from 'swr';
import { toast } from 'sonner';
import Button from './Button';
import Dialog from './Dialog';
import TemplateOne from '@components/templates/TemplateOne';
import { maxLength } from '@config/index';
import { dummyData } from '@app/dashboard/invoices/controller';
import { useTemplates, useUser } from '@hooks/index';
import { CustomField } from '../../types';
import { Spinner, TableSkeleton } from './Skeleton';
import { SectionWrapper } from './Wrapper';
import axios from 'axios';
import { classNames, downloadFile } from '@helpers/index';

const table = {
  companyName: {
    title: 'Company Name',
    description:
      'Company name is the name of the company that appears on the invoice.',
    stateKey: 'companyName',
    maxLength: maxLength?.customField,
  },
  imgUrl: {
    title: 'Company Image Link',
    description: 'Company image link is that appears on the invoice.',
    stateKey: 'imgUrl',
    maxLength: maxLength?.comment,
  },
  header: {
    title: 'Invoice Header',
    description:
      'Invoice header text is the text that appears at the top of the page.',
    stateKey: 'header',
    maxLength: maxLength?.message,
  },
  memo: {
    title: 'Memo',
    description:
      'Memo text is the text that appears above the invoice pricing section.',
    stateKey: 'memo',
    maxLength: maxLength?.message,
  },
  footer: {
    title: 'Footer',
    description:
      'Footer text is the text that appears at the bottom of the invoice.',
    stateKey: 'footer',
    maxLength: maxLength?.message,
  },
  customFields: {
    title: 'Custom Fields',
    description:
      'Custom fields are additional fields you can add to your invoice.',
    stateKey: 'customFields',
    maxLength: maxLength?.customField,
  },
};

const Section = (props: { children: React.ReactNode; hidden?: boolean }) => {
  if (props?.hidden) return null;

  return <section className="flex flex-col gap-5">{props?.children}</section>;
};

export default function InvoiceTable(props: { hidden?: boolean }) {
  const BASE_STATE = {
    header: '',
    memo: '',
    footer: '',
    customFields: { 0: { value: '' } },
  };
  const [state, setState] = useState<{
    isHeader?: boolean;
    isMemo?: boolean;
    isFooter?: boolean;
    isCustomFields?: boolean;
    isCompanyName?: boolean;
    isLogoUrl?: boolean;
    fetching?: string;
    customFields: { [key: string]: CustomField };
    companyName?: string;
    imgUrl?: string;
    header?: string;
    memo?: string;
    footer?: string;
    preview?: boolean;
  }>(BASE_STATE);
  const { templates, count, isLoading } = useTemplates({});
  const { user } = useUser({});
  const TEMPLATE = templates?.[0];
  console.log(state);

  useEffect(() => {
    // --------------------------------------------------------------------------------
    // 📌  Update state with templates data
    // --------------------------------------------------------------------------------
    if (templates) {
      setState((prev) => ({
        ...prev,
        header: TEMPLATE?.header ?? '',
        isHeader: !!TEMPLATE?.header,
        memo: TEMPLATE?.memo ?? '',
        isMemo: !!TEMPLATE?.memo,
        footer: TEMPLATE?.footer ?? '',
        isFooter: !!TEMPLATE?.footer,
        customFields: TEMPLATE?.customFields ?? { 0: { value: '' } },
        isCustomFields: !!Object.keys(TEMPLATE?.customFields || {}).length,
        companyName: TEMPLATE?.companyName ?? '',
        isCompanyName: !!TEMPLATE?.companyName,
        imgUrl: TEMPLATE?.imgUrl ?? '',
        isLogoUrl: !!TEMPLATE?.imgUrl,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates]);

  const handleChange = (key: number, value: string) => {
    setState((prevState) => ({
      ...prevState,
      customFields: {
        ...prevState.customFields,
        [key]: {
          value,
        },
      },
    }));
  };

  const addCustomField = () => {
    const customFields = { ...state.customFields };
    customFields[Object.keys(customFields).length] = { value: '' };
    setState((prevState) => ({ ...prevState, customFields }));
  };

  function removeCustomField(key: number) {
    const customFields = { ...state.customFields };
    delete customFields[key];
    setState((prevState) => ({ ...prevState, customFields }));
  }

  async function createTemplate() {
    try {
      const res = await cFetch({
        url: '/api/v1/templates/add',
        method: 'POST',
        data: {
          header: state?.header,
          memo: state?.memo,
          footer: state?.footer,
          customFields: state?.customFields,
          companyName: state?.companyName,
          imgUrl: state?.imgUrl,
        },
      });

      return res;
    } catch (error) {
      console.error(error);
    }
  }

  async function updateTemplate(id: string) {
    try {
      const res = await cFetch({
        url: '/api/v1/templates/update',
        method: 'POST',
        data: {
          id,
          header: state?.isHeader ? state?.header ?? TEMPLATE?.header : null,
          memo: state?.isMemo ? state?.memo ?? TEMPLATE?.memo : null,
          footer: state?.isFooter ? state?.footer ?? TEMPLATE?.footer : null,
          customFields: state?.isCustomFields
            ? state?.customFields ?? TEMPLATE?.customFields
            : null,
          companyName: state?.isCompanyName
            ? state?.companyName ?? TEMPLATE?.companyName
            : null,
          imgUrl: state?.isLogoUrl ? state?.imgUrl ?? TEMPLATE?.imgUrl : null,
        },
      });

      return res;
    } catch (error) {
      console.error(error);
    }
  }

  async function submit(e: React.FormEvent) {
    try {
      e.preventDefault();
      // --------------------------------------------------------------------------------
      // 📌  Add Stripe API key to db
      // --------------------------------------------------------------------------------
      setState((prev) => ({ ...prev, fetching: 'submit' }));
      let status;
      let error;

      if (!count) {
        const res = await createTemplate();
        status = res?.status;
        error = res?.error?.response?.data?.error;
      }

      if (!!count) {
        const res = await updateTemplate(templates?.[0]?.id!);
        status = res?.status;
        error = res?.error?.response?.data?.error;
      }

      if (status !== 200 || error) {
        throw new Error(error);
      }

      mutate(`/api/v1/templates`);
      toast.success(
        !!count
          ? 'Template updated successfully!'
          : 'Template created successfully!'
      );
    } catch (err: any) {
      console.error(err.message);
      toast.error(err.message);
    } finally {
      setState((prev) => ({ ...prev, fetching: undefined }));
    }
  }

  async function downloadPDF() {
    try {
      setState((prev) => ({ ...prev, fetching: 'download' }));
      const { data } = await axios.post('/api/v1/invoices/puppet-pdf-gen', {
        id: user?.id,
      });
      console.log('🚧 PDF_DATA ', data);
      const url = data?.url;

      await downloadFile({
        url,
        name: user?.id,
        classBack: (props) => {
          console.log('🚀 Progress', props);
        },
      });

      toast?.success('Document downloaded successfully!');
    } catch (error) {
      toast?.error('An error occurred while downloading the document.');
    } finally {
      setState((prev) => ({ ...prev, fetching: undefined }));
    }
  }

  if (isLoading) {
    return (
      <SectionWrapper>
        <TableSkeleton />
      </SectionWrapper>
    );
  }

  if (props.hidden) {
    return null;
  }

  return (
    <SectionWrapper>
      <Dialog
        open={state?.preview}
        callBack={() => setState({ ...state, preview: false })}
      >
        <TemplateOne
          header={state?.header}
          memo={state?.memo}
          footer={state?.footer}
          customFields={state?.customFields}
          invoiceNumber={dummyData.invoiceNumber}
          date={dummyData.date}
          billToName={dummyData.billToName}
          billToAddress={dummyData.billToAddress}
          items={dummyData.items}
          subtotal={dummyData.subtotal}
          tax={dummyData.tax}
          total={dummyData.total}
          dueDate={dummyData.dueDate}
          companyName={dummyData.companyName}
        />
      </Dialog>

      <form
        onSubmit={submit}
        className={classNames(
          'relative flex flex-col gap-5 bg-green-100',
          !!state?.fetching && 'opacity-50'
        )}
      >
        <Spinner hidden={!state?.fetching} />
        <Section>
          <div className="flex flex-row gap-5 justify-between">
            <label>
              {table?.companyName?.title}
              <span className="text-xs ml-1 text-gray-400">
                {table?.companyName?.maxLength} characters max
              </span>
            </label>

            <Switch
              enabled={state?.isCompanyName}
              onChange={() =>
                setState((prev) => ({
                  ...prev,
                  isCompanyName: !prev.isCompanyName,
                }))
              }
            />
          </div>
          <Section>
            <p className="text-xs text-gray-500">
              {table?.companyName?.description}
            </p>
          </Section>
          <Section hidden={!state?.isCompanyName}>
            <input
              placeholder="Add Company Name"
              value={state.companyName}
              onChange={(e) =>
                setState({ ...state, companyName: e.target.value })
              }
              className="block w-full rounded-md border-0 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              maxLength={table?.companyName?.maxLength}
            />
          </Section>
        </Section>
        <Section>
          <div className="flex flex-row gap-5 justify-between">
            <label>
              {table?.imgUrl?.title}
              <span className="text-xs ml-1 text-gray-400">
                {table?.imgUrl?.maxLength} characters max
              </span>
            </label>

            <Switch
              enabled={state?.isLogoUrl}
              onChange={() =>
                setState((prev) => ({
                  ...prev,
                  isLogoUrl: !prev.isLogoUrl,
                }))
              }
            />
          </div>
          <Section>
            <p className="text-xs text-gray-500">
              {table?.imgUrl?.description}
            </p>
          </Section>
          <Section hidden={!state?.isLogoUrl}>
            <input
              placeholder="Add Company Logo URL"
              value={state.imgUrl}
              onChange={(e) => setState({ ...state, imgUrl: e.target.value })}
              className="block w-full rounded-md border-0 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              maxLength={table?.imgUrl?.maxLength}
            />
          </Section>
        </Section>

        <Section>
          <div className="flex flex-row gap-5 justify-between">
            <label>
              {table?.header?.title}
              <span className="text-xs ml-1 text-gray-400">
                {table?.header?.maxLength} characters max
              </span>
            </label>

            <Switch
              enabled={state?.isHeader}
              onChange={() =>
                setState((prev) => ({
                  ...prev,
                  isHeader: !prev.isHeader,
                }))
              }
            />
          </div>
          <Section>
            <p className="text-xs text-gray-500">
              {table?.header?.description}
            </p>
          </Section>
          <Section hidden={!state?.isHeader}>
            <textarea
              placeholder="Add Header Content"
              value={state.header}
              onChange={(e) => setState({ ...state, header: e.target.value })}
              className="block w-full rounded-md border-0 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              maxLength={table?.header?.maxLength}
            />
          </Section>
        </Section>
        <Section>
          <div className="flex flex-row gap-5 justify-between">
            <label>
              {table?.footer?.title}
              <span className="text-xs ml-1 text-gray-400">
                {table?.footer?.maxLength} characters max
              </span>
            </label>

            <Switch
              enabled={state?.isFooter}
              onChange={() =>
                setState((prev) => ({
                  ...prev,
                  isFooter: !prev.isFooter,
                }))
              }
            />
          </div>
          <Section>
            <p className="text-xs text-gray-500">
              {table?.footer?.description}
            </p>
          </Section>
          <Section hidden={!state?.isFooter}>
            <textarea
              placeholder="Add Footer Content"
              value={state.footer}
              onChange={(e) => setState({ ...state, footer: e.target.value })}
              className="block w-full rounded-md border-0 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              maxLength={table?.footer?.maxLength}
            />
          </Section>
        </Section>
        <Section>
          <div className="flex flex-row gap-5 justify-between">
            <label>
              {table?.memo?.title}
              <span className="text-xs ml-1 text-gray-400">
                {table?.memo?.maxLength} characters max
              </span>
            </label>

            <Switch
              enabled={state?.isMemo}
              onChange={() =>
                setState((prev) => ({
                  ...prev,
                  isMemo: !prev.isMemo,
                }))
              }
            />
          </div>
          <Section>
            <p className="text-xs text-gray-500">{table?.memo?.description}</p>
          </Section>
          <Section hidden={!state?.isMemo}>
            <textarea
              placeholder="Add a new Memo"
              value={state.memo}
              onChange={(e) => setState({ ...state, memo: e.target.value })}
              className="block w-full rounded-md border-0 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              maxLength={table?.memo?.maxLength}
            />
          </Section>
        </Section>

        <Section>
          <div className="flex flex-row gap-5 justify-between">
            <label>
              {table?.customFields?.title}
              <span className="text-xs ml-1 text-gray-400">
                {table?.customFields?.maxLength} characters max
              </span>
            </label>

            <Switch
              enabled={state?.isCustomFields}
              onChange={() =>
                setState((prev) => ({
                  ...prev,
                  isCustomFields: !prev.isCustomFields,
                  customFields: { 0: { value: '' } },
                }))
              }
            />
          </div>
          <Section>
            <p className="text-xs text-gray-500">
              {table?.customFields?.description}
            </p>
          </Section>
          <Section hidden={!state?.isCustomFields}>
            {Object.keys(state.customFields)?.map((_, index) => (
              <div key={index} className="flex flex-row gap-5 items-center">
                <input
                  type="text"
                  placeholder="Define a custom field value"
                  value={state.customFields?.[index]?.value}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  maxLength={table?.customFields?.maxLength}
                />
                <Button
                  title="Remove"
                  style="ghost"
                  hide={Object.keys(state.customFields)?.length === 1}
                  onClick={() => removeCustomField(index)}
                />
              </div>
            ))}
            <div className="card-actions justify-start">
              <Button
                title="Add custom field"
                style="ghost"
                onClick={addCustomField}
              />
            </div>
          </Section>
        </Section>

        <div className="card-actions justify-end">
          <Button
            title="Save"
            type="submit"
            fetching={state?.fetching === 'submit'}
            disabled={isLoading}
          />
          <Button
            style="secondary"
            onClick={downloadPDF}
            disabled={!!state?.fetching || isLoading}
            fetching={state?.fetching === 'download'}
          >
            <section className="flex flex-row gap-2">
              <svg
                className="flex-shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              <p>Sample PDF</p>
            </section>
          </Button>
          <Button
            title="Preview"
            style="ghost"
            onClick={() => setState({ ...state, preview: true })}
            disabled={!!state?.fetching || isLoading}
          />
          {/* <Button
            title="Link Preview"
            style="ghost"
            onClick={invoicePreview}
            disabled={!!state?.fetching || isLoading}
            fetching={state?.fetching === 'preview'}
          /> */}
          <Button
            title="Reset"
            style="ghost"
            onClick={() => setState(BASE_STATE)}
            disabled={!!state?.fetching || isLoading}
          />
        </div>
      </form>
    </SectionWrapper>
  );
}
