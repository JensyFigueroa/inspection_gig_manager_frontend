import { ResponsivePieCanvas } from '@nivo/pie';
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from '@nivo/bar';
import styles from '../pages/statistics.module.css';
import Sidebar from '../components/Sidebar'
import DPUTracker from '../components/DPUTracker/DPUTracker';

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
            
           <DPUTracker/>

        </div>       
    </div>

  )
}
export default Statistics