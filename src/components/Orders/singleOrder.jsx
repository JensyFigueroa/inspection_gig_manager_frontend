import { useNavigate } from "react-router-dom";

export default function SingleOrder  ({gigs})  {

    const navigate = useNavigate();
    const flatGigs = gigs.flat();
    console.log(flatGigs)

// Group gigs by truckNumber and count the states.
const gigsByTruck = flatGigs.reduce((acc, gig) => {
  const truck = gig.truckNumber;



  if (!acc[truck]) {
    acc[truck] = {
      _id: gig._id,
      truckNumber: truck,
      customerName: gig.customerName,
      station: gig.station, // podemos tomar la primera estación
      statusCounts: { completed: 0, inProgress: 0, pending: 0 },
      createdAt:gig.createdAt
    };
  }

  // Sumar según el estado
  if (gig.status === "completed") acc[truck].statusCounts.completed += 1;
  else if (gig.status === "in-progress") acc[truck].statusCounts.inProgress += 1;
  else if (gig.status === "pending") acc[truck].statusCounts.pending += 1;

  return acc;
}, {});



const uniqueGigs = Object.values(gigsByTruck);

console.log(gigsByTruck)



    return(
        uniqueGigs.map(gig => (
          <div key={gig.truckNumber} className="table-row card text-start p-3" onClick={() => navigate(`/gigsorder/${gig.truckNumber}`)} >
    
             <div className="d-flex align-items-baseline gap-1">
              <h5>
                <i className="bi bi-card-text"> <span>Work Order # </span> {gig.truckNumber}   </i>
                <span>-</span>
                <i className="bi bi-building me-1"><span> Customer Name: {gig.customerName}</span></i>
              </h5>

              <span className="badge text-bg-dark">
                <i className="bi bi-geo-alt me-1"></i>
                {gig.station}
              </span>

              <span className="badge text-bg-success">Active</span>
            </div>

            <div>
            <i className="bi bi-calendar-event me-1"></i>
            <span>{gig.createdAt ? new Date(gig.createdAt).toLocaleDateString('en-US'): '-'}</span>
            <span className="ms-2 text-danger">
            {/* <i className="bi bi-exclamation-circle me-1"></i>
            <span className="fw-bold me-2">Overdue</span> */}
            </span>
        </div>

    {/* Gigs Info */}
    <div className="d-flex gap-4 mt-4">
      <span className="fw-bold">{gig.statusCounts.completed + gig.statusCounts.inProgress + gig.statusCounts.pending} Gigs</span>
      <span className="text-success">{gig.statusCounts.completed} Completed</span>
      <span className="text-primary">{gig.statusCounts.inProgress} In Progress</span>
      <span className="text-warning">{gig.statusCounts.pending} Pending</span>
    </div>

    {/* Progress Bar */}
        <div className="d-flex justify-content-end">
        <div className="progress w-25 mt-3" role="progressbar">
            <div className="progress-bar progress-bar-striped progress-bar-animated" style={{width:  `${
      (
        gig.statusCounts.completed /
        (gig.statusCounts.completed +
         gig.statusCounts.inProgress +
         gig.statusCounts.pending)
      * 100
      ).toFixed(0)
      }%`}}>{((gig.statusCounts.completed/(gig.statusCounts.completed + gig.statusCounts.inProgress + gig.statusCounts.pending))*100).toFixed(0)} %</div>
        </div>
        </div>

  </div>
))
    
    
    );

}

    