const SingleOrder = ({gigs}) => (
    gigs.map(gig => 
        <div className="card text-start p-3">
        <div className="d-flex align-items-baseline gap-1">
        <h5># {gig.truckNumber} - Seminole Rescue</h5>
        <span className="badge text-bg-dark">
            <i className="bi bi-geo-alt me-1"></i>
            {gig.station}
        </span>
        <span className="badge text-bg-success">
            Active
        </span>
        </div>
        {/* Meta Info */}
        <div className="d-flex gap-4">
        <div>
            <i className="bi bi-building me-1"></i>
            <span>Acme Corp</span>
        </div>
        <div>
            <i className="bi bi-calendar-event me-1"></i>
            {/* <span className="fw-bold me-2">Due:</span> */}
            <span>{new Date(gig.createdAt).toLocaleDateString('en-US')}</span>
            <span className="ms-2 text-danger">
            {/* <i className="bi bi-exclamation-circle me-1"></i>
            <span className="fw-bold me-2">Overdue</span> */}
            </span>
        </div>
        <div>
            
        </div>
        </div>
        {/* Gigs Info */}
        <div className="d-flex gap-4 mt-4">
        <span className="fw-bold">45 Gigs</span>
        <span className="text-success">15 Completed</span>
        <span className="text-primary">3 in progress</span>
        <span className="text-warning">24 pending</span>
        </div>
        {/* Progress Bar */}
        <div className="d-flex justify-content-end">
        <div className="progress w-25 mt-3" role="progressbar">
            <div className="progress-bar progress-bar-striped progress-bar-animated" style={{width: "43%"}}>43%</div>
        </div>
        </div>
    </div>
    )
    
);

export default SingleOrder;