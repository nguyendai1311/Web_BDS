import React, { Fragment } from "react";
import { Checkbox } from "../CheckboxComponent/CheckboxComponent";
import { Label } from "../LabelComponent/LabelComponent";
import { Input } from "antd";
import {
  WrapperFilterContainer,
  WrapperCourseFilter,
  WrapperFilterHeader,
  WrapperFilterTitle,
  WrapperSearchInput,
  WrapperFilterSection,
  WrapperFilterSectionTitle,
  WrapperFilterOption,
  IconWrapper,
} from "./style";
import { SearchOutlined } from "@ant-design/icons";

const filterOptions = {
  type: [
    { id: "basic", label: "Cơ bản" },
    { id: "intermediate1", label: "Trung cấp 1" },
    { id: "intermediate2", label: "Trung cấp 2" },
    { id: "advanced1", label: "Nâng cao 1" },
    { id: "advanced2", label: "Nâng cao 2" },
  ],
};
const sectionTitles = {
  type: "Loại khóa học",
};
function Filter({ filters, handleFilter, searchText, setSearchText }) {
  return (
    <WrapperFilterContainer>
      <WrapperCourseFilter>
        <WrapperFilterHeader>
          <WrapperFilterTitle>Tìm kiếm</WrapperFilterTitle>
          <WrapperSearchInput>
            <IconWrapper>
              <SearchOutlined />
            </IconWrapper>
            <Input
              placeholder="Tìm kiếm khóa học..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </WrapperSearchInput>
        </WrapperFilterHeader>

        {Object.keys(filterOptions).map((keyItem) => (
          <Fragment key={keyItem}>
            <WrapperFilterSection>
              <WrapperFilterSectionTitle> {sectionTitles[keyItem] || "Bộ lọc"}</WrapperFilterSectionTitle>
              {filterOptions[keyItem].map((option) => (
                <WrapperFilterOption as={Label} key={option.id}>
                  <Checkbox
                    checked={
                      filters &&
                      filters[keyItem] &&
                      filters[keyItem].indexOf(option.id) > -1
                    }
                    onCheckedChange={() => handleFilter(keyItem, option.id)}
                  />
                  {option.label}
                </WrapperFilterOption>
              ))}
            </WrapperFilterSection>
          </Fragment>
        ))}
      </WrapperCourseFilter>
    </WrapperFilterContainer>
  );
}

export default Filter;
