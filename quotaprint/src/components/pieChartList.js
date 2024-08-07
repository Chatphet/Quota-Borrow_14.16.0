import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Typography } from '@mui/material';

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
      <Typography variant="h6" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', }}>รายบุคคล</Typography>
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

export default PieChartList;
