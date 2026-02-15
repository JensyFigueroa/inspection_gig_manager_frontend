import { ResponsivePieCanvas } from '@nivo/pie';
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from '@nivo/bar';
import data from '../data/data.json'
import styles from '../pages/statistics.module.css';
import Sidebar from '../components/Sidebar'

const Statistics = ({user}) => {
    const stationData = Array.from({ length: 9 }, (_, i) => ({
        id: `st${i + 1}`,
        gigs: Math.floor(Math.random() * 20) + 1,
    }));

  return (
    <div className={styles.appContainer}>
        <div className={styles.sidebar}>
            <Sidebar user={user}/>
        </div>

        <div className="flex-1 ml-54 p-8 lg:p-12 bg-gray-50 min-h-screen">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="font-heading font-black text-4xl uppercase tracking-tight text-slate-900 mb-2">
                            Statistics
                        </h1>
                    </div>
                </div>


                <div className={styles.dashboard}>

                <div className={styles.ChartContainer}>
                <div className="card p-3" style={{width: 600, height: 400}}>
                    
                    <div className="fw-bold mb-2">Truck Delivered this Month</div>
                    <ResponsivePieCanvas 
                        data={data.reports.lineReport}
                        margin={{ top: 40, right: 200, bottom: 40, left: 120 }}
                        legends={[
                        {
                            anchor: 'right',
                            direction: 'column',
                            translateX: 140,
                            itemsSpacing: 2,
                            itemWidth: 60,
                            itemHeight: 16
                        }
                    ]} />
                    
                </div>
                <div className="card p-3 " style={{width: 600, height: 400}}>
                    <div className="fw-bold mb-2">Truck Delivered Daily</div>
                    <ResponsiveLine
                    
                    margin={{ top: 50, right: 110, bottom: 50, left: 60 }} 
                    data={data.reports.lineReportDaily}
                    useMesh={true}
                    enableSlices="x"
                    legends={[
                        {
                            anchor: 'bottom-right',
                            direction: 'column',
                            translateX: 100,
                            itemWidth: 80,
                            itemHeight: 22,
                            symbolShape: 'circle'
                        }
                    ]} />
                </div>
                <div className="card p-3" style={{ width: 600, height: 400 }}>
                <div className="fw-bold mb-2">Gigs per Station (Road Rescue)</div>
                <ResponsiveBar
                    data={stationData}
                    keys={['gigs']}
                    indexBy="id"
                    margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={{ scheme: 'nivo' }}
                    defs={[
                    {
                        id: 'dots',
                        type: 'patternDots',
                        background: 'inherit',
                        color: '#38bcb2',
                        size: 4,
                        padding: 1,
                        stagger: true
                    },
                    {
                        id: 'lines',
                        type: 'patternLines',
                        background: 'inherit',
                        color: '#eed336',
                        rotation: -45,
                        lineWidth: 6,
                        spacing: 10
                    }
                    ]}
                    fill={[
                    { match: { id: 'fries' }, id: 'dots' },
                    { match: { id: 'sandwich' }, id: 'lines' }
                    ]}
                    borderColor={{
                    from: 'color',
                    modifiers: [['darker', 1.6]]
                    }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0
                    }}
                    axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0
                    }}
                    labelSkipWidth={36}
                    labelSkipHeight={12}
                    labelTextColor={{
                    from: 'color',
                    modifiers: [['darker', 1.6]]
                    }}
                    legends={[
                    {
                        dataFrom: 'keys',
                        anchor: 'bottom-right',
                        direction: 'column',
                        justify: false,
                        translateX: 120,
                        translateY: 0,
                        itemsSpacing: 2,
                        itemWidth: 100,
                        itemHeight: 20,
                        itemDirection: 'left-to-right',
                        itemOpacity: 0.85,
                        symbolSize: 20,
                        effects: [
                        {
                            on: 'hover',
                            style: {
                            itemOpacity: 1
                            }
                        }
                        ]
                    }
                    ]}
                />
                </div>
            
            </div>        
                  
            
        
        
        
        </div>

        </div>       
    </div>

  )
}
export default Statistics