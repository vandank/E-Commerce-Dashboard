import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { fetchData } from './services/api';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const App = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState('');
  const [chartData, setChartData] = useState(null);

  const loadChart = async (analysis) => {
    try {
      const data = await fetchData(analysis);

      switch (analysis) {
        case 'monthly-revenue':
          setChartData({
            x: data.map(d => d.YearMonth),
            y: data.map(d => d.TotalPrice),
            type: 'scatter',
            title: 'Monthly Revenue (£)',
            xLabel: 'Month',
            yLabel: 'Revenue (£)',
            color: '#ff9800',
            insight: `1. The Total Revenue: £8,911,407.904 over the one-year period\n2. Average Order Value (AOV): £480.87 per invoice\n3. Unique Invoices: 18,532 unique purchase invoices\n4. Monthly Revenue Trends:\n   - Initial stability from Dec-2012 to Jan-2011, with high volatility Feb–Apr.\n   - May rises to ~£680K; slight dip in June–July; mild recovery in August.\n   - September jumps to ~£950K; October continues; November peaks at £1.16M.\n   - December drops steeply to ~£520K, likely due to seasonality or cutoff.`
          });
          break;

        case 'top-products':
          setChartData({
            x: data.map(d => d.Description),
            y: data.map(d => d.Quantity),
            type: 'bar',
            title: 'Top Products by Quantity',
            xLabel: 'Product',
            yLabel: 'Quantity',
            color: '#2196f3',
            insight: `Top-selling products are mostly small, giftable items.\nHighlights include PAPER CRAFT and CERAMIC JARS — indicating strong demand for decorative and nostalgic pieces.`
          });
          break;

        case 'customers-by-country':
          setChartData({
            x: data.map(d => d.Country),
            y: data.map(d => d.UniqueCustomers),
            type: 'bar',
            title: 'Top 10 Countries by Unique Customers (excl. UK)',
            xLabel: 'Country',
            yLabel: 'Customers',
            color: '#4caf50',
            insight: `Germany and France lead in customer count.\nNetherlands and EIRE — despite high revenue — are missing, suggesting higher spend per customer.\nImplies value vs. volume dynamics.`
          });
          break;

        case 'orders-by-country':
          setChartData({
            x: data.map(d => d.Country),
            y: data.map(d => d.NumOrders),
            type: 'bar',
            title: 'Top 10 Countries by Orders (excl. UK)',
            xLabel: 'Country',
            yLabel: 'Orders',
            color: '#f44336',
            insight: `Germany and France dominate in order volume.\nEIRE shows more orders per customer — high engagement.\nNetherlands has fewer but higher-value orders.`
          });
          break;

        case 'clv':
          setChartData({
            x: data.map(d => d.CustomerID),
            y: data.map(d => d.SimpleCLV),
            type: 'histogram',
            title: 'Customer Lifetime Value Distribution',
            xLabel: 'Estimated CLV (£)',
            yLabel: 'Number of Customers',
            color: '#9c27b0',
            insight: `CLV is skewed — a small segment contributes to large revenue.\nHighlights importance of identifying and retaining high-value customers.`
          });
          break;

        case 'rfm':
          setChartData({
            recency: data.recency,
            frequency: data.frequency,
            monetary: data.monetary,
            insight: `Recency: Most customers are active recently. A smaller group is at churn risk.\nFrequency: Majority buy 1–3 times. Few are highly frequent.\nMonetary: Most spend <£1000. A few outliers spend significantly.\nPareto effect: ~20% of customers contribute ~80% of revenue.`
          });
          break;

        default:
          setChartData(null);
      }
    } catch (error) {
      console.error("Error loading chart:", error);
    }
  };

  const handleClick = () => setShowOptions(true);

  const handleChange = (e) => {
    const analysis = e.target.value;
    setSelectedAnalysis(analysis);
    loadChart(analysis);
  };

  const renderPlot = () => {
    if (!chartData) return null;

    if (selectedAnalysis === 'rfm') {
      return (
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <h3>Recency Distribution</h3>
            <Plot
              data={[{ x: chartData.recency, type: 'histogram', marker: { color: '#00e5ff' } }]}
              layout={{ width: 300, height: 300, xaxis: { title: 'Recency', tickfont: { color: '#fff', size: 14 } }, yaxis: { tickfont: { color: '#fff', size: 14 } }, paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', grid: { color: 'rgba(255,255,255,0.3)' } }}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3>Frequency Distribution</h3>
            <Plot
              data={[{ x: chartData.frequency, type: 'histogram', marker: { color: '#ffb300' } }]}
              layout={{ width: 300, height: 300, xaxis: { title: 'Frequency', tickfont: { color: '#fff', size: 14 } }, yaxis: { tickfont: { color: '#fff', size: 14 } }, paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', grid: { color: 'rgba(255,255,255,0.3)' } }}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3>Monetary Distribution</h3>
            <Plot
              data={[{ x: chartData.monetary, type: 'histogram', marker: { color: '#00e676' } }]}
              layout={{ width: 300, height: 300, xaxis: { title: 'Monetary', tickfont: { color: '#fff', size: 14 } }, yaxis: { tickfont: { color: '#fff', size: 14 } }, paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', grid: { color: 'rgba(255,255,255,0.3)' } }}
            />
          </div>
          <Box mt={4} bgcolor="rgba(255,255,255,0.9)" borderRadius={2} p={3} color="#111" maxWidth={900} mx="auto">
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📌 Insights
            </Typography>
            <Typography style={{ whiteSpace: 'pre-line' }}>{chartData.insight}</Typography>
          </Box>
        </div>
      );
    }

    return (
      <div>
        <Plot
          data={[{
            x: chartData.x,
            y: chartData.y,
            type: chartData.type,
            marker: { color: chartData.color || '#1f77b4' }
          }]}
          layout={{
            width: 900,
            height: 500,
            title: chartData.title,
            xaxis: { title: chartData.xLabel, gridcolor: 'rgba(255,255,255,0.3)', tickfont: { color: '#fff', size: 16 } },
            yaxis: { title: chartData.yLabel, gridcolor: 'rgba(255,255,255,0.3)', tickfont: { color: '#fff', size: 16 } },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { color: '#fff', size: 16 }
          }}
        />
        {chartData.insight && (
          <Box mt={4} bgcolor="rgba(255,255,255,0.9)" borderRadius={2} p={3} color="#111" maxWidth={900} mx="auto">
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📌 Insights
            </Typography>
            <Typography style={{ whiteSpace: 'pre-line' }}>{chartData.insight}</Typography>
          </Box>
        )}
      </div>
    );
  };

  return (
    <div style={{
      textAlign: 'center',
      padding: '2rem',
      fontFamily: 'sans-serif',
      minHeight: '100vh',
      backgroundImage: showOptions ? "url('pic4.jpg')" : "url('pic3.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      color: '#fff',
      overflowX: 'hidden'
    }}>
      {!showOptions ? (
        <>
          <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 2, textShadow: '2px 2px 4px rgba(0,0,0,0.6)', color: '#fff' }}>
            Welcome to the E-commerce Insight Dashboard
          </Typography>
          <Button
            variant="contained"
            sx={{
              padding: '20px 40px',
              fontSize: '1.5rem',
              borderRadius: '50px',
              backgroundColor: 'rgba(30, 136, 229, 0.85)',
              color: '#fff'
            }}
            onClick={handleClick}
          >
            Click me — I'll take you to the analysis you're looking for
          </Button>
        </>
      ) : (
        <>
          {!selectedAnalysis && (
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#111', background: 'rgba(255, 255, 255, 0.6)', display: 'inline-block', padding: '10px 20px', borderRadius: '12px' }}>
              “The goal is to turn data into information, and information into insight.”
            </Typography>
          )}
          <Typography variant="h5" sx={{ mb: 2 }}>
            📊 Choose an Analysis
          </Typography>
          <Select
            value={selectedAnalysis}
            onChange={handleChange}
            displayEmpty
            variant="outlined"
            sx={{ backgroundColor: 'white', borderRadius: '8px', minWidth: 250 }}
          >
            <MenuItem value="">-- Select an Option --</MenuItem>
            <MenuItem value="monthly-revenue">Monthly Revenue</MenuItem>
            <MenuItem value="top-products">Top Products</MenuItem>
            <MenuItem value="customers-by-country">Customers by Country</MenuItem>
            <MenuItem value="orders-by-country">Orders by Country</MenuItem>
            <MenuItem value="clv">Customer Lifetime Value</MenuItem>
            <MenuItem value="rfm">RFM Analysis</MenuItem>
          </Select>
          <Box mt={5}>{renderPlot()}</Box>
        </>
      )}
    </div>
  );
};

export default App;
