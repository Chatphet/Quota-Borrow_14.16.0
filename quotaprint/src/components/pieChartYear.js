import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Typography } from '@mui/material';

function PieChartYear({ data }) {

  const sortedData = data.sort((a, b) => b.year - a.year);

  const pieData = sortedData.flatMap((item) => [
    {
      id: `BlackWhite-${item.year}`,
      value: item.totalBlackWhite,
      label: `Black&White ปี ${item.year}`,
    },
    {
      id: `Color-${item.year}`,
      value: item.totalColor,
      label: `Color ปี ${item.year}`,
    }
  ]);

  const size = {
    // width: 550,
    height: 200,
  };

  return (
    <div>
      <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>รายปี</Typography>
      <PieChart
        series={[
          {
            data: pieData,
            valueFormatter: (v) => `จำนวน ${v.value} แผ่น`,
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
      />
    </div>
  );
}

export default PieChartYear;
