import { useState, useEffect } from "react";
import { Card, Select, InputNumber } from "antd";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line,
  ResponsiveContainer
} from "recharts";
import dayjs from "dayjs";

import {
  Container,
  SectionTitle,
  ChartGrid,
  FilterRow,
  FilterLabel,
} from "./style";

import * as StatisticService from "../../../services/StatisficService";

const { Option } = Select;
const defaultYear = dayjs().year();

export default function ReportPage() {
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);

  const [monthlyData, setMonthlyData] = useState([]); // dữ liệu theo tháng (cả năm)
  const [dailyData, setDailyData] = useState([]); // dữ liệu theo ngày trong 1 tháng

  useEffect(() => {
    fetchCompletedYear(selectedYear);
  }, [selectedYear]);

  useEffect(() => {
    fetchCompletedMonth(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  // lấy theo năm
  const fetchCompletedYear = async (year) => {
    try {
      const res = await StatisticService.getCompletedByYear(year);
      const formatted = res.data.map((item) => ({
        month: `T${item.month}`,
        count: item.count,
      }));
      setMonthlyData(formatted);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu theo năm:", error);
    }
  };

  // lấy theo tháng
  const fetchCompletedMonth = async (year, month) => {
    try {
      const res = await StatisticService.getCompletedByMonth(year, month);
      const formatted = res.data.map((item) => ({
        day: `Ngày ${item.day}`,
        count: item.count,
      }));
      setDailyData(formatted);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu theo tháng:", error);
    }
  };

  return (
    <Container>
      <SectionTitle>Thống kê hồ sơ hoàn thành</SectionTitle>

      {/* Bộ lọc */}
      <FilterRow>
        <FilterLabel>Năm:</FilterLabel>
        <InputNumber
          min={2000}
          max={2100}
          value={selectedYear}
          onChange={setSelectedYear}
          style={{ width: 120, marginRight: 20 }}
        />

        <FilterLabel>Tháng:</FilterLabel>
        <Select
          value={selectedMonth}
          onChange={setSelectedMonth}
          style={{ width: 100 }}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <Option key={m} value={m}>{`T${m}`}</Option>
          ))}
        </Select>
      </FilterRow>

      <ChartGrid>
        {/* Biểu đồ theo năm */}
        <Card title={`Hồ sơ hoàn thành trong năm ${selectedYear}`}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData} barCategoryGap={30}>
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />   {/* 👈 ép số nguyên */}
              <Tooltip />
              <Bar dataKey="count" fill="#1890ff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Biểu đồ theo tháng */}
        <Card title={`Hồ sơ hoàn thành trong tháng ${selectedMonth}/${selectedYear}`}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyData}>
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />   {/* 👈 ép số nguyên */}
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#52c41a" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </ChartGrid>
    </Container>
  );
}
