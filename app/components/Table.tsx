import { classNames } from '@helpers/index';

type Row = { item?: string | React.ReactElement; class?: string };

type Props = {
  footer?: React.ReactElement;
  header?: Row[];
  data?: { row: Row[]; class?: string }[];
};

export default function Table(props: Props) {
  return (
    <div className="flex flex-col gap-5 px-4 sm:px-6 lg:px-8">
      <div className="-mx-4 mt-8 sm:-mx-0">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              {props?.header?.map((item, key) => {
                return (
                  <th
                    key={key}
                    scope="col"
                    className={classNames(
                      'py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0',
                      item.class
                    )}
                  >
                    {item.item}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {props?.data?.map((rows, key) => {
              return (
                <tr key={key} className={classNames(rows.class)}>
                  {rows?.row?.map((item, key) => {
                    return (
                      <td
                        key={key}
                        className={classNames(
                          'px-3 py-3.5 text-sm text-gray-900',
                          item.class
                        )}
                      >
                        {item.item}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {props.footer && (
        <div className="sm:flex sm:items-center">{props.footer}</div>
      )}
    </div>
  );
}