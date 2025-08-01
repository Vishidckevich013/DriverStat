import './Dashboard.css';

const Dashboard = () => (
  <main className="dashboard">
    <section className="stats">
      <div className="stat-card"> <div className="stat-title">Total amount of orders</div> <div className="stat-value">1174</div> </div>
      <div className="stat-card"> <div className="stat-title">Total money paid</div> <div className="stat-value">$8,126,420</div> </div>
      <div className="stat-card"> <div className="stat-title">Available courier</div> <div className="stat-value">29</div> </div>
      <div className="stat-card"> <div className="stat-title">Hours on the road</div> <div className="stat-value">89,011</div> </div>
    </section>
    <section className="main-content">
      <div className="top-carriers">
        <h2>Top Carriers</h2>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Company</th><th>Reviews</th><th>Vehicles</th><th>Partners</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>01</td><td>Arkas Logistics</td><td>8.7</td><td>21</td><td>16</td><td>...</td></tr>
            <tr><td>02</td><td>Arkas Logistics</td><td>8.1</td><td>19</td><td>12</td><td>...</td></tr>
            <tr><td>03</td><td>Arkas Logistics</td><td>8.9</td><td>24</td><td>34</td><td>...</td></tr>
            <tr><td>04</td><td>Arkas Logistics</td><td>8.7</td><td>32</td><td>39</td><td>...</td></tr>
            <tr><td>05</td><td>Arkas Logistics</td><td>8.7</td><td>21</td><td>18</td><td>...</td></tr>
          </tbody>
        </table>
      </div>
      <div className="chart">
        <h2>Top Carriers</h2>
        <div className="circle-chart">100%</div>
        <ul className="chart-legend">
          <li>Trucks <span>57%</span></li>
          <li>Cargo Vans <span>18%</span></li>
          <li>Trailers <span>9%</span></li>
          <li>Cargo planes <span>7%</span></li>
          <li>Others Vehicles <span>9%</span></li>
        </ul>
      </div>
    </section>
  </main>
);

export default Dashboard;
