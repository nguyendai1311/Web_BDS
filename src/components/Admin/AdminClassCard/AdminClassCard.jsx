import React from 'react';
import { Row, Col, Card, Button, Tag } from 'antd';
import { ClassCardWrapper } from './style';

const ClassCard = ({
  name,
  course,
  studentCount,
  address,
  schedule,
  teacher,
  todayName,
}) => {
  const todaySchedule = schedule?.filter(s => s.day?.toLowerCase() === todayName?.toLowerCase());

  return (
    <ClassCardWrapper>
      <Card bordered={false}>
        <div className="card-header">
          <h3>{name}</h3>
        </div>

        <Row gutter={[12, 12]} className="info-grid">
          <Col span={12}><strong>Khoá học:</strong> {course?.name || "N/A"}</Col>
          <Col span={12}><strong>Học viên:</strong> {studentCount}</Col>

          <Col span={24}><strong>Địa chỉ:</strong> {address}</Col>
          <Col span={24}><strong>Chủ nhiệm:</strong> {teacher?.name || "N/A"}</Col>

          {todaySchedule.length > 0 && (
            <Col span={24}>
              <strong>Lịch hôm nay:</strong>{' '}
              {todaySchedule.map((s, i) => (
                <Tag color="green" key={i}>
                  {s.day} {s.startTime} - {s.endTime}
                </Tag>
              ))}
            </Col>
          )}
        </Row>

      </Card>
    </ClassCardWrapper>
  );
};

export default ClassCard;
