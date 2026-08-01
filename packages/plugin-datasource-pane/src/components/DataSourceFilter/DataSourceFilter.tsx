import React, { PureComponent } from 'react';
import { Search } from '@alifd/next';
import { DataSourceType } from '../../types';
import { generateClassName } from '../../utils/misc';
import { intl } from '../../locale';

export interface DataSourceFilterProps {
  dataSourceTypes: DataSourceType[];
  onFilter?: (dataSourceType: string, keyword: string) => void;
}

export interface DataSourceFilterState {
  selectedDataSourceType: string;
  keyword: string;
}

export class DataSourceFilter extends PureComponent<
  DataSourceFilterProps,
  DataSourceFilterState
> {
  state = {
    selectedDataSourceType: '',
    keyword: '',
  };

  // TODO the onFilterChange type definition does not match the runtime value
  handleSearchFilterChange = (filterObj: Record<string, any>) => {
    // const { keyword } = this.state;
    const { onFilter } = this.props;
    // TODO hence the cast to string here
    this.setState(
      { selectedDataSourceType: filterObj as unknown as string },
      () => {
        const { keyword, selectedDataSourceType } = this.state;
        onFilter?.(keyword, selectedDataSourceType);
      },
    );
  };

  handleChange = (val: string, actionType, item: string) => {
    if (item === 'clear') {
      this.handleSearch('');
    }
  };

  handleSearch = (keyword: string) => {
    const { selectedDataSourceType } = this.state;
    const { onFilter } = this.props;
    onFilter?.(selectedDataSourceType, keyword);
    this.setState({ keyword }, () => {
      const { keyword, selectedDataSourceType } = this.state;
      onFilter?.(keyword, selectedDataSourceType);
    });
  };

  render() {
    const { dataSourceTypes } = this.props;
    const { selectedDataSourceType } = this.state;

    return (
      <div className={generateClassName('filters')}>
        <Search
          hasClear
          onChange={this.handleChange}
          onSearch={this.handleSearch}
          filterProps={{}}
          defaultFilterValue={selectedDataSourceType}
          filter={[
            {
              label: intl('All'),
              value: '',
            },
          ].concat(
            dataSourceTypes.map((type) => ({
              label: type?.type,
              value: type?.type,
            })),
          )}
          onFilterChange={this.handleSearchFilterChange}
        />
      </div>
    );
  }
}
