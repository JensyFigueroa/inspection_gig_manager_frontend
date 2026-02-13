import { ResponsivePieCanvas } from '@nivo/pie';
import { ResponsiveLine } from "@nivo/line";
import data from '../data/data.json'
import styles from '../pages/statistics.module.css';
import Sidebar from '../components/Sidebar'

const Statistics = ({user}) => {
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
            </div>
        </div>

        </div>       
    </div>

  )
}
export default Statistics