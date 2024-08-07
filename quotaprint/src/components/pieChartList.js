import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';

const StyledText = styled('text')(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fontSize: 20,
}));

function PieCenterLabel() {
  const { width, height, left, top } = useDrawingArea();
  return (
    <StyledText x={left + width / 2} y={top + height / 2}>
      รายบุคคล
    </StyledText>
  );
}

function PieChartList({ data }) {
  const pieData = data.map((item, index) => ({
    id: index,
    value: item.sumUserYear,
    label: `${item.requester}`,
    
  }))

  const size = {
    // width: 550,
    height: 200,
  };

  return (
    <div>  
      <PieChart
        series={[
          {
            data: pieData,
            valueFormatter: (v) => `จำนวน ${v.value} แผ่น`,
            innerRadius: 60,
            cornerRadius: 0,
          },
        ]}
        slotProps={{
          legend: {      
            direction: 'column',
            position: {
              vertical: 'middle',
              horizontal: 'right',
            },
            padding: 2,
            itemMarkWidth: 15,
            itemMarkHeight: 15,
            markGap: 5,
            itemGap: 8,
          }
        }}
        {...size}
        >
        <PieCenterLabel />
      </PieChart>
    </div>
  );
}

export default PieChartList;
